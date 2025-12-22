/**
 * Subscription domain types and interfaces
 * 
 * This module defines the core domain types for the Subscription entity,
 * separate from the database schema. These types represent the
 * business logic layer of the Subscription domain.
 */

import type { AppError } from "@/lib/errors";
import type { TransactionType } from "@/modules/transaction/domain/transaction.types";

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
  nextBilling: Date;
  intervalMonths: number;
  startDate: Date;
  endDate: Date | null;
  type: TransactionType;
  tagId: string;
  tag: SubscriptionTag;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  startDate: Date | string;
  endDate?: Date | string | null; // Optional, null means permanent
  intervalMonths?: number; // Default 1
  nextBilling?: Date | string; // Calculated from startDate if not provided
}

/**
 * Update subscription data
 */
export interface UpdateSubscriptionData {
  tagId?: string;
  type?: TransactionType;
  amount?: number;
  currency?: string;
  startDate?: Date | string;
  endDate?: Date | string | null;
  intervalMonths?: number;
  nextBilling?: Date | string;
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

