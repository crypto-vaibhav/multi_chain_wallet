"use client"
import { useWallet } from "./multi-wallet-context"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

export function WalletMenuBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: "home" | "activity" | "settings"
  setActiveTab: (tab: "home" | "activity" | "settings") => void
}) {
  const { lock } = useWallet()

  return (
    <div className="bg-white border-b border-zinc-200">
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-black">Multi-Chain Wallet</h1>
          <Button
            onClick={lock}
            variant="outline"
            size="sm"
            className="bg-black text-white hover:bg-zinc-800 border-black rounded-lg h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
            Lock
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "home"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "activity"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "settings"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
