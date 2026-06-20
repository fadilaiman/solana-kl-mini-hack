import { NextResponse } from 'next/server';
import { getDelegatePubkey } from '@/lib/solana';

export const dynamic = 'force-dynamic';

// Public config the checkout page needs to build the on-chain approve.
export async function GET() {
  return NextResponse.json({
    delegate: getDelegatePubkey().toBase58(),
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    mockChain: process.env.MOCK_CHAIN === 'true',
  });
}
