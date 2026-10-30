import type { Accident } from "./data"

export type AccidentSortKey =
  | "occurredAt"
  | "name"
  | "phone"
  | "identityCard"
  | "vehicleCard"
  | "plate"
  | "source"
  | "channel"
  | "severity"
export type AccidentSort = { key: AccidentSortKey; direction: "asc" | "desc" }

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })
const sourceRank = { app: 0, "no-app": 1 }
const channelRank = { online: 0, offline: 1 }
const severityRank = { Minor: 0, Moderate: 1, Severe: 2 }

export function sortAccidents(
  records: Accident[],
  sort: AccidentSort
): Accident[] {
  return [...records].sort((a, b) => {
    let compared: number
    switch (sort.key) {
      case "occurredAt":
        compared = Date.parse(a.occurredAt) - Date.parse(b.occurredAt)
        break
      case "source":
        compared = sourceRank[a.source] - sourceRank[b.source]
        break
      case "channel":
        compared = channelRank[a.channel] - channelRank[b.channel]
        break
      case "severity":
        compared = severityRank[a.severity] - severityRank[b.severity]
        break
      case "phone":
        compared = collator.compare(
          a.phone.replace(/\D/g, ""),
          b.phone.replace(/\D/g, "")
        )
        break
      default:
        compared = collator.compare(a[sort.key], b[sort.key])
    }
    return (
      compared * (sort.direction === "asc" ? 1 : -1) ||
      Date.parse(b.occurredAt) - Date.parse(a.occurredAt) ||
      collator.compare(a.id, b.id)
    )
  })
}

export function sortDescription(sort: AccidentSort) {
  const ascending = sort.direction === "asc"
  switch (sort.key) {
    case "occurredAt":
      return ascending ? "Oldest first" : "Newest first"
    case "source":
      return ascending ? "Uses app first" : "No app first"
    case "channel":
      return ascending ? "Online first" : "Offline first"
    case "severity":
      return ascending ? "Minor to severe" : "Severe to minor"
    case "name":
      return ascending ? "Names A–Z" : "Names Z–A"
    default:
      return ascending ? "Lowest first" : "Highest first"
  }
}
