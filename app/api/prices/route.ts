import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coin = searchParams.get("coin")
  const days = searchParams.get("days") || "1"

  // If specific coin and days are requested, fetch historical data
  if (coin && days) {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`,
        {
          next: { revalidate: 300 }, // Cache for 5 minutes
          headers: { accept: "application/json" },
        }
      )
      
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
      }
      
      const data = await res.json()
      return NextResponse.json({
        prices: data.prices || [],
        market_caps: data.market_caps || [],
        total_volumes: data.total_volumes || []
      })
    } catch (error) {
      console.error("Error fetching historical price data:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }
  }

  // Otherwise, fetch current prices for all coins
  try {
    const ids = ["solana", "ethereum", "binancecoin"].join("%2C")
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, {
      next: { revalidate: 60 },
      headers: { accept: "application/json" },
    })
    if (!res.ok) return NextResponse.json({}, { status: 200 })
    const data = await res.json()
    return NextResponse.json({
      solana: data.solana?.usd ?? 0,
      ethereum: data.ethereum?.usd ?? 0,
      binancecoin: data.binancecoin?.usd ?? 0,
    })
  } catch {
    return NextResponse.json({}, { status: 200 })
  }
}
