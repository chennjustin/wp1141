import { test, expect } from "@playwright/test";

// Simple E2E tests that exercise the app from the user's perspective.
// These tests assume that authentication flow is already working.

test("login page renders correctly", async ({ page }) => {
  // Navigate directly to the login page.
  await page.goto("/login");

  // Expect the login heading to be visible.
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  await expect(page.getByText("Sign in to continue")).toBeVisible();
});

test("unauthenticated request to /api/wallets returns 401", async ({ request }) => {
  // Use Playwright's APIRequestContext to call the wallets endpoint without authentication.
  const response = await request.get("/api/wallets");

  // Verify that the API rejects unauthenticated access.
  expect(response.status()).toBe(401);
  const json = (await response.json()) as { error?: string };
  expect(json.error).toBe("Unauthorized");
});


