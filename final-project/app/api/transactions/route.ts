import { NextResponse } from "next/server";
import { listTransactionsAction } from "@/modules/transaction/routes/list-transactions";
import { createTransactionAction } from "@/modules/transaction/routes/create-transaction";
import { BadRequestError, InternalServerError } from "@/lib/errors";
import { handleServiceError, createErrorResponse } from "@/lib/api-response";
import type {
  TransactionFilters,
  CreateTransactionData,
} from "@/modules/transaction/domain/transaction.types";

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: List transactions
 *     description: List transactions for a wallet with optional filters (date range, tag, user)
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *         description: Wallet ID
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-11-01T00:00:00Z"
 *         description: Start date filter (ISO 8601)
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-11-30T23:59:59Z"
 *         description: End date filter (ISO 8601)
 *       - in: query
 *         name: tagId
 *         required: false
 *         schema:
 *           type: string
 *           example: "food"
 *         description: Tag ID filter
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: "EXPENSE"
 *         description: Transaction type filter (INCOME or EXPENSE)
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *           example: "2"
 *         description: User ID filter (for v2.0 - filter by payer/share)
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request - Missing walletId
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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");

    if (!walletId) {
      return createErrorResponse(new BadRequestError("walletId is required"));
    }

    // Build filters object with optional parameters
    const filters: TransactionFilters = {
      walletId,
    };

    const startDate = searchParams.get("startDate");
    if (startDate) {
      filters.startDate = startDate;
    }

    const endDate = searchParams.get("endDate");
    if (endDate) {
      filters.endDate = endDate;
    }

    const tagId = searchParams.get("tagId");
    if (tagId !== null) {
      filters.tagId = tagId;
    }

    const type = searchParams.get("type");
    if (type === "INCOME" || type === "EXPENSE") {
      filters.type = type;
    } else if (type !== null) {
      return createErrorResponse(
        new BadRequestError("Invalid type value. Must be 'INCOME' or 'EXPENSE'")
      );
    }

    const userId = searchParams.get("userId");
    if (userId) {
      filters.userId = userId;
    }

    const result = await listTransactionsAction(filters);

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
    console.error("[GET /api/transactions] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction for a wallet. Currency defaults to last transaction's currency or wallet's default currency. Exchange rate defaults to last used rate for the currency.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
      return createErrorResponse(new BadRequestError("Invalid request body"));
    }

    // API accepts partial data, validation happens in service layer
    const transactionData: Partial<CreateTransactionData> = body;

    // Validation is handled in service layer
    const result = await createTransactionAction(transactionData as CreateTransactionData);

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

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/transactions] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}


