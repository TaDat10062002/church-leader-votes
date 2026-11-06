import { expect, test, type Page } from "@playwright/test";

const candidate = (id: string, name: string) => ({ id, name, image_url: `https://images.example.test/${id}.png`, display_order: Number(id) });

async function prepareVotePage(page: Page) {
  await page.route("**/api/elections/active", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ election: { id: "test-election", candidates: [candidate("1", "Nguyễn An"), candidate("2", "Trần Bình"), candidate("3", "Lê Chi")] } }),
  }));
  await page.route("**/api/votes", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, voteId: "test-vote" }) }));
  await page.goto("/vote");
  await expect(page.getByText("Danh sách ứng viên")).toBeVisible();
}

test("mouse drag places a candidate in a chosen slot and rejects duplicates", async ({ page }) => {
  await prepareVotePage(page);
  const handle = page.getByRole("button", { name: "Kéo Nguyễn An vào ô phiếu" });
  await handle.dragTo(page.locator('[aria-label="Ô phiếu 2, còn trống"]'), { steps: 8 });
  await expect(page.locator('[aria-label="Ô phiếu 2, Nguyễn An"]')).toBeVisible();
  await handle.dragTo(page.locator('[aria-label="Ô phiếu 1, còn trống"]'), { steps: 8 });
  await expect(page.locator('p[role="alert"]')).toContainText("đã có trong phiếu");
});

test("successful submission replaces the ballot with a thank-you page", async ({ page }) => {
  await prepareVotePage(page);
  const handle = page.getByRole("button", { name: "Kéo Nguyễn An vào ô phiếu" });
  await handle.dragTo(page.locator('[aria-label="Ô phiếu 2, còn trống"]'), { steps: 8 });
  await expect(page.locator('[aria-label="Ô phiếu 2, Nguyễn An"]')).toBeVisible();
  const [voteResponse] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/votes") && response.request().method() === "POST"),
    page.getByRole("button", { name: "Gửi phiếu" }).click(),
  ]);
  expect(voteResponse.ok()).toBe(true);
  await expect(page).toHaveURL(/\/thanks$/);
  await expect(page.getByText("Thanks for your voting")).toBeVisible();
  await expect(page.locator("main").getByRole("link")).toHaveCount(0);
  await expect(page.locator("main").getByRole("button")).toHaveCount(0);
  await page.goBack().catch(() => null);
  await expect(page).not.toHaveURL(/\/vote$/);
});

test("keyboard drag places a candidate into a ballot slot", async ({ page }) => {
  await prepareVotePage(page);
  const handle = page.getByRole("button", { name: "Kéo Trần Bình vào ô phiếu" });
  await handle.focus();
  await page.keyboard.press("Space");
  for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(page.locator('[aria-roledescription="vùng thả phiếu"]').filter({ hasText: "Trần Bình" })).toHaveCount(1);
});

test("voting page clearly explains when there is no active election", async ({ page }) => {
  await page.route("**/api/elections/active", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ election: null }),
  }));
  await page.goto("/vote");
  await expect(page.getByRole("heading", { name: "Chưa mở kỳ bầu chọn" })).toBeVisible();
  await expect(page.getByText("Danh sách ứng viên")).toHaveCount(0);
});

test("touch drag places a candidate in the ballot", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await prepareVotePage(page);
    const handle = page.getByRole("button", { name: "Kéo Lê Chi vào ô phiếu" });
    const target = page.locator('[aria-label="Ô phiếu 3, còn trống"]');
    await handle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const from = await handle.boundingBox(); const to = await target.boundingBox();
    if (!from || !to) throw new Error("Touch drag source or target is not visible.");
    const cdp = await context.newCDPSession(page);
    const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    const end = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...start, id: 0, force: 1 }] });
    await page.waitForTimeout(220);
    for (let step = 1; step <= 10; step++) {
      const progress = step / 10;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress, id: 0, force: 1 }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.locator('[aria-label="Ô phiếu 3, Lê Chi"]')).toBeVisible();
    await cdp.detach();
  } finally { await context.close(); }
});
