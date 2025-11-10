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
    <div className="min-h-screen relative flex items-start justify-center py-2 sm:py-4 md:py-6 px-2 sm:px-4 overflow-hidden transition-all duration-[3500ms] ease-in-out bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background orbs - same as login screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left orb - animated float */}
        <div 
          className="absolute w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-25 top-[-10%] left-[-10%] bg-blue-400 animate-float"
          style={{
            transition: 'background-color 3500ms ease-in-out, opacity 3500ms ease-in-out'
          }}
        />
        
        {/* Bottom-right orb - animated float with delay */}
        <div 
          className="absolute w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-25 bottom-[-10%] right-[-10%] bg-purple-400 animate-float-delay"
          style={{
            transition: 'background-color 3500ms ease-in-out, opacity 3500ms ease-in-out'
          }}
        />
        
        {/* Center orb - slow pulse animation */}
        <div 
          className="absolute w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full blur-3xl opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-400 animate-pulse-slow"
          style={{
            transition: 'background-color 3500ms ease-in-out, opacity 3500ms ease-in-out'
          }}
        />
      </div>

      {/* Responsive container - full width on mobile, constrained on larger screens */}
      <div className="relative z-10 w-full max-w-[100vw] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col">
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
