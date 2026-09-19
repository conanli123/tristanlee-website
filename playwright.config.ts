import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 75_000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:5173/dev.html",
    browserName: "chromium",
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
    launchOptions: { args: ["--no-proxy-server"] },
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
