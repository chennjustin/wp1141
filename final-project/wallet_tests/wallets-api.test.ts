import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

import { GET as listWallets, POST as createWallet } from "@/app/api/wallets/route";
import {
  GET as getWallet,
  PATCH as updateWallet,
  DELETE as deleteWallet,
} from "@/app/api/wallets/[walletId]/route";

import { prisma } from "@/lib/prisma";

// Type alias for a generic mock function.
type MockFn = ReturnType<typeof vi.fn>;

// Mock authOptions from "@/lib/auth" to avoid loading configuration that depends on DATABASE_URL
// or other environment-specific settings during tests.
vi.mock("@/lib/auth", () => {
  return {
    authOptions: {} as unknown,
  };
});

// Mock next-auth getServerSession so that we can control authentication state in tests.
vi.mock("next-auth", () => {
  return {
    getServerSession: vi.fn(),
  };
});

// Mock prisma client used by the route handlers so that we do not touch a real database.
vi.mock("@/lib/prisma", () => {
  const wallet = {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  };

  const walletUser = {
    create: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
  };

  const transaction = {
    count: vi.fn(),
  };

  const user = {
    update: vi.fn(),
    updateMany: vi.fn(),
  };

  // This object will be passed into the transaction callback in tests.
  const prismaMock = {
    wallet,
    walletUser,
    transaction,
    user,
    $transaction: vi.fn(),
  };

  return {
    prisma: prismaMock,
  };
});

// Import mocked getServerSession after the module mock is defined.
import { getServerSession } from "next-auth";

