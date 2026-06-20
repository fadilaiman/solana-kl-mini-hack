import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSafe } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// POST /api/v1/mandates/:id/cancel
// Stops a mandate (status -> REVOKED) so the sweep no longer debits it.
// Body: { revokeTx?, by? } — `revokeTx` is the customer's on-chain revoke
// signature (the trustless cancel); `by` is "customer" | "operator".
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const mandate = await prisma.mandate.findUnique({ where: { id: params.id } });
  if (!mandate) return NextResponse.json({ error: 'mandate not found' }, { status: 404 });

  // Already finished/stopped — idempotent.
  if (['REVOKED', 'COMPLETED', 'EXHAUSTED'].includes(mandate.status)) {
    return NextResponse.json(jsonSafe(mandate));
  }

  const updated = await prisma.mandate.update({
    where: { id: mandate.id },
    data: {
      status: 'REVOKED',
      revokeTx: body.revokeTx || null,
      canceledBy: body.by === 'customer' ? 'customer' : 'operator',
    },
  });
  return NextResponse.json(jsonSafe(updated));
}
