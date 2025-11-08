"use client"

import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ReceiveCard() {
  const { state } = useWallet()
  const { toast } = useToast()
  const address = state.status === "empty" ? "" : state.address

  return (
    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">Your Address</p>
          <p className="text-white font-mono break-all">{address}</p>
        </div>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(address)
            toast({ title: "Copied", description: "Address copied to clipboard" })
          }}
          className="bg-white/20 hover:bg-white/30 text-white"
        >
          Copy
        </Button>
      </div>
      <p className="text-white/50 text-xs mt-2">Send SOL or SPL tokens to this address.</p>
    </div>
  )
}
