import { BarChart3, Map, Settings, UserRound, Users } from "lucide-react"

export const mainNavigation = [
  {
    title: "Statistics overview",
    shortTitle: "Statistics",
    url: "/statistics",
    icon: BarChart3,
  },
  { title: "Accident map", shortTitle: "Map", url: "/map", icon: Map },
  { title: "Users", shortTitle: "Users", url: "/users", icon: Users },
]

export const accountNavigation = [
  { title: "Profile", url: "/profile", icon: UserRound },
  { title: "Settings", url: "/settings", icon: Settings },
]
