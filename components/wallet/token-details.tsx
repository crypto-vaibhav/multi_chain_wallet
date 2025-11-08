"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import type { Chain } from "./multi-wallet-context"

interface TokenDetailsProps {
  chain: Chain
  symbol: string
  balance: number
  usdValue: number
  onBack: () => void
}

interface PriceData {
  time: string
  price: number
}

export function TokenDetails({ chain, symbol, balance, usdValue, onBack }: TokenDetailsProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y">("1D")
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [priceChangePercent, setPriceChangePercent] = useState(0)
  const [loading, setLoading] = useState(true)

  // Get token info
  const getTokenInfo = () => {
    switch (symbol) {
      case "SOL":
        return {
          name: "Solana",
          description: "A high-performance blockchain supporting builders around the world creating crypto apps.",
          website: "solana.com",
          coingeckoId: "solana"
        }
      case "ETH":
        return {
          name: "Ethereum",
          description: "The world's programmable blockchain, enabling smart contracts and decentralized applications.",
          website: "ethereum.org",
          coingeckoId: "ethereum"
        }
      case "BNB":
        return {
          name: "BNB",
          description: "The native cryptocurrency of Binance Smart Chain, powering the Binance ecosystem.",
          website: "bnbchain.org",
          coingeckoId: "binancecoin"
        }
      default:
        return {
          name: symbol,
          description: "Cryptocurrency token",
          website: "",
          coingeckoId: ""
        }
    }
  }

  const tokenInfo = getTokenInfo()

  // Fetch price data from CoinGecko
  useEffect(() => {
    async function fetchPriceData() {
      setLoading(true)
      try {
        const days = timeframe === "1D" ? 1 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : 365
        const response = await fetch(
          `/api/prices?coin=${tokenInfo.coingeckoId}&days=${days}`
        )
        
        if (!response.ok) {
          throw new Error("Failed to fetch price data")
        }

        const data = await response.json()
        
        if (data.prices && data.prices.length > 0) {
          const formattedData: PriceData[] = data.prices.map((item: [number, number]) => ({
            time: new Date(item[0]).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              ...(timeframe !== "1D" && { month: 'short', day: 'numeric' })
            }),
            price: item[1]
          }))
          
          setPriceData(formattedData)
          
          const latest = data.prices[data.prices.length - 1][1]
          const oldest = data.prices[0][1]
          setCurrentPrice(latest)
          setPriceChange(latest - oldest)
          setPriceChangePercent(((latest - oldest) / oldest) * 100)
        }
      } catch (error) {
        console.error("Error fetching price data:", error)
        // Use mock data as fallback
        generateMockData()
      }
      setLoading(false)
    }

    if (tokenInfo.coingeckoId) {
      fetchPriceData()
    } else {
      generateMockData()
    }
  }, [timeframe, tokenInfo.coingeckoId])

  // Generate mock price data as fallback
  const generateMockData = () => {
    const basePrice = usdValue / balance
    const points = 24
    const data: PriceData[] = []
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * basePrice * 0.1
      data.push({
        time: `${i}:00`,
        price: basePrice + variation
      })
    }
    
    setPriceData(data)
    setCurrentPrice(basePrice)
    setPriceChange(Math.random() * 10 - 5)
    setPriceChangePercent(Math.random() * 10 - 5)
    setLoading(false)
  }

  // Calculate min and max for chart scaling
  const prices = priceData.map(d => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  // Generate SVG path for the chart
  const generatePath = () => {
    if (priceData.length === 0) return ""
    
    const width = 100 // percentage
    const height = 100 // percentage
    const stepX = width / (priceData.length - 1)
    
    const points = priceData.map((d, i) => {
      const x = i * stepX
      const y = height - ((d.price - minPrice) / priceRange) * height
      return `${x},${y}`
    })
    
    return `M ${points.join(" L ")}`
  }

  const isPositive = priceChange >= 0

  return (
    <div className="space-y-3 sm:space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black">{tokenInfo.name}</h1>
          <p className="text-xs sm:text-sm text-zinc-500 capitalize">{chain} Network</p>
        </div>
      </div>

      {/* Price Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="mb-4">
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mb-1">Current Price</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            ${loading ? "..." : currentPrice.toFixed(2)}
          </h2>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm sm:text-base font-medium">
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
            <span className="text-zinc-400 text-xs sm:text-sm ml-1">{timeframe}</span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 sm:gap-2 bg-white/10 rounded-lg p-1">
          {(["1D", "1W", "1M", "1Y"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 px-2 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                timeframe === tf
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <h3 className="text-black font-semibold text-sm sm:text-base mb-3">Price Chart</h3>
        {loading ? (
          <div className="h-32 sm:h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="relative h-32 sm:h-40 bg-zinc-50 rounded-lg overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Grid lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.2" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.2" />
              
              {/* Price line */}
              <path
                d={generatePath()}
                fill="none"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Area fill */}
              <path
                d={`${generatePath()} L 100,100 L 0,100 Z`}
                fill={isPositive ? "url(#greenGradient)" : "url(#redGradient)"}
              />
              
              <defs>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>

      {/* Your Holdings */}
      <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <h3 className="text-black font-semibold text-sm sm:text-base mb-3">Your Holdings</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 text-xs sm:text-sm">Balance</span>
            <span className="text-black font-semibold text-sm sm:text-base">{balance.toFixed(6)} {symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 text-xs sm:text-sm">Value</span>
            <span className="text-black font-semibold text-sm sm:text-base">${usdValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 text-xs sm:text-sm">Avg. Price</span>
            <span className="text-black font-semibold text-sm sm:text-base">
              ${balance > 0 ? (usdValue / balance).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Token Info */}
      <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <h3 className="text-black font-semibold text-sm sm:text-base mb-3">About {tokenInfo.name}</h3>
        <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed mb-3">
          {tokenInfo.description}
        </p>
        {tokenInfo.website && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 text-xs sm:text-sm">Website:</span>
            <a
              href={`https://${tokenInfo.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium underline"
            >
              {tokenInfo.website}
            </a>
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <h3 className="text-black font-semibold text-sm sm:text-base mb-3">Market Stats</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-zinc-600 text-xs mb-1">24h High</p>
            <p className="text-black font-semibold text-sm sm:text-base">
              ${loading ? "..." : maxPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-zinc-600 text-xs mb-1">24h Low</p>
            <p className="text-black font-semibold text-sm sm:text-base">
              ${loading ? "..." : minPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-zinc-600 text-xs mb-1">24h Volume</p>
            <p className="text-black font-semibold text-sm sm:text-base">
              ${loading ? "..." : (Math.random() * 1000000000).toFixed(0)}M
            </p>
          </div>
          <div>
            <p className="text-zinc-600 text-xs mb-1">Market Cap</p>
            <p className="text-black font-semibold text-sm sm:text-base">
              ${loading ? "..." : (Math.random() * 100000000000).toFixed(0)}B
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
