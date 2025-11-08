"use client"

import { useState } from "react"
import { useWallet } from "./multi-wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function WalletSettings() {
  const { exportPrivateKey, lock, selectedChain, selectedNetwork, switchChain, switchNetwork, isTestnetMode, toggleTestnetMode } = useWallet()
  const [password, setPassword] = useState("")
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setError("")
    setLoading(true)
    try {
      const pk = await exportPrivateKey(password)
      setPrivateKey(pk)
    } catch (err: any) {
      setError(err.message || "Failed to export private key")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (privateKey) {
      await navigator.clipboard.writeText(privateKey)
    }
  }

  return (
    <div className="space-y-4">
      {/* Chain & Network Selection */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-black font-semibold text-base mb-4">Network Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Selected Chain</label>
            <select
              value={selectedChain}
              onChange={(e) => switchChain(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-black text-sm focus:border-black focus:ring-1 focus:ring-black transition-all"
            >
              <option value="solana">Solana</option>
              <option value="ethereum">Ethereum</option>
              <option value="bsc">Binance Smart Chain</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Network Type</label>
            <select
              value={selectedNetwork}
              onChange={(e) => switchNetwork(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-black text-sm focus:border-black focus:ring-1 focus:ring-black transition-all"
            >
              <option value="devnet">Devnet</option>
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testnet Mode Toggle - Like Phantom Wallet */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-black font-semibold text-base mb-1">Testnet Mode</h3>
            <p className="text-zinc-600 text-sm">
              {isTestnetMode 
                ? "Using testnet for all chains (Devnet/Sepolia)" 
                : "Using mainnet for all chains"}
            </p>
          </div>
          <Switch 
            checked={isTestnetMode} 
            onCheckedChange={toggleTestnetMode}
            className="data-[state=checked]:bg-black"
          />
        </div>
      </div>

      {!privateKey ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="text-black font-semibold text-base mb-3">Export Private Key</h3>
          <p className="text-zinc-600 text-sm mb-4">
            ⚠️ Never share your private key. Anyone with it can access your funds.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Enter Password to Confirm</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-zinc-300 text-black"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button onClick={handleExport} disabled={loading || !password} className="w-full bg-black hover:bg-zinc-800 text-white rounded-lg">
              {loading ? "Verifying..." : "Export Private Key"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="text-black font-semibold text-base mb-3">Your Private Key</h3>
          <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg mb-4 break-all">
            <p className="text-black font-mono text-xs">{privateKey}</p>
          </div>
          <Button onClick={handleCopy} variant="outline" className="w-full mb-2 border-zinc-300 text-black hover:bg-zinc-50 rounded-lg">
            Copy Private Key
          </Button>
          <Button
            onClick={() => {
              setPrivateKey(null)
              setPassword("")
            }}
            variant="outline"
            className="w-full border-zinc-300 text-black hover:bg-zinc-50 rounded-lg"
          >
            Done
          </Button>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-black font-semibold text-base mb-4">Wallet Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600">Chain:</span>
            <span className="text-black font-medium">
              {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <Button onClick={lock} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg">
        Sign Out (Lock Wallet)
      </Button>
    </div>
  )
}
