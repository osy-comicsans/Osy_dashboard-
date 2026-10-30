import { Smartphone, Wifi, WifiOff } from "lucide-react"
import type { Accident } from "./data"

export function SourceBadge({ source }: Pick<Accident, "source">) {
  return (
    <span
      className={
        "report-badge " + (source === "app" ? "badge-app" : "badge-neutral")
      }
    >
      <Smartphone className="size-3" />
      {source === "app" ? "Uses app" : "No app"}
    </span>
  )
}
export function ChannelBadge({ channel }: Pick<Accident, "channel">) {
  const Icon = channel === "online" ? Wifi : WifiOff
  return (
    <span
      className={
        "report-badge " +
        (channel === "online" ? "badge-online" : "badge-offline")
      }
    >
      <Icon className="size-3" />
      {channel === "online" ? "Online" : "Offline"}
    </span>
  )
}
export function SeverityBadge({ severity }: Pick<Accident, "severity">) {
  return (
    <span className={"report-badge badge-" + severity.toLowerCase()}>
      <span className="size-1.5 rounded-full bg-current" />
      {severity}
    </span>
  )
}
