"use client"

import { useState } from "react"
import { useWallet } from "./multi-wallet-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReceiveSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { accounts, isTestnetMode } = useWallet()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopy = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[380px] md:max-w-[420px] bg-white border border-zinc-200 p-0 gap-0 max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-black text-base sm:text-lg font-semibold">Receive Crypto</DialogTitle>
              <DialogDescription className="text-zinc-600 text-xs mt-1">
                {isTestnetMode ? "🧪 Testnet Mode" : "🌐 Mainnet Mode"}
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <div className="space-y-3">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <div
                  key={account.chain}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-black font-semibold text-sm capitalize">{account.chain}</p>
                      <p className="text-zinc-500 text-xs">
                        {account.balance.toFixed(4)} {account.chain === "solana" ? "SOL" : account.chain === "ethereum" ? "ETH" : "BNB"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
                    <div className="flex items-start gap-2">
                      <p className="text-black font-mono text-[10px] break-all flex-1 leading-relaxed">
                        {account.address}
                      </p>
                      <button
                        onClick={() => handleCopy(account.address)}
                        className="flex-shrink-0 p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
                      >
                        {copiedAddress === account.address ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {copiedAddress === account.address && (
                    <p className="text-green-600 text-[10px] mt-1.5 text-center font-medium">
                      ✓ Copied!
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-xs">
                  No wallets found. Create a wallet in Settings.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 bg-blue-50">
          <p className="text-blue-900 text-[10px] leading-relaxed">
            <strong>⚠️ Important:</strong> Verify you're on {isTestnetMode ? "testnet" : "mainnet"} before sharing addresses.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
