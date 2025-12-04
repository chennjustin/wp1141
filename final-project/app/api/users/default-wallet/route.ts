import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";

/**
 * Update user's default wallet
 * 
 * This endpoint allows users to set their default wallet.
 * The wallet must exist and the user must have access to it.
 * Supports both PUT and POST methods (POST for sendBeacon compatibility).
 */
export async function PUT(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}

async function handleRequest(req: Request) {
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
    if (!body || typeof body !== "object" || !body.walletId) {
      return NextResponse.json(
        { error: "Invalid request body. walletId is required." },
        { status: 400 }
      );
    }

    const { walletId } = body;

    // Verify wallet exists and user has access
    const wallet = await walletRepository.findById(walletId, session.user.id);
    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found or access denied" },
        { status: 404 }
      );
    }

    // Update default wallet
    await walletRepository.setDefaultWallet(session.user.id, walletId);

    return NextResponse.json(
      { success: true, walletId },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/users/default-wallet] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

