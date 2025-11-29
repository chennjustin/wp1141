/**
 * Transaction domain types and interfaces
 * 
 * This module defines the core domain types for the Transaction entity,
 * separate from the database schema. These types represent the
 * business logic layer of the Transaction domain.
 */

import type { TransactionError } from "./transaction.errors";

/**
 * Transaction type enum
 */
export type TransactionType = "INCOME" | "EXPENSE";

/**
 * Default transaction type
 */
export const DEFAULT_TRANSACTION_TYPE: TransactionType = "EXPENSE";

/**
 * Transaction payer information
 */
export interface TransactionPayer {
  id: string;
  transactionId: string;
  payerId: string;
  paidAmount: number;
  payer: {
    id: string;
    name: string;
    image?: string | null;
  };
}

/**
 * Transaction share information
 */
export interface TransactionShare {
  id: string;
  transactionId: string;
  userId: string;
  shareAmount: number;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
}

/**
 * Transaction tag information
 */
export interface TransactionTag {
  id: string;
  name: string;
}

/**
 * Transaction entity
 */
export interface Transaction {
  id: string;
  walletId: string;
  createdById: string;
  date: Date;
  amount: number;
  currency: string;
  rateToNTD: number | null;
  name: string | null;
  note: string | null;
  isDeleted: boolean;
  type: TransactionType;
  tagId: string;
  tag: TransactionTag;
  createdAt: Date;
  updatedAt: Date;
  payers: TransactionPayer[];
  shares: TransactionShare[];
  createdBy: {
    id: string;
    name: string;
  };
}

/**
 * Create transaction payer data
 */
export interface CreateTransactionPayerData {
  payerId: string;
  paidAmount: number;
}

/**
 * Create transaction share data
 */
export interface CreateTransactionShareData {
  userId: string;
  shareAmount: number;
}

/**
 * Create transaction data
 */
export interface CreateTransactionData {
  walletId: string;
  date: Date | string;
  amount: number;
  currency?: string;
  rateToNTD?: number | null;
  name?: string | null;
  note?: string | null;
  type?: TransactionType;
  tagId: string;
  payers?: CreateTransactionPayerData[];
  shares?: CreateTransactionShareData[];
}

/**
 * Update transaction data
 */
export interface UpdateTransactionData {
  date?: Date | string;
  amount?: number;
  currency?: string;
  rateToNTD?: number | null;
  name?: string | null;
  note?: string | null;
  type?: TransactionType;
  tagId?: string;
  payers?: CreateTransactionPayerData[];
  shares?: CreateTransactionShareData[];
}

/**
 * Transaction query filters
 */
export interface TransactionFilters {
  walletId: string;
  startDate?: Date | string;
  endDate?: Date | string;
  tagId?: string | null;
  type?: TransactionType | null;
  userId?: string; // Filter by specific user's transactions (for v2.0)
}

/**
 * Monthly summary query parameters
 */
export interface MonthlySummaryFilters {
  walletId: string;
  year: number;
  month: number; // 1-12
  targetCurrency?: string; // Target currency for conversion (defaults to NTD)
}

/**
 * Transaction summary item
 */
export interface TransactionSummaryItem {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  name: string | null;
  note: string | null;
  tag: {
    id: string;
    name: string;
  };
}

/**
 * Monthly summary result
 */
export interface MonthlySummary {
  walletId: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number; // totalIncome - totalExpense
  currency: string; // The currency of the summary (NTD or targetCurrency)
  incomeCount: number; // Number of income transactions
  expenseCount: number; // Number of expense transactions
  incomes: TransactionSummaryItem[]; // List of income transactions
  expenses: TransactionSummaryItem[]; // List of expense transactions
}

/**
 * Service result wrapper
 * Supports both string errors (for backward compatibility) and AppError instances
 */
import type { AppError } from "@/lib/errors";

export interface TransactionServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | AppError;
}


