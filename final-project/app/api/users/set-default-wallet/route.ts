import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";

// Force dynamic rendering since we use session (which reads headers)
export const dynamic = 'force-dynamic';

/**
 * Set user's default wallet (without pinning)
 * 
 * This endpoint only sets the defaultWalletId in the User table.
 * It does NOT pin the wallet. Pin/unpin operations should use /api/users/default-wallet.
 */
export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !("walletId" in body)) {
      return NextResponse.json(
        { error: "Invalid request body. walletId is required." },
        { status: 400 }
      );
    }

    const { walletId } = body;

    if (typeof walletId !== "string") {
      return NextResponse.json(
        { error: "Invalid walletId. Must be a string." },
        { status: 400 }
      );
    }

    // Verify wallet exists and user has access
    const wallet = await walletRepository.findById(walletId, session.user.id);
    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found or access denied" },
        { status: 404 }
      );
    }

    // Set default wallet (without pinning)
    await walletRepository.setDefaultWallet(session.user.id, walletId);

    return NextResponse.json(
      { 
        success: true, 
        walletId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/users/set-default-wallet] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return PUT(req);
}

