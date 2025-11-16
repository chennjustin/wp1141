import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    walletId: string;
  };
}

// GET /api/wallets/:walletId
// Get detailed information about a single wallet the user has access to.
export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { walletId } = context.params;

    // Find wallet where user is an active member and wallet is not soft-deleted.
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        isDeleted: false,
        members: {
          some: {
            userId,
            isDeleted: false,
          },
        },
      },
      include: {
        members: {
          where: { isDeleted: false },
          include: {
            user: true,
          },
        },
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(wallet, { status: 200 });
  } catch (error) {
    console.error("[GET /api/wallets/:walletId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/wallets/:walletId
// Update wallet basic information (e.g., name, defaultCurrency).
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { walletId } = context.params;

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      name,
      defaultCurrency,
    }: {
      name?: string;
      defaultCurrency?: string;
    } = body;

    if (
      (name === undefined || name === null) &&
      (defaultCurrency === undefined || defaultCurrency === null)
    ) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    // Check that the current user is an active OWNER of this wallet
    const membership = await prisma.walletUser.findFirst({
      where: {
        walletId,
        userId,
        role: "OWNER",
        isDeleted: false,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only wallet owner can update this wallet" },
        { status: 403 }
      );
    }

    const dataToUpdate: { name?: string; defaultCurrency?: string } = {};

    if (typeof name === "string" && name.trim().length > 0) {
      dataToUpdate.name = name.trim();
    }

    if (typeof defaultCurrency === "string" && defaultCurrency.trim().length > 0) {
      dataToUpdate.defaultCurrency = defaultCurrency.trim();
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedWallet, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/wallets/:walletId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/wallets/:walletId
// Soft delete a wallet and its membership records.
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { walletId } = context.params;

    const result = await prisma.$transaction(async (tx) => {
      // Ensure the user is an active OWNER of this wallet
      const membership = await tx.walletUser.findFirst({
        where: {
          walletId,
          userId,
          role: "OWNER",
          isDeleted: false,
        },
      });

      if (!membership) {
        return {
          error: "Only wallet owner can delete this wallet",
          status: 403 as const,
        };
      }

      // Check wallet existence and deletion state
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet || wallet.isDeleted) {
        return {
          error: "Wallet not found or already deleted",
          status: 404 as const,
        };
      }

      // Optional safety: prevent deletion when there are active transactions.
      const activeTransactionCount = await tx.transaction.count({
        where: {
          walletId,
          isDeleted: false,
        },
      });

      if (activeTransactionCount > 0) {
        return {
          error: "Cannot delete wallet with existing transactions",
          status: 400 as const,
        };
      }

      // Soft delete all wallet membership records
      await tx.walletUser.updateMany({
        where: {
          walletId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
        },
      });

      // Soft delete the wallet itself
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          isDeleted: true,
        },
      });

      // Clear defaultWalletId for any users that reference this wallet
      await tx.user.updateMany({
        where: {
          defaultWalletId: walletId,
        },
        data: {
          defaultWalletId: null,
        },
      });

      return { success: true as const, status: 200 as const };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/wallets/:walletId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


