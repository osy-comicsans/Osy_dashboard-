import { useState } from "react"
import { ChevronLeft, ChevronRight, Eye, MapPin, SearchX } from "lucide-react"
import { Link } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChannelBadge, SeverityBadge, SourceBadge } from "./badges"
import { dateLabel, type Accident } from "./data"
import { RecordDetails } from "./record-details"

export function RecordsTable({
  records,
  mapLink,
}: {
  records: Accident[]
  mapLink: (id: string) => string
}) {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Accident | null>(null)
  const pageCount = Math.max(1, Math.ceil(records.length / 8))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * 8
  return (
    <>
      <Card className="min-w-0 pb-0">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>
                Accident reports{" "}
                <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-normal">
                  {records.length}
                </span>
              </CardTitle>
              <CardDescription className="mt-1">
                Driver, vehicle, and alert information for every report
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              Newest first · Algeria time
            </span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="records-table w-full text-left text-sm">
            <thead className="border-y bg-muted/35 text-xs text-muted-foreground">
              <tr>
                {[
                  "Report / date",
                  "Driver",
                  "Identity / vehicle card",
                  "Vehicle",
                  "App usage",
                  "Alert",
                  "Severity",
                  "Actions",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 font-medium whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(start, start + 8).map((record) => (
                <tr
                  key={record.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-xs font-medium">{record.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dateLabel(record.occurredAt, true)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.area}
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      className="font-medium hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      onClick={() => setSelected(record)}
                    >
                      {record.name}
                    </button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.phone}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-[11px] whitespace-nowrap tabular-nums">
                    <p>{record.identityCard}</p>
                    <p className="mt-1.5 text-muted-foreground">
                      {record.vehicleCard}
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-medium">{record.plate}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.vehicle}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <SourceBadge source={record.source} />
                  </td>
                  <td className="px-4 py-4">
                    <ChannelBadge channel={record.channel} />
                  </td>
                  <td className="px-4 py-4">
                    <SeverityBadge severity={record.severity} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={"View details for " + record.id}
                        onClick={() => setSelected(record)}
                      >
                        <Eye />
                      </Button>
                      <Link
                        className={buttonVariants({
                          size: "icon-sm",
                          variant: "ghost",
                        })}
                        aria-label={"View " + record.id + " on map"}
                        to={mapLink(record.id)}
                      >
                        <MapPin />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && (
            <div className="flex flex-col items-center gap-2 px-4 py-14">
              <SearchX className="mb-1 size-8 text-muted-foreground" />
              <p className="font-medium">No matching reports</p>
              <p className="text-sm text-muted-foreground">
                Try another search or clear the filters.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
          <span aria-live="polite">
            {records.length ? start + 1 : 0}–
            {Math.min(start + 8, records.length)} of {records.length} reports
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft />
            </Button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>
      <RecordDetails
        record={selected}
        onClose={() => setSelected(null)}
        mapLink={mapLink}
      />
    </>
  )
}
