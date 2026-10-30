import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "@/styles/leaflet-theme.css"
import { AlertCircle, LocateFixed, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dateLabel, severityColors, type Accident } from "./data"

export function AccidentMap({
  records,
  selectedId,
  onSelect,
}: {
  records: Accident[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const [tileIssue, setTileIssue] = useState(false)

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, {
      scrollWheelZoom: false,
    }).setView([28.2, 2.6], 5)
    map.current = instance
    const layer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(instance)
    tiles.current = layer
    layer.on("tileerror", () => setTileIssue(true))
    const observer = new ResizeObserver(() => instance.invalidateSize())
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      instance.remove()
      map.current = null
      tiles.current = null
    }
  }, [])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    const layer = L.layerGroup().addTo(instance)
    const currentMarkers = new Map<string, L.Marker>()
    for (const record of records) {
      const icon = L.divIcon({
        className: "accident-marker",
        html:
          '<span class="marker-pin" style="--marker-color:' +
          severityColors[record.severity] +
          '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v7m0 4h.01" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></span>',
        iconSize: [34, 40],
        iconAnchor: [17, 37],
        popupAnchor: [0, -36],
      })
      const popup = document.createElement("div")
      popup.className = "accident-popup"
      for (const [tag, value] of [
        ["strong", record.id],
        ["p", record.area + " · " + record.severity],
        ["p", dateLabel(record.occurredAt, true)],
        [
          "p",
          (record.source === "app" ? "Uses app" : "No app") +
            " · " +
            record.channel +
            " alert",
        ],
      ]) {
        const element = document.createElement(tag)
        element.textContent = value
        popup.append(element)
      }
      const marker = L.marker([record.latitude, record.longitude], {
        icon,
        title: record.id + " · " + record.area,
        alt: record.id,
        keyboard: true,
      })
        .bindPopup(popup)
        .on("click", () => onSelect(record.id))
        .addTo(layer)
      currentMarkers.set(record.id, marker)
    }
    markers.current = currentMarkers
    if (records.length)
      instance.fitBounds(
        L.latLngBounds(records.map((r) => [r.latitude, r.longitude])),
        { padding: [42, 42], maxZoom: 12, animate: false }
      )
    else instance.setView([28.2, 2.6], 5)
    return () => {
      layer.remove()
      currentMarkers.clear()
    }
  }, [records, onSelect])

  useEffect(() => {
    const instance = map.current
    const marker = selectedId ? markers.current.get(selectedId) : undefined
    for (const [id, item] of markers.current) {
      item.getElement()?.classList.toggle("is-selected", id === selectedId)
      item.setZIndexOffset(id === selectedId ? 1000 : 0)
    }
    if (instance && marker) {
      instance.setView(marker.getLatLng(), 13, { animate: false })
      marker.openPopup()
    }
  }, [selectedId, records, onSelect])

  function fitAll() {
    if (records.length)
      map.current?.fitBounds(
        L.latLngBounds(records.map((r) => [r.latitude, r.longitude])),
        { padding: [42, 42], maxZoom: 12 }
      )
    else map.current?.setView([28.2, 2.6], 5)
  }

  return (
    <div className="relative isolate h-[480px] min-w-0 overflow-hidden rounded-b-xl md:h-[640px]">
      <div
        ref={container}
        className="roadwatch-map h-full w-full"
        role="region"
        aria-label="Interactive accident map of Algeria"
        data-testid="accident-map"
      />
      <Button
        variant="outline"
        className="absolute top-4 right-4 z-[500] h-11 text-xs"
        onClick={fitAll}
      >
        <LocateFixed />
        Fit all reports
      </Button>
      <div className="map-legend absolute right-4 bottom-8 z-[500] flex gap-4 text-[10px]">
        {Object.entries(severityColors).map(([name, color]) => (
          <span key={name} className="flex items-center gap-1.5">
            <i className="size-2 rounded-full" style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
      {tileIssue && (
        <div
          role="status"
          className="map-notice absolute right-4 bottom-24 left-4 z-[500] flex flex-wrap items-center gap-2 p-3 text-xs"
        >
          <AlertCircle className="size-4 text-warning" />
          <span className="flex-1">
            Some map tiles could not load. Report locations are still available.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTileIssue(false)
              tiles.current?.redraw()
            }}
          >
            <RefreshCw />
            Retry
          </Button>
        </div>
      )}
      {!records.length && (
        <div className="map-notice pointer-events-none absolute top-20 right-4 left-20 z-[500] p-3 text-center text-xs">
          No accident locations match these filters.
        </div>
      )}
    </div>
  )
}
