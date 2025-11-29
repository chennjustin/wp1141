/**
 * Server Action: List transactions
 * 
 * This action retrieves transactions for a wallet with optional filters.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionService } from "../services/transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/transaction.errors";
import type { TransactionFilters } from "../domain/transaction.types";

/**
 * List transactions for a wallet
 */
export async function listTransactionsAction(filters: TransactionFilters) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await transactionService.getTransactionsByWallet(
      filters,
      session.user.id
    );
  } catch (error) {
    console.error("[listTransactionsAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}


