import { NextResponse } from "next/server";
import { listCarriersAction } from "@/modules/carrier/routes/list-carriers";
import { createCarrierAction } from "@/modules/carrier/routes/create-carrier";

/**
 * @swagger
 * /api/carriers:
 *   get:
 *     summary: List all carriers
 *     description: |
 *       List all carriers that belong to the current authenticated user.
 *       System user can list all carriers from all users.
 *     tags:
 *       - Carriers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of carriers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceCarrier'
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
    const result = await listCarriersAction();

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/carriers] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/carriers:
 *   post:
 *     summary: Create a new carrier
 *     description: |
 *       Create a new carrier for the current authenticated user.
 *       System user can create carrier for other users by specifying userId in the request body.
 *       System user can also bypass the "user already has a carrier" restriction.
 *     tags:
 *       - Carriers
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCarrierRequest'
 *     responses:
 *       201:
 *         description: Carrier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceCarrier'
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
 *       409:
 *         description: Conflict - User already has a carrier (system user can bypass this)
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

    const { carrierCode, userId }: { carrierCode?: string; userId?: string } = body;

    if (!carrierCode || typeof carrierCode !== "string") {
      return NextResponse.json(
        { error: "Carrier code is required" },
        { status: 400 }
      );
    }

    const result = await createCarrierAction({
      carrierCode,
      userId,
    });

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "User already has a carrier"
          ? 409
          : result.error === "Carrier code is required" ||
            result.error?.includes("Invalid carrier code")
          ? 400
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/carriers] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

