import { NextResponse } from "next/server";
import { inviteUsersToWalletAction } from "@/modules/wallet/routes/invite-users";

interface RouteContext {
  params: {
    walletId: string;
  };
}

/**
 * @swagger
 * /api/wallets/{walletId}/invite:
 *   post:
 *     summary: Invite users to wallet
 *     description: Invite one or more users to join a wallet. All wallet members can invite users.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to invite
 *     responses:
 *       200:
 *         description: Users invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request - Invalid input
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
 *       403:
 *         description: Forbidden - User must be a member of the wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallet not found
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
export async function POST(req: Request, context: RouteContext) {
  try {
    const { walletId } = context.params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { userIds }: { userIds?: string[] } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "At least one user ID is required" },
        { status: 400 }
      );
    }

    const result = await inviteUsersToWalletAction(walletId, userIds);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Wallet not found or access denied"
          ? 403
          : result.error === "Wallet not found"
          ? 404
          : result.error === "At least one user ID is required" ||
            result.error?.includes("not found")
          ? 400
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[POST /api/wallets/:walletId/invite] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

