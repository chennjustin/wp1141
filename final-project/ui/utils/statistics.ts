/**
 * Statistics utility functions
 * 
 * This module provides utilities for processing transaction data
 * for statistical visualization, including grouping by tags,
 * calculating totals and percentages, and color assignment.
 */

import type { Transaction } from "@/modules/transaction/domain/transaction.types";

/**
 * Category statistics data structure
 * 
 * Represents aggregated statistics for a single tag/category
 */
export interface CategoryStatistics {
  tagId: string;
  tagName: string;
  iconKey: string;
  totalAmount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

/**
 * Predefined color palette for category visualization
 * 
 * These colors are chosen to have good contrast and accessibility.
 * Colors are assigned in order to categories based on their total amount.
 */
const CATEGORY_COLORS = [
  "#EF4444", // red-500
  "#F59E0B", // amber-500
  "#F97316", // orange-500
  "#10B981", // emerald-500
  "#3B82F6", // blue-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#84CC16", // lime-500
  "#F43F5E", // rose-500
  "#06B6D4", // cyan-500
  "#6366F1", // indigo-500
  "#A855F7", // purple-500
  "#22C55E", // green-500
  "#EAB308", // yellow-500
];

/**
 * Convert transaction amount to wallet default currency
 * 
 * @param amount - Transaction amount in original currency
 * @param currency - Transaction currency
 * @param rateToDefaultCurrency - Exchange rate to wallet default currency
 * @param walletDefaultCurrency - Wallet default currency
 * @returns Amount converted to wallet default currency
 */
function convertToDefaultCurrency(
  amount: number,
  currency: string,
  rateToDefaultCurrency: number | null,
  walletDefaultCurrency: string
): number {
  // If same currency, no conversion needed
  if (currency === walletDefaultCurrency) {
    return amount;
  }

  // If no exchange rate, return 0 (cannot convert)
  if (!rateToDefaultCurrency || rateToDefaultCurrency <= 0) {
    console.warn(
      `Missing exchange rate for ${currency} to ${walletDefaultCurrency}. Transaction excluded from calculation.`
    );
    return 0;
  }

  // Convert: amount * rateToDefaultCurrency
  return amount * rateToDefaultCurrency;
}

/**
 * Process transactions and group by tag
 * 
 * This function takes an array of transactions and groups them by tag,
 * calculating the total amount, percentage, and assigning colors for each category.
 * All amounts are converted to wallet default currency before calculation.
 * 
 * @param transactions - Array of transactions to process
 * @param transactionType - Filter by transaction type (INCOME or EXPENSE)
 * @param walletDefaultCurrency - Wallet default currency for conversion
 * @returns Array of category statistics sorted by total amount (descending)
 * 
 * @example
 * ```ts
 * const stats = processTransactionsByCategory(transactions, "EXPENSE", "TWD");
 * // Returns: [{ tagId: "...", tagName: "Food", totalAmount: 1000, percentage: 50, ... }, ...]
 * ```
 */
export function processTransactionsByCategory(
  transactions: Transaction[],
  transactionType: "INCOME" | "EXPENSE",
  walletDefaultCurrency: string
): CategoryStatistics[] {
  // Filter transactions by type
  const filteredTransactions = transactions.filter(
    (t) => t.type === transactionType
  );

  if (filteredTransactions.length === 0) {
    return [];
  }

  // Group transactions by tag
  const categoryMap = new Map<string, {
    tagId: string;
    tagName: string;
    iconKey: string;
    totalAmount: number;
    transactionCount: number;
  }>();

  filteredTransactions.forEach((transaction) => {
    const tagId = transaction.tagId;
    const tagName = transaction.tag.name;
    const iconKey = transaction.tag.iconKey;
    // Convert amount to wallet default currency
    const convertedAmount = convertToDefaultCurrency(
      transaction.amount,
      transaction.currency,
      transaction.rateToDefaultCurrency,
      walletDefaultCurrency
    );
    const amount = Math.abs(convertedAmount);

    if (categoryMap.has(tagId)) {
      const existing = categoryMap.get(tagId)!;
      existing.totalAmount += amount;
      existing.transactionCount += 1;
    } else {
      categoryMap.set(tagId, {
        tagId,
        tagName,
        iconKey,
        totalAmount: amount,
        transactionCount: 1,
      });
    }
  });

  // Calculate total amount for percentage calculation
  const totalAmount = Array.from(categoryMap.values()).reduce(
    (sum, cat) => sum + cat.totalAmount,
    0
  );

  // Convert to array and calculate percentages
  const categoryStats: CategoryStatistics[] = Array.from(
    categoryMap.values()
  ).map((cat, index) => ({
    ...cat,
    percentage: totalAmount > 0 ? (cat.totalAmount / totalAmount) * 100 : 0,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  // Sort by total amount (descending)
  categoryStats.sort((a, b) => b.totalAmount - a.totalAmount);

  // Reassign colors after sorting to ensure largest categories get first colors
  categoryStats.forEach((cat, index) => {
    cat.color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  });

  return categoryStats;
}

/**
 * Calculate total amount for a transaction type
 * 
 * All amounts are converted to wallet default currency before calculation.
 * 
 * @param transactions - Array of transactions
 * @param transactionType - Transaction type to calculate total for
 * @param walletDefaultCurrency - Wallet default currency for conversion
 * @returns Total amount (always positive) in wallet default currency
 */
export function calculateTotalAmount(
  transactions: Transaction[],
  transactionType: "INCOME" | "EXPENSE",
  walletDefaultCurrency: string
): number {
  return transactions
    .filter((t) => t.type === transactionType)
    .reduce((sum, t) => {
      const convertedAmount = convertToDefaultCurrency(
        t.amount,
        t.currency,
        t.rateToDefaultCurrency,
        walletDefaultCurrency
      );
      return sum + Math.abs(convertedAmount);
    }, 0);
}

/**
 * Format currency amount for display
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: "TWD")
 * @returns Formatted string with currency symbol
 */
export function formatCurrency(amount: number, currency: string = "TWD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

