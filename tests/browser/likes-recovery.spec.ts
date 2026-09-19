import { expect, test } from "@playwright/test";

const workId = "how-to-train-your-dragon";
const snapshot = (count: number, liked = false) => ({
  counts: { [workId]: count },
  liked: liked ? [workId] : [],
});

test("a failed first connection can be retried from the like button", async ({
  page,
}) => {
  let reads = 0;
  let writes = 0;
  await page.route("**/api/likes{,/**}", async (route) => {
    if (route.request().method() === "PUT") {
      writes++;
      await route.fulfill({ json: { workId, count: 1, liked: true } });
    } else if (++reads === 1) {
      await route.fulfill({ status: 503, json: { error: "Unavailable" } });
    } else {
      await route.fulfill({ json: snapshot(0) });
    }
  });
  await page.goto(`#/work/${workId}`, { waitUntil: "domcontentloaded" });
  const button = page.locator(".detail-actions .like-button");
  await expect(button).toBeEnabled();
  await expect(button).toHaveAccessibleName(/点击重新连接点赞服务/);
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "false");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button.locator(".like-count")).toHaveText("1");
  expect(reads).toBe(2);
  expect(writes).toBe(1);
});

for (const initiallyLiked of [false, true]) {
  test(`an expired session automatically retries the intended ${initiallyLiked ? "unlike" : "like"}`, async ({
    page,
  }) => {
    let reads = 0;
    const attemptedStates: boolean[] = [];
    const desired = !initiallyLiked;
    await page.route("**/api/likes{,/**}", async (route) => {
      if (route.request().method() === "PUT") {
        attemptedStates.push(route.request().postDataJSON().liked);
        await route.fulfill(
          attemptedStates.length === 1
            ? { status: 409, json: { error: "Visitor session missing" } }
            : { json: { workId, count: desired ? 5 : 4, liked: desired } },
        );
      } else {
        await route.fulfill({
          json: snapshot(4, ++reads === 1 && initiallyLiked),
        });
      }
    });
    await page.goto(`#/work/${workId}`, { waitUntil: "domcontentloaded" });
    const button = page.locator(".detail-actions .like-button");
    await expect(button).toBeEnabled();
    await button.click();
    await expect(button).toHaveAttribute("aria-busy", "false");
    await expect(button).toHaveAttribute("aria-pressed", String(desired));
    await expect(button.locator(".like-count")).toHaveText(desired ? "5" : "4");
    await expect(page.locator(".detail-actions .like-error")).toHaveCount(0);
    expect(attemptedStates).toEqual([desired, desired]);
    expect(reads).toBe(2);
  });
}

test("a failed save rolls back and the same button can retry", async ({ page }) => {
  let writes = 0;
  await page.route("**/api/likes{,/**}", async (route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill(
        ++writes === 1
          ? { status: 503, json: { error: "Unavailable" } }
          : { json: { workId, count: 4, liked: true } },
      );
    } else {
      await route.fulfill({ json: snapshot(3) });
    }
  });
  await page.goto(`#/work/${workId}`, { waitUntil: "domcontentloaded" });
  const button = page.locator(".detail-actions .like-button");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.locator(".detail-actions .like-error")).toHaveText(
    "点赞未保存，请点击重试",
  );
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(button.locator(".like-count")).toHaveText("3");
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "false");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(button.locator(".like-count")).toHaveText("4");
  await expect(page.locator(".detail-actions .like-error")).toHaveCount(0);
  expect(writes).toBe(2);
});
