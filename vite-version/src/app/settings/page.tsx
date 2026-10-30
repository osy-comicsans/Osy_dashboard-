import { useState, type FormEvent } from "react"
import { Check, Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Panel,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useTheme } from "@/hooks/use-theme"
import { mainNavigation } from "@/config/navigation"
import {
  readPreferences,
  savePreferences,
  type Preferences,
} from "@/features/account/storage"

const appearances = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(readPreferences)
  const [preferences, setPreferences] = useState(saved)
  const [appearance, setAppearance] = useState(theme)
  const [status, setStatus] = useState<{
    text: string
    error?: boolean
  } | null>(null)
  const dirty =
    appearance !== theme ||
    JSON.stringify(preferences) !== JSON.stringify(saved)

  function update(next: Partial<Preferences>) {
    setPreferences((current) => ({ ...current, ...next }))
    setStatus(null)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      savePreferences(preferences)
      setTheme(appearance)
      setSaved(preferences)
      setStatus({ text: "Preferences saved in this browser." })
    } catch {
      setStatus({
        text: "Your browser could not save these changes. Please try again.",
        error: true,
      })
    }
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <h1 className="page-heading">Settings</h1>
          <p className="page-description">
            Make osy work the way you prefer.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="flex max-w-4xl flex-col gap-6">
        <Panel>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose a theme for your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <fieldset>
              <legend className="sr-only">Color theme</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {appearances.map((item) => (
                  <label key={item.value} className="appearance-choice">
                    <input
                      type="radio"
                      name="appearance"
                      value={item.value}
                      checked={appearance === item.value}
                      onChange={() => {
                        setAppearance(item.value)
                        setStatus(null)
                      }}
                    />
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                    <Check
                      className="appearance-check ml-auto size-4"
                      aria-hidden="true"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </CardContent>
        </Panel>
        <Panel>
          <CardHeader>
            <CardTitle>Workspace preferences</CardTitle>
            <CardDescription>
              A familiar starting point and comfortable tables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="settings-row">
              <div>
                <label htmlFor="start-page" className="text-sm font-medium">
                  Start page
                </label>
                <p
                  id="start-page-help"
                  className="mt-1 text-xs leading-relaxed text-muted-foreground"
                >
                  The page shown when you open osy at its home address.
                </p>
              </div>
              <select
                id="start-page"
                aria-describedby="start-page-help"
                className="filter-control w-full sm:w-56"
                value={preferences.startPage}
                onChange={(event) =>
                  update({
                    startPage: event.target.value as Preferences["startPage"],
                  })
                }
              >
                {mainNavigation.map((item) => (
                  <option key={item.url} value={item.url}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row border-t pt-6">
              <div>
                <label htmlFor="table-density" className="text-sm font-medium">
                  Users table spacing
                </label>
                <p
                  id="table-density-help"
                  className="mt-1 text-xs leading-relaxed text-muted-foreground"
                >
                  Choose how much space each driver row takes.
                </p>
              </div>
              <select
                id="table-density"
                aria-describedby="table-density-help"
                className="filter-control w-full sm:w-56"
                value={preferences.density}
                onChange={(event) =>
                  update({
                    density: event.target.value as Preferences["density"],
                  })
                }
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </CardContent>
        </Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Preferences apply to this browser.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!dirty}
              onClick={() => {
                setPreferences(saved)
                setAppearance(theme)
                setStatus(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty}>
              Save preferences
            </Button>
          </div>
        </div>
        {status && (
          <p
            role={status.error ? "alert" : "status"}
            className={
              "flex items-center gap-1.5 text-sm " +
              (status.error ? "text-destructive" : "text-muted-foreground")
            }
          >
            {!status.error && <Check className="size-4 text-success" />}
            {status.text}
          </p>
        )}
      </form>
    </>
  )
}
