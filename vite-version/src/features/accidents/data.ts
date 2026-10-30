export type Accident = {
  id: string
  occurredAt: string
  name: string
  phone: string
  identityCard: string
  vehicleCard: string
  plate: string
  vehicle: string
  vin: string
  source: "app" | "no-app"
  channel: "online" | "offline"
  severity: "Minor" | "Moderate" | "Severe"
  status: "New" | "Responding" | "Resolved"
  area: string
  road: string
  latitude: number
  longitude: number
}

export const areas = [
  {
    name: "Algiers",
    latitude: 36.7538,
    longitude: 3.0588,
    road: "N11 · Algiers",
  },
  { name: "Oran", latitude: 35.6971, longitude: -0.6308, road: "N2 · Oran" },
  {
    name: "Constantine",
    latitude: 36.365,
    longitude: 6.6147,
    road: "N3 · Constantine",
  },
  { name: "Blida", latitude: 36.47, longitude: 2.8277, road: "N1 · Blida" },
  { name: "Sétif", latitude: 36.19, longitude: 5.41, road: "N5 · Sétif" },
  { name: "Annaba", latitude: 36.9, longitude: 7.7667, road: "N44 · Annaba" },
  {
    name: "Tizi Ouzou",
    latitude: 36.7167,
    longitude: 4.05,
    road: "N12 · Tizi Ouzou",
  },
  { name: "Batna", latitude: 35.5559, longitude: 6.1741, road: "N3 · Batna" },
] as const

const names = [
  "Amine Benali",
  "Yasmine Mansouri",
  "Karim Haddad",
  "Lina Boudiaf",
  "Sofiane Meziane",
  "Sara Belkacem",
  "Riad Saidi",
  "Ines Rahmani",
  "Mehdi Ait Ali",
  "Nour Bouzid",
  "Walid Cherif",
  "Aya Hamidi",
]
const vehicles = [
  "Renault Clio",
  "Peugeot 208",
  "Dacia Sandero",
  "Volkswagen Golf",
  "Hyundai i10",
  "Seat Ibiza",
]
const wilayaCodes = ["16", "31", "25", "09", "19", "23", "15", "05"]

// Synthetic records only. IDs, contact information and locations are demonstration values.
export const accidents: Accident[] = Array.from(
  { length: 48 },
  (_, i): Accident => {
    const areaIndex = (i * 7 + Math.floor(i / 5)) % areas.length
    const area = areas[areaIndex]
    const sequence = String(i + 1).padStart(3, "0")
    return {
      id: "ACC-2026-" + sequence,
      occurredAt:
        "2026-10-" +
        String(30 - Math.floor((i * 30) / 48)).padStart(2, "0") +
        "T" +
        String(7 + (i % 14)).padStart(2, "0") +
        ":" +
        String((i * 7) % 60).padStart(2, "0") +
        ":00+01:00",
      name: names[i % names.length],
      phone: "+213 555 000 " + sequence,
      identityCard: "DEMO-NID-" + String(100001 + i),
      vehicleCard: "DEMO-REG-" + String(200001 + i),
      plate: String(10000 + i * 13) + " 126 " + wilayaCodes[areaIndex],
      vehicle: vehicles[i % vehicles.length],
      vin: "DEMO-VIN-" + String(300001 + i),
      source: i % 3 === 1 ? "no-app" : "app",
      channel: i % 4 < 2 ? "online" : "offline",
      severity: i % 7 === 0 ? "Severe" : i % 3 === 0 ? "Moderate" : "Minor",
      status: i < 5 ? "New" : i < 14 ? "Responding" : "Resolved",
      area: area.name,
      road: area.road,
      latitude: area.latitude + ((i % 5) - 2) * 0.013,
      longitude: area.longitude + ((Math.floor(i / 5) % 5) - 2) * 0.014,
    }
  }
).sort(
  (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
)

export const sampleEnd = new Date("2026-10-30T23:59:59+01:00")
export const dateLabel = (value: string, includeTime = false) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    ...(includeTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
    timeZone: "Africa/Algiers",
  }).format(new Date(value))

export const severityColors = {
  Minor: "var(--status-success)",
  Moderate: "var(--status-warning)",
  Severe: "var(--status-danger)",
}
