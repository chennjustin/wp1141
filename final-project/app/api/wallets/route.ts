import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/wallets
// List all wallets that the current authenticated user can access.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch wallets where the user is an active member and wallet is not soft-deleted.
    const wallets = await prisma.wallet.findMany({
      where: {
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
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(wallets, { status: 200 });
  } catch (error) {
    console.error("[GET /api/wallets] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/wallets
// Create a new wallet for the current user and attach them as OWNER.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      name,
      defaultCurrency = "TWD",
      setAsDefault = false,
    }: {
      name?: string;
      defaultCurrency?: string;
      setAsDefault?: boolean;
    } = body;

    // Basic validation for wallet name.
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Wallet name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Wrap create operations in a transaction to keep data consistent.
    const wallet = await prisma.$transaction(async (tx) => {
      // Create the wallet record
      const createdWallet = await tx.wallet.create({
        data: {
          name: trimmedName,
          defaultCurrency,
        },
      });

      // Attach the creator as OWNER in WalletUser
      await tx.walletUser.create({
        data: {
          walletId: createdWallet.id,
          userId,
          role: "OWNER",
        },
      });

      // Optionally set this wallet as the user's default wallet
      if (setAsDefault) {
        await tx.user.update({
          where: { id: userId },
          data: { defaultWalletId: createdWallet.id },
        });
      }

      return createdWallet;
    });

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error("[POST /api/wallets] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


