import { NextRequest, NextResponse } from "next/server";
import { markNotificationAsReadAction } from "@/modules/notification/routes/mark-notification-read";
import { markNotificationAsUnreadAction } from "@/modules/notification/routes/mark-notification-unread";
import { deleteNotificationAction } from "@/modules/notification/routes/delete-notification";

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   patch:
 *     summary: Mark a notification as read
 *     description: Mark a specific notification as read for the current user
 *     tags:
 *       - Notifications
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Successfully marked notification as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { notificationId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Support marking as unread
    if (action === "markAsUnread") {
      const result = await markNotificationAsUnreadAction(notificationId);

      if (!result.success) {
        const status =
          result.error === "Unauthorized"
            ? 401
            : result.error?.includes("not found")
            ? 404
            : 500;
        return NextResponse.json({ error: result.error }, { status });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Default: mark as read
    const result = await markNotificationAsReadAction(notificationId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error?.includes("not found")
          ? 404
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      "[PATCH /api/notifications/:notificationId] Unexpected error",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     description: Soft delete a specific notification for the current user
 *     tags:
 *       - Notifications
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Successfully deleted notification
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { notificationId } = await context.params;
    const result = await deleteNotificationAction(notificationId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error?.includes("not found")
          ? 404
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      "[DELETE /api/notifications/:notificationId] Unexpected error",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

