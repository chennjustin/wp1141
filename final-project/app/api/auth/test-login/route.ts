/**
 * Test login endpoint for system user
 * 
 * This endpoint allows logging in as the system user for testing purposes.
 * Only available in development/test environments.
 * 
 * Uses NextAuth's session creation mechanism to properly authenticate.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SYSTEM_USER_ID } from "@/config/constants";
import { config } from "@/config/env";
import { randomBytes } from "crypto";

/**
 * Generate a secure random token for session
 */
function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * @swagger
 * /api/auth/test-login:
 *   post:
 *     summary: Login as system user (testing only)
 *     description: Creates a session for the system user. Only available in development/test environments.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully logged in as system user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - Not available in production
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
export async function POST(req: Request) {
  // Only allow in development/test environments
  if (config.isProduction) {
    return NextResponse.json(
      { error: "Test login is not available in production" },
      { status: 403 }
    );
  }

  try {
    // Ensure system user exists
    let systemUser = await prisma.user.findUnique({
      where: { id: SYSTEM_USER_ID },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          id: SYSTEM_USER_ID,
          name: "System",
          isDeleted: false,
        },
      });
    }

    // Generate a secure session token
    const sessionToken = generateSessionToken();

    // Calculate expiration (30 days from now)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    // Delete any existing sessions for system user
    await prisma.session.deleteMany({
      where: { userId: SYSTEM_USER_ID },
    });

    // Create new session in database
    await prisma.session.create({
      data: {
        sessionToken,
        userId: SYSTEM_USER_ID,
        expires,
      },
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged in as system user",
      userId: SYSTEM_USER_ID,
    });

    // Set the NextAuth session cookie
    // NextAuth uses different cookie names based on environment
    const cookieName = config.isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/test-login] Error:", error);
    return NextResponse.json(
      { error: "Failed to create test login session" },
      { status: 500 }
    );
  }
}

