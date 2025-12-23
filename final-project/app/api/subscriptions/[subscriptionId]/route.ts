import { NextResponse } from "next/server";
import { cancelSubscriptionAction } from "@/modules/subscription/routes/cancel-subscription";
import { InternalServerError } from "@/lib/errors";
import { handleServiceError, createErrorResponse } from "@/lib/api-response";

interface RouteContext {
  params: {
    subscriptionId: string;
  };
}

/**
 * @swagger
 * /api/subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Cancel subscription
 *     description: Cancel a subscription by setting its endDate to today. This will trigger transaction synchronization to remove future transactions. Only wallet members can cancel subscriptions.
 *     tags:
 *       - Subscriptions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "subscription-1"
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subscription not found or access denied
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
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { subscriptionId } = context.params;
    const result = await cancelSubscriptionAction(subscriptionId);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/subscriptions/:subscriptionId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

