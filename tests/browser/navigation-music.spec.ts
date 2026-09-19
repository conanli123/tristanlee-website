import { expect, test } from "@playwright/test";

test("home scroll and navigation share active sections, history and filter state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#/home", { waitUntil: "domcontentloaded" });
  const nav = page.locator(".desktop-nav");
  await expect(nav.locator('[aria-current="location"]')).toContainText("HOME");
  for (const section of ["work", "profile", "news", "contact"]) {
    await nav.locator(`a[href="#/home?section=${section}"]`).click();
    await expect(nav.locator('[aria-current="location"]')).toHaveAttribute(
      "href",
      `#/home?section=${section}`,
    );
    await expect
      .poll(() =>
        page
          .locator(`[data-home-section="${section}"]`)
          .evaluate((e) =>
            Math.abs(
              e.getBoundingClientRect().top -
                document.querySelector(".site-header")!.getBoundingClientRect()
                  .bottom -
                24,
            ),
          ),
      )
      .toBeLessThan(4);
  }
  const historyLength = await page.evaluate(() => history.length);
  await page.locator("#work").evaluate((e) =>
    window.scrollTo({
      top: e.getBoundingClientRect().top + scrollY - 120,
      behavior: "instant",
    }),
  );
  await expect(nav.locator('[aria-current="location"]')).toContainText("WORK");
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await page
    .locator(".work-filters button")
    .filter({ hasText: /^All/ })
    .click();
  await nav.locator('a[href="#/home?section=profile"]').click();
  await nav.locator('a[href="#/home?section=work"]').click();
  await expect(page.locator(".work-filters button.active")).toContainText(
    "All",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(nav.locator('[aria-current="location"]')).toContainText("WORK");
  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(nav.locator('[aria-current="location"]')).toContainText(
    "PROFILE",
  );
  await nav.locator('a[href="#/music"]').click();
  await expect(page.locator(".music-page")).toBeVisible();
  await expect(nav.locator('[aria-current="page"]')).toContainText("MUSIC");
});

test("mobile menu follows scrolling and opens MUSIC", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#/home", { waitUntil: "domcontentloaded" });
  await page.locator("#work").evaluate((e) =>
    window.scrollTo({
      top: e.getBoundingClientRect().top + scrollY - 98,
      behavior: "instant",
    }),
  );
  await page.getByRole("button", { name: "MENU", exact: false }).click();
  const menu = page.getByRole("navigation", { name: "菜单导航" });
  await expect(menu.locator('[aria-current="location"]')).toContainText("WORK");
  await menu.locator('a[href="#/home?section=contact"]').click();
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "MENU", exact: false }).click();
  await expect(menu.locator('[aria-current="location"]')).toContainText(
    "CONTACT",
  );
  await menu.locator('a[href="#/music"]').click();
  await expect(page.locator(".music-page")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("real audio playback, seek, shuffle, track selection and route continuity", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#/music", { waitUntil: "domcontentloaded" });
  const audio = page.locator("audio[data-site-music]");
  await expect(page.locator(".music-track-row")).toHaveCount(7);
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).readyState))
    .toBeGreaterThan(0);
  await page.locator(".music-track-row").nth(1).click();
  if (await audio.evaluate((a) => (a as HTMLAudioElement).paused))
    await page.locator(".music-play-button").click();
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime))
    .toBeGreaterThan(0.15);
  await expect(page.locator(".music-current h2")).toHaveText("Griphop");
  await page.getByRole("slider", { name: "音量", exact: true }).fill("0.35");
  expect(
    await audio.evaluate((a) => (a as HTMLAudioElement).volume),
  ).toBeCloseTo(0.35, 2);
  await page.getByRole("button", { name: "静音", exact: true }).click();
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).muted)).toBe(true);
  await page.getByRole("button", { name: "取消静音", exact: true }).click();
  await page.getByRole("slider", { name: "播放进度", exact: true }).fill("15");
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime), {
      // A cold CDN response may need to buffer the track before seeking.
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(15);
  await page.locator(".music-play-button").click();
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).paused))
    .toBe(true);
  const paused = await audio.evaluate(
    (a) => (a as HTMLAudioElement).currentTime,
  );
  await page.waitForTimeout(250);
  expect(
    await audio.evaluate((a) => (a as HTMLAudioElement).currentTime),
  ).toBeCloseTo(paused, 1);
  await page.locator(".music-play-button").click();
  const source = await audio.evaluate(
    (a) => (a as HTMLAudioElement).currentSrc,
  );
  await page.locator('.desktop-nav a[href="#/work"]').click();
  await expect(page.locator(".depth-carousel")).toHaveCount(1);
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).currentSrc)).toBe(
    source,
  );
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(
    false,
  );
  await page.locator(".music-mini-toggle").click();
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).paused))
    .toBe(true);
  await page.locator(".music-mini-toggle").click();
  await page.locator(".music-mini-next").click();
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentSrc))
    .not.toBe(source);
  await page.locator('.desktop-nav a[href="#/music"]').click();
  await page.getByRole("button", { name: "随机播放", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "随机播放", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.locator(".music-track-row").first().click();
  await expect(page.locator(".music-current h2")).toHaveText("District Four");
  await page.getByRole("button", { name: "下一首", exact: true }).click();
  await expect(page.locator(".music-current h2")).toHaveText("Griphop");
  await expect
    .poll(() =>
      audio.evaluate((a) => Number.isFinite((a as HTMLAudioElement).duration)),
    )
    .toBe(true);
  const end = await audio.evaluate((a) =>
    Math.floor((a as HTMLAudioElement).duration),
  );
  await page
    .getByRole("slider", { name: "播放进度", exact: true })
    .fill(String(end));
  await expect(page.locator(".music-current h2")).toHaveText("Chillin Hard", {
    timeout: 5000,
  });
  expect(errors).toEqual([]);
});

