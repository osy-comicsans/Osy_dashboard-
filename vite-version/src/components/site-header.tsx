import { Link } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Notifications } from "@/components/notifications"

export function SiteHeader() {
  return (
    <header className="site-topbar">
      <div className="flex items-center gap-3">
        <SidebarTrigger aria-label="Toggle navigation" className="md:hidden" />
        <Link to="/statistics" className="osy-wordmark" aria-label="osy home">
          osy<span aria-hidden="true">.</span>
        </Link>
      </div>
      <Notifications />
    </header>
  )
}
