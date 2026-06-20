import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getMint,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
  TokenAccountNotFoundError,
} from '@solana/spl-token';
import bs58 from 'bs58';

// ── Connection ─────────────────────────────────────────────────
export function getConnection(): Connection {
  return new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed',
  );
}

// ── System fee-payer / delegate keypair (server-only secret) ───
let _system: Keypair | null = null;
export function getSystemKeypair(): Keypair {
  if (_system) return _system;
  const secret = process.env.SYSTEM_FEEPAYER_SECRET;
  if (!secret) throw new Error('SYSTEM_FEEPAYER_SECRET is not set');
  _system = Keypair.fromSecretKey(bs58.decode(secret));
  return _system;
}

export function getDelegatePubkey(): PublicKey {
  return getSystemKeypair().publicKey;
}

const isMock = () => process.env.MOCK_CHAIN === 'true';

// ── Mint metadata (decimals are authoritative; symbol is best-effort) ──
export async function fetchMintDecimals(mintStr: string): Promise<number> {
  if (isMock()) return 6; // assume 6 (USDC-like) when mocking
  const connection = getConnection();
  const mint = await getMint(connection, new PublicKey(mintStr));
  return mint.decimals;
}

// ── Verify a payer's approve granted our delegate enough allowance ──
export interface ApprovalStatus {
  ok: boolean;
  delegatedAmount: bigint;
  reason?: string;
}

export async function verifyApproval(
  payerWallet: string,
  mintStr: string,
  minAmount: bigint,
): Promise<ApprovalStatus> {
  if (isMock()) return { ok: true, delegatedAmount: minAmount * 1000n };

  const connection = getConnection();
  const mint = new PublicKey(mintStr);
  const payer = new PublicKey(payerWallet);
  const delegate = getDelegatePubkey();
  const ata = await getAssociatedTokenAddress(mint, payer);

  try {
    const acct = await getAccount(connection, ata);
    if (!acct.delegate || !acct.delegate.equals(delegate)) {
      return { ok: false, delegatedAmount: 0n, reason: 'delegate not set to platform' };
    }
    if (acct.delegatedAmount < minAmount) {
      return { ok: false, delegatedAmount: acct.delegatedAmount, reason: 'insufficient allowance' };
    }
    return { ok: true, delegatedAmount: acct.delegatedAmount };
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) {
      return { ok: false, delegatedAmount: 0n, reason: 'payer token account not found' };
    }
    throw e;
  }
}

// ── Execute one debit: pull debitAmount from payer ATA → merchant ATA ──
// Signed by the system keypair as both the delegate authority AND fee payer
// (gas-absorbed). Works for any SPL mint via transferChecked + decimals.
export interface DebitResult {
  signature: string;
  mock: boolean;
}

export async function executeDebit(params: {
  payerWallet: string;
  merchantWallet: string;
  mint: string;
  amount: bigint;
  decimals: number;
}): Promise<DebitResult> {
  const { payerWallet, merchantWallet, mint, amount, decimals } = params;

  if (isMock()) {
    return { signature: `mock_${bs58.encode(Keypair.generate().publicKey.toBytes())}`, mock: true };
  }

  const connection = getConnection();
  const system = getSystemKeypair();
  const mintPk = new PublicKey(mint);
  const payerAta = await getAssociatedTokenAddress(mintPk, new PublicKey(payerWallet));

  // Ensure the merchant has a token account (fee payer creates it idempotently).
  const merchantAta = await getOrCreateAssociatedTokenAccount(
    connection,
    system,                       // payer of rent/gas
    mintPk,
    new PublicKey(merchantWallet),
  );

  const ix = createTransferCheckedInstruction(
    payerAta,                     // source
    mintPk,                       // mint
    merchantAta.address,          // destination
    system.publicKey,             // authority = our delegate
    amount,                       // base units
    decimals,
  );

  // Devnet can be congested — add a priority fee and retry with a fresh
  // blockhash each attempt so a dropped/expired tx doesn't fail the cycle.
  let sig = '';
  let lastErr: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }))
        .add(ix);
      tx.feePayer = system.publicKey; // gas absorbed by the platform
      sig = await sendAndConfirmTransaction(connection, tx, [system], {
        commitment: 'confirmed',
      });
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;

  return { signature: sig, mock: false };
}
