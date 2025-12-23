import { NextResponse } from "next/server";
import { removeMemberAction } from "@/modules/wallet/routes/remove-member";
import { updateMemberRoleAction } from "@/modules/wallet/routes/update-member-role";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";

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
/**
 * @swagger
 * /api/wallets/{walletId}/members/{userId}:
 *   patch:
 *     summary: Update member role
 *     description: Update a member's role in the wallet. Only wallet owner can update member roles.
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
 *         description: User ID of the member to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [MEMBER, VIEWER]
 *                 description: New role for the member
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only wallet owner can update member roles
 *       404:
 *         description: Wallet or member not found
 *       500:
 *         description: Internal server error
 */
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { walletId, userId } = context.params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { role }: { role?: string } = body;

    if (!role || (role !== WalletRole.MEMBER && role !== WalletRole.VIEWER)) {
      return NextResponse.json(
        { error: "Role must be either MEMBER or VIEWER" },
        { status: 400 }
      );
    }

    const result = await updateMemberRoleAction(walletId, userId, role as WalletRole);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Only wallet owner can update member roles" ||
            result.error === "Cannot update wallet owner role"
          ? 403
          : result.error === "Wallet not found" || result.error === "Member not found"
          ? 404
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/wallets/:walletId/members/:userId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

