const ENC_PREFIX = 'enc:'
let _cachedKey = null

async function getKey() {
  if (_cachedKey) return _cachedKey
  const hex = import.meta.env.VITE_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) return null
  const bytes = new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)))
  _cachedKey = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt'])
  return _cachedKey
}

export async function encryptText(plaintext) {
  const key = await getKey()
  if (!key || !plaintext) return plaintext
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), 12)
  let binary = ''
  for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i])
  return ENC_PREFIX + btoa(binary)
}

export async function decryptText(value) {
  if (!value || !value.startsWith(ENC_PREFIX)) return value
  const key = await getKey()
  if (!key) return value
  try {
    const combined = Uint8Array.from(atob(value.slice(ENC_PREFIX.length)), c => c.charCodeAt(0))
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: combined.slice(0, 12) },
      key,
      combined.slice(12)
    )
    return new TextDecoder().decode(plaintext)
  } catch {
    return value
  }
}
