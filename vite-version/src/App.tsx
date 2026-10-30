import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { RootFallback, RootLayout } from "@/components/router/root-layout"
import { routes } from "@/config/routes"

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ""

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      HydrateFallback: RootFallback,
      children: routes,
    },
  ],
  { basename }
)

function App() {
  return (
    <div
      className="font-sans antialiased"
      style={{ fontFamily: "var(--font-family)" }}
    >
      <ThemeProvider defaultTheme="light" storageKey="osy-theme">
        <Toaster>
          <RouterProvider router={router} />
        </Toaster>
      </ThemeProvider>
    </div>
  )
}

export default App
