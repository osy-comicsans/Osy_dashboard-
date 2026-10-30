import type { CSSProperties } from "react"
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
import { AccidentFilters } from "@/features/accidents/filters"
import { AccidentCharts } from "@/features/accidents/charts"
import { RecordsTable } from "@/features/accidents/records-table"
import { useAccidents } from "@/features/accidents/use-accidents"
import { exportAccidents } from "@/features/accidents/export"

export default function StatisticsPage() {
  const { records, days, mapLink, active } = useAccidents()
  const metrics = [
    {
      label: "Total accidents",
      value: records.length,
      icon: CarFront,
      text: active
        ? "Reports matching your filters"
        : "Reported across 8 Algerian areas",
      color: "var(--primary)",
    },
    {
      label: "App reports",
      value: records.filter((a) => a.source === "app").length,
      icon: Smartphone,
      text: "Reports from drivers using the app",
      color: "var(--color-text-accent)",
    },
    {
      label: "Online alerts",
      value: records.filter((a) => a.channel === "online").length,
      icon: Wifi,
      text: "Alerts received with connectivity",
      color: "var(--status-success)",
    },
    {
      label: "Offline alerts",
      value: records.filter((a) => a.channel === "offline").length,
      icon: WifiOff,
      text: "Alerts recorded without connectivity",
      color: "var(--color-violet)",
    },
  ]
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="page-eyebrow">Road safety intelligence</p>
          <h1 className="page-heading">Statistics overview</h1>
          <p className="page-description">
            Understand accidents, the people involved, and how alerts reach you.
          </p>
        </div>
        <div className="page-actions flex gap-3">
          <Link
            className={buttonVariants({ variant: "outline", size: "lg" })}
            to={mapLink()}
          >
            <Map />
            Open map
            <ArrowUpRight />
          </Link>
          <Button
            disabled={!records.length}
            onClick={() => exportAccidents(records)}
          >
            <Download />
            Export reports
          </Button>
        </div>
      </div>
      <AccidentFilters />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="metric-card"
            style={{ "--metric-color": metric.color } as CSSProperties}
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
        key={records.map((r) => r.id).join(",")}
        records={records}
        mapLink={mapLink}
      />
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Sample data for Algeria · October 2026. All people, identity numbers,
        vehicle details, and accident locations are fictional.
      </p>
    </>
  )
}
