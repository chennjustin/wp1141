import { NextResponse } from "next/server";
import { leaveWalletAction } from "@/modules/wallet/routes/leave-wallet";

interface RouteContext {
  params: {
    walletId: string;
  };
}

/**
 * @swagger
 * /api/wallets/{walletId}/leave:
 *   post:
 *     summary: Leave wallet
 *     description: Leave a wallet. Wallet creator cannot leave the wallet.
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
 *         description: Left wallet successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Wallet creator cannot leave
 *       404:
 *         description: Wallet not found or user is not a member
 *       500:
 *         description: Internal server error
 */
export async function POST(_req: Request, context: RouteContext) {
  try {
    const { walletId } = context.params;
    const result = await leaveWalletAction(walletId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Wallet creator cannot leave the wallet"
          ? 403
          : result.error === "Wallet not found" || result.error === "You are not a member of this wallet"
          ? 404
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/wallets/:walletId/leave] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

