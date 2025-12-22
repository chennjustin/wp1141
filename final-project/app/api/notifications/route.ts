import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import { createNotificationAction } from "@/modules/notification/routes/create-notification";
import { listNotificationsAction } from "@/modules/notification/routes/list-notifications";
import { markAllNotificationsAsReadAction } from "@/modules/notification/routes/mark-notification-read";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: List all notifications
 *     description: Get all notifications for the current authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const result = await listNotificationsAction();

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data || [], { status: 200 });
  } catch (error) {
    console.error("[GET /api/notifications] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     description: Create a new notification for the current user or a specified user. If userId is not provided, the notification will be created for the current authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *           examples:
 *             forCurrentUser:
 *               summary: Create notification for current user
 *               value:
 *                 type: "SUBSCRIPTION_REMINDER"
 *                 message: "您的訂閱將於明天到期"
 *             forSpecificUser:
 *               summary: Create notification for specific user
 *               value:
 *                 userId: "user-1"
 *                 type: "WALLET_INVITATION"
 *                 message: "您被邀請加入錢包「家庭開支」"
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *             example:
 *               id: "notification-1"
 *               userId: "user-1"
 *               type: "SUBSCRIPTION_REMINDER"
 *               message: "您的訂閱將於明天到期"
 *               isRead: false
 *               createdAt: "2025-12-15T10:00:00Z"
 *               isDeleted: false
 *       400:
 *         description: Bad request - Invalid input (missing type or message, or invalid notification type)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingFields:
 *                 value:
 *                   error: "Type and message are required"
 *               invalidType:
 *                 value:
 *                   error: "Invalid notification type"
 *       401:
 *         description: Unauthorized
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
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, type, message } = body;

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json(
        { error: "Type and message are required" },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = [
      "REPAYMENT",
      "SUBSCRIPTION_REMINDER",
      "SHARED_WALLET_UPDATE",
      "WALLET_INVITATION",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 }
      );
    }

    const result = await createNotificationAction({
      userId,
      type: type as NotificationType,
      message,
    });

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Message is required"
          ? 400
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notifications] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notifications:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications as read for the current user
 *     tags:
 *       - Notifications
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [markAllAsRead]
 *     responses:
 *       200:
 *         description: Successfully marked all notifications as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "markAllAsRead") {
      const result = await markAllNotificationsAsReadAction();

      if (!result.success) {
        const status = result.error === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: result.error }, { status });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[PATCH /api/notifications] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

