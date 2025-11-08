import type { Chain } from "./chains"

export interface TokenInfo {
  symbol: string
  name: string
  decimals: number
  coingeckoId: string
  icon?: string
  // Contract addresses by chain
  contracts: Partial<Record<Chain, string>>
}

// Popular stablecoins and tokens across multiple chains
export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  // Stablecoins
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    coingeckoId: "usd-coin",
    contracts: {
      ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC Native
      avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC Native
      optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC Native
      base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC Native
      bsc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC from Binance
      solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    coingeckoId: "tether",
    contracts: {
      ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      avalanche: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      optimism: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      bsc: "0x55d398326f99059fF775485246999027B3197955",
      solana: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    },
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    coingeckoId: "dai",
    contracts: {
      ethereum: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      polygon: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      avalanche: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      arbitrum: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      optimism: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      base: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      bsc: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    },
  },

  // Wrapped tokens
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    coingeckoId: "weth",
    contracts: {
      ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      polygon: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      avalanche: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      optimism: "0x4200000000000000000000000000000000000006",
      base: "0x4200000000000000000000000000000000000006",
    },
  },
  WBTC: {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    coingeckoId: "wrapped-bitcoin",
    contracts: {
      ethereum: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      polygon: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      avalanche: "0x50b7545627a5162F82A992c33b87aDc75187B218",
      arbitrum: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      optimism: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    },
  },

  // DeFi tokens
  UNI: {
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
    coingeckoId: "uniswap",
    contracts: {
      ethereum: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      polygon: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
      arbitrum: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      optimism: "0x6fd9d7AD17242c41f7131d257212c54A0e816691",
    },
  },
  AAVE: {
    symbol: "AAVE",
    name: "Aave",
    decimals: 18,
    coingeckoId: "aave",
    contracts: {
      ethereum: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      polygon: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
      avalanche: "0x63a72806098Bd3D9520cC43356dD78afe5D386D9",
      arbitrum: "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196",
      optimism: "0x76FB31fb4af56892A25e32cFC43De717950c9278",
    },
  },
  LINK: {
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    coingeckoId: "chainlink",
    contracts: {
      ethereum: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      polygon: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
      avalanche: "0x5947BB275c521040051D82396192181b413227A3",
      arbitrum: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      optimism: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
      bsc: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    },
  },

  // Meme coins
  SHIB: {
    symbol: "SHIB",
    name: "Shiba Inu",
    decimals: 18,
    coingeckoId: "shiba-inu",
    contracts: {
      ethereum: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    },
  },
  PEPE: {
    symbol: "PEPE",
    name: "Pepe",
    decimals: 18,
    coingeckoId: "pepe",
    contracts: {
      ethereum: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    },
  },

  // Layer 2 native tokens
  "MATIC": {
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    coingeckoId: "matic-network",
    contracts: {
      ethereum: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", // MATIC on Ethereum
    },
  },
}

// ERC20 ABI - minimal interface for token operations
export const ERC20_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// SPL Token Program ID for Solana
export const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNL6MR9Qk3RJXdyxpAH3dP8dh8k"

// Get token contract address for a specific chain
export function getTokenContract(tokenSymbol: string, chain: Chain): string | undefined {
  const token = SUPPORTED_TOKENS[tokenSymbol]
  return token?.contracts[chain]
}

// Get all supported tokens for a chain
export function getSupportedTokensForChain(chain: Chain): TokenInfo[] {
  return Object.values(SUPPORTED_TOKENS).filter(token => token.contracts[chain])
}

// Check if a token is supported on a chain
export function isTokenSupported(tokenSymbol: string, chain: Chain): boolean {
  return !!getTokenContract(tokenSymbol, chain)
}

// Get token info
export function getTokenInfo(symbol: string): TokenInfo | undefined {
  return SUPPORTED_TOKENS[symbol]
}

// Popular token lists by category
export const TOKEN_CATEGORIES = {
  stablecoins: ["USDC", "USDT", "DAI"],
  wrapped: ["WETH", "WBTC"],
  defi: ["UNI", "AAVE", "LINK"],
  meme: ["SHIB", "PEPE"],
  native: ["ETH", "BNB", "MATIC", "AVAX", "SOL", "FTM", "CELO"],
}

// Default tokens to show for each chain
export const DEFAULT_TOKENS_BY_CHAIN: Record<Chain, string[]> = {
  ethereum: ["USDC", "USDT", "DAI", "WETH", "WBTC", "UNI", "AAVE", "LINK"],
  polygon: ["USDC", "USDT", "DAI", "WETH", "WBTC", "UNI", "AAVE", "LINK"],
  bsc: ["USDC", "USDT", "DAI", "LINK"],
  avalanche: ["USDC", "USDT", "DAI", "WETH", "WBTC", "AAVE", "LINK"],
  arbitrum: ["USDC", "USDT", "DAI", "WETH", "WBTC", "UNI", "AAVE", "LINK"],
  optimism: ["USDC", "USDT", "DAI", "WETH", "WBTC", "UNI", "AAVE", "LINK"],
  base: ["USDC", "DAI", "WETH"],
  fantom: [],
  celo: [],
  solana: ["USDC", "USDT"],
}
