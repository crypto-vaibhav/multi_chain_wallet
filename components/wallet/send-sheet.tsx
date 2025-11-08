"use client"

import { useState, useMemo, useEffect } from "react"
import { useWallet, type Chain } from "./multi-wallet-context"
import { sendEVMTransaction, sendSolanaTransaction, isValidSolanaAddress, isValidEVMAddress } from "@/lib/wallet-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle, X, CheckCircle2 } from "lucide-react"

export function SendSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const {
    accounts,
    allAssets,
    selectedChain,
    selectedNetwork,
    isTestnetMode,
    switchChain,
    exportPrivateKey,
    getPassword,
    addActivity,
  } = useWallet()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>(undefined)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [addressWarning, setAddressWarning] = useState<string | null>(null)

  // Show ALL assets (SOL, ETH, BNB) - even with 0 balance
  const availableAssets = useMemo(() => {
    // Always show the three main tokens in order
    return ["SOL", "ETH", "BNB"].map(symbol => {
      const asset = allAssets.find(a => a.symbol === symbol)
      return asset || {
        chain: symbol === "SOL" ? "solana" as Chain : symbol === "ETH" ? "ethereum" as Chain : "bsc" as Chain,
        symbol,
        balance: 0,
        usdValue: 0
      }
    })
  }, [allAssets])

  // Get the chain for the currently selected asset
  const selectedAssetChain = useMemo(() => {
    if (!selectedAsset) return selectedChain
    const asset = allAssets.find(a => a.symbol === selectedAsset)
    return asset?.chain || selectedChain
  }, [selectedAsset, allAssets, selectedChain])

  // Auto-switch chain when asset is selected
  useEffect(() => {
    if (selectedAsset && selectedAssetChain !== selectedChain) {
      switchChain(selectedAssetChain)
    }
  }, [selectedAsset, selectedAssetChain, selectedChain, switchChain])

  // Validate recipient address format
  useEffect(() => {
    if (!recipient) {
      setAddressWarning(null)
      return
    }

    const isValid = selectedAssetChain === "solana" 
      ? isValidSolanaAddress(recipient)
      : isValidEVMAddress(recipient)

    if (!isValid) {
      setAddressWarning("Invalid address format")
    } else {
      setAddressWarning(null)
    }
  }, [recipient, selectedAssetChain])

  const getRpcUrl = (chain: string): string => {
    if (chain === "solana") {
      if (isTestnetMode) return "https://api.devnet.solana.com"
      return "https://api.mainnet-beta.solana.com"
    }
    if (chain === "ethereum") {
      if (isTestnetMode) return "https://ethereum-sepolia-rpc.publicnode.com"
      return "https://eth.llamarpc.com"
    }
    if (chain === "bsc") {
      if (isTestnetMode) return "https://bsc-testnet.publicnode.com"
      return "https://bsc-dataseed.binance.org"
    }
    return ""
  }

  const handleSend = async () => {
    setError(null)
    setTxHash(null)
    setLoading(true)

    try {
      if (!recipient || !amount || !selectedAsset) {
        throw new Error("Please fill in all fields")
      }

      const isValidAddress = selectedAssetChain === "solana"
        ? isValidSolanaAddress(recipient)
        : isValidEVMAddress(recipient)
      
      if (!isValidAddress) {
        throw new Error(`Invalid ${selectedAssetChain} address`)
      }

      const account = accounts.find((a) => a.chain === selectedAssetChain)
      if (!account) throw new Error("Account not found")

      if (account.address.toLowerCase() === recipient.toLowerCase()) {
        throw new Error("Cannot send to your own address")
      }

      const currentPassword = getPassword()
      if (!currentPassword) {
        throw new Error("Please re-unlock your wallet")
      }

      const privateKey = await exportPrivateKey(currentPassword, selectedAssetChain)
      if (!privateKey) throw new Error("Could not retrieve private key")

      const amt = parseFloat(amount)
      if (!Number.isFinite(amt) || amt <= 0) {
        throw new Error("Invalid amount")
      }

      const selectedAssetData = allAssets.find(a => a.symbol === selectedAsset)
      if (!selectedAssetData) {
        throw new Error("Asset not found")
      }
      
      if (selectedAssetData.balance === 0) {
        throw new Error(`You don't have any ${selectedAsset}. Please add funds first.`)
      }
      
      if (amt > selectedAssetData.balance) {
        throw new Error(`Insufficient balance. You have ${selectedAssetData.balance.toFixed(4)} ${selectedAsset}`)
      }

      const rpcUrl = getRpcUrl(selectedAssetChain)
      let txIdentifier = ""

      if (selectedAssetChain === "solana") {
        const sig = await sendSolanaTransaction(privateKey, recipient, amount, rpcUrl)
        setTxHash(sig)
        txIdentifier = sig
      } else {
        const hash = await sendEVMTransaction(privateKey, recipient, amount, rpcUrl)
        setTxHash(hash)
        txIdentifier = hash
      }

      addActivity({
        type: "sent",
        chain: selectedAssetChain,
        symbol: selectedAsset,
        amount: amt,
        txHash: txIdentifier,
        from: account.address,
        to: recipient,
      })

      setRecipient("")
      setAmount("")
      setSelectedAsset(undefined)
    } catch (err: any) {
      setError(err.message || "Failed to send")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[380px] md:max-w-[420px] bg-white border border-zinc-200 p-0 gap-0 max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-black text-base sm:text-lg font-semibold">Send Crypto</DialogTitle>
              <DialogDescription className="text-zinc-600 text-xs mt-1">
                Send crypto from any of your wallets
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">Asset</label>
              <Select onValueChange={setSelectedAsset} value={selectedAsset}>
                <SelectTrigger className="w-full bg-white border-zinc-300 h-11 rounded-lg text-black">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200">
                  {availableAssets.map(asset => (
                    <SelectItem key={`${asset.chain}-${asset.symbol}`} value={asset.symbol} className="text-black">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{asset.symbol}</span>
                          <span className="text-zinc-400 text-xs capitalize">({asset.chain})</span>
                        </div>
                        <span className="text-zinc-500 text-xs">{asset.balance.toFixed(4)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">Recipient Address</label>
              <Input
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={`bg-white border-zinc-300 h-11 rounded-lg placeholder:text-zinc-400 text-sm ${
                  addressWarning ? "border-yellow-500" : ""
                }`}
              />
              {addressWarning && (
                <div className="flex items-start gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-700 text-[10px] leading-relaxed">{addressWarning}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-zinc-300 h-11 rounded-lg placeholder:text-zinc-400 text-sm"
              />
            </div>

            {txHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-green-700 text-sm font-semibold">Transaction Sent!</p>
                </div>
                <p className="text-green-600 text-[10px] break-all font-mono leading-relaxed">{txHash}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200">
          <Button 
            onClick={handleSend} 
            disabled={loading || !recipient || !amount || !selectedAsset || !!addressWarning} 
            className="w-full bg-black hover:bg-zinc-800 text-white h-11 rounded-lg font-medium disabled:bg-zinc-300 disabled:text-zinc-500"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Transaction"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