test("paused preference survives reload and does not restart on navigation", async ({
  page,
}) => {
  await page.goto("#/music", { waitUntil: "domcontentloaded" });
  const audio = page.locator("audio[data-site-music]");
  if (await audio.evaluate((a) => (a as HTMLAudioElement).paused))
    await page.locator(".music-play-button").click();
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).paused))
    .toBe(false);
  await page.locator(".music-play-button").click();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).readyState))
    .toBeGreaterThan(0);
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(
    true,
  );
  await page.locator('.desktop-nav a[href="#/home"]').click();
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(
    true,
  );
});

test("official song previews pause background audio and restore native playback on selection", async ({
  page,
}) => {
  // Verify our integration independently of third-party region/subscription rules.
  await page.route("https://embed.music.apple.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body>Official player fixture</body></html>",
    }),
  );
  await page.goto("#/music", { waitUntil: "domcontentloaded" });
  await page.locator(".music-track-row").first().click();
  const audio = page.locator("audio[data-site-music]");
  if (await audio.evaluate((a) => (a as HTMLAudioElement).paused))
    await page.locator(".music-play-button").click();
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime))
    .toBeGreaterThan(0.1);
  const previews = [
    { title: "快乐崇拜", songId: "1443399243" },
    { title: "八方来财", songId: "1763742879" },
    { title: "花花公子", songId: "1724867781" },
  ];
  for (const [index, preview] of previews.entries()) {
    await page.locator(".music-platform-row").nth(index).click();
    await expect(page.locator(".music-current h2")).toHaveText(preview.title);
    await expect(page.locator(".music-platform-player iframe")).toHaveCount(1);
    await expect(page.locator(".music-platform-player iframe")).toHaveAttribute(
      "src",
      `https://embed.music.apple.com/cn/song/${preview.songId}`,
    );
    await expect(page.locator(".music-platform-player > a")).toHaveAttribute(
      "href",
      `https://music.apple.com/cn/song/${preview.songId}`,
    );
    await expect(
      page.locator(".music-track-row[aria-current=true]"),
    ).toHaveCount(1);
    await expect
      .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).paused))
      .toBe(true);
  }
  await page.locator(".music-track-row").nth(1).click();
  await expect(page.locator(".music-platform-player iframe")).toHaveCount(0);
  await expect(page.locator(".music-current h2")).toHaveText("Griphop");
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime))
    .toBeGreaterThan(0.1);
  await page.locator(".music-platform-row").first().click();
  await page.locator('.desktop-nav a[href="#/work"]').click();
  await expect(page.locator(".music-platform-player iframe")).toHaveCount(0);
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(
    true,
  );
});

test("autoplay denial is recoverable with one play click", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL });
  await context.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!navigator.userActivation.hasBeenActive)
        return Promise.reject(
          new DOMException("Gesture required", "NotAllowedError"),
        );
      return original.call(this);
    };
  });
  const page = await context.newPage();
  try {
    await page.goto("#/music", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".music-status")).toContainText("点击播放");
    await page.locator(".music-play-button").click();
    await expect
      .poll(() =>
        page
          .locator("audio")
          .evaluate((a) => (a as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0.1);
    await expect(page.locator(".music-status")).toContainText("继续浏览");
  } finally {
    await context.close();
  }
});

test("fresh visits choose different tracks from the full playlist", async ({
  browser,
  baseURL,
}) => {
  const sources: string[] = [];
  for (const random of [0.1, 0.9]) {
    const context = await browser.newContext({ baseURL });
    await context.addInitScript((value) => {
      Math.random = () => value;
    }, random);
    const page = await context.newPage();
    try {
      await page.goto("#/music", { waitUntil: "domcontentloaded" });
      await page.locator(".music-current h2").waitFor();
      sources.push(
        await page
          .locator("audio")
          .evaluate((a) => (a as HTMLAudioElement).src),
      );
    } finally {
      await context.close();
    }
  }
  expect(sources[0]).not.toEqual(sources[1]);
});

test("all tracks decode and a failed track can recover by switching songs", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.route("**/music/district-four.mp3", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("#/music", { waitUntil: "domcontentloaded" });
  await page.locator(".music-play-button").click();
  await expect(page.locator(".music-status")).toContainText("无法播放");
  await page.unroute("**/music/district-four.mp3");
  for (const index of [1, 2, 3, 0]) {
    await page.locator(".music-track-row").nth(index).click();
    await expect
      .poll(() =>
        page.locator("audio").evaluate((a) => (a as HTMLAudioElement).duration),
      )
      .toBeGreaterThan(100);
    await expect
      .poll(() =>
        page
          .locator("audio")
          .evaluate((a) => (a as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0.05);
    await expect(page.locator(".music-track-row").nth(index)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.locator(".music-status")).not.toContainText("无法播放");
  }
});

for (const width of [320, 390, 1024, 1366, 1440]) {
  test(`music layout and navigation fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("#/music", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".music-track-row")).toHaveCount(7);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    if (width > 1000) {
      const header = await page.locator(".site-header").evaluate((e) => {
        const intro = e.querySelector(".header-intro")!.getBoundingClientRect();
        const nav = e.querySelector(".desktop-nav")!.getBoundingClientRect();
        return { overlap: intro.right - nav.left, right: nav.right };
      });
      expect(header.overlap).toBeLessThanOrEqual(0);
      expect(header.right).toBeLessThanOrEqual(width);
    }
    await page.screenshot({ path: `test-results/music-${width}.png` });
  });
}
