import type { CSSProperties } from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { SiteFooter } from "@/components/site-footer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function BaseLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
          "--header-height": "4rem",
        } as CSSProperties
      }
    >
      <AppSidebar variant="floating" />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:px-6 md:py-8 lg:px-8">
          <Outlet />
        </div>
        <SiteFooter />
      </SidebarInset>
      <MobileNavigation />
    </SidebarProvider>
  )
}
