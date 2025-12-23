/**
 * Transaction grouping utilities
 * 
 * This module provides utilities for grouping and processing transactions
 * by date, calculating daily summaries, and formatting dates.
 */

import type { Transaction } from "@/modules/transaction/domain/transaction.types";

/**
 * Daily transaction group
 * Represents all transactions for a single day with summary information
 */
export interface DailyTransactionGroup {
  date: Date;
  dateKey: string; // YYYY-MM-DD format for stable comparison
  dateLabel: string; // Formatted date string (e.g., "2025/11/12 (三)")
  totalIncome: number;
  totalExpense: number;
  netAmount: number; // totalIncome - totalExpense
  transactions: Transaction[];
}

/**
 * Get weekday label in Traditional Chinese
 * 
 * @param date - Date object
 * @returns Weekday label (一, 二, 三, 四, 五, 六, 日)
 */
function getWeekdayLabel(date: Date): string {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return weekdays[date.getDay()];
}

/**
 * Format date to "YYYY/MM/DD (weekday)" format
 * 
 * @param date - Date object
 * @returns Formatted date string (e.g., "2025/11/12 (三)")
 */
export function formatDateLabel(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const weekday = getWeekdayLabel(date);
  
  return `${year}/${month}/${day} (${weekday})`;
}

/**
 * Get date key in YYYY-MM-DD format
 * 
 * @param date - Date object
 * @returns Date key string (e.g., "2025-12-12")
 */
function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

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
      `Missing exchange rate for ${currency} to ${walletDefaultCurrency}. Transaction excluded from daily summary.`
    );
    return 0;
  }

  // Convert: amount * rateToDefaultCurrency
  return amount * rateToDefaultCurrency;
}

/**
 * Group transactions by date and calculate daily summaries
 * 
 * This function groups transactions by date (year-month-day) and calculates
 * daily totals for income, expense, and net amount. All amounts are converted
 * to wallet default currency before calculation. Transactions within each day
 * are sorted by time (most recent first).
 * 
 * @param transactions - Array of transactions to group
 * @param walletDefaultCurrency - Wallet default currency for conversion
 * @returns Array of daily transaction groups, sorted by date (most recent first)
 * 
 * @example
 * ```tsx
 * const groups = groupTransactionsByDate(transactions, "TWD");
 * // Returns: [
 * //   {
 * //     date: Date,
 * //     dateKey: "2025-12-12",
 * //     dateLabel: "2025/11/12 (三)",
 * //     totalIncome: 1000,
 * //     totalExpense: 155,
 * //     netAmount: 845,
 * //     transactions: [...]
 * //   },
 * //   ...
 * // ]
 * ```
 */
export function groupTransactionsByDate(
  transactions: Transaction[],
  walletDefaultCurrency: string
): DailyTransactionGroup[] {
  // Group transactions by date
  const dateMap = new Map<string, Transaction[]>();
  
  for (const transaction of transactions) {
    const transactionDate = new Date(transaction.date);
    const dateKey = getDateKey(transactionDate);
    
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, []);
    }
    
    dateMap.get(dateKey)!.push(transaction);
  }
  
  // Convert map to array of groups with summaries
  const groups: DailyTransactionGroup[] = [];
  
  for (const [dateKey, dayTransactions] of dateMap.entries()) {
    // Sort transactions within the day by time (most recent first)
    dayTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    // Calculate daily totals (converted to wallet default currency)
    let totalIncome = 0;
    let totalExpense = 0;
    
    for (const transaction of dayTransactions) {
      // Convert amount to wallet default currency
      const convertedAmount = convertToDefaultCurrency(
        transaction.amount,
        transaction.currency,
        transaction.rateToDefaultCurrency,
        walletDefaultCurrency
      );
      
      if (transaction.type === "INCOME") {
        totalIncome += convertedAmount;
      } else {
        totalExpense += convertedAmount;
      }
    }
    
    const netAmount = totalIncome - totalExpense;
    
    // Create date object from dateKey
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    
    groups.push({
      date,
      dateKey,
      dateLabel: formatDateLabel(date),
      totalIncome,
      totalExpense,
      netAmount,
      transactions: dayTransactions,
    });
  }
  
  // Sort groups by date (most recent first)
  groups.sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });
  
  return groups;
}

