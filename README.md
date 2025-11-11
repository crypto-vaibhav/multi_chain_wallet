# 🔐 Multi-Chain Crypto Wallet

A modern, secure, and beautiful multi-chain cryptocurrency wallet built with Next.js 15. Manage your Solana, Ethereum, and Binance Smart Chain assets all in one place with a sleek, mobile-first interface.

![Multi-Chain Wallet](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🌐 Multi-Chain Support
- **Solana** - Full support for SOL and SPL tokens
- **Ethereum** - Native ETH and ERC-20 token support
- **Binance Smart Chain** - BNB and BEP-20 token compatibility
- Single mnemonic phrase manages all chains

### 🔒 Security First
- **AES-GCM Encryption** - Military-grade encryption for private keys
- **Local Storage Only** - Your keys never leave your device
- **Password Protected** - Secure unlock mechanism
- **HD Wallet** - Hierarchical Deterministic wallet (BIP-39/BIP-44 compliant)

### 💎 Beautiful UI/UX
- **Smooth Animations** - Floating gradient orbs with fluid transitions
- **Mobile-First Design** - Responsive across all devices
- **Phone-Sized Interface** - Optimized wallet experience (max 520px)
- **Dark/Light Themes** - Adaptive color schemes

### 📊 Advanced Features
- **Real-Time Price Charts** - Live cryptocurrency prices via CoinGecko API
- **Token Details** - Comprehensive market data and analytics
- **Multi-Network Support** - Mainnet and Testnet modes
- **Activity History** - Track all your transactions
- **Send & Receive** - Easy asset transfers with QR codes
- **Custom Token Support** - Add any ERC-20 or SPL token

### 🎨 User Interface
- **Portfolio Overview** - Total balance across all chains
- **Asset Management** - View and manage all tokens
- **Transaction History** - Filtered activity feed per wallet
- **Settings Panel** - Network switching, private key export
- **Lock Screen** - Create, Import, or Unlock wallet with animated backgrounds

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- A modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/crypto-vaibhav/multi_chain_wallet.git

# Navigate to project directory
cd multi_chain_wallet

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the wallet.

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

## 📱 Usage Guide

### Creating a New Wallet

1. Click **"Create"** tab on the lock screen
2. Enter a strong password
3. Click **"Create Wallet"**
4. **IMPORTANT**: Backup your mnemonic phrase securely
5. Wallet addresses for all chains are automatically generated

### Importing an Existing Wallet

1. Click **"Import"** tab
2. Select the blockchain (Solana/Ethereum/BSC)
3. Enter your private key or mnemonic
4. Set a password
5. Click **"Import Wallet"**

### Sending Crypto

1. Navigate to **Home** tab
2. Click **"Send"** button
3. Select the asset to send
4. Enter recipient address
5. Specify amount
6. Confirm transaction

### Receiving Crypto

1. Click **"Receive"** button
2. Select the chain
3. Copy your address or show QR code
4. Share with sender

### Viewing Token Details

1. Click on any token in your asset list
2. View real-time price charts (1D, 1W, 1M, 1Y)
3. See market cap, 24h volume, and price changes
4. Check your holdings and total value

## 🏗️ Project Structure

```
multi_chain_wallet/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   └── prices/               # CoinGecko price fetching
│   ├── globals.css               # Global styles & animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main wallet app page
├── components/                   # React components
│   ├── wallet/                   # Wallet-specific components
│   │   ├── multi-wallet-context.tsx    # Wallet state management
│   │   ├── wallet-lock-screen.tsx      # Lock/Create/Import UI
│   │   ├── wallet-home.tsx             # Portfolio & assets
│   │   ├── wallet-activity.tsx         # Transaction history
│   │   ├── wallet-settings.tsx         # Settings panel
│   │   ├── send-sheet.tsx              # Send crypto interface
│   │   ├── receive-sheet.tsx           # Receive crypto interface
│   │   └── token-details.tsx           # Token price charts
│   └── ui/                       # Reusable UI components
├── lib/                          # Core libraries
│   ├── encryption.ts             # AES-GCM encryption utilities
│   ├── hd-wallet.ts              # HD wallet generation
│   ├── solana.ts                 # Solana blockchain integration
│   ├── ethereum.ts               # Ethereum blockchain integration
│   ├── evm.ts                    # EVM chain utilities
│   ├── chains.ts                 # Chain configurations
│   └── tokens.ts                 # Token definitions
├── public/                       # Static assets
└── package.json                  # Dependencies
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.1.9** - Utility-first styling
- **Shadcn/UI** - Beautiful component library

### Blockchain Integration
- **@solana/web3.js** - Solana blockchain interaction
- **ethers v6** - Ethereum & EVM chains
- **bip39** - Mnemonic phrase generation
- **ed25519-hd-key** - Solana key derivation
- **bs58** - Base58 encoding/decoding

### Encryption & Security
- **Web Crypto API** - Browser-native encryption
- **AES-GCM** - Authenticated encryption
- **PBKDF2** - Password-based key derivation

### Data & APIs
- **CoinGecko API** - Real-time cryptocurrency prices
- **LocalStorage** - Secure client-side storage

## 🔐 Security Considerations

### Best Practices Implemented
✅ All private keys encrypted with AES-GCM  
✅ Password never stored, only used for key derivation  
✅ Keys never transmitted over network  
✅ Secure random number generation  
✅ HD wallet for deterministic key generation  

### User Responsibilities
⚠️ **Never share your private keys or mnemonic phrase**  
⚠️ **Use a strong, unique password**  
⚠️ **Backup your mnemonic phrase offline**  
⚠️ **This is a client-side wallet - you control your keys**  
⚠️ **Test with small amounts first**  

## 🌍 Supported Networks

### Solana
- **Mainnet**: `https://api.mainnet-beta.solana.com`
- **Devnet**: `https://api.devnet.solana.com`

### Ethereum
- **Mainnet**: `https://eth.llamarpc.com` (Chain ID: 1)
- **Sepolia Testnet**: `https://rpc.sepolia.org` (Chain ID: 11155111)

### Binance Smart Chain
- **Mainnet**: `https://bsc-dataseed.binance.org` (Chain ID: 56)
- **Testnet**: `https://data-seed-prebsc-1-s1.binance.org:8545` (Chain ID: 97)

## 📊 API Integration

### CoinGecko Price API
```typescript
GET /api/prices?symbol={token}&period={timeframe}

// Example
GET /api/prices?symbol=bitcoin&period=24h
```

**Supported Periods**: `24h`, `7d`, `30d`, `1y`

**Response**:
```json
{
  "prices": [[timestamp, price], ...],
  "currentPrice": 45000,
  "priceChange24h": 2.5,
  "marketCap": 850000000000,
  "volume24h": 25000000000
}
```

## 🎨 Custom Animations

### Floating Gradient Orbs
```css
/* Smooth 12-second floating animation */
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(15px, -15px) scale(1.05); }
  66% { transform: translate(-10px, 10px) scale(0.95); }
}
```

### Features
- 3500ms transition timing for ultra-smooth color changes
- Reduced movement (±15px) for subtle effect
- Multiple orbs with staggered delays
- Responsive blur and opacity

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Test on multiple devices and browsers
- Document complex functions
- Keep security as top priority

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- CoinGecko API has rate limits (50 calls/minute for free tier)
- Some tokens may not have price data available
- Transaction history is stored locally (clears on browser data reset)

## 🗺️ Roadmap

- [ ] Add more blockchain networks (Polygon, Avalanche, etc.)
- [ ] Implement NFT support
- [ ] Add hardware wallet integration
- [ ] Multi-language support
- [ ] Desktop app (Electron)
- [ ] Browser extension version
- [ ] Swap functionality (DEX integration)
- [ ] Staking support
- [ ] Transaction signing with QR codes

## 📧 Contact & Support

- **GitHub**: [@crypto-vaibhav](https://github.com/crypto-vaibhav)
- **Repository**: [multi_chain_wallet](https://github.com/crypto-vaibhav/multi_chain_wallet)
- **Issues**: [Report a bug](https://github.com/crypto-vaibhav/multi_chain_wallet/issues)

## ⭐ Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [CoinGecko](https://www.coingecko.com/) - Cryptocurrency data API
- [Solana](https://solana.com/) - High-performance blockchain
- [Ethereum](https://ethereum.org/) - Decentralized platform

---

<div align="center">

**⚡ Built with ❤️ for the crypto community**

Made with [Next.js](https://nextjs.org/) | Powered by [Web3](https://web3.foundation/)

[⬆ Back to Top](#-multi-chain-crypto-wallet)

</div>
