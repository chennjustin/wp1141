/**
 * Server Action: Update transaction
 * 
 * This action updates an existing transaction.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionService } from "../services/transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/transaction.errors";
import type { UpdateTransactionData } from "../domain/transaction.types";

/**
 * Update transaction
 */
export async function updateTransactionAction(
  transactionId: string,
  data: UpdateTransactionData
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await transactionService.updateTransaction(
      transactionId,
      session.user.id,
      data
    );
  } catch (error) {
    console.error("[updateTransactionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}


