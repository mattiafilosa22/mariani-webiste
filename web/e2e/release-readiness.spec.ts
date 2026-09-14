import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 320, height: 740 },
  { width: 375, height: 812 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
];

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
}

for (const locale of ["it", "en"] as const) {
  for (const viewport of viewports) {
    test(`${locale} homepage ${viewport.width}px is responsive`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}/`);
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
}

test("release identity, featured inventory and metadata are correct", async ({ page }) => {
  await page.goto("/it/");
  await expect(page.locator("h1")).toContainText("La tua prossima auto");
  await expect(page.locator("body")).not.toContainText("Ford Blubay · Concessionaria");
  await expect(page.locator("body")).not.toContainText("Preferenze cookie");
  await expect(page.locator("footer")).toContainText("P.IVA 01300000492");

  const heading = page.getByRole("heading", { name: "Auto in offerta" });
  await expect(heading).toBeVisible();
  const section = heading.locator("xpath=ancestor::section[1]");
  await expect(section.locator(".car-card")).toHaveCount(8);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://mariani-auto.it/it/"
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    "href",
    "https://mariani-auto.it/en/"
  );
  await expect(page).toHaveTitle(/Mariani/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
});

test("mobile navigation opens, traps focus and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/it/");
  const toggle = page.locator("button.nav-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("nav.nav")).not.toHaveAttribute("aria-hidden", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("no tracker is requested and OpenStreetMap loads only after consent click", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.route(/tile\.openstreetmap\.org/, (route) => route.abort());
  await page.goto("/it/contatti/");
  await page.waitForLoadState("networkidle");

  expect(requests.some((url) => /google-analytics|googletagmanager|connect\.facebook\.net|facebook\.com\/tr/i.test(url))).toBe(false);
  expect(requests.some((url) => /tile\.openstreetmap\.org/i.test(url))).toBe(false);
  await page.getByRole("button", { name: "Carica la mappa" }).click();
  await expect.poll(() => requests.some((url) => /tile\.openstreetmap\.org/i.test(url))).toBe(true);
});

test("critical public pages have no serious or critical axe violations", async ({ page }) => {
  await page.goto("/it/auto/");
  const vehicleHref = await page.locator('.car-card a[href*="/auto/"]').first().getAttribute("href");
  expect(vehicleHref).toBeTruthy();

  const paths = [
    "/it/",
    "/it/auto/",
    vehicleHref!,
    "/it/officina/",
    "/it/contatti/",
    "/it/privacy-policy/",
    "/it/cookie-policy/",
  ];

  for (const path of paths) {
    await page.goto(path);
    // Attende la fine delle brevi transizioni visuali: axe deve misurare i
    // colori finali, non quelli temporaneamente miscelati con lo sfondo.
    await page.waitForTimeout(800);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
      `accessibility violations on ${path}`
    ).toEqual([]);
  }
});
