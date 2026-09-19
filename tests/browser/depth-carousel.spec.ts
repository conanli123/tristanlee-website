import { expect, test, type Page } from "@playwright/test";
import { works } from "../../src/data/site";

const cards = ".depth-carousel__card";
const dots = ".depth-carousel__dot";
const next = ".depth-carousel__arrow--next";
const previous = ".depth-carousel__arrow--prev";
const lightingWorks = works.filter((work) => work.group === "lighting");

test.beforeEach(async ({ page }) => {
  // Exercise shared UI state without adding test votes to the public database.
  const liked = new Set<string>();
  await page.route("**/api/likes{,/**}", async (route) => {
    const request = route.request();
    if (request.method() === "PUT") {
      const workId = new URL(request.url()).pathname.split("/").pop()!;
      const value = request.postDataJSON().liked;
      if (value) liked.add(workId);
      else liked.delete(workId);
      await route.fulfill({
        json: { workId, count: value ? 1 : 0, liked: value },
      });
    } else {
      await route.fulfill({
        json: {
          counts: Object.fromEntries([...liked].map((id) => [id, 1])),
          liked: [...liked],
        },
      });
    }
  });
});

async function openLighting(page: Page) {
  await page.goto("#/work", { waitUntil: "domcontentloaded" });
  await expect(page.locator(cards)).toHaveCount(13);
  await expect(page.locator(".work-grid")).toHaveCount(0);
  await page.locator(".depth-carousel").scrollIntoViewIfNeeded();
  await expect(page.locator(`${cards}.is-active`)).toBeVisible();
}

async function pause(page: Page) {
  await page.locator(".depth-carousel__play").click();
  await expect(page.locator(".depth-carousel__play")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
}

async function expectCentered(page: Page, index: number) {
  const card = page.locator(cards).nth(index);
  await expect(card).toHaveAttribute("aria-current", "true");
  await expect(card).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      card.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const stage = element.parentElement!.getBoundingClientRect();
        return Math.abs(rect.x + rect.width / 2 - stage.x - stage.width / 2);
      }),
    )
    .toBeLessThan(0.1);
  await expect(card).toHaveAttribute(
    "style",
    /translateX\(0px\) translateZ\(0px\) rotateY\(0deg\)/,
  );
  await expect(page.locator(dots).nth(index)).toHaveAttribute(
    "aria-current",
    "true",
  );
  const work = lightingWorks[index];
  await expect(
    page.locator(".lighting-depth-caption .work-title"),
  ).toHaveAttribute("href", `#/work/${work.id}`);
  await expect(
    page.locator(".lighting-depth-caption .work-title"),
  ).toContainText(work.title);
  await expect(page.locator(".lighting-depth-caption time")).toHaveText(
    work.year,
  );
  expect(
    await card.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return element.contains(
        document.elementFromPoint(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
        ),
      );
    }),
  ).toBe(true);
}

