"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Keypair } from "@solana/web3.js"
import { sendSOL } from "@/lib/solana"

export default function SendForm() {
  const { state, network } = useWallet()
  const { toast } = useToast()
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [isBusy, setIsBusy] = useState(false)

  const canSend = state.status === "unlocked"

  async function onSend() {
    if (!canSend) return
    const amt = Number(amount)
    if (!to || !Number.isFinite(amt) || amt <= 0) {
      toast({ title: "Invalid input", description: "Enter a valid address and amount.", variant: "destructive" })
      return
    }
    setIsBusy(true)
    try {
      const kp = Keypair.fromSecretKey(state.secretKey)
      const sig = await sendSOL(kp, to, amt, network)
      toast({ title: "Transaction sent", description: sig })
      setTo("")
      setAmount("")
    } catch (e: any) {
      toast({ title: "Send failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3">
      <div>
        <p className="text-white/80 mb-2">Send SOL</p>
        <Input
          placeholder="Recipient address"
          className="bg-black/20 border-white/10 text-white"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Amount (SOL)"
          className="bg-black/20 border-white/10 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button disabled={!canSend || isBusy} onClick={onSend} className="bg-white/20 text-white hover:bg-white/30">
          {isBusy ? "Sending..." : "Send"}
        </Button>
      </div>
      {state.status !== "unlocked" && <p className="text-xs text-white/50">Unlock your wallet to send.</p>}
    </div>
  )
}
