/**
 * Transaction validation utilities
 * 
 * This module provides validation functions for transaction operations,
 * including payers, shares, amounts, and related entities.
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateTransactionData,
  UpdateTransactionData,
  CreateTransactionPayerData,
  CreateTransactionShareData,
} from "../domain/transaction.types";
import {
  TransactionAmountMismatchError,
  InvalidPayerIdsError,
  InvalidShareUserIdsError,
  TransactionTagNotFoundError,
  ValidationError,
} from "../domain/transaction.errors";

/**
 * Validate required fields for transaction creation
 */
export function validateRequiredFields(
  data: Partial<CreateTransactionData>
): ValidationError | null {
  const missingFields: string[] = [];
  if (!data.walletId) missingFields.push("walletId");
  if (!data.date) missingFields.push("date");
  if (data.amount === undefined || data.amount === null) missingFields.push("amount");
  if (!data.tagId || typeof data.tagId !== "string") missingFields.push("tagId");

  if (missingFields.length > 0) {
    return new ValidationError(`Missing required fields: ${missingFields.join(", ")}`);
  }
  return null;
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount: number | undefined): ValidationError | null {
  if (amount !== undefined && (typeof amount !== "number" || amount === 0)) {
    return new ValidationError("Transaction amount must be a non-zero number");
  }
  return null;
}

/**
 * Validate payers and their amounts
 */
export async function validatePayers(
  payers: CreateTransactionPayerData[] | undefined,
  expectedAmount: number
): Promise<TransactionAmountMismatchError | InvalidPayerIdsError | null> {
  if (!payers || payers.length === 0) {
    return null;
  }

  // Validate total paid amount matches transaction amount
  const totalPaid = payers.reduce((sum, payer) => sum + payer.paidAmount, 0);
  if (Math.abs(totalPaid - expectedAmount) > 0.01) {
    return new TransactionAmountMismatchError(
      "Total paid amount must equal transaction amount",
      expectedAmount,
      totalPaid
    );
  }

  // Validate all payerIds exist
  const payerIds = payers.map((p) => p.payerId);
  const uniquePayerIds = [...new Set(payerIds)];
  const existingPayers = await prisma.user.findMany({
    where: {
      id: { in: uniquePayerIds },
      isDeleted: false,
    },
    select: { id: true },
  });
  const existingPayerIds = new Set(existingPayers.map((p) => p.id));
  const invalidPayerIds = uniquePayerIds.filter((id) => !existingPayerIds.has(id));

  if (invalidPayerIds.length > 0) {
    return new InvalidPayerIdsError(
      `Invalid payer IDs: ${invalidPayerIds.join(", ")}`,
      invalidPayerIds
    );
  }

  return null;
}

/**
 * Validate shares and their amounts
 */
export async function validateShares(
  shares: CreateTransactionShareData[] | undefined,
  expectedAmount: number
): Promise<TransactionAmountMismatchError | InvalidShareUserIdsError | null> {
  if (!shares || shares.length === 0) {
    return null;
  }

  // Validate total shared amount matches transaction amount
  const totalShared = shares.reduce((sum, share) => sum + share.shareAmount, 0);
  if (Math.abs(totalShared - expectedAmount) > 0.01) {
    return new TransactionAmountMismatchError(
      "Total shared amount must equal transaction amount",
      expectedAmount,
      totalShared
    );
  }

  // Validate all userIds exist
  const userIds = shares.map((s) => s.userId);
  const uniqueUserIds = [...new Set(userIds)];
  const existingUsers = await prisma.user.findMany({
    where: {
      id: { in: uniqueUserIds },
      isDeleted: false,
    },
    select: { id: true },
  });
  const existingUserIds = new Set(existingUsers.map((u) => u.id));
  const invalidUserIds = uniqueUserIds.filter((id) => !existingUserIds.has(id));

  if (invalidUserIds.length > 0) {
    return new InvalidShareUserIdsError(
      `Invalid user IDs: ${invalidUserIds.join(", ")}`,
      invalidUserIds
    );
  }

  return null;
}

/**
 * Validate tag exists and is not deleted
 */
export async function validateTag(tagId: string): Promise<TransactionTagNotFoundError | null> {
  const tag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      isDeleted: false,
    },
  });

  if (!tag) {
    return new TransactionTagNotFoundError("Tag not found");
  }

  return null;
}

