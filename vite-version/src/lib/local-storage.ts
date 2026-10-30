/** Read osy browser data, carrying existing settings over from the previous name. */
export function readLocalValue(key: string): string | null {
  try {
    const current = localStorage.getItem(key)
    if (current !== null) return current
    const legacyKey = key.replace(/^osy-/, "roadwatch-")
    const legacy = localStorage.getItem(legacyKey)
    if (legacy === null) return null
    try {
      localStorage.setItem(key, legacy)
      localStorage.removeItem(legacyKey)
    } catch {
      // The existing value is still usable if the browser cannot write storage.
    }
    return legacy
  } catch {
    return null
  }
}
