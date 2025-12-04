import { NextResponse } from "next/server";
import { getTransactionAction } from "@/modules/transaction/routes/get-transaction";
import { updateTransactionAction } from "@/modules/transaction/routes/update-transaction";
import { deleteTransactionAction } from "@/modules/transaction/routes/delete-transaction";
import { BadRequestError, InternalServerError } from "@/lib/errors";
import { handleServiceError, createErrorResponse } from "@/lib/api-response";
import type { UpdateTransactionData } from "@/modules/transaction/domain/transaction.types";

interface RouteContext {
  params: {
    transactionId: string;
  };
}

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Get detailed information about a single transaction the user has access to
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "transaction-1"
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Transaction not found or access denied
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
    const { transactionId } = context.params;
    const result = await getTransactionAction(transactionId);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    // Ensure data exists before returning
    if (!result.data) {
      return createErrorResponse(
        new InternalServerError("No data returned from service")
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/transactions/:transactionId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   patch:
 *     summary: Update transaction
 *     description: Update transaction information. Only wallet members can update transactions.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "transaction-1"
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
 *       404:
 *         description: Transaction not found or access denied
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
    const { transactionId } = context.params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return createErrorResponse(new BadRequestError("Invalid request body"));
    }

    // API accepts partial data, validation happens in service layer
    const updateData: Partial<UpdateTransactionData> = body;

    const result = await updateTransactionAction(transactionId, updateData as UpdateTransactionData);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    // Ensure data exists before returning
    if (!result.data) {
      return createErrorResponse(
        new InternalServerError("No data returned from service")
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/transactions/:transactionId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   delete:
 *     summary: Delete transaction
 *     description: Soft delete a transaction. Only wallet members can delete transactions.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "transaction-1"
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
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
 *         description: Transaction not found or access denied
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
    const { transactionId } = context.params;
    const result = await deleteTransactionAction(transactionId);

    // Handle service errors
    const errorResponse = handleServiceError(result);
    if (errorResponse) {
      return errorResponse;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/transactions/:transactionId] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}


