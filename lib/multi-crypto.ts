const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function getKeyFromPassword(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, [
    "deriveKey",
  ])
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function encryptJSON(data: unknown, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getKeyFromPassword(password, salt)
  const plaintext = encoder.encode(JSON.stringify(data))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext))
  return {
    salt: Buffer.from(salt).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    data: Buffer.from(ciphertext).toString("base64"),
  }
}

export async function decryptJSON<T = unknown>(
  bundle: { salt: string; iv: string; data: string },
  password: string,
): Promise<T> {
  const salt = Uint8Array.from(Buffer.from(bundle.salt, "base64"))
  const iv = Uint8Array.from(Buffer.from(bundle.iv, "base64"))
  const key = await getKeyFromPassword(password, salt)
  const ct = Uint8Array.from(Buffer.from(bundle.data, "base64"))
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct)
  return JSON.parse(decoder.decode(new Uint8Array(pt)))
}
