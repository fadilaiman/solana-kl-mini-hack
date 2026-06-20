import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSafe } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// GET /api/v1/mandates/:id — full mandate + debit history (checkout & ledger).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const mandate = await prisma.mandate.findUnique({
    where: { id: params.id },
    include: { debitLogs: { orderBy: { executedAt: 'desc' } } },
  });

  if (!mandate) {
    return NextResponse.json({ error: 'mandate not found' }, { status: 404 });
  }

  const collected = mandate.debitLogs.filter((l) => l.status === 'SUCCESS').length;
  return NextResponse.json(jsonSafe({ ...mandate, collected }));
}
