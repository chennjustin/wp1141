/**
 * Server Action: Get transaction by ID
 * 
 * This action retrieves detailed information about a single transaction
 * that the user has access to.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionService } from "../services/transaction.service";
import { UnauthorizedError, InternalServerError } from "../domain/transaction.errors";

/**
 * Get transaction by ID
 */
export async function getTransactionAction(transactionId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await transactionService.getTransactionById(
      transactionId,
      session.user.id
    );
  } catch (error) {
    console.error("[getTransactionAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}


