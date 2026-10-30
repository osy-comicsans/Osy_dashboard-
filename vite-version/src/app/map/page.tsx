import { useCallback, useState } from "react"
import { BarChart3, Eye, MapPin, SearchX } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AccidentFilters } from "@/features/accidents/filters"
import { AccidentMap } from "@/features/accidents/accident-map"
import {
  ChannelBadge,
  SeverityBadge,
  SourceBadge,
} from "@/features/accidents/badges"
import { RecordDetails } from "@/features/accidents/record-details"
import { useAccidents } from "@/features/accidents/use-accidents"
import { dateLabel, type Accident } from "@/features/accidents/data"

export default function MapPage() {
  const { records, selectedId, mapLink } = useAccidents()
  const [params, setParams] = useSearchParams()
  const [details, setDetails] = useState<Accident | null>(null)
  const selected = records.find((r) => r.id === selectedId)
  const select = useCallback(
    (id: string) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          next.set("incident", id)
          return next
        },
        { replace: true }
      )
    },
    [setParams]
  )
  const statisticsParams = new URLSearchParams(params)
  statisticsParams.delete("incident")
  return (
    <>
      <div className="page-intro">
        <div>
          <h1 className="page-heading">Accident map</h1>
          <p className="page-description">
            Accident locations across Algeria. Select a report to inspect it.
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          to={
            "/statistics" +
            (statisticsParams.size ? "?" + statisticsParams.toString() : "")
          }
        >
          <BarChart3 />
          View statistics
        </Link>
      </div>
      <AccidentFilters />
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Card className="min-w-0 gap-0 pb-0">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Accident locations</CardTitle>
                <CardDescription className="mt-1">
                  Algeria · {new Set(records.map((r) => r.area)).size}{" "}
                  {new Set(records.map((r) => r.area)).size === 1
                    ? "area"
                    : "areas"}{" "}
                  · sample reports
                </CardDescription>
              </div>
              <span className="report-badge badge-app">
                <MapPin className="size-3" />
                {records.length} locations
              </span>
            </div>
          </CardHeader>
          <AccidentMap
            records={records}
            selectedId={selected?.id ?? null}
            onSelect={select}
          />
        </Card>
        <Card className="min-w-0 gap-0 pb-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>
              Matching reports{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({records.length})
              </span>
            </CardTitle>
            <CardDescription>Select a report to focus the map</CardDescription>
          </CardHeader>
          {selected && (
            <div className="selected-report">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-primary">
                  Selected report
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetails(selected)}
                >
                  <Eye />
                  Details
                </Button>
              </div>
              <p className="mt-2 text-sm font-semibold">{selected.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.phone}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.plate} · {selected.vehicle}
              </p>
            </div>
          )}
          <div className="max-h-[450px] overflow-y-auto xl:h-[640px] xl:max-h-[640px]">
            {records.map((record) => (
              <button
                key={record.id}
                aria-pressed={record.id === selectedId}
                onClick={() => select(record.id)}
                className={
                  "map-report block p-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{record.id}</span>
                  <SeverityBadge severity={record.severity} />
                </div>
                <p className="mt-2 flex items-center gap-1 text-sm font-medium">
                  <MapPin className="size-3.5 text-primary" />
                  {record.area}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {record.road} · {dateLabel(record.occurredAt, true)}
                </p>
                <div className="mt-3 flex gap-2">
                  <SourceBadge source={record.source} />
                  <ChannelBadge channel={record.channel} />
                </div>
              </button>
            ))}
            {!records.length && (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <SearchX className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">No matching reports</p>
                <p className="text-xs text-muted-foreground">
                  Clear or change the filters to see accident locations.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Sample data for Algeria · October 2026. Markers show fictional accident
        locations. The base map needs an internet connection.
      </p>
      <RecordDetails
        record={details}
        onClose={() => setDetails(null)}
        mapLink={mapLink}
      />
    </>
  )
}
