import { useState } from "react"
import { Bell, CheckCheck, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import { Popover } from "@base-ui/react/popover"
import { Button } from "@/components/ui/button"
import { accidents, dateLabel } from "@/features/accidents/data"
import { readLocalValue } from "@/lib/local-storage"

const alerts = accidents.filter((record) => record.status === "New")
const storageKey = "osy-read-notifications"

function readNotifications(): string[] {
  try {
    const stored: unknown = JSON.parse(readLocalValue(storageKey) || "[]")
    return Array.isArray(stored)
      ? stored.filter((id): id is string => typeof id === "string")
      : []
  } catch {
    return []
  }
}

export function Notifications() {
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(readNotifications)
  const unread = alerts.filter((record) => !read.includes(record.id)).length
  function markRead(ids: string[]) {
    const next = [...new Set([...read, ...ids])]
    setRead(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      /* Keep the read state for this session if storage is unavailable. */
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="notifications-trigger"
            aria-label={
              unread ? `Notifications (${unread} unread)` : "Notifications"
            }
          />
        }
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && <span className="notification-dot" aria-hidden="true" />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          align="end"
          sideOffset={12}
          collisionPadding={16}
          className="z-50"
        >
          <Popover.Popup
            className="notifications-panel"
            aria-label="Notifications"
          >
            <div className="flex items-start justify-between gap-3 border-b p-5">
              <div>
                <Popover.Title className="text-sm font-semibold">
                  Notifications
                </Popover.Title>
                <Popover.Description className="mt-1 text-xs text-muted-foreground">
                  Sample accident alerts · Algeria
                </Popover.Description>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark all notifications as read"
                disabled={!unread}
                onClick={() => markRead(alerts.map((record) => record.id))}
              >
                <CheckCheck className="size-4" />
              </Button>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {alerts.map((record) => (
                <li key={record.id}>
                  <Link
                    to={"/map?incident=" + encodeURIComponent(record.id)}
                    className="notification-item"
                    data-unread={!read.includes(record.id) || undefined}
                    onClick={() => {
                      markRead([record.id])
                      setOpen(false)
                    }}
                  >
                    <span className="notification-symbol">
                      <MapPin className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        Accident reported in {record.area}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {record.id} · {dateLabel(record.occurredAt, true)}
                      </span>
                    </span>
                    {!read.includes(record.id) && (
                      <span
                        className="notification-unread"
                        aria-label="Unread"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {!unread && (
              <p
                role="status"
                className="border-t px-5 py-3 text-xs text-muted-foreground"
              >
                You’re all caught up.
              </p>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
