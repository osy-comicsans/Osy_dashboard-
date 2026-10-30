import { useState, type FormEvent } from "react"
import { Check, Mail, MapPin, Phone, Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Panel,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { areas } from "@/features/accidents/data"
import {
  initials,
  readProfile,
  saveProfile,
  type Profile,
} from "@/features/account/storage"

export default function ProfilePage() {
  const [saved, setSaved] = useState(readProfile)
  const [profile, setProfile] = useState(saved)
  const [status, setStatus] = useState<{
    text: string
    error?: boolean
  } | null>(null)
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved)

  function update(key: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }))
    setStatus(null)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    }
    if (!next.name) {
      setStatus({ text: "Enter your full name.", error: true })
      return
    }
    try {
      saveProfile(next)
      setSaved(next)
      setProfile(next)
      setStatus({ text: "Profile saved in this browser." })
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
          <h1 className="page-heading">Profile</h1>
          <p className="page-description">
            Your workspace identity and contact information.
          </p>
        </div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Keep your name and contact details up to date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label
                  className="account-field sm:col-span-2"
                  htmlFor="profile-name"
                >
                  <span>Full name</span>
                  <input
                    className="filter-control"
                    id="profile-name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={profile.name}
                    onChange={(event) => update("name", event.target.value)}
                  />
                </label>
                <label className="account-field" htmlFor="profile-email">
                  <span>Email address</span>
                  <input
                    className="filter-control"
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={profile.email}
                    onChange={(event) => update("email", event.target.value)}
                  />
                </label>
                <label className="account-field" htmlFor="profile-phone">
                  <span>
                    Phone number{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <input
                    className="filter-control"
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    placeholder="+213 …"
                    value={profile.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </label>
                <div className="account-field sm:col-span-2">
                  <label htmlFor="profile-area">Area</label>
                  <select
                    id="profile-area"
                    className="filter-control"
                    value={profile.area}
                    onChange={(event) => update("area", event.target.value)}
                  >
                    <option>All Algeria</option>
                    {areas.map((area) => (
                      <option key={area.name}>{area.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                This is a local demo profile. Changes are saved on this device.
              </p>
              <div className="flex flex-wrap items-center gap-3 border-t pt-5">
                <Button type="submit" disabled={!dirty}>
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!dirty}
                  onClick={() => {
                    setProfile(saved)
                    setStatus(null)
                  }}
                >
                  Cancel
                </Button>
                {status && (
                  <p
                    role={status.error ? "alert" : "status"}
                    className={
                      "flex items-center gap-1.5 text-xs " +
                      (status.error
                        ? "text-destructive"
                        : "text-muted-foreground")
                    }
                  >
                    {!status.error && <Check className="size-4 text-success" />}
                    {status.text}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Panel>
        <Panel>
          <CardContent>
            <div className="flex flex-col items-start gap-3 border-b pb-6">
              <span
                className="user-initials profile-initials"
                aria-hidden="true"
              >
                {initials(saved.name)}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold break-words">
                  {saved.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Workspace profile
                </p>
              </div>
            </div>
            <dl className="space-y-5 py-6">
              {[
                { label: "Email", value: saved.email, icon: Mail },
                {
                  label: "Phone",
                  value: saved.phone || "Not added",
                  icon: Phone,
                },
                { label: "Area", value: saved.area, icon: MapPin },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm break-words">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <Link
              to="/settings"
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
            >
              <Settings />
              Account settings
            </Link>
          </CardContent>
        </Panel>
      </div>
    </>
  )
}
