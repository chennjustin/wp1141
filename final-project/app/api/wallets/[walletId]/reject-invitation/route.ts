import { NextResponse } from "next/server";
import { rejectWalletInvitationAction } from "@/modules/wallet/routes/reject-invitation";

interface RouteContext {
  params: {
    walletId: string;
  };
}

/**
 * @swagger
 * /api/wallets/{walletId}/reject-invitation:
 *   post:
 *     summary: Reject wallet invitation
 *     description: Reject a pending wallet invitation. Only the invited user can reject their own invitation.
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
 *     responses:
 *       200:
 *         description: Invitation rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request - Invalid invitation status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallet invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(_req: Request, context: RouteContext) {
  try {
    const { walletId } = context.params;
    const result = await rejectWalletInvitationAction(walletId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Wallet invitation not found" ||
            result.error === "Wallet invitation has been deleted"
          ? 404
          : result.error?.includes("Cannot reject invitation")
          ? 400
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      "[POST /api/wallets/:walletId/reject-invitation] Unexpected error",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

