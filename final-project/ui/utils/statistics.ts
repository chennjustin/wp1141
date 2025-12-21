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
 * Process transactions and group by tag
 * 
 * This function takes an array of transactions and groups them by tag,
 * calculating the total amount, percentage, and assigning colors for each category.
 * 
 * @param transactions - Array of transactions to process
 * @param transactionType - Filter by transaction type (INCOME or EXPENSE)
 * @returns Array of category statistics sorted by total amount (descending)
 * 
 * @example
 * ```ts
 * const stats = processTransactionsByCategory(transactions, "EXPENSE");
 * // Returns: [{ tagId: "...", tagName: "Food", totalAmount: 1000, percentage: 50, ... }, ...]
 * ```
 */
export function processTransactionsByCategory(
  transactions: Transaction[],
  transactionType: "INCOME" | "EXPENSE"
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
    const amount = Math.abs(transaction.amount);

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
 * @param transactions - Array of transactions
 * @param transactionType - Transaction type to calculate total for
 * @returns Total amount (always positive)
 */
export function calculateTotalAmount(
  transactions: Transaction[],
  transactionType: "INCOME" | "EXPENSE"
): number {
  return transactions
    .filter((t) => t.type === transactionType)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
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

