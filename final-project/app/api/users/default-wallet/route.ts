import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";

// Force dynamic rendering since we use session (which reads headers)
export const dynamic = 'force-dynamic';

/**
 * Pin/unpin wallet for user
 * 
 * This endpoint allows users to pin or unpin wallets (max 5 pinned wallets).
 * - To pin a wallet: provide walletId (must exist and user must have access)
 * - To unpin a wallet: provide walletId as null (My Wallet cannot be unpinned)
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
    if (!body || typeof body !== "object" || !("walletId" in body)) {
      return NextResponse.json(
        { error: "Invalid request body. walletId is required." },
        { status: 400 }
      );
    }

    const { walletId } = body;

    // Handle unpinning wallet (walletId is null)
    if (walletId === null || walletId === undefined) {
      // This should not be used for unpinning - use the unpin endpoint instead
      // But we keep it for backward compatibility
      return NextResponse.json(
        { error: "Use DELETE method to unpin a wallet" },
        { status: 400 }
      );
    }

    // Handle pinning wallet (walletId is provided)
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

    // Check if My Wallet - always allow pinning My Wallet
    const isMyWallet = wallet.name === "我的錢包";

    // Check if already pinned
    const isPinned = await walletRepository.isWalletPinned(session.user.id, walletId);
    if (isPinned) {
      // Already pinned, return success
      const pinnedWallets = await walletRepository.getPinnedWallets(session.user.id);
      return NextResponse.json(
        { 
          success: true, 
          walletId,
          pinnedWalletIds: pinnedWallets.map((p: { walletId: string }) => p.walletId),
        },
        { status: 200 }
      );
    }

    // Check limit (max 5 pinned wallets, but My Wallet doesn't count toward limit)
    if (!isMyWallet) {
      // Exclude "我的錢包" from count when checking limit
      const count = await walletRepository.countPinnedWallets(session.user.id, true);
      if (count >= 5) {
        return NextResponse.json(
          { error: "Maximum 5 pinned wallets allowed" },
          { status: 400 }
        );
      }
    }

    // Pin wallet (exclude "我的錢包" from limit check)
    const success = await walletRepository.pinWallet(session.user.id, walletId, true);
    if (!success) {
      return NextResponse.json(
        { error: "Maximum 5 pinned wallets allowed (excluding My Wallet)" },
        { status: 400 }
      );
    }

    // Get updated pinned wallets list
    const pinnedWallets = await walletRepository.getPinnedWallets(session.user.id);

    return NextResponse.json(
      { 
        success: true, 
        walletId,
        pinnedWalletIds: pinnedWallets.map((p: { walletId: string }) => p.walletId),
      },
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

/**
 * Unpin a wallet
 */
export async function DELETE(req: Request) {
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

    // Check if pinned
    const isPinned = await walletRepository.isWalletPinned(session.user.id, walletId);
    if (!isPinned) {
      return NextResponse.json(
        { error: "Wallet is not pinned" },
        { status: 400 }
      );
    }

    // Unpin wallet
    await walletRepository.unpinWallet(session.user.id, walletId);

    // Get updated pinned wallets list
    const pinnedWallets = await walletRepository.getPinnedWallets(session.user.id);

    return NextResponse.json(
      { 
        success: true, 
        walletId: null,
        pinnedWalletIds: pinnedWallets.map((p: { walletId: string }) => p.walletId),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/users/default-wallet] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get user's pinned wallets
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pinned wallets
    const pinnedWallets = await walletRepository.getPinnedWallets(session.user.id);

    return NextResponse.json(
      { 
        success: true,
        pinnedWalletIds: pinnedWallets.map((p: { walletId: string }) => p.walletId),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/users/default-wallet] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

