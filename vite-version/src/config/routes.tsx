import type { ComponentType } from "react"
import { Navigate, type RouteObject } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { StartPage } from "@/components/router/start-page"

function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

export const routes: RouteObject[] = [
  {
    element: <BaseLayout />,
    children: [
      { index: true, element: <StartPage /> },
      {
        path: "/statistics",
        lazy: page(() => import("@/app/statistics/page")),
      },
      { path: "/map", lazy: page(() => import("@/app/map/page")) },
      { path: "/users", lazy: page(() => import("@/app/users/page")) },
      { path: "/profile", lazy: page(() => import("@/app/profile/page")) },
      { path: "/settings", lazy: page(() => import("@/app/settings/page")) },
      { path: "*", element: <Navigate to="/statistics" replace /> },
    ],
  },
]
