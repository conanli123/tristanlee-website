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
  await expect(page.locator(".music-track-row")).toHaveCount(5);
  await expect
    .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).readyState))
    .toBeGreaterThan(0);
  await page.locator(".music-track-row").nth(2).click();
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
  await expect(page.locator(".music-current h2")).toHaveText("八方来财");
  await page.getByRole("button", { name: "下一首", exact: true }).click();
  await expect(page.locator(".music-current h2")).toHaveText("District Four");
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
  await expect(page.locator(".music-current h2")).toHaveText("Griphop", {
    timeout: 5000,
  });
  expect(errors).toEqual([]);
});

test("pausing lasts for this visit and reopening attempts the first song again", async ({
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
  await page.locator('.desktop-nav a[href="#/home"]').click();
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(
    true,
  );
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      document.documentElement.dataset.reopenedMusic = this.src;
      return original.call(this);
    };
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-reopened-music", /\/music\/ba-fang-lai-cai\.mp3$/,
  );
});

test("uploaded songs play beyond preview length in the native playlist", async ({
  page,
}) => {
  await page.goto("#/music", { waitUntil: "domcontentloaded" });
  await expect(
    page.locator(".music-track-name > span > strong"),
  ).toHaveText(["八方来财", "District Four", "Griphop", "快乐崇拜", "花花公子"]);
  await expect(page.locator(".music-page iframe")).toHaveCount(0);
  const audio = page.locator("audio[data-site-music]");
  const uploads = [
    { index: 3, title: "快乐崇拜", file: "happy-worship.mp3" },
    { index: 4, title: "花花公子", file: "crush-on-you.mp3" },
    { index: 0, title: "八方来财", file: "ba-fang-lai-cai.mp3" },
  ];
  for (const upload of uploads) {
    await page.locator(".music-track-row").nth(upload.index).click();
    await expect(page.locator(".music-current h2")).toHaveText(upload.title);
    await expect
      .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentSrc))
      .toMatch(new RegExp(`/music/${upload.file.replace(".", "\\.")}$`));
    await expect
      .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).duration))
      .toBeGreaterThan(100);
    await expect
      .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime))
      .toBeGreaterThan(0.1);
    await page.getByRole("slider", { name: "播放进度", exact: true }).fill("60");
    await expect
      .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime), {
        timeout: 15_000,
      })
      .toBeGreaterThan(60.1);
    await expect(
      page.locator(".music-track-row[aria-current=true]"),
    ).toHaveCount(1);
    expect(await audio.evaluate((a) => (a as HTMLAudioElement).error)).toBeNull();
  }
  await page.locator('.desktop-nav a[href="#/work"]').click();
  await expect(page.locator(".music-mini-title strong")).toHaveText("八方来财");
  expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(
    false,
  );
});

test("autoplay denial recovers on the first ordinary page interaction", async ({
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
    await expect(page.locator(".music-current h2")).toHaveText("八方来财");
    const audio = page.locator("audio[data-site-music]");
    expect(await audio.evaluate((a) => (a as HTMLAudioElement).paused)).toBe(true);
    // Non-control content inside the MUSIC page must also unlock playback.
    await page.locator(".music-page-heading h1").click();
    await expect
      .poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime))
      .toBeGreaterThan(0.1);
    expect(await audio.evaluate((a) => (a as HTMLAudioElement).currentSrc)).toMatch(
      /\/music\/ba-fang-lai-cai\.mp3$/,
    );
    await page.locator('.desktop-nav a[href="#/home"]').click();
    await expect(page.locator(".music-mini-title strong")).toHaveText("八方来财");
  } finally {
    await context.close();
  }
});

test("fresh visits always attempt to autoplay 八方来财 before any interaction", async ({
  browser,
  baseURL,
}) => {
  for (const random of [0.1, 0.9]) {
    const context = await browser.newContext({ baseURL });
    await context.addInitScript((value) => {
      Math.random = () => value;
      // Previous releases persisted paused state, including after platform previews.
      localStorage.setItem("tristanlee-music", JSON.stringify({ enabled: false }));
      const original = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        if (this.matches("audio[data-site-music]")) {
          document.documentElement.dataset.initialMusicAttempt = this.src;
          document.documentElement.dataset.initialMusicHadGesture = String(
            navigator.userActivation.hasBeenActive,
          );
        }
        return original.call(this);
      };
    }, random);
    const page = await context.newPage();
    try {
      await page.goto("#/music", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".music-current h2")).toHaveText("八方来财");
      await expect(page.locator("html")).toHaveAttribute(
        "data-initial-music-attempt",
        /\/music\/ba-fang-lai-cai\.mp3$/,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-initial-music-had-gesture",
        "false",
      );
    } finally {
      await context.close();
    }
  }
});

test("allowed autoplay starts audible first-song playback without interaction", async ({
  playwright,
  baseURL,
}) => {
  const browser = await playwright.chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
    args: ["--no-proxy-server", "--autoplay-policy=no-user-gesture-required"],
  });
  try {
    const context = await browser.newContext({ baseURL });
    await context.addInitScript(() => {
      localStorage.setItem("tristanlee-music", JSON.stringify({ enabled: false }));
      const original = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        document.documentElement.dataset.autoplayHadGesture = String(
          navigator.userActivation.hasBeenActive,
        );
        return original.call(this);
      };
    });
    const page = await context.newPage();
    await page.goto("#/home", { waitUntil: "domcontentloaded" });
    const audio = page.locator("audio[data-site-music]");
    await expect.poll(() => audio.evaluate((a) => (a as HTMLAudioElement).currentTime))
      .toBeGreaterThan(0.1);
    expect(await audio.evaluate((a) => (a as HTMLAudioElement).muted)).toBe(false);
    expect(await audio.evaluate((a) => (a as HTMLAudioElement).volume)).toBeGreaterThan(0);
    expect(await audio.evaluate((a) => (a as HTMLAudioElement).src))
      .toMatch(/\/music\/ba-fang-lai-cai\.mp3$/);
    await expect(page.locator("html")).toHaveAttribute("data-autoplay-had-gesture", "false");
  } finally {
    await browser.close();
  }
});

test("all tracks decode and a failed track can recover by switching songs", async ({
  page,
}) => {
  await page.route("**/music/ba-fang-lai-cai.mp3", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("#/music", { waitUntil: "domcontentloaded" });
  await page.locator(".music-play-button").click();
  await expect(page.locator(".music-status")).toContainText("无法播放");
  await page.unroute("**/music/ba-fang-lai-cai.mp3");
  for (const index of [1, 2, 3, 4, 0]) {
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
    await expect(page.locator(".music-track-row")).toHaveCount(5);
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
