import { ethers } from "ethers"
import { Keypair } from "@solana/web3.js"
import * as ed25519 from "ed25519-hd-key"
import * as bip39 from "bip39"
import nacl from "tweetnacl"

/**
 * Generate a new HD wallet with mnemonic that can derive addresses for all chains
 */
export async function generateHDWallet() {
  // Generate a 12-word mnemonic using ethers
  const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16))
  
  // Get the seed from mnemonic using bip39 (standard BIP39 seed generation)
  const seed = await bip39.mnemonicToSeed(mnemonic)
  
  // Create master node from seed using BIP32
  const masterNode = ethers.HDNodeWallet.fromSeed(seed)
  
  // Derive Ethereum address using relative path (BIP44: m/44'/60'/0'/0/0)
  // Use relative path without "m/" prefix
  const ethWallet = masterNode.derivePath("44'/60'/0'/0/0")
  
  // BSC uses the same derivation path as Ethereum
  // We'll create a new wallet instance for BSC, but they'll have the same address/private key
  const bscWallet = ethWallet
  
  // For Solana, we derive from the mnemonic seed
  // Solana uses Ed25519 with path m/44'/501'/0'/0'
  const derivedSeed = ed25519.derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key
  const solKeypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey)
  
  return {
    mnemonic,
    solana: {
      address: solKeypair.publicKey.toBase58(),
      privateKey: btoa(String.fromCharCode(...solKeypair.secretKey)),
      secretKey: solKeypair.secretKey,
    },
    ethereum: {
      address: ethWallet.address,
      privateKey: ethWallet.privateKey,
    },
    bsc: {
      address: bscWallet.address,
      privateKey: bscWallet.privateKey,
    },
  }
}

/**
 * Derive wallet from mnemonic phrase
 */
export async function deriveFromMnemonic(mnemonic: string) {
  // Validate mnemonic
  if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic phrase")
  }
  
  // Get the seed from mnemonic using bip39 (standard BIP39 seed generation)
  const seed = await bip39.mnemonicToSeed(mnemonic)
  
  // Create master node from seed using BIP32
  const masterNode = ethers.HDNodeWallet.fromSeed(seed)
  
  // Derive Ethereum address using relative path (BIP44: m/44'/60'/0'/0/0)
  // Use relative path without "m/" prefix
  const ethWallet = masterNode.derivePath("44'/60'/0'/0/0")
  
  // BSC uses the same derivation path as Ethereum
  const bscWallet = ethWallet
  
  // For Solana, we derive from the mnemonic seed
  // Solana uses Ed25519 with path m/44'/501'/0'/0'
  const derivedSeed = ed25519.derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key
  const solKeypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey)
  
  return {
    mnemonic,
    solana: {
      address: solKeypair.publicKey.toBase58(),
      privateKey: btoa(String.fromCharCode(...solKeypair.secretKey)),
      secretKey: solKeypair.secretKey,
    },
    ethereum: {
      address: ethWallet.address,
      privateKey: ethWallet.privateKey,
    },
    bsc: {
      address: bscWallet.address,
      privateKey: bscWallet.privateKey,
    },
  }
}
