import { NextResponse } from "next/server";
import { getCarrierAction } from "@/modules/carrier/routes/get-carrier";
import { updateCarrierAction } from "@/modules/carrier/routes/update-carrier";
import { deleteCarrierAction } from "@/modules/carrier/routes/delete-carrier";

interface RouteContext {
  params: {
    carrierId: string;
  };
}

/**
 * @swagger
 * /api/carriers/{carrierId}:
 *   get:
 *     summary: Get carrier by ID
 *     description: Get detailed information about a single carrier that belongs to the current user
 *     tags:
 *       - Carriers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: carrierId
 *         required: true
 *         schema:
 *           type: string
 *           example: "carrier-1"
 *         description: Carrier ID
 *     responses:
 *       200:
 *         description: Carrier details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceCarrier'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Carrier not found or access denied
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
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { carrierId } = context.params;
    const result = await getCarrierAction(carrierId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Carrier not found" ||
            result.error === "Carrier not found for this user"
          ? 404
          : result.error === "Access denied"
          ? 403
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/carriers/:carrierId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/carriers/{carrierId}:
 *   patch:
 *     summary: Update carrier
 *     description: Update carrier information. Only carrier owner can update.
 *     tags:
 *       - Carriers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: carrierId
 *         required: true
 *         schema:
 *           type: string
 *           example: "carrier-1"
 *         description: Carrier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCarrierRequest'
 *     responses:
 *       200:
 *         description: Carrier updated successfully
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
 *       403:
 *         description: Forbidden - Only carrier owner can update
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
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { carrierId } = context.params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { carrierCode }: { carrierCode?: string } = body;

    const result = await updateCarrierAction(carrierId, {
      carrierCode,
    });

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Carrier not found" ||
            result.error === "Carrier not found for this user"
          ? 404
          : result.error === "Only carrier owner can update this carrier"
          ? 403
          : result.error === "No fields provided to update" ||
            result.error === "No valid fields provided to update" ||
            result.error?.includes("Invalid carrier code")
          ? 400
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/carriers/:carrierId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/carriers/{carrierId}:
 *   delete:
 *     summary: Delete carrier
 *     description: |
 *       Soft delete a carrier. Only carrier owner can delete.
 *       System user can delete any carrier.
 *     tags:
 *       - Carriers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: carrierId
 *         required: true
 *         schema:
 *           type: string
 *           example: "carrier-1"
 *         description: Carrier ID
 *     responses:
 *       200:
 *         description: Carrier deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarrierDeleteResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Only carrier owner can delete (system user can delete any carrier)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Carrier not found or already deleted
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
    const { carrierId } = context.params;
    const result = await deleteCarrierAction(carrierId);

    if (!result.success) {
      const status =
        result.error === "Unauthorized"
          ? 401
          : result.error === "Carrier not found" ||
            result.error === "Carrier not found for this user"
          ? 404
          : result.error === "Only carrier owner can delete this carrier"
          ? 403
          : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/carriers/:carrierId] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

