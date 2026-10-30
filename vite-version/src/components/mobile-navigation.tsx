import { LiquiGlass } from "@liqui-design/glass"
import { mainNavigation } from "@/config/navigation"
import { GlassNavigation } from "@/components/glass-navigation"
import { useSidebar } from "@/components/ui/sidebar"

export function MobileNavigation() {
  const { openMobile } = useSidebar()
  return (
    <LiquiGlass
      className="mobile-nav osy-mobile-glass"
      contentClassName="mobile-nav-content"
      material="auto"
      radius={32}
      frost={0.5}
      blur={12}
      refraction={24}
      bezel={16}
      specular={0.3}
      dispersion={0}
      hidden={openMobile}
    >
      <GlassNavigation items={mainNavigation} orientation="horizontal" />
    </LiquiGlass>
  )
}
