import { test, expect } from "@playwright/test"

test("osy branding preserves settings and profiles saved under the previous name", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("rename-test-seeded")) return
    localStorage.setItem("rename-test-seeded", "true")
    localStorage.setItem("roadwatch-theme", "dark")
    localStorage.setItem(
      "roadwatch-preferences",
      JSON.stringify({ startPage: "/users", density: "compact" })
    )
    localStorage.setItem(
      "roadwatch-profile",
      JSON.stringify({
        name: "Lina Boudiaf",
        email: "lina@example.com",
        phone: "+213 555 123 456",
        area: "Oran",
      })
    )
    localStorage.setItem(
      "roadwatch-read-notifications",
      JSON.stringify(
        Array.from(
          { length: 5 },
          (_, i) => "ACC-2026-" + String(i + 1).padStart(3, "0")
        )
      )
    )
  })
  await page.goto("/")
  await expect(page).toHaveURL(/\/users$/)
  await expect(page).toHaveTitle("osy | Accident monitoring")
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(page.locator(".users-table")).toHaveAttribute(
    "data-density",
    "compact"
  )
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/osy.svg"
  )
  expect((await page.request.get("/osy.svg")).ok()).toBe(true)
  await expect(
    page.getByRole("button", { name: "Notifications", exact: true })
  ).toBeVisible()
  await page.goto("/profile")
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Lina Boudiaf"
  )
  await expect(page.getByLabel("Area", { exact: true })).toHaveValue("Oran")
  expect(
    await page.evaluate(() =>
      ["theme", "preferences", "profile", "read-notifications"].every(
        (key) =>
          localStorage.getItem("osy-" + key) !== null &&
          localStorage.getItem("roadwatch-" + key) === null
      )
    )
  ).toBe(true)
  await page.evaluate(() => {
    const profile = JSON.parse(localStorage.getItem("osy-profile")!)
    profile.name = "RoadWatch Admin"
    localStorage.setItem("osy-profile", JSON.stringify(profile))
  })
  await page.reload()
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "osy Admin"
  )
})

test("users navigation, search, sorting and report details", async ({
  page,
}) => {
  await page.goto("/statistics")
  await page.getByRole("link", { name: "Users", exact: true }).first().click()
  await expect(page).toHaveURL(/\/users$/)
  await expect(
    page.getByRole("heading", { name: "Users", exact: true })
  ).toBeVisible()
  await expect(page.locator("tbody tr")).toHaveCount(10)
  await page.getByRole("button", { name: "Next page", exact: true }).click()
  await expect(page.getByText("Page 2 of 5")).toBeVisible()
  const search = page.getByRole("searchbox", { name: "Search users" })
  await search.fill("555000003")
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await expect(page.locator("tbody")).toContainText("Karim Haddad")
  await expect(page.getByText("Page 1 of 1")).toBeVisible()
  await search.fill("DEMO-REG-200003")
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await page
    .getByRole("button", { name: "View report for DEMO-NID-100003" })
    .click()
  await expect(page.getByRole("dialog")).toContainText("DEMO-NID-100003")
  await expect(page.getByRole("dialog").getByRole("link")).toHaveAttribute(
    "href",
    "/map?incident=ACC-2026-003"
  )
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await search.fill("missing-driver")
  await expect(
    page.getByRole("heading", { name: "No matching users" })
  ).toBeVisible()
  await search.fill("")
  await page.getByRole("button", { name: "App usage", exact: true }).click()
  await expect(page.locator("tbody tr").first()).toContainText("Uses app")
  await page.getByRole("button", { name: "App usage", exact: true }).click()
  await expect(page.locator("tbody tr").first()).toContainText("No app")
  await expect(
    page.getByRole("columnheader", { name: "App usage" })
  ).toHaveAttribute("aria-sort", "descending")
})

test("profile saves locally and cancel restores saved contact details", async ({
  page,
}) => {
  await page.goto("/profile")
  await page.getByLabel("Full name", { exact: true }).fill("Lina Boudiaf")
  await page
    .getByLabel("Email address", { exact: true })
    .fill("lina@example.com")
  await page.getByLabel("Phone number").fill("+213 555 123 456")
  await page.getByLabel("Area", { exact: true }).selectOption("Oran")
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByRole("status")).toHaveText(
    "Profile saved in this browser."
  )
  await expect(
    page.getByRole("heading", { name: "Lina Boudiaf" })
  ).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Lina Boudiaf"
  )
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(
    "lina@example.com"
  )
  await expect(page.getByLabel("Area", { exact: true })).toHaveValue("Oran")
  await page.getByLabel("Full name", { exact: true }).fill("Unsaved name")
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Lina Boudiaf"
  )
  await expect(
    page.getByRole("button", { name: "Save changes" })
  ).toBeDisabled()
})

test("settings persist and apply appearance, home page and user table spacing", async ({
  page,
}) => {
  await page.goto("/settings")
  await page.getByRole("radio", { name: "Dark", exact: true }).check()
  await page.getByLabel("Start page", { exact: true }).selectOption("/users")
  await page
    .getByLabel("Users table spacing", { exact: true })
    .selectOption("compact")
  await page.getByRole("button", { name: "Save preferences" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(page.getByRole("status")).toHaveText(
    "Preferences saved in this browser."
  )
  await page.goto("/")
  await expect(page).toHaveURL(/\/users$/)
  await expect(page.locator(".users-table")).toHaveAttribute(
    "data-density",
    "compact"
  )
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.goto("/settings")
  await expect(
    page.getByRole("radio", { name: "Dark", exact: true })
  ).toBeChecked()
  await expect(page.getByLabel("Start page", { exact: true })).toHaveValue(
    "/users"
  )
  await page.getByRole("radio", { name: "Light", exact: true }).check()
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  await expect(
    page.getByRole("radio", { name: "Dark", exact: true })
  ).toBeChecked()
  await expect(
    page.getByRole("button", { name: "Save preferences" })
  ).toBeDisabled()
  await page.emulateMedia({ colorScheme: "dark" })
  await page.getByRole("radio", { name: "System", exact: true }).check()
  await page.getByRole("button", { name: "Save preferences" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.emulateMedia({ colorScheme: "light" })
  await expect(page.locator("html")).toHaveClass(/light/)
})

test("mobile sidebar keeps profile and settings at the bottom and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/users")
  await expect(
    page.getByRole("heading", { name: "Users", exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await expect(
    page.locator(".mobile-nav").getByRole("link", { name: "Users" })
  ).toHaveAttribute("aria-current", "page")
  await page.getByRole("button", { name: "Toggle navigation" }).click()
  const sidebar = page.getByRole("dialog", { name: "Sidebar", exact: true })
  await expect(sidebar).toBeVisible()
  const main = sidebar.locator('[data-slot="sidebar-content"]')
  const footer = sidebar.locator('[data-slot="sidebar-footer"]')
  await expect(
    main.getByRole("link", { name: "Users", exact: true })
  ).toBeVisible()
  await expect(
    footer.getByRole("link", { name: "Profile", exact: true })
  ).toBeVisible()
  const bounds = await footer.boundingBox()
  expect(bounds!.y).toBeGreaterThan(600)
  await footer.getByRole("link", { name: "Profile", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Profile", exact: true })
  ).toBeVisible()
  await expect(sidebar).toBeHidden()
  await page.getByRole("button", { name: "Toggle navigation" }).click()
  await sidebar.getByRole("link", { name: "Settings", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
})
