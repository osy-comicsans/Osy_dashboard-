import { MapPin } from "lucide-react"
import { useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { pathname } = useLocation()
  return (
    <header className="site-topbar">
      <div className="flex items-center gap-4">
        <SidebarTrigger aria-label="Toggle navigation" />
        <span className="topbar-location hidden items-center gap-2 sm:flex">
          <MapPin className="size-3" />
          Algeria
        </span>
      </div>
      <span className="topbar-title">
        {pathname === "/map" ? "Accident map" : "Statistics overview"}
      </span>
      <div className="flex items-center gap-3">
        <span className="report-badge badge-neutral hidden sm:inline-flex">
          <span className="size-1.5 rounded-full bg-primary" />
          Sample data
        </span>
        <ModeToggle />
      </div>
    </header>
  )
}
