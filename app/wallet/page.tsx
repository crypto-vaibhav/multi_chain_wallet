"use client"

import { useState } from "react"
import { MultiWalletProvider, useWallet } from "@/components/wallet/multi-wallet-context"
import { WalletLockScreen } from "@/components/wallet/wallet-lock-screen"
import { WalletMenuBar } from "@/components/wallet/wallet-menu-bar"
import { WalletHome } from "@/components/wallet/wallet-home"
import { WalletActivity } from "@/components/wallet/wallet-activity"
import { WalletSettings } from "@/components/wallet/wallet-settings"

function WalletContent() {
  const { isLocked } = useWallet()
  const [activeTab, setActiveTab] = useState<"home" | "activity" | "settings">("home")

  if (isLocked) {
    return <WalletLockScreen />
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-start justify-center py-2 sm:py-4 md:py-6 px-2 sm:px-4">
      {/* Responsive container - full width on mobile, constrained on larger screens */}
      <div className="w-full max-w-[100vw] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <WalletMenuBar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
          {activeTab === "home" && <WalletHome />}
          {activeTab === "activity" && <WalletActivity />}
          {activeTab === "settings" && <WalletSettings />}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <MultiWalletProvider>
      <WalletContent />
    </MultiWalletProvider>
  )
}
