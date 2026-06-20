import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeDebit, verifyApproval } from '@/lib/solana';
import { nextDebitForFrequency } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

// GET /api/v1/cron/debit-sweep — bearer-guarded recurring debit processor.
// Triggered every minute by the cron sidecar; only mandates whose nextDebitAt
// has elapsed are charged, so the real cadence comes from DEBIT_ENVIRONMENT.
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results: any[] = [];

  const due = await prisma.mandate.findMany({
    where: { status: 'ACTIVE', nextDebitAt: { lte: now } },
    include: { _count: { select: { debitLogs: true } }, debitLogs: { where: { status: 'SUCCESS' } } },
  });

  for (const m of due) {
    const collected = m.debitLogs.length;

    // Contract fully collected — close it out.
    if (collected >= m.totalCycles) {
      await prisma.mandate.update({ where: { id: m.id }, data: { status: 'COMPLETED' } });
      results.push({ id: m.id, status: 'COMPLETED' });
      continue;
    }

    if (!m.payer) {
      results.push({ id: m.id, status: 'SKIPPED', reason: 'no payer' });
      continue;
    }

    // Allowance check — if the delegate can no longer cover a cycle, exhaust it.
    const allowance = await verifyApproval(m.payer, m.mint, m.debitAmount);
    if (!allowance.ok) {
      await prisma.mandate.update({ where: { id: m.id }, data: { status: 'EXHAUSTED' } });
      results.push({ id: m.id, status: 'EXHAUSTED', reason: allowance.reason });
      continue;
    }

    try {
      const { signature, mock } = await executeDebit({
        payerWallet: m.payer,
        merchantWallet: m.merchant,
        mint: m.mint,
        amount: m.debitAmount,
        decimals: m.decimals,
      });

      const willComplete = collected + 1 >= m.totalCycles;

      await prisma.$transaction([
        prisma.debitLog.create({
          data: {
            mandateId: m.id,
            txSignature: signature,
            amountDebited: m.debitAmount,
            status: 'SUCCESS',
          },
        }),
        prisma.mandate.update({
          where: { id: m.id },
          data: {
            lastDebitedAt: now,
            nextDebitAt: nextDebitForFrequency(now, m.frequency),
            status: willComplete ? 'COMPLETED' : 'ACTIVE',
          },
        }),
      ]);

      results.push({
        id: m.id,
        status: willComplete ? 'COMPLETED' : 'PROCESSED',
        cycle: `${collected + 1}/${m.totalCycles}`,
        signature,
        mock,
      });
    } catch (err: any) {
      // Log the failure; push the next attempt forward so we don't hot-loop.
      await prisma.$transaction([
        prisma.debitLog.create({
          data: {
            mandateId: m.id,
            txSignature: `FAILED_${m.id}_${now.getTime()}`,
            amountDebited: m.debitAmount,
            status: 'FAILED',
            errorMessage: String(err?.message || err).slice(0, 500),
          },
        }),
        prisma.mandate.update({
          where: { id: m.id },
          data: { nextDebitAt: nextDebitForFrequency(now, m.frequency) },
        }),
      ]);
      results.push({ id: m.id, status: 'FAILED', error: String(err?.message || err) });
    }
  }

  return NextResponse.json({
    sweptAt: now.toISOString(),
    processed: results.length,
    details: results,
  });
}
