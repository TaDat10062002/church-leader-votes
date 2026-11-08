import { expect, test } from "@playwright/test";

test("glass controls preserve roster restore, dialog focus and cancellation on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem("appearance-theme", "dark");
    localStorage.setItem("appearance-palette", "navy");
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/admin/results", (route) => route.fulfill({ json: { election: null, results: [] } }));
  await page.route("**/api/admin/parse-excel", (route) => route.fulfill({
    json: { candidates: [{ name: "Nguyễn An", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%237c9d72'/%3E%3C/svg%3E" }] },
  }));
  let starts = 0;
  await page.route("**/api/admin/start", (route) => { starts++; return route.fulfill({ json: { ok: true } }); });
  await page.goto("/admin");
  await page.getByLabel("Mã PIN").fill("reset-test-pin");
  await page.getByRole("button", { name: "Vào trang quản trị" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/import-file");
  await page.locator('input[type="file"]').setInputFiles({ name: "roster.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from("mocked upload") });
  await expect(page.getByText("Đã tải 1 ứng viên vào danh sách tạm.")).toBeVisible();
  await page.getByRole("switch", { name: "Giao diện tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Xóa Nguyễn An", exact: true })).toBeVisible();
  await page.getByRole("switch", { name: "Giao diện tối" }).click();
  await page.getByRole("button", { name: "Xóa Nguyễn An", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Xem ứng viên đã xóa, 1 ứng viên" });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Ứng viên đã xóa" });
  await expect(sheet).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "navy");
  await page.keyboard.press("Tab");
  expect(await sheet.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await sheet.getByRole("button", { name: "Khôi phục Nguyễn An" }).click();
  await expect(sheet.getByText("Chưa có ứng viên nào bị xóa.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Xem ứng viên đã xóa, 0 ứng viên" })).toBeFocused();
  const startTrigger = page.getByRole("button", { name: "Bắt đầu bầu chọn", exact: true });
  await startTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận bắt đầu bầu cử" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(startTrigger).toBeFocused();
  await expect(page.getByRole("button", { name: "Xóa Nguyễn An", exact: true })).toBeVisible();
  expect(starts).toBe(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
