import type { ComponentProps } from "react"
import { BarChart3, Map, ShieldCheck } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const { pathname, search } = useLocation()
  const params = new URLSearchParams(search)
  params.delete("incident")
  const query = params.size ? "?" + params.toString() : ""
  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-5 pt-6 pb-7">
        <Link
          to="/statistics"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2.5 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="brand-mark">
            <ShieldCheck className="size-6" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            RoadWatch
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3">
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
                  isActive={pathname === item.url}
                  render={
                    <Link
                      onClick={() => setOpenMobile(false)}
                      to={item.url + query}
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
      </SidebarContent>
    </Sidebar>
  )
}
