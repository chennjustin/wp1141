/**
 * Transaction error handling utilities
 * 
 * This module provides utilities for handling Prisma errors
 * and converting them to domain-specific errors.
 */

import {
  ValidationError,
  TransactionTagNotFoundError,
  InternalServerError,
} from "../domain/transaction.errors";

/**
 * Handle Prisma foreign key constraint errors
 */
export function handlePrismaForeignKeyError(error: any): ValidationError | TransactionTagNotFoundError | null {
  if (error?.code !== "P2003") {
    return null;
  }

  const fieldName = error?.meta?.field_name || "unknown field";

  if (fieldName.includes("payerId")) {
    return new ValidationError("Invalid payer ID provided");
  }

  if (fieldName.includes("userId") || fieldName.includes("TransactionShare")) {
    return new ValidationError("Invalid user ID provided");
  }

  if (fieldName.includes("tagId")) {
    return new TransactionTagNotFoundError("Tag not found");
  }

  return new ValidationError("Invalid reference ID provided");
}

/**
 * Handle general transaction errors
 */
export function handleTransactionError(
  error: any,
  operation: "create" | "update" | "delete" | "get"
): InternalServerError {
  const operationVerb = operation === "get" ? "getting" : `${operation}ing`;
  console.error(`Error ${operationVerb} transaction:`, error);

  // Try to handle Prisma foreign key errors first
  const prismaError = handlePrismaForeignKeyError(error);
  if (prismaError) {
    return prismaError as any; // Type assertion needed due to return type mismatch
  }

  const operationMessage = operation === "get" ? "get" : operation;
  return new InternalServerError(`Failed to ${operationMessage} transaction`);
}

