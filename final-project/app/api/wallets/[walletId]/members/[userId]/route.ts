import { NextResponse } from "next/server";
import { removeMemberAction } from "@/modules/wallet/routes/remove-member";

interface RouteContext {
  params: {
    walletId: string;
    userId: string;
  };
}

/**
 * @swagger
 * /api/wallets/{walletId}/members/{userId}:
 *   delete:
 *     summary: Remove member from wallet
 *     description: Remove a member from the wallet. Only wallet creator can remove members.
 *     tags:
 *       - Wallets
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the member to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only wallet creator can remove members
 *       404:
 *         description: Wallet or member not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { walletId, userId } = context.params;
    const result = await removeMemberAction(walletId, userId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Only wallet creator can remove members" ||
            result.error === "Cannot remove wallet creator"
          ? 403
          : result.error === "Wallet not found" || result.error === "Member not found"
          ? 404
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/wallets/:walletId/members/:userId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

