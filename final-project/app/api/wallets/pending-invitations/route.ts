import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WalletUserStatus } from "@prisma/client";

// Force dynamic rendering since we use session (which reads headers)
export const dynamic = 'force-dynamic';

/**
 * Get all wallet invitations (pending, accepted, rejected) for the current user
 * Returns invitations with their status so frontend can display appropriate UI
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all wallet invitations for the user (PENDING, ACCEPTED, REJECTED)
    // Exclude OWNER status as those are not invitations
    const invitations = await prisma.walletUser.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: [WalletUserStatus.PENDING, WalletUserStatus.ACCEPTED, WalletUserStatus.REJECTED],
        },
        isDeleted: false,
      },
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Map to include wallet info and status
    const invitationList = invitations.map((invitation) => ({
      walletId: invitation.walletId,
      walletName: invitation.wallet.name,
      status: invitation.status,
      id: invitation.id,
    }));

    return NextResponse.json(invitationList, { status: 200 });
  } catch (error) {
    console.error("[GET /api/wallets/pending-invitations] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

