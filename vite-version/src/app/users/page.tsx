import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  SearchX,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Panel,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { accidents, dateLabel, type Accident } from "@/features/accidents/data"
import { SourceBadge } from "@/features/accidents/badges"
import { RecordDetails } from "@/features/accidents/record-details"
import { initials, readPreferences } from "@/features/account/storage"

// Identity cards identify drivers; names alone are not unique.
const usersByIdentity = new Map<string, Accident[]>()
for (const record of accidents) {
  const reports = usersByIdentity.get(record.identityCard) ?? []
  reports.push(record)
  usersByIdentity.set(record.identityCard, reports)
}
const users = Array.from(usersByIdentity.values(), (reports) => ({
  ...reports[0],
  reportCount: reports.length,
}))
type SortKey = "name" | "phone" | "identityCard" | "source" | "reportCount"
const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "Driver" },
  { key: "phone", label: "Phone" },
  { key: "identityCard", label: "Identity card" },
  { key: "source", label: "App usage" },
  { key: "reportCount", label: "Reports" },
]
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

export default function UsersPage() {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>(
    { key: "name", direction: "asc" }
  )
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Accident | null>(null)
  const [density] = useState(() => readPreferences().density)
  const term = query.trim().toLowerCase()
  const phoneTerm = term.replace(/\D/g, "")
  const results = users
    .filter(
      (user) =>
        [
          user.name,
          user.phone,
          user.identityCard,
          user.vehicleCard,
          user.plate,
        ].some((value) => value.toLowerCase().includes(term)) ||
        (/^[+\d\s()-]+$/.test(term) &&
          phoneTerm.length > 0 &&
          user.phone.replace(/\D/g, "").includes(phoneTerm))
    )
    .sort((a, b) => {
      const order =
        sort.key === "reportCount"
          ? a.reportCount - b.reportCount
          : collator.compare(String(a[sort.key]), String(b[sort.key]))
      return (
        (sort.direction === "asc" ? order : -order) ||
        collator.compare(a.identityCard, b.identityCard)
      )
    })
  const pageCount = Math.max(1, Math.ceil(results.length / 10))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * 10

  function search(value: string) {
    setQuery(value)
    setPage(1)
  }

  function changeSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
    setPage(1)
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <h1 className="page-heading">Users</h1>
          <p className="page-description">
            Driver information from accident reports across Algeria.
          </p>
        </div>
        <span className="report-badge badge-neutral">Sample data</span>
      </div>
      <Panel className="min-w-0 gap-0 pb-0">
        <CardHeader className="pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>
                Driver directory{" "}
                <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-normal">
                  {users.length}
                </span>
              </CardTitle>
              <CardDescription className="mt-1">
                Search contact details or IDs. Select a driver to view their
                latest report.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              {results.length} {results.length === 1 ? "driver" : "drivers"}
            </span>
          </div>
          <div className="records-search relative mt-4 w-full sm:max-w-md">
            <label htmlFor="user-search" className="sr-only">
              Search users
            </label>
            <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
            <input
              id="user-search"
              type="search"
              value={query}
              onChange={(event) => search(event.target.value)}
              placeholder="Search by name, phone, or ID…"
              className="filter-control w-full"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => search("")}
                className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table
            className="records-table users-table w-full text-left text-sm"
            data-density={density}
          >
            <caption className="sr-only">
              Fictional drivers and their latest report information
            </caption>
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
                        onClick={() => changeSort(column.key)}
                      >
                        {column.label}
                        <Icon className="size-3.5" aria-hidden="true" />
                      </button>
                    </th>
                  )
                })}
                <th scope="col" className="px-4 py-3 font-medium">
                  Latest report
                </th>
                <th scope="col" className="relative px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {results.slice(start, start + 10).map((user) => (
                <tr
                  key={user.identityCard}
                  className="border-b hover:bg-muted/30"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="user-initials" aria-hidden="true">
                        {initials(user.name)}
                      </span>
                      <div>
                        <button
                          type="button"
                          className="font-medium hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                          onClick={() => setSelected(user)}
                        >
                          {user.name}
                        </button>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {user.area}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap tabular-nums">
                    {user.phone}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-xs tabular-nums">{user.identityCard}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.vehicleCard}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <SourceBadge source={user.source} />
                  </td>
                  <td className="px-4 py-4 tabular-nums">{user.reportCount}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-xs font-medium">{user.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dateLabel(user.occurredAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={"View report for " + user.identityCard}
                      onClick={() => setSelected(user)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!results.length && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <SearchX className="mb-1 size-6 text-muted-foreground" />
            <h2 className="font-medium">No matching users</h2>
            <p className="text-sm text-muted-foreground">
              Try another name, phone number, or ID.
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => search("")}
            >
              Clear search
            </Button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {results.length ? start + 1 : 0}–
            {Math.min(start + 10, results.length)} of {results.length} drivers
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Panel>
      <RecordDetails
        record={selected}
        onClose={() => setSelected(null)}
        mapLink={(id) => "/map?incident=" + encodeURIComponent(id)}
      />
    </>
  )
}
