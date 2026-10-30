import type { ComponentProps } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { areas } from "./data"
import { useAccidents } from "./use-accidents"
import { Button } from "@/components/ui/button"

function FilterSelect({
  label,
  children,
  ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[10px] font-medium text-muted-foreground">
      <span>{label}</span>
      <select {...props} aria-label={label} className="filter-control w-full">
        {children}
      </select>
    </label>
  )
}

export function AccidentFilters() {
  const {
    query,
    source,
    channel,
    area,
    days,
    severity,
    update,
    reset,
    active,
  } = useAccidents()
  return (
    <section aria-label="Accident filters" className="glass-panel p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="size-4 text-primary" />
        Filter reports
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          Applied to all results
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[1.6fr_repeat(5,1fr)]">
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          <span>Search records</span>
          <span className="relative">
            <Search className="absolute top-[18px] left-3.5 size-4" />
            <input
              type="search"
              aria-label="Search records"
              value={query}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Name, phone, ID, plate…"
              className="filter-control w-full pr-3 pl-10"
            />
          </span>
        </label>
        <FilterSelect
          label="App usage"
          value={source}
          onChange={(e) => update("source", e.target.value)}
        >
          <option value="all">All reports</option>
          <option value="app">Uses app</option>
          <option value="no-app">No app</option>
        </FilterSelect>
        <FilterSelect
          label="Alert connectivity"
          value={channel}
          onChange={(e) => update("channel", e.target.value)}
        >
          <option value="all">All alerts</option>
          <option value="online">Online alert</option>
          <option value="offline">Offline alert</option>
        </FilterSelect>
        <FilterSelect
          label="Area"
          value={area}
          onChange={(e) => update("area", e.target.value)}
        >
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a.name}>{a.name}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Severity"
          value={severity}
          onChange={(e) => update("severity", e.target.value)}
        >
          <option value="all">All severities</option>
          <option>Minor</option>
          <option>Moderate</option>
          <option>Severe</option>
        </FilterSelect>
        <FilterSelect
          label="Sample period"
          value={days}
          onChange={(e) => update("days", e.target.value)}
        >
          <option value="7">24–30 Oct 2026</option>
          <option value="30">October 2026</option>
          <option value="90">Aug–Oct 2026</option>
        </FilterSelect>
      </div>
      {active && (
        <Button variant="ghost" size="sm" className="mt-3" onClick={reset}>
          <X />
          Clear filters
        </Button>
      )}
    </section>
  )
}
