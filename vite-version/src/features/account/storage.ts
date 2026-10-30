import { readLocalValue } from "@/lib/local-storage"

export type Profile = {
  name: string
  email: string
  phone: string
  area: string
}

export type Preferences = {
  startPage: "/statistics" | "/map" | "/users"
  density: "comfortable" | "compact"
}

export const defaultProfile: Profile = {
  name: "osy Admin",
  email: "admin@example.com",
  phone: "",
  area: "All Algeria",
}

export const defaultPreferences: Preferences = {
  startPage: "/statistics",
  density: "comfortable",
}

// These pages use local demo data until an account service is connected.
function readStored(key: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(readLocalValue(key) || "null")
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

export function readProfile(): Profile {
  const stored = readStored("osy-profile")
  // Update only the old demo name; keep customized profile names intact.
  if (stored.name === "RoadWatch Admin") stored.name = defaultProfile.name
  return Object.fromEntries(
    Object.entries(defaultProfile).map(([key, value]) => [
      key,
      typeof stored[key] === "string" ? stored[key] : value,
    ])
  ) as Profile
}

export function readPreferences(): Preferences {
  const stored = readStored("osy-preferences")
  return {
    startPage:
      stored.startPage === "/map" || stored.startPage === "/users"
        ? stored.startPage
        : "/statistics",
    density: stored.density === "compact" ? "compact" : "comfortable",
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem("osy-profile", JSON.stringify(profile))
}

export function savePreferences(preferences: Preferences) {
  localStorage.setItem("osy-preferences", JSON.stringify(preferences))
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}
