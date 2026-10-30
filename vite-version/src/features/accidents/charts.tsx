import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { accidents, dateLabel, type Accident } from "./data"

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--shape-sm)",
  color: "var(--foreground)",
  fontSize: 12,
}

export function AccidentCharts({
  records,
  days,
}: {
  records: Accident[]
  days: string
}) {
  const dates = [...new Set(accidents.map((a) => a.occurredAt.slice(0, 10)))]
    .sort()
    .slice(-Math.min(Number(days), 30))
  const trend = dates.map((date) => ({
    date: dateLabel(date + "T12:00:00+01:00"),
    Online: records.filter(
      (a) => a.occurredAt.startsWith(date) && a.channel === "online"
    ).length,
    Offline: records.filter(
      (a) => a.occurredAt.startsWith(date) && a.channel === "offline"
    ).length,
  }))
  const channels = [
    {
      name: "Online alerts",
      value: records.filter((a) => a.channel === "online").length,
      color: "var(--chart-1)",
    },
    {
      name: "Offline alerts",
      value: records.filter((a) => a.channel === "offline").length,
      color: "var(--chart-2)",
    },
  ]
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[1.8fr_1fr]">
      <div className="min-w-0">
        <CardHeader>
          <CardTitle>Accident trends</CardTitle>
          <CardDescription>
            Daily reports by alert connectivity · October 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <i className="size-2 rounded-full bg-chart-1" />
              Online alerts
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-2 rounded-full bg-chart-2" />
              Offline alerts
            </span>
          </div>
          <div
            className="h-56 w-full"
            role="img"
            aria-label={
              "Daily accident trend. " + records.length + " matching reports."
            }
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={trend}
                margin={{ top: 10, right: 0, bottom: 0, left: -25 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  minTickGap={25}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="Online"
                  stackId="reports"
                  fill="var(--chart-1)"
                  maxBarSize={22}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="Offline"
                  stackId="reports"
                  fill="var(--chart-2)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>
      <div className="min-w-0">
        <CardHeader>
          <CardTitle>Alert breakdown</CardTitle>
          <CardDescription>How accident alerts were received</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative h-44"
            role="img"
            aria-label={channels.map((c) => c.name + ": " + c.value).join(", ")}
          >
            {records.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={channels}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={57}
                    outerRadius={77}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {channels.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 m-auto size-36 rounded-full border-[18px] border-muted" />
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-3xl font-semibold tabular-nums">
                {records.length}
              </strong>
              <span className="text-xs text-muted-foreground">
                total alerts
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            {channels.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2 rounded-full"
                  style={{ background: c.color }}
                />
                <span className="text-muted-foreground">{c.name}</span>
                <strong className="ml-auto font-medium">{c.value}</strong>
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {records.length
                    ? Math.round((c.value / records.length) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  )
}
