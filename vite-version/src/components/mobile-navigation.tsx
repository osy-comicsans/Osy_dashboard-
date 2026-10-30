import { BarChart3, Map } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

export function MobileNavigation() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  params.delete("incident")
  const query = params.size ? "?" + params.toString() : ""
  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      <NavLink to={"/statistics" + query}>
        <BarChart3 className="size-4" />
        Statistics
      </NavLink>
      <NavLink to={"/map" + query}>
        <Map className="size-4" />
        Map
      </NavLink>
    </nav>
  )
}
