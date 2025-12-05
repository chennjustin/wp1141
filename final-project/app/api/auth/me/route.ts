/**
 * Get current user endpoint
 * 
 * This endpoint returns the currently authenticated user's information.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/modules/auth/permissions";
import { userRepository } from "@/modules/user/repositories/user.repository";

// Force dynamic rendering since this route uses headers for authentication
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns the currently authenticated user's information including id, userID, name, email, and image.
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentUser'
 *       401:
 *         description: Unauthorized - User not authenticated
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
export async function GET() {
  try {
    // Check authentication
    const authResult = await requireAuth();

    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user information from database
    const user = await userRepository.findById(authResult.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user information (excluding sensitive fields)
    return NextResponse.json(
      {
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/auth/me] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

