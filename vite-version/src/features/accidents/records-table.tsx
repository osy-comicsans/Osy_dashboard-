import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Search,
  SearchX,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChannelBadge, SeverityBadge, SourceBadge } from "./badges"
import { dateLabel, type Accident } from "./data"
import { RecordDetails } from "./record-details"
import {
  sortDescription,
  type AccidentSort,
  type AccidentSortKey,
} from "./sort-accidents"

const columns: { key: AccidentSortKey; label: string }[] = [
  { key: "occurredAt", label: "Report / date" },
  { key: "name", label: "Driver" },
  { key: "phone", label: "Phone" },
  { key: "identityCard", label: "Identity card" },
  { key: "vehicleCard", label: "Vehicle card" },
  { key: "plate", label: "License plate" },
  { key: "source", label: "App usage" },
  { key: "channel", label: "Alert" },
  { key: "severity", label: "Severity" },
]

export function RecordsTable({
  records,
  mapLink,
  query,
  onQueryChange,
  sort,
  onSort,
}: {
  records: Accident[]
  mapLink: (id: string) => string
  query: string
  onQueryChange: (value: string) => void
  sort: AccidentSort
  onSort: (key: AccidentSortKey) => void
}) {
  const [pagination, setPagination] = useState({ page: 1, context: "" })
  const context = [query, sort.key, sort.direction].join("|")
  const [selected, setSelected] = useState<Accident | null>(null)
  const pageCount = Math.max(1, Math.ceil(records.length / 8))
  const currentPage =
    pagination.context === context ? Math.min(pagination.page, pageCount) : 1
  const start = (currentPage - 1) * 8
  return (
    <>
      <section className="min-w-0 pb-0">
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
                Click a column heading to sort; click again to reverse.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              {sortDescription(sort)} · Algeria time
            </span>
          </div>
          <div className="records-search relative mt-4 w-full sm:max-w-md">
            <label htmlFor="report-search" className="sr-only">
              Search records
            </label>
            <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
            <input
              id="report-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by name, phone, or ID…"
              className="filter-control w-full"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onQueryChange("")}
                className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="records-table w-full text-left text-sm">
            <thead className="border-y bg-muted/35 text-xs text-muted-foreground">
              <tr>
                {columns.map((column) => {
                  const active = sort.key === column.key
                  const Icon = active
                    ? sort.direction === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        active
                          ? sort.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                      className="px-4 py-2 font-medium whitespace-nowrap"
                    >
                      <button
                        type="button"
                        className="table-sort-button"
                        onClick={() => onSort(column.key)}
                        title={
                          "Sort by " +
                          column.label +
                          (active && sort.direction === "asc"
                            ? " descending"
                            : " ascending")
                        }
                      >
                        {column.label}
                        <Icon className="size-3.5" aria-hidden="true" />
                      </button>
                    </th>
                  )
                })}
                <th scope="col" className="px-4 py-3 font-medium">
                  Actions
                </th>
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
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap tabular-nums">
                    {record.phone}
                  </td>
                  <td className="px-4 py-4 text-[11px] whitespace-nowrap tabular-nums">
                    <p>{record.identityCard}</p>
                  </td>
                  <td className="px-4 py-4 text-[11px] whitespace-nowrap tabular-nums">
                    {record.vehicleCard}
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
                Try a different name, phone number, or ID.
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
              onClick={() => setPagination({ page: currentPage - 1, context })}
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
              onClick={() => setPagination({ page: currentPage + 1, context })}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>
      <RecordDetails
        record={selected}
        onClose={() => setSelected(null)}
        mapLink={mapLink}
      />
    </>
  )
}
