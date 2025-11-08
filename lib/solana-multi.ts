import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js"

export type SolNetwork = "devnet" | "mainnet-beta"

export function getSolConnection(network: SolNetwork) {
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
  return new Connection(url, "confirmed")
}

export function keypairFromBase64(secretB64: string) {
  const bytes = Uint8Array.from(Buffer.from(secretB64, "base64"))
  return Keypair.fromSecretKey(bytes)
}

export async function getSolBalance(address: string, network: SolNetwork) {
  const conn = getSolConnection(network)
  const lamports = await conn.getBalance(new PublicKey(address))
  return lamports / 1e9
}

export async function sendSol(secretB64: string, to: string, amountSol: number, network: SolNetwork) {
  const conn = getSolConnection(network)
  const kp = keypairFromBase64(secretB64)
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: kp.publicKey,
      toPubkey: new PublicKey(to),
      lamports: Math.round(amountSol * 1e9),
    }),
  )
  const sig = await sendAndConfirmTransaction(conn, tx, [kp])
  return sig
}

export async function getSolActivity(address: string, network: SolNetwork) {
  const conn = getSolConnection(network)
  const pubkey = new PublicKey(address)
  const sigs = await conn.getSignaturesForAddress(pubkey, { limit: 12 })
  return sigs.map((s) => ({
    signature: s.signature,
    slot: s.slot,
    err: s.err,
    time: s.blockTime ? new Date(s.blockTime * 1000).toLocaleString() : "unknown",
  }))
}
