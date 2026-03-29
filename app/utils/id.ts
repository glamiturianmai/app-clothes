function createId(): string {
  const isCryptoUuidAvailable =
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'

  if (isCryptoUuidAvailable) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

export { createId }
