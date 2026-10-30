import type { Accident } from "./data"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function matchesAccidentQuery(
  record: Accident,
  query: string,
  includeLocation = false
) {
  const search = normalize(query)
  if (!search) return true
  const fields = [
    record.name,
    record.phone,
    record.id,
    record.identityCard,
    record.vehicleCard,
    record.plate,
    record.vin,
  ]
  if (includeLocation) fields.push(record.vehicle, record.area)
  if (fields.some((value) => normalize(value).includes(search))) return true
  // Accept phone digits with or without spaces, country prefix, or punctuation.
  const phoneQuery = search.replace(/\D/g, "")
  return (
    /^[+\d\s().-]+$/.test(search) &&
    phoneQuery.length > 0 &&
    record.phone.replace(/\D/g, "").includes(phoneQuery)
  )
}
