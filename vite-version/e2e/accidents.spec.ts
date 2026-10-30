import { test, expect } from "@playwright/test"

test("statistics headers sort every report and exports follow the selected order", async ({
  page,
}) => {
  test.setTimeout(60000)
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toBeVisible({ timeout: 15000 })
  await expect(
    page.getByRole("region", { name: "Accident filters" })
  ).toHaveCount(0)
  await expect(page.getByRole("searchbox")).toHaveCount(1)
  await expect(page.getByTestId("Total accidents")).toHaveText("48")
  const rows = page.locator("tbody tr")
  const firstCell = (index: number) => rows.first().locator("td").nth(index)
  const header = (name: string) =>
    page.getByRole("button", { name, exact: true })

  await header("App usage").click()
  await expect(
    page.getByRole("columnheader", { name: "App usage" })
  ).toHaveAttribute("aria-sort", "ascending")
  await expect(firstCell(6)).toHaveText("Uses app")
  expect(await rows.locator("td:nth-child(7)").allTextContents()).toEqual(
    Array(8).fill("Uses app")
  )
  for (let index = 0; index < 4; index++) {
    await page.getByRole("button", { name: "Next page", exact: true }).click()
    await expect(page.getByText("Page " + (index + 2) + " of 6")).toBeVisible()
  }
  await expect(firstCell(6)).toHaveText("No app")
  await header("App usage").click()
  await expect(
    page.getByRole("columnheader", { name: "App usage" })
  ).toHaveAttribute("aria-sort", "descending")
  await expect(page.getByText("Page 1 of 6")).toBeVisible()
  expect(await rows.locator("td:nth-child(7)").allTextContents()).toEqual(
    Array(8).fill("No app")
  )
  await expect(page.getByTestId("Total accidents")).toHaveText("48")

  await header("Alert").click()
  await expect(firstCell(7)).toHaveText("Online")
  await header("Alert").click()
  await expect(firstCell(7)).toHaveText("Offline")
  await header("Severity").click()
  await expect(firstCell(8)).toHaveText("Minor")
  await header("Severity").click()
  await expect(firstCell(8)).toHaveText("Severe")
  await header("Driver").click()
  await expect(firstCell(1)).toHaveText("Amine Benali")
  await header("Driver").click()
  await expect(firstCell(1)).toHaveText("Yasmine Mansouri")
  await header("Identity card").click()
  await expect(firstCell(3)).toHaveText("DEMO-NID-100001")
  await header("Identity card").click()
  await expect(firstCell(3)).toHaveText("DEMO-NID-100048")
  await header("Vehicle card").click()
  await expect(firstCell(4)).toHaveText("DEMO-REG-200001")
  await header("Vehicle card").click()
  await expect(firstCell(4)).toHaveText("DEMO-REG-200048")
  await header("License plate").click()
  await expect(firstCell(5)).toContainText("10000")
  await header("License plate").click()
  await expect(firstCell(5)).toContainText("10611")
  await header("Report / date").click()
  await expect(firstCell(0)).toContainText("ACC-2026-048")
  await header("Report / date").click()
  await expect(firstCell(0)).toContainText("ACC-2026-002")
  await header("Phone").click()
  await expect(firstCell(2)).toHaveText("+213 555 000 001")
  await header("Phone").click()
  await expect(firstCell(2)).toHaveText("+213 555 000 048")

  const downloadEvent = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export reports" }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe("roadwatch-accidents.csv")
  const stream = await download.createReadStream()
  let csv = ""
  for await (const chunk of stream!) csv += chunk.toString()
  expect(csv.trim().split("\r\n")).toHaveLength(49)
  expect(csv.split("\r\n")[1]).toContain("ACC-2026-048")

  expect(errors).toEqual([])
})

