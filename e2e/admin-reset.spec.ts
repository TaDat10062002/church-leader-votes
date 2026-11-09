import { expect, test, type Page } from "@playwright/test";

const warning = "Mọi dữ liệu bầu cử hiện tại sẽ bị xóa vĩnh viễn và không thể hoàn tác. Xác nhận khi bạn muốn thực hiện lại cuộc bầu cử.";

async function openDashboard(page: Page) {
  await page.route("**/api/admin/results", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ election: { id: "reset-test-election" }, results: [] }),
  }));
  await page.goto("/admin");
  await page.getByLabel("Mã PIN").fill("reset-test-pin");
  await page.getByLabel("Mã PIN").press("Enter");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("button", { name: "Bầu cử lại" })).toBeVisible();
}

test("cancel closes the reset modal without calling the reset endpoint", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/admin/reset", async (route) => {
    requests += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await openDashboard(page);

  const trigger = page.getByRole("button", { name: "Bầu cử lại" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận bầu cử lại" });
  await expect(dialog).toContainText(warning);
  await expect(dialog.getByRole("button", { name: "Hủy" })).toBeVisible();
  await dialog.getByRole("button", { name: "Hủy" }).click();

  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(requests).toBe(0);
});

test("successful confirmation returns the administrator to roster import", async ({ page }) => {
  let requests = 0;
  let releaseReset!: () => void;
  const pendingReset = new Promise<void>((resolve) => { releaseReset = resolve; });
  await page.route("**/api/admin/reset", async (route) => {
    requests += 1;
    await pendingReset;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await openDashboard(page);

  await page.getByRole("button", { name: "Bầu cử lại" }).click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận bầu cử lại" });
  await dialog.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Đang xóa dữ liệu…" })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Hủy", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  expect(requests).toBe(1);
  releaseReset();

  await expect(page).toHaveURL(/\/import-file$/);
  await expect(page.getByText("Tải Excel mẫu")).toBeVisible();
  expect(requests).toBe(1);
});

test("reset failure stays in the dashboard and reports the error", async ({ page }) => {
  await page.route("**/api/admin/reset", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ code: "ELECTION_RESET_FAILED" }),
  }));
  await openDashboard(page);

  await page.getByRole("button", { name: "Bầu cử lại" }).click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận bầu cử lại" });
  await dialog.getByRole("button", { name: "Xác nhận" }).click();

  await expect(dialog.getByRole("alert")).toContainText("Không thể đặt lại dữ liệu bầu cử");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(dialog.getByRole("button", { name: "Xác nhận", exact: true })).toBeEnabled();
});

test("dashboard chart orientation and theme changes preserve visible rankings on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem("appearance-theme", "light");
    localStorage.setItem("appearance-palette", "green");
  });
  const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%237c9d72'/%3E%3C/svg%3E";
  const results = [
    { id: "chart-a", name_vi: "Nguyễn An", name_zh: "王小明", image_url: image, total: 12 },
    { id: "chart-b", name_vi: "Trần Bình", name_zh: "陳小明", image_url: image, total: 7 },
  ];
  await page.route("**/api/admin/results", (route) => route.fulfill({ json: { election: { id: "chart-election" }, results } }));
  await page.goto("/admin");
  await page.getByLabel("Mã PIN").fill("reset-test-pin");
  await page.getByLabel("Mã PIN").press("Enter");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("img", { name: /chart with type Bar chart/i })).toBeVisible();
  const orientation = page.getByRole("switch", { name: "Hướng biểu đồ" });
  await orientation.focus();
  await page.keyboard.press("Space");
  await expect(orientation).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("img", { name: /chart with type Bar chart/i })).toBeVisible();
  await page.getByRole("switch", { name: "Giao diện tối" }).click();
  await page.getByRole("button", { name: "Màu xanh navy dịu", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "navy");
  const rankings = page.getByRole("heading", { name: "Thứ hạng hiện tại" }).locator("..");
  await expect(rankings.getByText("Nguyễn An", { exact: true })).toBeVisible();
  await expect(rankings.getByText("Trần Bình", { exact: true })).toBeVisible();
  await expect(rankings.getByText("12", { exact: true })).toBeVisible();
  await expect(rankings.getByText("7", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "繁體中文", exact: true }).click();
  await expect(page.getByText("王小明", { exact: true })).toBeVisible();
  await expect(page.getByText("陳小明", { exact: true })).toBeVisible();
  await expect(page.getByText("Nguyễn An", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
