import { describe, it, expect } from "vitest";

// Base URL for the running Next.js application.
// You can override this in tests by setting TEST_BASE_URL if needed.
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

/**
 * HTTP-level tests for the wallets API.
 *
 * These tests use real HTTP requests instead of calling route handlers directly.
 * They assume that a Next.js dev server is already running and listening on BASE_URL.
 *
 * Recommended usage:
 * 1. In one terminal, start the dev server:
 *      npm run dev
 * 2. In another terminal, change into the wallet_tests directory and run only this test file:
 *      cd wallet_tests
 *      npx vitest --run wallets-api.http.test.ts
 *
 * Note: These tests focus on unauthenticated scenarios, because authenticated
 * flows with next-auth sessions are already covered by handler-level tests.
 */
describe("Wallets API over HTTP (unauthenticated scenarios)", () => {
  it("GET /api/wallets returns 401 when user is not authenticated", async () => {
    const res = await fetch(`${BASE_URL}/api/wallets`, {
      method: "GET",
    });

    expect(res.status).toBe(401);

    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Unauthorized");
  });

  it("GET /api/wallets/:walletId returns 401 when user is not authenticated", async () => {
    const res = await fetch(`${BASE_URL}/api/wallets/some-wallet-id`, {
      method: "GET",
    });

    expect(res.status).toBe(401);

    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Unauthorized");
  });
});


