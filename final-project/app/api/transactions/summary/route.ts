import { NextResponse } from "next/server";
import { getMonthlySummaryAction } from "@/modules/transaction/routes/get-monthly-summary";
import { BadRequestError, InternalServerError } from "@/lib/errors";
import { handleServiceError, createErrorResponse } from "@/lib/api-response";
import type { MonthlySummaryFilters } from "@/modules/transaction/domain/transaction.types";

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Get monthly transaction summary
 *     description: Get total income and expense for a specific month, converted to NTD or specified currency
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
 *         description: Wallet ID
 *         example: "1"
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2100
 *         description: Year (e.g., 2024)
 *         example: 2024
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *         example: 11
 *       - in: query
 *         name: targetCurrency
 *         required: false
 *         schema:
 *           type: string
 *           default: TWD
 *         description: Target currency for conversion (defaults to TWD/NTD)
 *         example: "TWD"
 *     responses:
 *       200:
 *         description: Monthly summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlySummary'
 *       400:
 *         description: Bad request - Invalid parameters
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
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const targetCurrency = searchParams.get("targetCurrency") || undefined;

    if (!walletId) {
      return createErrorResponse(new BadRequestError("walletId is required"));
    }

    if (!yearParam) {
      return createErrorResponse(new BadRequestError("year is required"));
    }

    if (!monthParam) {
      return createErrorResponse(new BadRequestError("month is required"));
    }

    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return createErrorResponse(
        new BadRequestError("year must be between 2000 and 2100")
      );
    }

    if (isNaN(month) || month < 1 || month > 12) {
      return createErrorResponse(
        new BadRequestError("month must be between 1 and 12")
      );
    }

    const filters: MonthlySummaryFilters = {
      walletId,
      year,
      month,
      targetCurrency,
    };

    const result = await getMonthlySummaryAction(filters);

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
    console.error("[GET /api/transactions/summary] Unexpected error", error);
    return createErrorResponse(new InternalServerError("Internal server error"));
  }
}

