import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSafe, toBaseUnits } from '@/lib/serialize';
import { fetchMintDecimals } from '@/lib/solana';
import { isFrequency } from '@/lib/schedule';
import { DEFAULT_TOKEN } from '@/lib/constants';
import { PublicKey } from '@solana/web3.js';

export const dynamic = 'force-dynamic';

// GET /api/v1/mandates — list (newest first).
// Optional ?wallet=<addr> filters to mandates where the address is either the
// merchant (receiving) or the payer (paying).
export async function GET(req: NextRequest) {
  const wallet = new URL(req.url).searchParams.get('wallet')?.trim();
  const where = wallet ? { OR: [{ merchant: wallet }, { payer: wallet }] } : {};

  const mandates = await prisma.mandate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      debitLogs: { orderBy: { executedAt: 'desc' } },
      _count: { select: { debitLogs: true } },
    },
  });
  return NextResponse.json(jsonSafe(mandates));
}

// POST /api/v1/mandates — merchant creates a mandate, denominated in a currency (RM).
// Body: {
//   merchant, mint, tokenSymbol?, currency?='RM', rmPerToken?=1,
//   configMethod: 'per_payment' | 'total',
//   perPaymentRm?  (when per_payment),
//   totalRm?       (when total — auto-divided across payments),
//   frequency: 'testing_10m'|'daily'|'weekly'|'monthly',
//   numberOfPayments
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      merchant, configMethod,
      perPayment, total, frequency, numberOfPayments,
    } = body;

    // Token defaults to devnet USDC unless explicitly overridden.
    const mint = body.mint || DEFAULT_TOKEN.mint;
    const tokenSymbol = body.tokenSymbol || (mint === DEFAULT_TOKEN.mint ? DEFAULT_TOKEN.symbol : null);

    if (!merchant || !frequency || !numberOfPayments) {
      return NextResponse.json(
        { error: 'merchant, frequency and numberOfPayments are required' },
        { status: 400 },
      );
    }

    try {
      new PublicKey(merchant);
      new PublicKey(mint);
    } catch {
      return NextResponse.json({ error: 'merchant or mint is not a valid Solana address' }, { status: 400 });
    }

    if (!isFrequency(String(frequency))) {
      return NextResponse.json({ error: 'invalid frequency' }, { status: 400 });
    }

    const payments = parseInt(String(numberOfPayments), 10);
    if (!Number.isInteger(payments) || payments < 1) {
      return NextResponse.json({ error: 'numberOfPayments must be a positive integer' }, { status: 400 });
    }

    // Amounts are denominated directly in the settlement token.
    const currency = (tokenSymbol || 'token').toString();

    let perPaymentTokens: number;
    if (configMethod === 'total') {
      const t = Number(total);
      if (!(t > 0)) return NextResponse.json({ error: 'total must be greater than zero' }, { status: 400 });
      perPaymentTokens = t / payments;
    } else {
      perPaymentTokens = Number(perPayment);
      if (!(perPaymentTokens > 0)) return NextResponse.json({ error: 'perPayment must be greater than zero' }, { status: 400 });
    }

    // Decimals: known default, else read from the mint on-chain.
    const decimals =
      body.decimals != null ? parseInt(String(body.decimals), 10)
        : mint === DEFAULT_TOKEN.mint ? DEFAULT_TOKEN.decimals
          : await fetchMintDecimals(mint);

    const debitAmount = toBaseUnits(perPaymentTokens.toFixed(decimals), decimals);
    if (debitAmount <= 0n) {
      return NextResponse.json(
        { error: `per-payment amount is below this token's smallest unit (${1 / 10 ** decimals})` },
        { status: 400 },
      );
    }
    const maxAmount = debitAmount * BigInt(payments);

    const mandate = await prisma.mandate.create({
      data: {
        merchant,
        mint,
        tokenSymbol: tokenSymbol || null,
        currency,
        decimals,
        maxAmount,
        debitAmount,
        totalCycles: payments,
        frequency: String(frequency),
        status: 'PENDING_AUTH',
      },
    });

    return NextResponse.json(jsonSafe(mandate), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'failed to create mandate' }, { status: 500 });
  }
}
