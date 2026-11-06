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
  await page.getByRole("button", { name: "Vào trang quản trị" }).click();
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

  await page.getByRole("button", { name: "Bầu cử lại" }).click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận bầu cử lại" });
  await expect(dialog).toContainText(warning);
  await expect(dialog.getByRole("button", { name: "Hủy" })).toBeVisible();
  await dialog.getByRole("button", { name: "Hủy" }).click();

  await expect(dialog).not.toBeVisible();
  expect(requests).toBe(0);
});

test("successful confirmation returns the administrator to roster import", async ({ page }) => {
  await page.route("**/api/admin/reset", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  }));
  await openDashboard(page);

  await page.getByRole("button", { name: "Bầu cử lại" }).click();
  await page.getByRole("dialog", { name: "Xác nhận bầu cử lại" }).getByRole("button", { name: "Xác nhận" }).click();

  await expect(page).toHaveURL(/\/import-file$/);
  await expect(page.getByText("Tải Excel mẫu")).toBeVisible();
});

test("reset failure stays in the dashboard and reports the error", async ({ page }) => {
  await page.route("**/api/admin/reset", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: "Không thể đặt lại dữ liệu bầu cử. Vui lòng thử lại." }),
  }));
  await openDashboard(page);

  await page.getByRole("button", { name: "Bầu cử lại" }).click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận bầu cử lại" });
  await dialog.getByRole("button", { name: "Xác nhận" }).click();

  await expect(dialog.getByRole("alert")).toContainText("Không thể đặt lại dữ liệu bầu cử");
  await expect(page).toHaveURL(/\/dashboard$/);
});
