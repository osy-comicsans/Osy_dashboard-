import type { ComponentProps } from "react"
import { LiquiGlass } from "@liqui-design/glass"
import { ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { accountNavigation, mainNavigation } from "@/config/navigation"
import { GlassNavigation } from "@/components/glass-navigation"
import { Sidebar, useSidebar } from "@/components/ui/sidebar"

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar {...props} mobileWidth="6rem" className="osy-sidebar">
      <LiquiGlass
        className="osy-rail"
        contentClassName="osy-rail-content"
        material="auto"
        radius={36}
        frost={0.5}
        blur={12}
        refraction={24}
        bezel={16}
        dispersion={0}
        specular={0.3}
      >
        <Link
          to="/statistics"
          aria-label="osy home"
          className="rail-brand"
          onClick={() => setOpenMobile(false)}
        >
          <ShieldCheck className="size-6" aria-hidden="true" />
        </Link>
        <GlassNavigation
          items={mainNavigation}
          footerItems={accountNavigation}
          onNavigate={() => setOpenMobile(false)}
        />
      </LiquiGlass>
    </Sidebar>
  )
}
