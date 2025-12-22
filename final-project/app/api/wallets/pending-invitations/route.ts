import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get pending wallet invitations for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all pending wallet invitations for the user
    const pendingInvitations = await prisma.walletUser.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
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

    // Map to include wallet info
    const invitations = pendingInvitations.map((invitation) => ({
      walletId: invitation.walletId,
      walletName: invitation.wallet.name,
      id: invitation.id,
    }));

    return NextResponse.json(invitations, { status: 200 });
  } catch (error) {
    console.error("[GET /api/wallets/pending-invitations] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

