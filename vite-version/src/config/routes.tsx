import type { ComponentType } from "react"
import { Navigate, type RouteObject } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"

function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

export const routes: RouteObject[] = [
  {
    element: <BaseLayout />,
    children: [
      { index: true, element: <Navigate to="/statistics" replace /> },
      {
        path: "/statistics",
        lazy: page(() => import("@/app/statistics/page")),
      },
      { path: "/map", lazy: page(() => import("@/app/map/page")) },
      { path: "*", element: <Navigate to="/statistics" replace /> },
    ],
  },
]