describe("Wallets API route handlers (CRUD)", () => {
  const mockedGetServerSession = getServerSession as unknown as MockFn;

  const prismaWallet = prisma.wallet as unknown as {
    findMany: MockFn;
    create: MockFn;
    findFirst: MockFn;
    findUnique: MockFn;
    update: MockFn;
  };

  const prismaWalletUser = prisma.walletUser as unknown as {
    create: MockFn;
    findFirst: MockFn;
    updateMany: MockFn;
  };

  const prismaTransaction = prisma.transaction as unknown as {
    count: MockFn;
  };

  const prismaUser = prisma.user as unknown as {
    update: MockFn;
    updateMany: MockFn;
  };

  const prismaTransactionFn = prisma.$transaction as unknown as MockFn;

  beforeEach(() => {
    // Reset all mocks before each test case to avoid cross-test pollution.
    vi.clearAllMocks();

    // Implement $transaction to directly invoke the callback with the prisma mock object.
    prismaTransactionFn.mockImplementation(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
      return cb(prisma);
    });
  });

  afterEach(() => {
    // Ensure no unexpected timers or side effects remain.
    vi.resetModules();
  });

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // Helper to parse a NextResponse into status and JSON payload.
  async function parseResponse<T = unknown>(response: NextResponse): Promise<{
    status: number;
    data: T;
  }> {
    const status = response.status;
    const data = (await response.json()) as T;
    return { status, data };
  }

  // Helper to create a Request object with JSON body.
  function createJsonRequest(url: string, method: string, body: unknown): Request {
    return new Request(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Tests for GET /api/wallets
  // ---------------------------------------------------------------------------

  describe("GET /api/wallets", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Arrange: no session means unauthorized access.
      mockedGetServerSession.mockResolvedValueOnce(null);

      // Act: directly call the route handler.
      const res = (await listWallets()) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert: status and error message.
      expect(status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prismaWallet.findMany).not.toHaveBeenCalled();
    });

    it("returns list of wallets for authenticated user", async () => {
      // Arrange: mock authenticated session.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      const mockWallets = [
        { id: "w1", name: "Wallet 1", isDeleted: false },
        { id: "w2", name: "Wallet 2", isDeleted: false },
      ];

      prismaWallet.findMany.mockResolvedValueOnce(mockWallets);

      // Act.
      const res = (await listWallets()) as NextResponse;
      const { status, data } = await parseResponse<typeof mockWallets>(res);

      // Assert.
      expect(status).toBe(200);
      expect(data).toEqual(mockWallets);
      expect(prismaWallet.findMany).toHaveBeenCalledTimes(1);
      const args = prismaWallet.findMany.mock.calls[0][0];
      expect(args.where.members.some.userId).toBe("user-1");
      expect(args.where.isDeleted).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Tests for POST /api/wallets
  // ---------------------------------------------------------------------------

  describe("POST /api/wallets", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Arrange: no session.
      mockedGetServerSession.mockResolvedValueOnce(null);

      const req = createJsonRequest("http://localhost/api/wallets", "POST", {
        name: "My Wallet",
      });

      // Act.
      const res = (await createWallet(req)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prismaTransactionFn).not.toHaveBeenCalled();
    });

    it("returns 400 when name is missing or empty", async () => {
      // Arrange: authenticated session.
      mockedGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      });

      const invalidRequests = [{}, { name: "" }, { name: "   " }];

      for (const body of invalidRequests) {
        const req = createJsonRequest("http://localhost/api/wallets", "POST", body);

        // Act.
        const res = (await createWallet(req)) as NextResponse;
        const { status, data } = await parseResponse<{ error: string }>(res);

        // Assert.
        expect(status).toBe(400);
        expect(data.error).toBe("Wallet name is required");
      }
    });

    it("creates wallet and owner membership without setting default wallet", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      const createdWallet = {
        id: "w1",
        name: "My Wallet",
        defaultCurrency: "USD",
      };

      prismaWallet.create.mockResolvedValueOnce(createdWallet);

      const req = createJsonRequest("http://localhost/api/wallets", "POST", {
        name: "  My Wallet  ",
        defaultCurrency: "USD",
        setAsDefault: false,
      });

      // Act.
      const res = (await createWallet(req)) as NextResponse;
      const { status, data } = await parseResponse<typeof createdWallet>(res);

      // Assert.
      expect(status).toBe(201);
      expect(data).toEqual(createdWallet);

      // Transaction should have been invoked once.
      expect(prismaTransactionFn).toHaveBeenCalledTimes(1);

      // Wallet creation with trimmed name.
      expect(prismaWallet.create).toHaveBeenCalledTimes(1);
      const walletCreateArgs = prismaWallet.create.mock.calls[0][0];
      expect(walletCreateArgs.data.name).toBe("My Wallet");
      expect(walletCreateArgs.data.defaultCurrency).toBe("USD");

      // Owner membership is created.
      expect(prismaWalletUser.create).toHaveBeenCalledTimes(1);
      const membershipArgs = prismaWalletUser.create.mock.calls[0][0];
      expect(membershipArgs.data.walletId).toBe(createdWallet.id);
      expect(membershipArgs.data.userId).toBe("user-1");
      expect(membershipArgs.data.role).toBe("OWNER");

      // Default wallet should not be updated when setAsDefault is false.
      expect(prismaUser.update).not.toHaveBeenCalled();
    });

    it("creates wallet and sets it as default when setAsDefault is true", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      const createdWallet = {
        id: "w2",
        name: "Another Wallet",
        defaultCurrency: "TWD",
      };

      prismaWallet.create.mockResolvedValueOnce(createdWallet);

      const req = createJsonRequest("http://localhost/api/wallets", "POST", {
        name: "Another Wallet",
        // defaultCurrency is omitted to rely on default value in the handler.
        setAsDefault: true,
      });

      // Act.
      const res = (await createWallet(req)) as NextResponse;
      const { status, data } = await parseResponse<typeof createdWallet>(res);

      // Assert.
      expect(status).toBe(201);
      expect(data).toEqual(createdWallet);

      expect(prismaTransactionFn).toHaveBeenCalledTimes(1);
      expect(prismaUser.update).toHaveBeenCalledTimes(1);
      const userUpdateArgs = prismaUser.update.mock.calls[0][0];
      expect(userUpdateArgs.where.id).toBe("user-1");
      expect(userUpdateArgs.data.defaultWalletId).toBe(createdWallet.id);
    });
  });

  // ---------------------------------------------------------------------------
  // Tests for GET /api/wallets/:walletId
  // ---------------------------------------------------------------------------

  describe("GET /api/wallets/:walletId", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce(null);

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await getWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prismaWallet.findFirst).not.toHaveBeenCalled();
    });

    it("returns 404 when wallet is not found or access is denied", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      prismaWallet.findFirst.mockResolvedValueOnce(null);

      const context = { params: { walletId: "missing-wallet" } };

      // Act.
      const res = (await getWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(404);
      expect(data.error).toBe("Wallet not found or access denied");
    });

    it("returns wallet details when wallet exists and user has access", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      const wallet = {
        id: "w1",
        name: "Accessible Wallet",
        isDeleted: false,
        members: [
          {
            id: "wu1",
            userId: "user-1",
            isDeleted: false,
            user: { id: "user-1", name: "Test User" },
          },
        ],
      };

      prismaWallet.findFirst.mockResolvedValueOnce(wallet);

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await getWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<typeof wallet>(res);

      // Assert.
      expect(status).toBe(200);
      expect(data).toEqual(wallet);
      expect(prismaWallet.findFirst).toHaveBeenCalledTimes(1);
      const args = prismaWallet.findFirst.mock.calls[0][0];
      expect(args.where.id).toBe("w1");
      expect(args.where.isDeleted).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Tests for PATCH /api/wallets/:walletId
  // ---------------------------------------------------------------------------

  describe("PATCH /api/wallets/:walletId", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce(null);

      const req = createJsonRequest("http://localhost/api/wallets/w1", "PATCH", {
        name: "Updated Name",
      });

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await updateWallet(req, context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prismaWalletUser.findFirst).not.toHaveBeenCalled();
      expect(prismaWallet.update).not.toHaveBeenCalled();
    });

    it("returns 400 when no fields are provided to update", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      const req = createJsonRequest("http://localhost/api/wallets/w1", "PATCH", {});
      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await updateWallet(req, context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(400);
      expect(data.error).toBe("No fields provided to update");
      expect(prismaWalletUser.findFirst).not.toHaveBeenCalled();
      expect(prismaWallet.update).not.toHaveBeenCalled();
    });

    it("returns 403 when user is not the wallet owner", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-2" },
      });

      const req = createJsonRequest("http://localhost/api/wallets/w1", "PATCH", {
        name: "Updated Name",
      });
      const context = { params: { walletId: "w1" } };

      prismaWalletUser.findFirst.mockResolvedValueOnce(null);

      // Act.
      const res = (await updateWallet(req, context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(403);
      expect(data.error).toBe("Only wallet owner can update this wallet");
      expect(prismaWallet.update).not.toHaveBeenCalled();
    });

    it("returns 400 when provided fields are invalid after trimming", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      prismaWalletUser.findFirst.mockResolvedValueOnce({
        id: "wu1",
        walletId: "w1",
        userId: "user-1",
        role: "OWNER",
        isDeleted: false,
      });

      const req = createJsonRequest("http://localhost/api/wallets/w1", "PATCH", {
        name: "   ",
        defaultCurrency: "",
      });
      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await updateWallet(req, context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(400);
      expect(data.error).toBe("No valid fields provided to update");
      expect(prismaWallet.update).not.toHaveBeenCalled();
    });

    it("updates wallet name and defaultCurrency when user is owner", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      prismaWalletUser.findFirst.mockResolvedValueOnce({
        id: "wu1",
        walletId: "w1",
        userId: "user-1",
        role: "OWNER",
        isDeleted: false,
      });

      const updatedWallet = {
        id: "w1",
        name: "Updated Wallet",
        defaultCurrency: "USD",
      };

      prismaWallet.update.mockResolvedValueOnce(updatedWallet);

      const req = createJsonRequest("http://localhost/api/wallets/w1", "PATCH", {
        name: "  Updated Wallet  ",
        defaultCurrency: "  USD ",
      });
      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await updateWallet(req, context)) as NextResponse;
      const { status, data } = await parseResponse<typeof updatedWallet>(res);

      // Assert.
      expect(status).toBe(200);
      expect(data).toEqual(updatedWallet);
      expect(prismaWallet.update).toHaveBeenCalledTimes(1);

      const updateArgs = prismaWallet.update.mock.calls[0][0];
      expect(updateArgs.where.id).toBe("w1");
      expect(updateArgs.data.name).toBe("Updated Wallet");
      expect(updateArgs.data.defaultCurrency).toBe("USD");
    });
  });

  // ---------------------------------------------------------------------------
  // Tests for DELETE /api/wallets/:walletId
  // ---------------------------------------------------------------------------

  describe("DELETE /api/wallets/:walletId", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce(null);

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await deleteWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prismaTransactionFn).not.toHaveBeenCalled();
    });

    it("returns 403 when user is not the wallet owner", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-2" },
      });

      prismaTransactionFn.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        // Inside the transaction, simulate no owner membership.
        prismaWalletUser.findFirst.mockResolvedValueOnce(null);
        return cb(prisma);
      });

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await deleteWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(403);
      expect(data.error).toBe("Only wallet owner can delete this wallet");
    });

    it("returns 404 when wallet does not exist or is already deleted", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      prismaTransactionFn.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        prismaWalletUser.findFirst.mockResolvedValueOnce({
          id: "wu1",
          walletId: "missing-wallet",
          userId: "user-1",
          role: "OWNER",
          isDeleted: false,
        });

        // Simulate wallet not found.
        prismaWallet.findUnique.mockResolvedValueOnce(null);

        return cb(prisma);
      });

      const context = { params: { walletId: "missing-wallet" } };

      // Act.
      const res = (await deleteWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(404);
      expect(data.error).toBe("Wallet not found or already deleted");
    });

    it("returns 400 when wallet has active transactions", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      prismaTransactionFn.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        prismaWalletUser.findFirst.mockResolvedValueOnce({
          id: "wu1",
          walletId: "w1",
          userId: "user-1",
          role: "OWNER",
          isDeleted: false,
        });

        prismaWallet.findUnique.mockResolvedValueOnce({
          id: "w1",
          isDeleted: false,
        });

        // Simulate existing active transactions.
        prismaTransaction.count.mockResolvedValueOnce(3);

        return cb(prisma);
      });

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await deleteWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ error: string }>(res);

      // Assert.
      expect(status).toBe(400);
      expect(data.error).toBe("Cannot delete wallet with existing transactions");
    });

    it("soft deletes wallet and related membership when user is owner and there are no active transactions", async () => {
      // Arrange.
      mockedGetServerSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });

      prismaTransactionFn.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<unknown>) => {
        prismaWalletUser.findFirst.mockResolvedValueOnce({
          id: "wu1",
          walletId: "w1",
          userId: "user-1",
          role: "OWNER",
          isDeleted: false,
        });

        prismaWallet.findUnique.mockResolvedValueOnce({
          id: "w1",
          isDeleted: false,
        });

        // No active transactions.
        prismaTransaction.count.mockResolvedValueOnce(0);

        return cb(prisma);
      });

      const context = { params: { walletId: "w1" } };

      // Act.
      const res = (await deleteWallet(new Request("http://localhost"), context)) as NextResponse;
      const { status, data } = await parseResponse<{ success: boolean }>(res);

      // Assert.
      expect(status).toBe(200);
      expect(data.success).toBe(true);

      // Membership records should be soft deleted.
      expect(prismaWalletUser.updateMany).toHaveBeenCalledTimes(1);
      const membershipUpdateArgs = prismaWalletUser.updateMany.mock.calls[0][0];
      expect(membershipUpdateArgs.where.walletId).toBe("w1");
      expect(membershipUpdateArgs.data.isDeleted).toBe(true);

      // Wallet itself should be soft deleted.
      expect(prismaWallet.update).toHaveBeenCalledTimes(1);
      const walletUpdateArgs = prismaWallet.update.mock.calls[0][0];
      expect(walletUpdateArgs.where.id).toBe("w1");
      expect(walletUpdateArgs.data.isDeleted).toBe(true);

      // Users referencing this wallet as default should be updated.
      expect(prismaUser.updateMany).toHaveBeenCalledTimes(1);
      const userUpdateManyArgs = prismaUser.updateMany.mock.calls[0][0];
      expect(userUpdateManyArgs.where.defaultWalletId).toBe("w1");
      expect(userUpdateManyArgs.data.defaultWalletId).toBeNull();
    });
  });
});


