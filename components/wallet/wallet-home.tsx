"use client"

import { useState } from "react"
import { useWallet, type Chain } from "./multi-wallet-context"
import { Button } from "@/components/ui/button"
import { SendSheet } from "./send-sheet"
import { ReceiveSheet } from "./receive-sheet"
import { TokenDetails } from "./token-details"
import { Copy, Check } from "lucide-react"

export function WalletHome() {
  const { accounts, allAssets, totalBalance, getAddress, selectedChain, selectedNetwork, isTestnetMode, switchChain } = useWallet()
  const [showSend, setShowSend] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<{
    chain: Chain
    symbol: string
    balance: number
    usdValue: number
  } | null>(null)

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  // Get current address based on selected chain and network
  const currentAddress = getAddress()

  // If a token is selected, show token details view
  if (selectedToken) {
    return (
      <TokenDetails
        chain={selectedToken.chain}
        symbol={selectedToken.symbol}
        balance={selectedToken.balance}
        usdValue={selectedToken.usdValue}
        onBack={() => setSelectedToken(null)}
      />
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Total Portfolio Value Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium">Total Portfolio Value</p>
          <div className="bg-white/10 px-2 py-0.5 rounded-full">
            <p className="text-white text-xs font-medium">
              {isTestnetMode ? "🧪 TEST" : "🌐 MAIN"}
            </p>
          </div>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">${totalBalance.toFixed(2)}</h2>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={() => setShowReceive(true)}
            className="flex-1 bg-white text-black hover:bg-zinc-100 font-medium rounded-lg sm:rounded-xl h-10 sm:h-11 text-sm sm:text-base"
          >
            Receive
          </Button>
          <Button
            onClick={() => setShowSend(true)}
            className="flex-1 bg-white text-black hover:bg-zinc-100 font-medium rounded-lg sm:rounded-xl h-10 sm:h-11 text-sm sm:text-base"
          >
            Send
          </Button>
        </div>
      </div>

      {/* All Assets */}
      <div>
        <h3 className="text-black font-semibold text-sm sm:text-base mb-2 sm:mb-3">Your Assets</h3>
        {allAssets.length > 0 ? (
          <div className="space-y-2">
            {/* Always show SOL, ETH, and BNB even if balance is 0 */}
            {["SOL", "ETH", "BNB"].map((symbol) => {
              const asset = allAssets.find(a => a.symbol === symbol)
              if (!asset) return null
              
              return (
                <div
                  key={`${asset.chain}-${asset.symbol}`}
                  onClick={() => {
                    setSelectedToken({
                      chain: asset.chain,
                      symbol: asset.symbol,
                      balance: asset.balance,
                      usdValue: asset.usdValue
                    })
                  }}
                  className={`bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all cursor-pointer ${
                    selectedChain === asset.chain 
                      ? 'border-black bg-zinc-50 hover:bg-zinc-100' 
                      : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-black font-semibold text-sm sm:text-base">{asset.symbol}</p>
                      <p className="text-zinc-500 text-xs sm:text-sm capitalize">{asset.chain}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-black font-semibold text-sm sm:text-base">{asset.balance.toFixed(4)}</p>
                      <p className="text-zinc-500 text-xs sm:text-sm">${asset.usdValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
            <p className="text-zinc-500 text-xs sm:text-sm">No assets found. Send some funds to get started.</p>
          </div>
        )}
      </div>

      <SendSheet open={showSend} onOpenChange={setShowSend} />
      <ReceiveSheet open={showReceive} onOpenChange={setShowReceive} />
    </div>
  )
}
