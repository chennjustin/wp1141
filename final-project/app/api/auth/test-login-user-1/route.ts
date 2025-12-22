/**
 * Test login endpoint for user-1
 * 
 * This endpoint allows logging in as user-1 for testing purposes.
 * Only available in development/test environments.
 * 
 * Uses NextAuth's session creation mechanism to properly authenticate.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/config/env";
import { randomBytes } from "crypto";

/**
 * Test user ID constant
 */
const TEST_USER_ID = "user-1";

/**
 * Generate a secure random token for session
 */
function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * @swagger
 * /api/auth/test-login-user-1:
 *   post:
 *     summary: Login as user-1 (testing only)
 *     description: Creates a session for user-1. Only available in development/test environments.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully logged in as user-1
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userId:
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
    // Ensure user-1 exists
    let testUser = await prisma.user.findUnique({
      where: { id: TEST_USER_ID },
    });

    if (!testUser) {
      // Create user-1 if it doesn't exist (matching seed.ts structure)
      testUser = await prisma.user.create({
        data: {
          id: TEST_USER_ID,
          userID: "user1",
          name: "User One",
          email: "user1@example.com",
          isDeleted: false,
        },
      });
    }

    // Generate a secure session token
    const sessionToken = generateSessionToken();

    // Calculate expiration (30 days from now)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    // Delete any existing sessions for user-1
    await prisma.session.deleteMany({
      where: { userId: TEST_USER_ID },
    });

    // Create new session in database
    await prisma.session.create({
      data: {
        sessionToken,
        userId: TEST_USER_ID,
        expires,
      },
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged in as user-1",
      userId: TEST_USER_ID,
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
    console.error("[POST /api/auth/test-login-user-1] Error:", error);
    return NextResponse.json(
      { error: "Failed to create test login session" },
      { status: 500 }
    );
  }
}



