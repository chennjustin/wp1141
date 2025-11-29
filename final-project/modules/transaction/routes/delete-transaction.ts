/**
 * Server Action: Delete transaction
 * 
 * This action soft deletes a transaction.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionService } from "../services/transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/transaction.errors";

/**
 * Delete transaction
 */
export async function deleteTransactionAction(transactionId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
      };
    }

    return await transactionService.deleteTransaction(
      transactionId,
      session.user.id
    );
  } catch (error) {
    console.error("[deleteTransactionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
    };
  }
}


