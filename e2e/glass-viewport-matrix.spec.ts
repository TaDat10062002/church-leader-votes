import { expect, test } from "@playwright/test";

const viewports = [
  { name: "phone-portrait", width: 375, height: 812 },
  { name: "phone-landscape", width: 812, height: 375 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

const appearances = [
  { theme: "light", palette: "green" },
  { theme: "light", palette: "navy" },
  { theme: "dark", palette: "green" },
  { theme: "dark", palette: "navy" },
] as const;

for (const viewport of viewports) {
  for (const appearance of appearances) {
    test(`${viewport.name} renders all five routes in ${appearance.theme}/${appearance.palette} without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.addInitScript(({ theme, palette }) => {
        localStorage.setItem("appearance-theme", theme);
        localStorage.setItem("appearance-palette", palette);
      }, appearance);

      await page.route("**/api/admin/results", (route) => route.fulfill({ json: {
        election: { id: "matrix-election", status: "opened" },
        results: [{ id: "matrix-candidate", name_vi: "Nguyễn An", name_zh: "王小明", image_url: "", total: 3 }],
      } }));
      await page.route("**/api/elections/active", (route) => route.fulfill({ json: {
        election: {
          id: "matrix-election",
          status: "opened",
          candidates: [{ id: "matrix-candidate", name_vi: "Nguyễn An", name_zh: "王小明", image_url: "", display_order: 1 }],
        },
      } }));

      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Nhập mã PIN quản trị" })).toBeVisible();
      await page.getByLabel("Mã PIN").fill("reset-test-pin");
      await page.getByLabel("Mã PIN").press("Enter");
      await expect(page).toHaveURL(/\/dashboard$/);

      for (const route of ["/dashboard", "/import-file", "/vote", "/thanks"]) {
        await page.goto(route);
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", appearance.theme);
        await expect(page.locator("html")).toHaveAttribute("data-palette", appearance.palette);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          `${route} overflows at ${viewport.width}x${viewport.height}`,
        ).toBe(true);
      }
    });
  }
}
