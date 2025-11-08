"use client"

import { useState } from "react"
import { useWallet, type Chain } from "./multi-wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

export function WalletLockScreen() {
  const { unlock, createWallet, importWallet } = useWallet()
  const [mode, setMode] = useState<"unlock" | "create" | "import">("unlock")
  const [password, setPassword] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [selectedChain, setSelectedChain] = useState<Chain>("solana")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleUnlock = async () => {
    setLoading(true)
    setError("")
    const success = await unlock(password)
    if (!success) setError("Invalid password")
    setLoading(false)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError("")
    try {
      // Create all chains at once (pass any chain, it will create all)
      await createWallet(password, "solana")
    } catch (err: any) {
      setError(err.message || "Failed to create wallet")
    }
    setLoading(false)
  }

  const handleImport = async () => {
    setLoading(true)
    setError("")
    try {
      await importWallet(privateKey, password, selectedChain)
    } catch (err: any) {
      setError(err.message || "Failed to import wallet")
    }
    setLoading(false)
  }

  // Get background animation class based on mode
  const getBackgroundClass = () => {
    switch (mode) {
      case "unlock":
        return "bg-gradient-unlock"
      case "create":
        return "bg-gradient-create"
      case "import":
        return "bg-gradient-import"
      default:
        return "bg-gradient-unlock"
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-2 sm:p-4 transition-all duration-[3500ms] ease-in-out ${getBackgroundClass()}`}>
      {/* Animated background orbs - smooth transitions with consistent positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left orb - stays in similar area, only color changes */}
        <div className={`absolute w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-25 top-[-10%] left-[-10%] animate-float ${
          mode === "unlock" ? "bg-blue-400" : 
          mode === "create" ? "bg-green-400" :
          "bg-purple-400"
        }`} 
        style={{
          transition: 'background-color 3500ms ease-in-out, opacity 3500ms ease-in-out'
        }} />
        
        {/* Bottom-right orb - stays in similar area, only color changes */}
        <div className={`absolute w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-25 bottom-[-10%] right-[-10%] animate-float-delay ${
          mode === "unlock" ? "bg-purple-400" : 
          mode === "create" ? "bg-blue-400" :
          "bg-pink-400"
        }`}
        style={{
          transition: 'background-color 3500ms ease-in-out, opacity 3500ms ease-in-out'
        }} />
        
        {/* Center orb - stays centered, only color changes */}
        <div className={`absolute w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow ${
          mode === "unlock" ? "bg-pink-400" : 
          mode === "create" ? "bg-yellow-400" :
          "bg-cyan-400"
        }`}
        style={{
          transition: 'background-color 3500ms ease-in-out, opacity 3500ms ease-in-out'
        }} />
      </div>

      {/* Responsive container */}
      <div className="w-full max-w-[100vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-500 hover:shadow-3xl animate-fadeIn">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header with tabs */}
          <div className="flex bg-zinc-100 rounded-full p-1 mb-6 sm:mb-8 transition-all duration-300 relative overflow-hidden">
            {/* Sliding indicator with bounce effect */}
            <div 
              className={`absolute top-1 bottom-1 rounded-full bg-white shadow-md transition-all duration-500 ease-out animate-scaleIn ${
                mode === "unlock" ? "left-1 w-[calc(33.333%-0.25rem)]" :
                mode === "create" ? "left-[calc(33.333%+0.125rem)] w-[calc(33.333%-0.25rem)]" :
                "left-[calc(66.666%+0.25rem)] w-[calc(33.333%-0.25rem)]"
              }`}
              style={{
                transition: 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
            <button
              onClick={() => setMode("unlock")}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 relative z-10 transform hover:scale-105 active:scale-95 ${
                mode === "unlock"
                  ? "text-black"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Unlock
            </button>
            <button
              onClick={() => setMode("create")}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 relative z-10 transform hover:scale-105 active:scale-95 ${
                mode === "create"
                  ? "text-black"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setMode("import")}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 relative z-10 transform hover:scale-105 active:scale-95 ${
                mode === "import"
                  ? "text-black"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Import
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8 transition-all duration-300">
            <span className="inline-block animate-slideIn" key={mode}>
              {mode === "unlock" ? "Unlock Wallet" : mode === "create" ? "Create Wallet" : "Import Wallet"}
            </span>
          </h1>

          <div className="space-y-4 overflow-hidden">
            <div className="animate-slideIn" key={`content-${mode}`}>
              {mode === "create" && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-4 transition-all duration-300">
                  <p className="text-zinc-700 text-sm">
                    💡 Creating a wallet will generate addresses for all chains (Solana, Ethereum, BSC) from a single mnemonic phrase.
                  </p>
                </div>
              )}

            {mode === "import" && (
              <div>
                <label className="block text-zinc-600 text-sm font-medium mb-2">Select Chain</label>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value as Chain)}
                  className="w-full bg-white border border-zinc-300 rounded-xl h-12 text-black focus:border-black focus:ring-0 px-4 transition-all"
                >
                  <option value="solana">Solana</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="bsc">Binance Smart Chain</option>
                </select>
              </div>
            )}

            {mode === "import" && (
              <div>
                <label className="block text-zinc-600 text-sm font-medium mb-2">Private Key</label>
                <Input
                  type="password"
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="bg-white border border-zinc-300 rounded-xl h-12 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-zinc-600 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-zinc-300 rounded-xl h-12 text-black placeholder:text-zinc-400 focus:border-black focus:ring-0 pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

            <Button
              onClick={mode === "unlock" ? handleUnlock : mode === "create" ? handleCreate : handleImport}
              disabled={loading || !password || (mode === "import" && !privateKey)}
              className="w-full bg-black hover:bg-zinc-800 text-white font-medium rounded-xl h-12 mt-6 transition-all"
            >
              {loading
                ? "Loading..."
                : mode === "unlock"
                  ? "Unlock"
                  : mode === "create"
                    ? "Create Wallet"
                    : "Import Wallet"}
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
