/**
 * Subscription domain types and interfaces
 * 
 * This module defines the core domain types for the Subscription entity,
 * separate from the database schema. These types represent the
 * business logic layer of the Subscription domain.
 */

import type { AppError } from "@/lib/errors";
import type { TransactionType } from "@/modules/transaction/domain/transaction.types";
import type { CreateTransactionPayerData, CreateTransactionShareData } from "@/modules/transaction/domain/transaction.types";

/**
 * Subscription tag information
 */
export interface SubscriptionTag {
  id: string;
  name: string;
  iconKey: string;
}

/**
 * Subscription entity
 */
export interface Subscription {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  currency: string;
  rateToDefaultCurrency: number | null;
  nextBilling: Date;
  intervalMonths: number;
  startDate: Date;
  endDate: Date | null;
  type: TransactionType;
  tagId: string;
  name: string | null;
  tag: SubscriptionTag;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  payers?: CreateTransactionPayerData[];
  shares?: CreateTransactionShareData[];
}

/**
 * Create subscription data
 */
export interface CreateSubscriptionData {
  walletId: string;
  tagId: string;
  type: TransactionType;
  amount: number; // Monthly amount
  currency: string;
  rateToDefaultCurrency?: number | null;
  startDate: Date | string;
  endDate?: Date | string | null; // Optional, null means permanent
  intervalMonths?: number; // Default 1
  nextBilling?: Date | string; // Calculated from startDate if not provided
  name?: string | null; // Optional description
  payers?: CreateTransactionPayerData[];
  shares?: CreateTransactionShareData[];
}

/**
 * Update subscription data
 */
export interface UpdateSubscriptionData {
  tagId?: string;
  type?: TransactionType;
  amount?: number;
  currency?: string;
  rateToDefaultCurrency?: number | null;
  startDate?: Date | string;
  endDate?: Date | string | null;
  intervalMonths?: number;
  nextBilling?: Date | string;
  name?: string | null;
  isDeleted?: boolean;
  payers?: CreateTransactionPayerData[];
  shares?: CreateTransactionShareData[];
}

/**
 * Subscription query filters
 */
export interface SubscriptionFilters {
  walletId: string;
  userId?: string;
  includeDeleted?: boolean; // For history page
}

/**
 * Service result wrapper
 * Supports both string errors (for backward compatibility) and AppError instances
 */
export interface SubscriptionServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | AppError;
}

