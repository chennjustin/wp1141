/**
 * Server Action: Create transaction
 * 
 * This action creates a new transaction for a wallet.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionService } from "../services/transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/transaction.errors";
import type { CreateTransactionData } from "../domain/transaction.types";

/**
 * Create a new transaction
 */
export async function createTransactionAction(data: CreateTransactionData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await transactionService.createTransaction(session.user.id, data);
  } catch (error) {
    console.error("[createTransactionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}


