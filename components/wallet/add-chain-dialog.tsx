"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SUPPORTED_CHAINS, type Chain } from "@/lib/chains"
import { Loader2, Plus, CheckCircle2 } from "lucide-react"

interface AddChainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingChains: Chain[]
  onAddChain: (chain: Chain) => Promise<void>
}

export function AddChainDialog({ open, onOpenChange, existingChains, onAddChain }: AddChainDialogProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | "">("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Get available chains (not already added)
  const availableChains = Object.keys(SUPPORTED_CHAINS).filter(
    (chain) => !existingChains.includes(chain as Chain)
  ) as Chain[]

  const handleAddChain = async () => {
    if (!selectedChain) {
      setError("Please select a chain")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onAddChain(selectedChain)
      setSelectedChain("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to add chain")
    } finally {
      setLoading(false)
    }
  }

  const chainInfo = selectedChain ? SUPPORTED_CHAINS[selectedChain] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[420px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-black">
            Add Network
          </DialogTitle>
          <DialogDescription className="text-zinc-600">
            Select a blockchain network to add to your wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableChains.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-black font-semibold mb-1">All networks added!</p>
              <p className="text-zinc-600 text-sm">
                You've added all supported blockchain networks
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-zinc-700 text-sm font-medium mb-2">
                  Select Network
                </label>
                <Select value={selectedChain} onValueChange={(value) => setSelectedChain(value as Chain)}>
                  <SelectTrigger className="w-full bg-white border border-zinc-300 rounded-xl h-12 text-black">
                    <SelectValue placeholder="Choose a blockchain..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-zinc-200 rounded-xl max-h-[300px]">
                    {availableChains.map((chain) => {
                      const info = SUPPORTED_CHAINS[chain]
                      return (
                        <SelectItem
                          key={chain}
                          value={chain}
                          className="cursor-pointer hover:bg-zinc-100 focus:bg-zinc-100"
                        >
                          <div className="flex items-center gap-3 py-1">
                            <span className="text-2xl">{info.logo}</span>
                            <div>
                              <div className="font-semibold text-black">{info.name}</div>
                              <div className="text-xs text-zinc-500">{info.symbol}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {chainInfo && (
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{chainInfo.logo}</span>
                    <div className="flex-1">
                      <h3 className="text-black font-bold text-lg">{chainInfo.name}</h3>
                      <p className="text-zinc-600 text-sm">{chainInfo.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Type:</span>
                      <span className="text-black font-medium uppercase">{chainInfo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Chain ID:</span>
                      <span className="text-black font-medium">{chainInfo.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Decimals:</span>
                      <span className="text-black font-medium">{chainInfo.nativeCurrency.decimals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600">Explorer:</span>
                      <a
                        href={chainInfo.blockExplorer.mainnet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xs underline"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleAddChain}
                disabled={!selectedChain || loading}
                className="w-full bg-black hover:bg-zinc-800 text-white font-medium rounded-xl h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Network...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Network
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
