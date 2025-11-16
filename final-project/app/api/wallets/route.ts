import { NextResponse } from "next/server";
import { listWalletsAction } from "@/modules/wallet/routes/list-wallets";
import { createWalletAction } from "@/modules/wallet/routes/create-wallet";

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: List all wallets
 *     description: List all wallets that the current authenticated user can access
 *     tags:
 *       - Wallets
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of wallets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wallet'
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
export async function GET() {
  try {
    const result = await listWalletsAction();

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/wallets] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/wallets:
 *   post:
 *     summary: Create a new wallet
 *     description: Create a new wallet for the current user and attach them as OWNER
 *     tags:
 *       - Wallets
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWalletRequest'
 *     responses:
 *       201:
 *         description: Wallet created successfully
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      name,
      defaultCurrency,
      setAsDefault,
    }: {
      name?: string;
      defaultCurrency?: string;
      setAsDefault?: boolean;
    } = body;

    const result = await createWalletAction({
      name: name || "",
          defaultCurrency,
      setAsDefault,
      });

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Wallet name is required"
          ? 400
          : 500;
      return NextResponse.json({ error: result.error }, { status });
      }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/wallets] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


