import { NextResponse } from "next/server";
import { searchUsers } from "@/modules/user/routes/search-users";

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by userID or name
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: List of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Bad request - Missing query parameter
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const users = await searchUsers(query.trim(), limit);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/users/search] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

