import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { accidents, areas, sampleEnd } from "./data"
import { matchesAccidentQuery } from "./search-accidents"

export function useAccidents({ filters = true }: { filters?: boolean } = {}) {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(() => params.get("q") ?? "")
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
      setQuery(params.get("q") ?? "")
    }
  }, [params])
  useEffect(() => {
    const restore = () => {
      pendingTarget.current = null
      pendingParams.current = new URLSearchParams(window.location.search)
      setQuery(pendingParams.current.get("q") ?? "")
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])
  const source =
    filters && ["app", "no-app"].includes(params.get("source") ?? "")
      ? params.get("source")!
      : "all"
  const channel =
    filters && ["online", "offline"].includes(params.get("channel") ?? "")
      ? params.get("channel")!
      : "all"
  const area =
    filters && areas.some((a) => a.name === params.get("area"))
      ? params.get("area")!
      : "all"
  const days =
    filters && ["7", "30", "90"].includes(params.get("days") ?? "")
      ? params.get("days")!
      : "30"
  const severity =
    filters &&
    ["Minor", "Moderate", "Severe"].includes(params.get("severity") ?? "")
      ? params.get("severity")!
      : "all"
  const start = filters
    ? sampleEnd.getTime() - Number(days) * 86400000
    : Number.NEGATIVE_INFINITY
  const records = useMemo(
    () =>
      accidents.filter(
        (record) =>
          (source === "all" || record.source === source) &&
          (channel === "all" || record.channel === channel) &&
          (area === "all" || record.area === area) &&
          (severity === "all" || record.severity === severity) &&
          new Date(record.occurredAt).getTime() > start &&
          matchesAccidentQuery(record, query, filters)
      ),
    [source, channel, area, severity, start, query, filters]
  )
  function update(key: string, value: string) {
    if (key === "q") setQuery(value)
    const next = new URLSearchParams(pendingParams.current)
    if (!value || (key !== "q" && value === "all")) next.delete(key)
    else next.set(key, value)
    if (key !== "incident") next.delete("incident")
    pendingParams.current = next
    pendingTarget.current = next.toString()
    setParams(next, { replace: true })
  }
  function reset() {
    setQuery("")
    pendingParams.current = new URLSearchParams()
    pendingTarget.current = ""
    setParams({})
  }
  function mapLink(id?: string) {
    const next = new URLSearchParams(params)
    if (query) next.set("q", query)
    else next.delete("q")
    if (!filters) {
      for (const key of ["source", "channel", "area", "severity", "days"])
        next.delete(key)
    }
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
