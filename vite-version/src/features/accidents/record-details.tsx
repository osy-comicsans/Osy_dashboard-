import { MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dateLabel, type Accident } from "./data"
import { ChannelBadge, SeverityBadge, SourceBadge } from "./badges"

export function RecordDetails({
  record,
  onClose,
  mapLink,
}: {
  record: Accident | null
  onClose: () => void
  mapLink: (id: string) => string
}) {
  return (
    <Dialog
      open={!!record}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Accident report</DialogTitle>
          <DialogDescription>
            {record?.id} · Fictional demonstration record
          </DialogDescription>
        </DialogHeader>
        {record && (
          <>
            <div className="flex flex-wrap gap-2">
              <SourceBadge source={record.source} />
              <ChannelBadge channel={record.channel} />
              <SeverityBadge severity={record.severity} />
            </div>
            {[
              {
                heading: "Driver information",
                fields: [
                  ["Full name", record.name],
                  ["Phone number", record.phone],
                  ["National identity card", record.identityCard],
                ],
              },
              {
                heading: "Vehicle information",
                fields: [
                  ["Vehicle", record.vehicle],
                  ["License plate", record.plate],
                  ["Vehicle registration card", record.vehicleCard],
                  ["Vehicle identification (VIN)", record.vin],
                ],
              },
              {
                heading: "Incident information",
                fields: [
                  [
                    "Date & time (Algeria)",
                    dateLabel(record.occurredAt, true) + " 2026",
                  ],
                  ["Area", record.area],
                  ["Road", record.road],
                  ["Status", record.status],
                  [
                    "Coordinates",
                    record.latitude.toFixed(5) +
                      ", " +
                      record.longitude.toFixed(5),
                  ],
                ],
              },
            ].map((section) => (
              <section key={section.heading} className="border-t pt-4">
                <h3 className="mb-3 text-sm font-semibold">
                  {section.heading}
                </h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 break-words text-sm font-medium">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <Link
              className={buttonVariants()}
              to={mapLink(record.id)}
              onClick={onClose}
            >
              <MapPin />
              View on map
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
