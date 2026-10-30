import { test, expect } from "@playwright/test"

test("statistics, independent filters, search, details, pagination and CSV export", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toBeVisible()
  await expect(page.getByTestId("Total accidents")).toHaveText("48")
  await page.getByRole("button", { name: "Next page", exact: true }).click()
  await expect(page.getByText("Page 2 of 6")).toBeVisible()
  await page.getByLabel("App usage", { exact: true }).selectOption("app")
  await expect(page.getByTestId("Total accidents")).toHaveText("32")
  await page
    .getByLabel("Alert connectivity", { exact: true })
    .selectOption("offline")
  await expect(page.getByTestId("Total accidents")).toHaveText("16")
  await expect(page.getByTestId("Online alerts")).toHaveText("0")
  await page
    .getByRole("button", { name: "View details for ACC-2026-003" })
    .click()
  await expect(page.getByRole("dialog")).toContainText("DEMO-NID-100003")
  await expect(page.getByRole("dialog")).toContainText("DEMO-REG-200003")
  await expect(page.getByRole("dialog")).toContainText("+213 555 000 003")
  await page.getByRole("button", { name: "Close", exact: true }).click()
  const downloadEvent = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export reports" }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe("roadwatch-accidents.csv")
  const stream = await download.createReadStream()
  let csv = ""
  for await (const chunk of stream!) csv += chunk.toString()
  expect(csv.trim().split("\r\n")).toHaveLength(17)
  expect(csv).toContain("vehicleCard")
  await page.getByLabel("App usage", { exact: true }).selectOption("no-app")
  await page
    .getByLabel("Alert connectivity", { exact: true })
    .selectOption("online")
  await expect(page).toHaveURL(/channel=online/)
  await expect(page.getByTestId("Total accidents")).toHaveText("8")
  await page.getByLabel("Severity", { exact: true }).selectOption("Severe")
  await expect(page.getByTestId("Total accidents")).toHaveText("1")
  await page.getByLabel("Sample period", { exact: true }).selectOption("7")
  await expect(page).toHaveURL(/days=7/)
  await expect(page.getByTestId("Total accidents")).toHaveText("0")
  await page.getByRole("button", { name: "Clear filters" }).click()
  await page
    .getByRole("searchbox", { name: "Search records" })
    .fill("missing-record")
  await expect(page.getByText("No matching reports")).toBeVisible()
  await expect(page.getByTestId("Total accidents")).toHaveText("0")
  await expect(
    page.getByRole("button", { name: "Export reports" })
  ).toBeDisabled()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await page
    .getByRole("searchbox", { name: "Search records" })
    .fill("DEMO-REG-200003")
  await expect(page.getByTestId("Total accidents")).toHaveText("1")
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page.getByTestId("Total accidents")).toHaveText("48")
  await page.screenshot({ path: ".tmp/statistics-desktop.png", fullPage: true })
  expect(errors).toEqual([])
})

test("design tokens, map tiles, and both appearances work", async ({
  page,
}) => {
  const failures: string[] = []
  page.on("requestfailed", (request) => {
    if (request.url().includes("tile.openstreetmap.org"))
      failures.push(request.failure()?.errorText ?? request.url())
  })
  await page.goto("/map")
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(48)
  await expect
    .poll(() => page.locator(".leaflet-tile-loaded").count(), {
      timeout: 20000,
      message: "OpenStreetMap tile loading: " + failures.join(", "),
    })
    .toBeGreaterThan(0)
  await page.screenshot({ path: ".tmp/map-loaded.png", fullPage: true })
  await expect(page.locator(".leaflet-tile-pane")).toHaveCSS("filter", /invert/)
  await expect(page.locator(".leaflet-control-zoom-in")).toHaveCSS(
    "height",
    "44px"
  )
  await page.getByRole("button", { name: "Switch to light mode" }).click()
  await expect(page.locator("html")).toHaveClass(/light/)
  await expect(page.locator(".leaflet-tile-pane")).not.toHaveCSS(
    "filter",
    /invert/
  )
  await page.getByRole("button", { name: "Switch to dark mode" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page
    .getByRole("link", { name: "Statistics overview", exact: true })
    .click()
  await expect(page.getByTestId("Total accidents")).toHaveText("48")
  await page.evaluate(() => document.fonts.ready)
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toHaveCSS("font-family", /Plus Jakarta Sans/)
  await expect(page.getByRole("button", { name: "Export reports" })).toHaveCSS(
    "height",
    "52px"
  )
  await page.screenshot({ path: ".tmp/statistics-dark.png", fullPage: true })
})

test("map navigation preserves filters, selects records, and renders Leaflet markers", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/statistics?source=app&channel=offline")
  await page.getByRole("link", { name: "View ACC-2026-003 on map" }).click()
  await expect(
    page.getByRole("heading", { name: "Accident map", exact: true })
  ).toBeVisible()
  await expect(page.getByLabel("App usage", { exact: true })).toHaveValue("app")
  await expect(
    page.getByLabel("Alert connectivity", { exact: true })
  ).toHaveValue("offline")
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(16)
  await expect(page.locator(".leaflet-popup")).toContainText("ACC-2026-003")
  await expect(page.locator(".accident-marker.is-selected")).toHaveCount(1)
  await expect(page.getByText("Selected report", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Details", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("Karim Haddad")
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(48)
  await page.getByLabel("Area", { exact: true }).selectOption("Algiers")
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(9)
  await page.getByRole("button", { name: "Fit all reports" }).click()
  await page.screenshot({ path: ".tmp/map-desktop.png", fullPage: true })
  await page
    .getByRole("searchbox", { name: "Search records" })
    .fill("missing-record")
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(0)
  await expect(page.getByText("No matching reports")).toBeVisible()
  expect(errors).toEqual([])
})

test("mobile pages fit the viewport and sidebar navigation works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/statistics")
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "Toggle navigation" }).click()
  await page.getByRole("link", { name: "Accident map", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Accident map", exact: true })
  ).toBeVisible()
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(48)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Statistics", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toBeVisible()
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Map", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Accident map", exact: true })
  ).toBeVisible()
  await page.screenshot({ path: ".tmp/map-mobile.png", fullPage: true })
})
