import { expect, test, type Page } from "@playwright/test";

type Theme = "light" | "dark";
type Palette = "green" | "navy";

async function mockElection(page: Page) {
  await page.route("**/api/elections/active", (route) => route.fulfill({
    json: {
      election: {
        id: "appearance-election",
        status: "opened",
        candidates: [
          { id: "appearance-candidate", name: "Nguyễn An", image_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23426b53'/%3E%3C/svg%3E", display_order: 1 },
        ],
      },
    },
  }));
}

function contrast(first: string, second: string) {
  const luminance = (hex: string) => {
    const channels = hex.trim().replace("#", "").match(/.{2}/g)!.map((channel) => {
      const value = Number.parseInt(channel, 16) / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

for (const theme of ["light", "dark"] as const) {
  for (const palette of ["green", "navy"] as const) {
    test(`saved ${theme}/${palette} appearance is available before hydration and remains readable`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.emulateMedia({ colorScheme: theme === "dark" ? "light" : "dark", reducedMotion: "reduce" });
      await page.addInitScript(({ theme: savedTheme, palette: savedPalette }: { theme: Theme; palette: Palette }) => {
        localStorage.setItem("appearance-theme", savedTheme);
        localStorage.setItem("appearance-palette", savedPalette);
        document.addEventListener("DOMContentLoaded", () => {
          (window as typeof window & { firstAppearance?: { theme?: string; palette?: string } }).firstAppearance = {
            theme: document.documentElement.dataset.theme,
            palette: document.documentElement.dataset.palette,
          };
        }, { once: true });
      }, { theme, palette });
      await page.goto("/thanks");
      await expect(page.getByRole("switch", { name: "Giao diện tối" })).toHaveAttribute("aria-checked", String(theme === "dark"));
      await expect(page.getByRole("button", { name: palette === "green" ? "Màu xanh lá" : "Màu xanh navy dịu", exact: true })).toHaveAttribute("aria-pressed", "true");
      expect(await page.evaluate(() => (window as typeof window & { firstAppearance?: unknown }).firstAppearance)).toEqual({ theme, palette });
      const colors = await page.evaluate(() => {
        const css = getComputedStyle(document.documentElement);
        return {
          ink: css.getPropertyValue("--app-ink"),
          muted: css.getPropertyValue("--app-muted"),
          fallback: css.getPropertyValue("--glass-fallback"),
          primary: css.getPropertyValue("--primary"),
          ring: css.getPropertyValue("--ring"),
          foreground: css.getPropertyValue("--foreground"),
        };
      });
      expect(colors.primary.trim()).not.toBe("");
      expect(colors.ring.trim()).not.toBe("");
      expect(colors.foreground.trim()).toBe(colors.ink.trim());
      expect(contrast(colors.ink, colors.fallback)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors.muted, colors.fallback)).toBeGreaterThanOrEqual(4.5);
      expect(errors).toEqual([]);
    });
  }
}

test("system theme updates an open ballot portal and manual choices persist without changing the ballot", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await mockElection(page);
  await page.goto("/vote");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const candidate = page.getByRole("button", { name: "Nguyễn An, chạm để chọn", exact: true });
  await candidate.click();
  await page.getByRole("button", { name: "Xem / sửa phiếu", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Phiếu của bạn", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("1 / 9 ứng viên đã chọn", { exact: true })).toBeVisible();
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).color)).toBe(await page.locator("body").evaluate((element) => getComputedStyle(element).color));
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Xem / sửa phiếu", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Màu xanh navy dịu", exact: true }).click();
  await page.getByRole("switch", { name: "Giao diện tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Nguyễn An, đã chọn ở vị trí 1", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "navy");
  expect(await page.evaluate(() => ({ theme: localStorage.getItem("appearance-theme"), palette: localStorage.getItem("appearance-palette") }))).toEqual({ theme: "dark", palette: "navy" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const fallback of ["reduced-transparency", "no-backdrop"] as const) {
  test(`${fallback} uses readable opaque surfaces in the page and portal`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    // Simulate capability/preference detection, then exercise the application's
    // normal fallback rules rather than injecting replacement CSS in the test.
    await page.addInitScript((mode) => {
      if (mode === "reduced-transparency") {
        const original = window.matchMedia.bind(window);
        window.matchMedia = (query: string) => {
          const media = original(query);
          if (query === "(prefers-reduced-transparency: reduce)") Object.defineProperty(media, "matches", { value: true });
          return media;
        };
      } else {
        const original = CSS.supports.bind(CSS);
        CSS.supports = ((property: string, value?: string) => property.includes("backdrop-filter") ? false : value === undefined ? original(property) : original(property, value)) as typeof CSS.supports;
      }
    }, fallback);
    await mockElection(page);
    await page.goto("/vote");
    await expect(page.locator("html")).toHaveAttribute(fallback === "reduced-transparency" ? "data-reduced-transparency" : "data-backdrop-supported", fallback === "reduced-transparency" ? "reduce" : "false");
    await page.getByRole("button", { name: "Nguyễn An, chạm để chọn", exact: true }).click();
    await page.getByRole("button", { name: "Xem / sửa phiếu", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Phiếu của bạn", exact: true })).toBeVisible();
    const surfaces = await page.locator(".glasscn-material").evaluateAll((elements) => elements.filter((element) => element.getClientRects().length).map((element) => {
      const css = getComputedStyle(element);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = css.backgroundColor;
      context.fillRect(0, 0, 1, 1);
      return { filter: css.backdropFilter, image: css.backgroundImage, alpha: context.getImageData(0, 0, 1, 1).data[3], animation: css.animationName };
    }));
    expect(surfaces.length).toBeGreaterThan(3);
    for (const surface of surfaces) {
      expect(surface.filter).toBe("none");
      expect(surface.image).toBe("none");
      expect(surface.alpha).toBe(255);
      expect(surface.animation).toBe("none");
    }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Xem / sửa phiếu", exact: true })).toBeFocused();
  });
}
