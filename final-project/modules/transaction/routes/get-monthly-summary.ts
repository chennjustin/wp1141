/**
 * Server Action: Get monthly summary
 * 
 * This action retrieves monthly income and expense summary for a wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionService } from "../services/transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/transaction.errors";
import type { MonthlySummaryFilters } from "../domain/transaction.types";

/**
 * Get monthly summary
 */
export async function getMonthlySummaryAction(filters: MonthlySummaryFilters) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await transactionService.getMonthlySummary(
      filters,
      session.user.id
    );
  } catch (error) {
    console.error("[getMonthlySummaryAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

