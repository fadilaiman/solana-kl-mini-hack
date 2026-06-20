import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSafe } from '@/lib/serialize';
import { verifyApproval } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';

export const dynamic = 'force-dynamic';

// POST /api/v1/mandates/:id/authorize
// Called by the checkout page after the payer signs the on-chain approve.
// Body: { payer (wallet pubkey), approveTx (signature) }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { payer, approveTx } = await req.json();
    if (!payer) {
      return NextResponse.json({ error: 'payer wallet is required' }, { status: 400 });
    }
    try {
      new PublicKey(payer);
    } catch {
      return NextResponse.json({ error: 'payer is not a valid Solana address' }, { status: 400 });
    }

    const mandate = await prisma.mandate.findUnique({ where: { id: params.id } });
    if (!mandate) return NextResponse.json({ error: 'mandate not found' }, { status: 404 });
    if (mandate.status !== 'PENDING_AUTH') {
      return NextResponse.json({ error: `mandate already ${mandate.status}` }, { status: 409 });
    }

    // Confirm the on-chain approve delegated enough to our platform key.
    // Retry a few times — on congested devnet the tx may land a bit after the
    // wallet's confirmation timed out.
    let check = await verifyApproval(payer, mandate.mint, mandate.debitAmount);
    for (let i = 0; i < 5 && !check.ok; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      check = await verifyApproval(payer, mandate.mint, mandate.debitAmount);
    }
    if (!check.ok) {
      return NextResponse.json(
        { error: `approval not detected on-chain yet (${check.reason}) — devnet may be slow, please try again` },
        { status: 422 },
      );
    }

    // Activate. nextDebitAt = now so the first sweep collects immediately (demo-friendly).
    const updated = await prisma.mandate.update({
      where: { id: mandate.id },
      data: {
        payer,
        approveTx: approveTx || null,
        status: 'ACTIVE',
        nextDebitAt: new Date(),
      },
    });

    return NextResponse.json(jsonSafe(updated));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'authorization failed' }, { status: 500 });
  }
}
