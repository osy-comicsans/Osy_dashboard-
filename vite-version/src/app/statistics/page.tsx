import { useMemo, useState } from "react"
import {
  CarFront,
  Download,
  Map,
  Smartphone,
  Wifi,
  WifiOff,
  ArrowUpRight,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AccidentCharts } from "@/features/accidents/charts"
import { RecordsTable } from "@/features/accidents/records-table"
import { useAccidents } from "@/features/accidents/use-accidents"
import { exportAccidents } from "@/features/accidents/export"
import {
  sortAccidents,
  type AccidentSort,
  type AccidentSortKey,
} from "@/features/accidents/sort-accidents"

export default function StatisticsPage() {
  const { records, days, mapLink, active, query, update } = useAccidents({
    filters: false,
  })
  const [sort, setSort] = useState<AccidentSort>({
    key: "occurredAt",
    direction: "desc",
  })
  const sortedRecords = useMemo(
    () => sortAccidents(records, sort),
    [records, sort]
  )
  function changeSort(key: AccidentSortKey) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }
  const metrics = [
    {
      label: "Total accidents",
      value: records.length,
      icon: CarFront,
      text: active
        ? "Reports matching your filters"
        : "Reported across 8 Algerian areas",
    },
    {
      label: "App reports",
      value: records.filter((a) => a.source === "app").length,
      icon: Smartphone,
      text: "Reports from drivers using the app",
    },
    {
      label: "Online alerts",
      value: records.filter((a) => a.channel === "online").length,
      icon: Wifi,
      text: "Alerts received with connectivity",
    },
    {
      label: "Offline alerts",
      value: records.filter((a) => a.channel === "offline").length,
      icon: WifiOff,
      text: "Alerts recorded without connectivity",
    },
  ]
  return (
    <>
      <div className="page-intro">
        <div>
          <h1 className="page-heading">Statistics overview</h1>
          <p className="page-description">
            Accident reports and alerts across Algeria.
          </p>
        </div>
        <div className="page-actions flex gap-3">
          <Link
            className={buttonVariants({ variant: "outline" })}
            to={mapLink()}
          >
            <Map />
            Open map
            <ArrowUpRight />
          </Link>
          <Button
            disabled={!records.length}
            onClick={() => exportAccidents(sortedRecords)}
          >
            <Download />
            Export reports
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="metric-card py-0"
            contentClassName="flex min-w-0 flex-col py-(--card-spacing)"
            material="auto"
            frost={0.6}
            blur={2}
            refraction={56}
            bezel={14}
            specular={0.25}
            dispersion={0}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
                <span className="metric-icon">
                  <metric.icon className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p
                className="metric-value tabular-nums"
                data-testid={metric.label}
              >
                {metric.value}
              </p>
              <p className="metric-caption">{metric.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <AccidentCharts records={records} days={days} />
      <RecordsTable
        records={sortedRecords}
        mapLink={mapLink}
        query={query}
        onQueryChange={(value) => update("q", value)}
        sort={sort}
        onSort={changeSort}
      />
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Sample data for Algeria · October 2026. All people, identity numbers,
        vehicle details, and accident locations are fictional.
      </p>
    </>
  )
}
