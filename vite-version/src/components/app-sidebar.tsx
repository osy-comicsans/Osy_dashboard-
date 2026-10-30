import type { ComponentProps } from "react"
import { BarChart3, Map, ShieldCheck, FlaskConical } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const { pathname, search } = useLocation()
  const navigationSearch = new URLSearchParams(search)
  navigationSearch.delete("incident")
  const query = navigationSearch.toString()
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-5 pb-8">
        <Link
          to="/statistics"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-3 rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <div className="brand-mark">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">
              RoadWatch.
            </div>
            <p className="text-xs text-muted-foreground">Accident monitoring</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {[
              {
                title: "Statistics overview",
                url: "/statistics",
                icon: BarChart3,
              },
              { title: "Accident map", url: "/map", icon: Map },
            ].map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  className="h-13"
                  isActive={pathname === item.url}
                  render={
                    <Link
                      onClick={() => setOpenMobile(false)}
                      to={item.url + (query ? "?" + query : "")}
                    />
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <div className="glass-panel mx-4 mt-auto p-4">
          <FlaskConical className="mb-3 size-5 text-primary" />
          <p className="text-sm font-medium">A clearer view of road safety</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Explore accident reports, identify affected areas, and understand
            how alerts are received.
          </p>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-lg border-t pt-4">
          <div className="workspace-avatar flex size-10 items-center justify-center text-xs font-semibold">
            RW
          </div>
          <div>
            <p className="text-sm font-medium">Road safety workspace</p>
            <p className="text-xs text-muted-foreground">Demo environment</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