test("default Lighting, filter refresh and detail return", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openLighting(page);
  await pause(page);
  await expectCentered(page, 0);
  await page
    .locator(".work-filters button")
    .filter({ hasText: /^All/ })
    .click();
  await expect(page.locator(".work-grid .work-card")).toHaveCount(25);
  await expect(page.locator(".depth-carousel")).toHaveCount(0);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".work-filters button.active")).toContainText(
    "All",
  );
  await page
    .locator(".work-filters button")
    .filter({ hasText: /^Lighting/ })
    .click();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".work-filters button.active")).toContainText(
    "Lighting",
  );
  await pause(page);
  await page.locator(`${cards}.is-active`).click();
  await expect(page.locator(".work-detail")).toBeVisible();
  await page.locator(".breadcrumb").click();
  await expect(page).toHaveURL(/category=lighting/);
  await expect(page.locator(".depth-carousel")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`home scroll shows the same Lighting carousel at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
    await page.goto("#/home", { waitUntil: "domcontentloaded" });
    const workSection = page.locator("#work");
    await workSection.scrollIntoViewIfNeeded();
    await expect(page).toHaveURL(/#\/home$/);
    await expect(
      workSection.locator(".work-filters button.active"),
    ).toContainText("Lighting");
    await expect(workSection.locator(cards)).toHaveCount(13);
    await expect(workSection.locator(".work-grid")).toHaveCount(0);
    await page.locator(".depth-carousel").scrollIntoViewIfNeeded();
    await pause(page);
    await page.locator(next).click();
    await expectCentered(page, 1);
    const homeWidth = (await page.locator(`${cards}.is-active`).boundingBox())!
      .width;
    await workSection
      .locator(".work-filters button")
      .filter({ hasText: /^All/ })
      .click();
    await expect(workSection.locator(".work-card")).toHaveCount(25);
    await expect(workSection.locator(".depth-carousel")).toHaveCount(0);
    await workSection
      .locator(".work-filters button")
      .filter({ hasText: /^Lighting/ })
      .click();
    await expect(workSection.locator(cards)).toHaveCount(13);
    await expect(workSection.locator(".work-grid")).toHaveCount(0);
    await page.locator(".depth-carousel").scrollIntoViewIfNeeded();
    await pause(page);
    await page.locator(dots).nth(10).click();
    await expectCentered(page, 10);
    await page.locator(`${cards}.is-active`).click();
    await expect(page.locator(".detail-heading h1")).toHaveText(
      "小破孩之大状元电影",
    );
    await expect(page.locator(".detail-heading .eyebrow")).toContainText(
      "2018",
    );
    if (width > 700) {
      await page.locator('.desktop-nav a[href="#/work"]').click();
    } else {
      await page.goto("#/work", { waitUntil: "domcontentloaded" });
    }
    await expect(page.locator(cards)).toHaveCount(13);
    await expect(page.locator(".work-grid")).toHaveCount(0);
    await pause(page);
    const workWidth = (await page.locator(`${cards}.is-active`).boundingBox())!
      .width;
    expect(Math.abs(workWidth - homeWidth)).toBeLessThan(1);
  });
}

test("animated navigation stays centered through all dots, wraps and rapid clicks", async ({
  page,
}) => {
  await openLighting(page);
  await pause(page);
  const first = page.locator(cards).first();
  const original = await first.getAttribute("style");
  await page.locator(next).click();
  await page.waitForTimeout(100);
  expect(await first.getAttribute("style")).not.toBe(original);
  const opacity = Number(
    await first.evaluate((element) => element.style.opacity),
  );
  expect(opacity).toBeGreaterThan(0);
  expect(opacity).toBeLessThan(1);
  await expectCentered(page, 1);
  for (let index = 0; index < 13; index++) {
    await page.locator(dots).nth(index).click();
    await expectCentered(page, index);
  }
  await page.locator(next).click();
  await expectCentered(page, 0);
  await page.locator(previous).click();
  await expectCentered(page, 12);
  await page.locator(next).click({ clickCount: 3, delay: 35 });
  await expectCentered(page, 2);
  await page.locator(".depth-carousel").focus();
  await page.keyboard.press("Home");
  await expectCentered(page, 0);
  await page.keyboard.press("End");
  await expectCentered(page, 12);
});

test("drag and wheel navigate without accidental detail clicks or page scrolling", async ({
  page,
}) => {
  await openLighting(page);
  await pause(page);
  const box = (await page.locator(`${cards}.is-active`).boundingBox())!;
  const startX = box.x + box.width * 0.8;
  await page.mouse.move(startX, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(startX - box.width * 0.55, box.y + box.height / 2, {
    steps: 15,
  });
  await page.mouse.up();
  await expectCentered(page, 1);
  await expect(page).toHaveURL(/#\/work$/);
  const active = (await page.locator(`${cards}.is-active`).boundingBox())!;
  await page.mouse.move(
    active.x + active.width / 2,
    active.y + active.height / 2,
  );
  const scroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, active.width * 0.54);
  await expectCentered(page, 2);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.locator(`${cards}.is-active`).click();
  await expect(page.locator(".work-detail")).toBeVisible();
});

test("visible rear card centers before opening and likes/favorites preserve selection", async ({
  page,
}) => {
  await openLighting(page);
  await pause(page);
  const rear = page.locator(cards).nth(1);
  const rect = (await rear.boundingBox())!;
  await page.mouse.click(rect.x + rect.width - 10, rect.y + rect.height / 2);
  await expectCentered(page, 1);
  const caption = page.locator(".lighting-depth-caption");
  await caption.locator(".favorite-button").click();
  await expect(caption.locator(".favorite-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await caption.locator(".like-button").click();
  await expect(caption.locator(".like-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectCentered(page, 1);
  await page.locator(`${cards}.is-active`).click();
  await expect(page).toHaveURL(new RegExp(`/work/${lightingWorks[1].id}$`));
  await expect(
    page.locator(".detail-actions .favorite-button"),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".detail-actions .like-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator(".breadcrumb").click();
  await page
    .locator(".work-filters button")
    .filter({ hasText: /^All/ })
    .click();
  const gridCard = page.locator(".work-card").filter({
    has: page.locator(`a.work-title[href="#/work/${lightingWorks[1].id}"]`),
  });
  await expect(gridCard.locator(".favorite-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(gridCard.locator(".like-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("renamed film title and 2018 date agree in the carousel and detail", async ({
  page,
}) => {
  await openLighting(page);
  await pause(page);
  const index = lightingWorks.findIndex(
    (work) => work.id === "forest-tiger-chase",
  );
  await page.locator(dots).nth(index).click();
  await expectCentered(page, index);
  const caption = page.locator(".lighting-depth-caption");
  await expect(caption.locator(".work-title")).toContainText(
    "小破孩之大状元电影",
  );
  await expect(caption.locator(".work-title span")).toHaveText(
    "XIAO PO HAI: THE TOP SCHOLAR",
  );
  await expect(caption.locator("time")).toHaveText("2018");
  await page.locator(`${cards}.is-active`).click();
  await expect(page.locator(".detail-heading h1")).toHaveText(
    "小破孩之大状元电影",
  );
  await expect(page.locator(".detail-heading .eyebrow")).toContainText("2018");
  await expect(page.locator(".detail-heading")).toContainText(
    "XIAO PO HAI: THE TOP SCHOLAR",
  );
});

test("autoplay advances, pauses on hover/focus and resumes after leaving", async ({
  page,
}) => {
  await openLighting(page);
  await page.mouse.move(5, 110);
  await expect(page.locator(cards).nth(1)).toHaveAttribute(
    "aria-current",
    "true",
    { timeout: 5000 },
  );
  await page.locator(".depth-carousel").hover();
  await page.waitForTimeout(3400);
  await expectCentered(page, 1);
  await page.locator(".depth-carousel").focus();
  await page.mouse.move(5, 110);
  await page.waitForTimeout(3400);
  await expectCentered(page, 1);
  await page.locator(".work-filters button.active").focus();
  await expect(page.locator(cards).nth(2)).toHaveAttribute(
    "aria-current",
    "true",
    { timeout: 5000 },
  );
  await pause(page);
  await page.mouse.move(5, 110);
  await page.locator(".work-filters button.active").focus();
  await page.waitForTimeout(3400);
  await expectCentered(page, 2);
  await page.locator(".depth-carousel__play").click();
  await page.mouse.move(5, 110);
  await page.locator(".work-filters button.active").focus();
  await expect(page.locator(cards).nth(3)).toHaveAttribute(
    "aria-current",
    "true",
    { timeout: 5000 },
  );
});

for (const width of [320, 390, 1366, 1440]) {
  test(`responsive layout at ${width}px retains aspect ratio and working controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 768 });
    await openLighting(page);
    await pause(page);
    await page.locator(next).click();
    await expectCentered(page, 1);
    const dimensions = await page
      .locator(`${cards}.is-active`)
      .evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          ratio: rect.width / rect.height,
          width: rect.width,
          carouselWidth: element
            .closest(".depth-carousel")!
            .getBoundingClientRect().width,
          left: rect.left,
          right: rect.right,
          overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });
    expect(dimensions.ratio).toBeCloseTo(420 / 320, 3);
    if (width < 500) {
      expect(
        dimensions.width / dimensions.carouselWidth,
      ).toBeGreaterThanOrEqual(0.75);
    } else if (width === 1440) {
      expect(dimensions.width).toBeGreaterThanOrEqual(620);
    }
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(width);
    expect(dimensions.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/depth-${width}.png` });
  });
}

test("reduced motion keeps manual navigation and disables autoplay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLighting(page);
  await expect(page.locator(".depth-carousel__play")).toHaveCount(0);
  await page.mouse.move(5, 110);
  await page.waitForTimeout(3500);
  await expectCentered(page, 0);
  await page.locator(next).click();
  await expectCentered(page, 1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expectCentered(page, 1);
  await page.locator(dots).nth(12).click();
  await expectCentered(page, 12);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectCentered(page, 12);
});

test("autoplay suspends offscreen and resumes when the gallery returns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 360 });
  await openLighting(page);
  await page.mouse.move(5, 110);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(4000);
  await expect(page.locator(cards).first()).toHaveAttribute(
    "aria-current",
    "true",
  );
  await page.locator(".depth-carousel").scrollIntoViewIfNeeded();
  await expect(page.locator(cards).nth(1)).toHaveAttribute(
    "aria-current",
    "true",
    { timeout: 5000 },
  );
});

test("touch horizontal swipe changes the card while vertical swipe scrolls", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL,
  });
  const page = await context.newPage();
  try {
    await openLighting(page);
    await pause(page);
    const session = await context.newCDPSession(page);
    const box = (await page.locator(`${cards}.is-active`).boundingBox())!;
    const x = box.x + box.width * 0.8;
    const y = box.y + box.height / 2;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - (step / 10) * box.width * 0.55, y }],
      });
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expectCentered(page, 1);
    const before = await page.evaluate(() => scrollY);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - step * 15 }],
      });
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(before + 20);
    await expect(page.locator(cards).nth(1)).toHaveAttribute(
      "aria-current",
      "true",
    );
  } finally {
    await context.close();
  }
});
