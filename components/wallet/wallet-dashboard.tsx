"use client"

import { useEffect, useMemo, useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getParsedTokens, getRecentActivity, getSolBalance } from "@/lib/solana"
import ReceiveCard from "./receive-card"
import SendForm from "./send-form"
import { PublicKey } from "@solana/web3.js"

export default function WalletDashboard() {
  const { state, network, setNetwork, lock, exportSecretBase58 } = useWallet()
  const { toast } = useToast()

  const pubkey = useMemo(() => {
    if (state.status === "empty") return null
    return new PublicKey(state.address)
  }, [state])

  const [balance, setBalance] = useState<number | null>(null)
  const [tokens, setTokens] = useState<Array<{ mint: string; uiAmount: number; decimals: number }>>([])
  const [activity, setActivity] = useState<Array<{ signature: string; slot: number; blockTime: number | null }>>([])
  const [isLoading, setIsLoading] = useState(false)

  async function refresh() {
    if (!pubkey) return
    setIsLoading(true)
    try {
      const [b, t, a] = await Promise.all([
        getSolBalance(pubkey, network),
        getParsedTokens(pubkey, network),
        getRecentActivity(pubkey, network, 10),
      ])
      setBalance(b)
      setTokens(t)
      setActivity(a)
    } catch (e: any) {
      toast({ title: "Refresh failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubkey?.toBase58(), network])

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Account</p>
            <p className="text-white font-mono text-sm break-all">{pubkey?.toBase58()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={network} onValueChange={(v: any) => setNetwork(v)}>
              <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent className="bg-[#1b1b1b] text-white border-white/10">
                <SelectItem value="devnet">Devnet</SelectItem>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="mainnet-beta">Mainnet</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={refresh} className="bg-white/20 hover:bg-white/30 text-white">
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const sec = exportSecretBase58()
                if (sec) {
                  navigator.clipboard.writeText(sec)
                  toast({ title: "Secret exported", description: "Copied base58 secret key to clipboard" })
                } else {
                  toast({ title: "Locked", description: "Unlock to export secret", variant: "destructive" })
                }
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Export Secret
            </Button>
            <Button
              onClick={lock}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              Lock
            </Button>
          </div>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white/60">Balance</p>
            <p className="text-3xl text-white">{balance === null ? "—" : `${balance.toFixed(4)} SOL`}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(pubkey?.toBase58() || "")
                toast({ title: "Copied", description: "Address copied to clipboard" })
              }}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Copy Address
            </Button>
          </div>
        </div>

        <SendForm />
        <ReceiveCard />

        <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
          <p className="text-white/80 mb-2">Tokens</p>
          {tokens.length === 0 ? (
            <p className="text-white/50 text-sm">No SPL tokens found.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {tokens.map((t) => (
                <li key={t.mint} className="py-2 flex items-center justify-between">
                  <span className="text-white/90">
                    {t.mint.slice(0, 4)}…{t.mint.slice(-4)}
                  </span>
                  <span className="text-white">{t.uiAmount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
          <p className="text-white/80 mb-2">Activity</p>
          {activity.length === 0 ? (
            <p className="text-white/50 text-sm">No recent transactions.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {activity.map((a) => (
                <li key={a.signature} className="py-2">
                  <p className="text-white/90 break-all">{a.signature}</p>
                  <p className="text-white/50 text-xs">
                    Slot {a.slot} {a.blockTime ? `• ${new Date(a.blockTime * 1000).toLocaleString()}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
