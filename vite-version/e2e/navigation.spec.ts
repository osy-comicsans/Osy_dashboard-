import { test, expect } from "@playwright/test"

test("icon rail supports click, drag, cancellation, keyboard and history", async ({
  page,
}) => {
  await page.goto("/statistics?q=ACC-2026-003")
  const rail = page.locator(".osy-rail")
  const statistics = rail.getByRole("link", {
    name: "Statistics overview",
    exact: true,
  })
  const users = rail.getByRole("link", { name: "Users", exact: true })
  const settings = rail.getByRole("link", { name: "Settings", exact: true })
  await expect(statistics).toHaveText("")
  await expect(rail.locator(".liqui-glass__refract").first()).toBeAttached()
  await users.click()
  await expect(page).toHaveURL(/\/users$/)
  await expect(users).toHaveAttribute("aria-current", "page")
  await statistics.click()
  const start = await statistics.boundingBox()
  const finish = await settings.boundingBox()
  await page.mouse.move(
    start!.x + start!.width / 2,
    start!.y + start!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    finish!.x + finish!.width / 2,
    finish!.y + finish!.height / 2,
    { steps: 20 }
  )
  await expect(settings).toHaveAttribute("data-selected", "true")
  await expect(page).toHaveURL(/\/statistics$/)
  await page.mouse.up()
  await expect(page).toHaveURL(/\/settings$/)
  await expect(settings).toHaveAttribute("aria-current", "page")
  const indicator = rail.locator(".glass-nav-indicator")
  await expect
    .poll(async () => {
      const lens = await indicator.boundingBox()
      const active = await settings.boundingBox()
      return Math.abs(lens!.y - active!.y)
    })
    .toBeLessThan(1)
  await page.goBack()
  await expect(statistics).toHaveAttribute("aria-current", "page")
  const original = await statistics.boundingBox()
  const userBounds = await users.boundingBox()
  await page.mouse.move(original!.x + 20, original!.y + 20)
  await page.mouse.down()
  await page.mouse.move(userBounds!.x + 20, userBounds!.y + 20, { steps: 8 })
  await page.keyboard.press("Escape")
  await page.mouse.up()
  await expect(page).toHaveURL(/\/statistics$/)
  await statistics.focus()
  await page.keyboard.press("ArrowDown")
  await expect(
    rail.getByRole("link", { name: "Accident map", exact: true })
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/map$/)
})

test("mobile glass tab bar supports touch sliding and the icon drawer", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/statistics?q=ACC-2026-003")
  const bar = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  })
  const statistics = await bar
    .getByRole("link", { name: "Statistics", exact: true })
    .boundingBox()
  const map = await bar
    .getByRole("link", { name: "Map", exact: true })
    .boundingBox()
  const session = await context.newCDPSession(page)
  const y = statistics!.y + statistics!.height / 2
  const startX = statistics!.x + statistics!.width / 2
  const endX = map!.x + map!.width / 2
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y }],
  })
  for (let step = 1; step <= 8; step++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX + ((endX - startX) * step) / 8, y }],
    })
  }
  await expect(
    bar.getByRole("link", { name: "Map", exact: true })
  ).toHaveAttribute("data-selected", "true")
  await expect(page).toHaveURL(/\/statistics\?q=ACC-2026-003$/)
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  })
  await expect(page).toHaveURL(/\/map\?q=ACC-2026-003$/)
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1)
  await page.getByRole("button", { name: "Toggle navigation" }).click()
  const drawer = page.getByRole("dialog", { name: "Sidebar", exact: true })
  await expect(bar).toBeHidden()
  await expect(
    drawer.getByRole("link", { name: "Profile", exact: true })
  ).toHaveText("")
  await drawer.getByRole("link", { name: "Profile", exact: true }).click()
  await expect(page).toHaveURL(/\/profile$/)
  await expect(drawer).toBeHidden()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await session.detach()
})

test("osy header notifications open, mark read, persist and link to the map", async ({
  page,
}) => {
  await page.goto("/statistics")
  await expect(page.locator(".osy-wordmark")).toHaveText("osy.")
  await page
    .getByRole("button", { name: "Notifications (5 unread)", exact: true })
    .click()
  const popup = page.getByRole("dialog", { name: "Notifications", exact: true })
  await expect(popup).toContainText("Sample accident alerts")
  await expect(popup.getByRole("link")).toHaveCount(5)
  await popup
    .getByRole("button", { name: "Mark all notifications as read" })
    .click()
  await expect(popup.getByRole("status")).toHaveText("You’re all caught up.")
  await page.keyboard.press("Escape")
  await expect(popup).toBeHidden()
  await page.reload()
  await page.getByRole("button", { name: "Notifications", exact: true }).click()
  await expect(popup.getByRole("status")).toBeVisible()
  const first = popup.getByRole("link").first()
  const destination = await first.getAttribute("href")
  await first.click()
  await expect(page).toHaveURL(new RegExp(destination!.replace("?", "\\?")))
  await expect(popup).toBeHidden()
  await expect(page.locator(".leaflet-popup")).toBeVisible()
})
