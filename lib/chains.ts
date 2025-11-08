export type Chain = 
  | "solana" 
  | "ethereum" 
  | "bsc" 
  | "polygon" 
  | "avalanche" 
  | "arbitrum" 
  | "optimism" 
  | "base"
  | "fantom"
  | "cronos"

export type SolanaNetwork = "mainnet-beta" | "testnet" | "devnet"
export type EthereumNetwork = "mainnet" | "sepolia"
export type NetworkType = "mainnet" | "testnet"

export type ChainNetwork = {
  chain: Chain
  network: SolanaNetwork | EthereumNetwork | NetworkType
}

export const DEFAULT_CHAIN: Chain = "solana"
export const DEFAULT_SOLANA: SolanaNetwork = "devnet"
export const DEFAULT_ETHEREUM: EthereumNetwork = "mainnet"

export interface ChainInfo {
  id: Chain
  name: string
  symbol: string
  logo: string
  chainId: number
  testnetChainId?: number
  rpcUrls: {
    mainnet: string[]
    testnet?: string[]
  }
  blockExplorer: {
    mainnet: string
    testnet?: string
  }
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  coingeckoId: string
  type: "evm" | "solana"
}

export const SUPPORTED_CHAINS: Record<Chain, ChainInfo> = {
  solana: {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    logo: "⬡",
    chainId: 0,
    rpcUrls: {
      mainnet: [
        "https://api.mainnet-beta.solana.com",
        "https://solana-mainnet.g.alchemy.com/v2/demo",
      ],
      testnet: [
        "https://api.devnet.solana.com",
        "https://api.testnet.solana.com"
      ]
    },
    blockExplorer: {
      mainnet: "https://solscan.io",
      testnet: "https://solscan.io/?cluster=devnet"
    },
    nativeCurrency: {
      name: "Solana",
      symbol: "SOL",
      decimals: 9
    },
    coingeckoId: "solana",
    type: "solana"
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logo: "Ξ",
    chainId: 1,
    testnetChainId: 11155111,
    rpcUrls: {
      mainnet: [
        "https://ethereum-rpc.publicnode.com",
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth"
      ],
      testnet: [
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://rpc.sepolia.org"
      ]
    },
    blockExplorer: {
      mainnet: "https://etherscan.io",
      testnet: "https://sepolia.etherscan.io"
    },
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    coingeckoId: "ethereum",
    type: "evm"
  },
  bsc: {
    id: "bsc",
    name: "BNB Smart Chain",
    symbol: "BNB",
    logo: "🔶",
    chainId: 56,
    testnetChainId: 97,
    rpcUrls: {
      mainnet: [
        "https://bsc-dataseed.binance.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-rpc.publicnode.com"
      ],
      testnet: [
        "https://bsc-testnet.publicnode.com",
        "https://data-seed-prebsc-1-s1.binance.org:8545"
      ]
    },
    blockExplorer: {
      mainnet: "https://bscscan.com",
      testnet: "https://testnet.bscscan.com"
    },
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    coingeckoId: "binancecoin",
    type: "evm"
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logo: "⬟",
    chainId: 137,
    testnetChainId: 80001,
    rpcUrls: {
      mainnet: [
        "https://polygon-rpc.com",
        "https://polygon-bor-rpc.publicnode.com",
        "https://rpc.ankr.com/polygon"
      ],
      testnet: [
        "https://rpc-mumbai.maticvigil.com",
        "https://polygon-mumbai-bor-rpc.publicnode.com"
      ]
    },
    blockExplorer: {
      mainnet: "https://polygonscan.com",
      testnet: "https://mumbai.polygonscan.com"
    },
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    coingeckoId: "matic-network",
    type: "evm"
  },
  avalanche: {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    logo: "🔺",
    chainId: 43114,
    testnetChainId: 43113,
    rpcUrls: {
      mainnet: [
        "https://api.avax.network/ext/bc/C/rpc",
        "https://avalanche-c-chain-rpc.publicnode.com",
        "https://rpc.ankr.com/avalanche"
      ],
      testnet: [
        "https://api.avax-test.network/ext/bc/C/rpc",
        "https://avalanche-fuji-c-chain-rpc.publicnode.com"
      ]
    },
    blockExplorer: {
      mainnet: "https://snowtrace.io",
      testnet: "https://testnet.snowtrace.io"
    },
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18
    },
    coingeckoId: "avalanche-2",
    type: "evm"
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum One",
    symbol: "ETH",
    logo: "🔷",
    chainId: 42161,
    testnetChainId: 421614,
    rpcUrls: {
      mainnet: [
        "https://arb1.arbitrum.io/rpc",
        "https://arbitrum-one-rpc.publicnode.com",
        "https://rpc.ankr.com/arbitrum"
      ],
      testnet: [
        "https://sepolia-rollup.arbitrum.io/rpc",
        "https://arbitrum-sepolia.blockpi.network/v1/rpc/public"
      ]
    },
    blockExplorer: {
      mainnet: "https://arbiscan.io",
      testnet: "https://sepolia.arbiscan.io"
    },
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    coingeckoId: "ethereum",
    type: "evm"
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    symbol: "ETH",
    logo: "🔴",
    chainId: 10,
    testnetChainId: 11155420,
    rpcUrls: {
      mainnet: [
        "https://mainnet.optimism.io",
        "https://optimism-rpc.publicnode.com",
        "https://rpc.ankr.com/optimism"
      ],
      testnet: [
        "https://sepolia.optimism.io",
        "https://optimism-sepolia.blockpi.network/v1/rpc/public"
      ]
    },
    blockExplorer: {
      mainnet: "https://optimistic.etherscan.io",
      testnet: "https://sepolia-optimism.etherscan.io"
    },
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    coingeckoId: "ethereum",
    type: "evm"
  },
  base: {
    id: "base",
    name: "Base",
    symbol: "ETH",
    logo: "🔵",
    chainId: 8453,
    testnetChainId: 84532,
    rpcUrls: {
      mainnet: [
        "https://mainnet.base.org",
        "https://base-rpc.publicnode.com",
        "https://base.llamarpc.com"
      ],
      testnet: [
        "https://sepolia.base.org",
        "https://base-sepolia-rpc.publicnode.com"
      ]
    },
    blockExplorer: {
      mainnet: "https://basescan.org",
      testnet: "https://sepolia.basescan.org"
    },
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    coingeckoId: "ethereum",
    type: "evm"
  },
  fantom: {
    id: "fantom",
    name: "Fantom",
    symbol: "FTM",
    logo: "👻",
    chainId: 250,
    testnetChainId: 4002,
    rpcUrls: {
      mainnet: [
        "https://rpc.ftm.tools",
        "https://fantom-rpc.publicnode.com",
        "https://rpc.ankr.com/fantom"
      ],
      testnet: [
        "https://rpc.testnet.fantom.network",
        "https://fantom-testnet.publicnode.com"
      ]
    },
    blockExplorer: {
      mainnet: "https://ftmscan.com",
      testnet: "https://testnet.ftmscan.com"
    },
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18
    },
    coingeckoId: "fantom",
    type: "evm"
  },
  cronos: {
    id: "cronos",
    name: "Cronos",
    symbol: "CRO",
    logo: "💎",
    chainId: 25,
    testnetChainId: 338,
    rpcUrls: {
      mainnet: [
        "https://evm.cronos.org",
        "https://cronos-evm-rpc.publicnode.com",
        "https://rpc.vvs.finance"
      ],
      testnet: [
        "https://evm-t3.cronos.org",
        "https://cronos-testnet.crypto.org:8545"
      ]
    },
    blockExplorer: {
      mainnet: "https://cronoscan.com",
      testnet: "https://testnet.cronoscan.com"
    },
    nativeCurrency: {
      name: "Cronos",
      symbol: "CRO",
      decimals: 18
    },
    coingeckoId: "crypto-com-chain",
    type: "evm"
  }
}

export function formatCurrency(chain: Chain, amount: number) {
  const chainInfo = SUPPORTED_CHAINS[chain]
  return `${amount.toFixed(chainInfo.nativeCurrency.decimals === 9 ? 4 : 6)} ${chainInfo.symbol}`
}

export function getChainInfo(chain: Chain): ChainInfo {
  return SUPPORTED_CHAINS[chain]
}
