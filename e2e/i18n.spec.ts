import { expect, test } from "@playwright/test";

test("language selection updates content and persists across routes and reloads", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  let mainFrameNavigations = 0;
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) mainFrameNavigations += 1;
  });
  await page.route("**/api/elections/active", (route) => route.fulfill({ json: {
    election: {
      id: "locale-election",
      status: "opened",
      candidates: [{ id: "candidate-1", name: "Nguyễn An", image_url: "", display_order: 1 }],
    },
  } }));

  await page.goto("/vote");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page).toHaveTitle("Bầu chọn Ban Điều Hành");
  await expect(page.getByRole("heading", { name: "Chọn người bạn tín nhiệm" })).toBeVisible();

  const votePageNavigations = mainFrameNavigations;
  await page.getByRole("button", { name: "繁體中文", exact: true }).click();
  expect(mainFrameNavigations).toBe(votePageNavigations);
  await expect(page).toHaveURL(/\/vote$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(page).toHaveTitle("教會行政委員會選舉");
  await expect(page.getByRole("heading", { name: "選出您信任的人選" })).toBeVisible();
  await expect(page.getByText("Nguyễn An", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.cookie)).toContain("app-locale=zh-TW");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(page.getByRole("heading", { name: "選出您信任的人選" })).toBeVisible();

  await page.goto("/admin");
  await expect(page).toHaveTitle("教會行政委員會選舉");
  await expect(page.getByRole("heading", { name: "輸入管理員 PIN 碼" })).toBeVisible();
  const adminPageNavigations = mainFrameNavigations;
  await page.getByRole("button", { name: "Tiếng Việt", exact: true }).click();
  expect(mainFrameNavigations).toBe(adminPageNavigations);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page).toHaveTitle("Bầu chọn Ban Điều Hành");
  await expect(page.getByRole("heading", { name: "Nhập mã PIN quản trị" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});
