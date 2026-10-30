import type { Accident } from "./data"

export function exportAccidents(records: Accident[]) {
  const fields: (keyof Accident)[] = [
    "id",
    "occurredAt",
    "name",
    "phone",
    "identityCard",
    "vehicleCard",
    "plate",
    "vehicle",
    "vin",
    "source",
    "channel",
    "severity",
    "status",
    "area",
    "road",
    "latitude",
    "longitude",
  ]
  const cell = (value: unknown) => {
    const text = String(value)
    return (
      '"' +
      (/^[=+@\-\t\r]/.test(text) ? "'" : "") +
      text.replaceAll('"', '""') +
      '"'
    )
  }
  const csv = [
    fields.join(","),
    ...records.map((record) =>
      fields.map((field) => cell(record[field])).join(",")
    ),
  ].join("\r\n")
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  )
  const link = document.createElement("a")
  link.href = url
  link.download = "roadwatch-accidents.csv"
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
