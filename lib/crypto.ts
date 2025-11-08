"use client"

function getSubtle() {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("WebCrypto not available")
  }
  return window.crypto.subtle
}

async function sha256(data: Uint8Array) {
  const subtle = getSubtle()
  const digest = await subtle.digest("SHA-256", data)
  return new Uint8Array(digest)
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtle()
  const enc = new TextEncoder()
  const keyMaterial = await subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"])
  return subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export function randomBytes(length: number) {
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return arr
}

export function toBase64(u8: Uint8Array) {
  if (typeof window === "undefined") return ""
  let binary = ""
  u8.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

export function fromBase64(b64: string) {
  if (typeof window === "undefined") return new Uint8Array()
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export async function encryptSecretKey(secretKey: Uint8Array, password: string) {
  const subtle = getSubtle()
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = await deriveKey(password, salt)
  const cipher = await subtle.encrypt({ name: "AES-GCM", iv }, key, secretKey)
  const verifier = await sha256(secretKey)
  return {
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    cipherText: toBase64(new Uint8Array(cipher)),
    verifier: toBase64(verifier),
  }
}

export async function decryptSecretKey(
  data: { salt: string; iv: string; cipherText: string },
  password: string,
): Promise<Uint8Array> {
  const subtle = getSubtle()
  const salt = fromBase64(data.salt)
  const iv = fromBase64(data.iv)
  const cipherText = fromBase64(data.cipherText)
  const key = await deriveKey(password, salt)
  const plain = await subtle.decrypt({ name: "AES-GCM", iv }, key, cipherText)
  return new Uint8Array(plain)
}

export const encryptPrivateKey = encryptSecretKey
export const decryptPrivateKey = decryptSecretKey