test("statistics table search supports names, phone digits, IDs and pagination reset", async ({
  page,
}) => {
  test.setTimeout(60000)
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/statistics")
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toBeVisible({ timeout: 15000 })
  const rows = page.locator("tbody tr")
  const firstCell = (index: number) => rows.first().locator("td").nth(index)
  const header = (name: string) =>
    page.getByRole("button", { name, exact: true })
  await header("Phone").click()
  await header("Phone").click()
  await expect(
    page.getByRole("columnheader", { name: "Phone" })
  ).toHaveAttribute("aria-sort", "descending")
  const search = page.getByRole("searchbox", { name: "Search records" })
  await search.fill("Karim")
  await expect(rows).toHaveCount(4)
  await expect(firstCell(1)).toHaveText("Karim Haddad")
  await expect(
    page.getByRole("columnheader", { name: "Phone" })
  ).toHaveAttribute("aria-sort", "descending")
  await search.fill("555000003")
  await expect(rows).toHaveCount(1)
  await expect(firstCell(2)).toHaveText("+213 555 000 003")
  await search.fill("demo-nid-100003")
  await expect(rows).toHaveCount(1)
  await search.fill("DEMO-REG-200003")
  await expect(page).toHaveURL(/q=DEMO-REG-200003/)
  await expect(firstCell(4)).toHaveText("DEMO-REG-200003")
  await page
    .getByRole("button", { name: "View details for ACC-2026-003" })
    .click()
  await expect(page.getByRole("dialog")).toContainText("DEMO-NID-100003")
  await expect(page.getByRole("dialog")).toContainText("DEMO-REG-200003")
  await page.getByRole("button", { name: "Close", exact: true }).click()

  await search.fill("all")
  await expect(search).toHaveValue("all")
  await expect(page).toHaveURL(/q=all/)
  await search.fill("missing-record")
  await expect(page.getByText("No matching reports")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Export reports" })
  ).toBeDisabled()
  await page.getByRole("button", { name: "Clear search" }).click()
  await expect(rows).toHaveCount(8)
  await expect(page.getByTestId("Total accidents")).toHaveText("48")
  await page.getByRole("button", { name: "Next page", exact: true }).click()
  await expect(page.getByText("Page 2 of 6")).toBeVisible()
  await search.pressSequentially("Amine", { delay: 40 })
  await expect(search).toHaveValue("Amine")
  await expect(rows).toHaveCount(4)
  await expect(page.getByText("Page 1 of 1")).toBeVisible()
  await page.getByRole("button", { name: "Clear search" }).click()
  await header("Driver").click()
  await expect(firstCell(1)).toHaveText("Amine Benali")
  await page.screenshot({ path: ".tmp/statistics-desktop.png", fullPage: true })
  expect(errors).toEqual([])
})

test("map styling, Gabarito and both appearances work", async ({ page }) => {
  // Appearance checks use a local tile fixture instead of depending on OSM availability.
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#f5f5f5"/></svg>',
    })
  )
  await page.goto("/map")
  await expect(page.locator("html")).toHaveClass(/light/)
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(48)
  await expect
    .poll(() => page.locator(".leaflet-tile-loaded").count())
    .toBeGreaterThan(0)
  await expect(page.locator(".leaflet-tile-pane")).not.toHaveCSS(
    "filter",
    /invert/
  )
  await expect(page.locator(".leaflet-control-zoom-in")).toHaveCSS(
    "height",
    "44px"
  )
  for (const appearance of ["Dark", "Light"]) {
    await page.getByRole("link", { name: "Settings", exact: true }).click()
    await page.getByRole("radio", { name: appearance, exact: true }).check()
    await page.getByRole("button", { name: "Save preferences" }).click()
    await page.getByRole("link", { name: "Accident map", exact: true }).click()
    await expect(page.locator("html")).toHaveClass(
      new RegExp(appearance.toLowerCase())
    )
    if (appearance === "Dark") {
      await expect(page.locator(".leaflet-tile-pane")).toHaveCSS(
        "filter",
        /invert/
      )
    } else {
      await expect(page.locator(".leaflet-tile-pane")).not.toHaveCSS(
        "filter",
        /invert/
      )
    }
  }
  await page
    .getByRole("link", { name: "Statistics overview", exact: true })
    .click()
  await expect(page.getByTestId("Total accidents")).toHaveText("48")
  await page.evaluate(() => document.fonts.ready)
  await expect(
    page.getByRole("heading", { name: "Statistics overview" })
  ).toHaveCSS("font-family", /Gabarito/)
  await expect(page.getByRole("button", { name: "Export reports" })).toHaveCSS(
    "height",
    "40px"
  )
  await page.screenshot({ path: ".tmp/statistics-light.png", fullPage: true })
})

test("map navigation preserves filters, selects records, and renders Leaflet markers", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/statistics?q=ACC-2026-003")
  await page.getByRole("link", { name: "View ACC-2026-003 on map" }).click()
  await expect(
    page.getByRole("heading", { name: "Accident map", exact: true })
  ).toBeVisible()
  await expect(page.getByLabel("App usage", { exact: true })).toHaveValue("all")
  await expect(
    page.getByLabel("Alert connectivity", { exact: true })
  ).toHaveValue("all")
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1)
  await expect(page.locator(".leaflet-popup")).toContainText("ACC-2026-003")
  await expect(page.locator(".accident-marker.is-selected")).toHaveCount(1)
  await expect(page.getByText("Selected report", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Details", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("Karim Haddad")
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(48)
  await page.getByLabel("App usage", { exact: true }).selectOption("app")
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(32)
  await page
    .getByLabel("Alert connectivity", { exact: true })
    .selectOption("offline")
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(16)
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
