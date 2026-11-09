import { expect, test, type Page } from "@playwright/test";

const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%237c9d72'/%3E%3C/svg%3E";
const candidate = (id: string, name: string) => ({ id, name_vi: name, name_zh: name, image_url: image, display_order: Number(id) });

async function prepareVotePage(page: Page) {
  await page.route("**/api/elections/active", (route) => route.fulfill({
    json: { election: { id: "test-election", status: "opened", candidates: [candidate("1", "Nguyễn An"), candidate("2", "Trần Bình"), candidate("3", "Lê Chi")] } },
  }));
  await page.goto("/vote");
  await expect(page.getByRole("heading", { name: "Danh sách ứng viên" })).toBeVisible();
}

test("tap selection fills the first empty slot and prevents duplicates", async ({ page }) => {
  await prepareVotePage(page);
  await page.getByRole("button", { name: "Nguyễn An, chạm để chọn", exact: true }).click();
  await expect(page.locator('[aria-label="Ô phiếu 1, Nguyễn An"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Nguyễn An, đã chọn ở vị trí 1", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Trần Bình, chạm để chọn", exact: true }).click();
  await page.getByRole("button", { name: "Xóa Nguyễn An khỏi ô 1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Nguyễn An, chạm để chọn", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Lê Chi, chạm để chọn", exact: true }).click();
  await expect(page.locator('[aria-label="Ô phiếu 1, Lê Chi"]')).toBeVisible();
  await expect(page.locator('[aria-label="Ô phiếu 2, Trần Bình"]')).toBeVisible();
});

test("keyboard selection and cancellation preserve the ballot and return focus", async ({ page }) => {
  let submissions = 0;
  await page.route("**/api/votes", (route) => { submissions++; return route.fulfill({ json: { ok: true } }); });
  await prepareVotePage(page);
  await page.getByRole("button", { name: "Trần Bình, chạm để chọn", exact: true }).focus();
  await page.keyboard.press("Space");
  const send = page.getByRole("button", { name: "Gửi phiếu", exact: true });
  await send.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Xác nhận gửi phiếu" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await dialog.getByRole("button", { name: "Quay lại chỉnh sửa", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(send).toBeFocused();
  await expect(page.locator('[aria-label="Ô phiếu 1, Trần Bình"]')).toBeVisible();
  await send.click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(send).toBeFocused();
  expect(submissions).toBe(0);
});

test("confirmation sends the selected candidates once and opens the thank-you page", async ({ page }) => {
  let submissions = 0;
  let submittedBody: unknown;
  await page.route("**/api/votes", (route) => {
    submissions++;
    submittedBody = route.request().postDataJSON();
    return route.fulfill({ json: { ok: true, voteId: "test-vote" } });
  });
  await prepareVotePage(page);
  await page.getByRole("button", { name: "Nguyễn An, chạm để chọn", exact: true }).click();
  await page.getByRole("button", { name: "Gửi phiếu", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Xác nhận gửi phiếu" });
  await expect(dialog.getByText("Nguyễn An", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Xác nhận gửi", exact: true }).click();
  await expect(page).toHaveURL(/\/thanks$/);
  expect(submissions).toBe(1);
  expect(submittedBody).toEqual({ electionId: "test-election", candidateIds: ["1"] });
  await expect(page.getByRole("heading", { name: "Cảm ơn bạn đã bỏ phiếu" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Giao diện tối" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Gửi phiếu", exact: true })).toHaveCount(0);
});

test("pending and failed submissions keep the ballot and block repeat requests", async ({ page }) => {
  let submissions = 0;
  let finishResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => { finishResponse = resolve; });
  await page.route("**/api/votes", async (route) => {
    submissions++;
    await responseGate;
    return route.fulfill({ status: 503, json: { code: "VOTE_SAVE_FAILED" } });
  });
  await prepareVotePage(page);
  await page.getByRole("button", { name: "Nguyễn An, chạm để chọn", exact: true }).click();
  const send = page.getByRole("button", { name: "Gửi phiếu", exact: true });
  await send.click();
  await page.getByRole("dialog", { name: "Xác nhận gửi phiếu" }).getByRole("button", { name: "Xác nhận gửi", exact: true }).click();
  await expect(send).toBeDisabled();
  await expect(send).toHaveAttribute("aria-busy", "true");
  await expect.poll(() => submissions).toBe(1);
  await send.evaluate((element) => (element as HTMLButtonElement).click());
  expect(submissions).toBe(1);
  finishResponse();
  await expect(page.getByRole("alert").filter({ hasText: "Không lưu được phiếu. Vui lòng thử lại." })).toBeVisible();
  await expect(send).toBeEnabled();
  await expect(page.locator('[aria-label="Ô phiếu 1, Nguyễn An"]')).toBeVisible();
  await send.click();
  await page.getByRole("dialog", { name: "Xác nhận gửi phiếu" }).getByRole("button", { name: "Quay lại chỉnh sửa", exact: true }).click();
  expect(submissions).toBe(1);
});

test("mobile touch selection opens an editable ballot without overflow", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 375, height: 812 }, hasTouch: true });
  const page = await context.newPage();
  try {
    await prepareVotePage(page);
    await page.getByRole("button", { name: "Lê Chi, chạm để chọn", exact: true }).tap();
    const trigger = page.getByRole("button", { name: "Xem / sửa phiếu", exact: true });
    await trigger.tap();
    const dialog = page.getByRole("dialog", { name: "Phiếu của bạn", exact: true });
    await expect(dialog.locator('[aria-label="Ô phiếu 1, Lê Chi"]')).toBeVisible();
    await dialog.getByRole("button", { name: "Xóa Lê Chi khỏi ô 1", exact: true }).tap();
    await expect(dialog.locator('[aria-label="Ô phiếu 1, còn trống"]')).toBeVisible();
    await dialog.getByRole("button", { name: "Xong", exact: true }).tap();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("button", { name: "Gửi phiếu", exact: true })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await context.close();
  }
});

test("dense candidate list stays scrollable while its ballot portal is open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/api/elections/active", (route) => route.fulfill({ json: {
    election: {
      id: "dense-test-election",
      status: "opened",
      candidates: Array.from({ length: 36 }, (_, index) => candidate(String(index + 1), `Ứng viên ${index + 1}`)),
    },
  } }));
  await page.goto("/vote");
  const lastCandidate = page.getByRole("button", { name: "Ứng viên 36, chạm để chọn", exact: true });
  await lastCandidate.click();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Xem / sửa phiếu", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Phiếu của bạn", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Ứng viên 36", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Xong", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Xem / sửa phiếu", exact: true })).toBeFocused();
});

for (const state of ["unavailable", "closed"] as const) {
  test("voting page explains the " + state + " election state", async ({ page }) => {
    await page.route("**/api/elections/active", (route) => route.fulfill({ json: { election: state === "closed" ? { id: "test-election", status: "closed", candidates: [] } : null } }));
    await page.goto("/vote");
    await expect(page.getByRole("heading", { name: state === "closed" ? "Kỳ bầu chọn đã đóng" : "Chưa mở kỳ bầu chọn" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Danh sách ứng viên" })).toHaveCount(0);
  });
}

test("PIN submission by Enter shows pending and error states without repeat requests", async ({ page }) => {
  let submissions = 0;
  let finishResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => { finishResponse = resolve; });
  await page.route("**/api/admin/session", async (route) => {
    submissions++;
    await responseGate;
    return route.fulfill({ status: 401, json: { code: "ADMIN_LOGIN_REJECTED" } });
  });
  await page.goto("/admin");
  const pin = page.getByLabel("Mã PIN", { exact: true });
  await pin.fill("incorrect-pin");
  await pin.press("Enter");
  const submit = page.getByRole("button", { name: "Đang xác thực…", exact: true });
  await expect(submit).toBeDisabled();
  await expect(pin).toBeDisabled();
  await expect.poll(() => submissions).toBe(1);
  await page.keyboard.press("Enter");
  expect(submissions).toBe(1);
  finishResponse();
  await expect(page.getByRole("alert").filter({ hasText: "Mã PIN không đúng hoặc đã thử quá nhiều lần." })).toBeVisible();
  await expect(pin).toHaveValue("incorrect-pin");
  await expect(page.getByRole("button", { name: "Vào trang quản trị", exact: true })).toBeEnabled();
});
