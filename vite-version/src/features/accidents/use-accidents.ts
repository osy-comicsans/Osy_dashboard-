import { useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { accidents, areas, sampleEnd } from "./data"

export function useAccidents() {
  const [params, setParams] = useSearchParams()
  const pendingParams = useRef(params)
  const pendingTarget = useRef<string | null>(null)
  // Preserve consecutive edits while a previous URL navigation is committing.
  useEffect(() => {
    if (
      pendingTarget.current === null ||
      pendingTarget.current === params.toString()
    ) {
      pendingParams.current = params
      pendingTarget.current = null
    }
  }, [params])
  useEffect(() => {
    const restore = () => {
      pendingTarget.current = null
      pendingParams.current = new URLSearchParams(window.location.search)
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])
  const query = params.get("q") ?? ""
  const source = ["app", "no-app"].includes(params.get("source") ?? "")
    ? params.get("source")!
    : "all"
  const channel = ["online", "offline"].includes(params.get("channel") ?? "")
    ? params.get("channel")!
    : "all"
  const area = areas.some((a) => a.name === params.get("area"))
    ? params.get("area")!
    : "all"
  const days = ["7", "30", "90"].includes(params.get("days") ?? "")
    ? params.get("days")!
    : "30"
  const severity = ["Minor", "Moderate", "Severe"].includes(
    params.get("severity") ?? ""
  )
    ? params.get("severity")!
    : "all"
  const start = sampleEnd.getTime() - Number(days) * 86400000
  const records = useMemo(
    () =>
      accidents.filter(
        (record) =>
          (source === "all" || record.source === source) &&
          (channel === "all" || record.channel === channel) &&
          (area === "all" || record.area === area) &&
          (severity === "all" || record.severity === severity) &&
          new Date(record.occurredAt).getTime() > start &&
          [
            record.id,
            record.name,
            record.phone,
            record.identityCard,
            record.vehicleCard,
            record.plate,
            record.vehicle,
            record.area,
            record.vin,
          ].some((value) =>
            value.toLowerCase().includes(query.trim().toLowerCase())
          )
      ),
    [source, channel, area, severity, start, query]
  )
  function update(key: string, value: string) {
    const next = new URLSearchParams(pendingParams.current)
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    if (key !== "incident") next.delete("incident")
    pendingParams.current = next
    pendingTarget.current = next.toString()
    setParams(next, { replace: true })
  }
  function reset() {
    pendingParams.current = new URLSearchParams()
    pendingTarget.current = ""
    setParams({})
  }
  function mapLink(id?: string) {
    const next = new URLSearchParams(params)
    if (id) next.set("incident", id)
    else next.delete("incident")
    return "/map" + (next.size ? "?" + next.toString() : "")
  }
  return {
    records,
    query,
    source,
    channel,
    area,
    days,
    severity,
    update,
    reset,
    mapLink,
    selectedId: params.get("incident"),
    active: !!(
      query ||
      source !== "all" ||
      channel !== "all" ||
      area !== "all" ||
      severity !== "all" ||
      days !== "30"
    ),
  }
}
