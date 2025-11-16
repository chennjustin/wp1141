import { defineConfig } from "@playwright/test";

// Playwright configuration for end-to-end tests.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    // Base URL for the running Next.js app.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // Start the Next.js dev server before running tests.
    command: "npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});


