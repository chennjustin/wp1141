/**
 * Transaction summary utilities
 * 
 * This module handles calculation and currency conversion for transaction summaries.
 */

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Transaction, TransactionSummaryItem } from "../domain/transaction.types";

/**
 * Convert amount to target currency
 * Converts: transaction currency -> wallet default currency -> target currency (if needed)
 * Uses rateToDefaultCurrency to convert from transaction currency to wallet default currency
 */
function convertToCurrency(
  amount: number,
  fromCurrency: string,
  fromRateToDefaultCurrency: number | null,
  walletDefaultCurrency: string,
  targetCurrency: string
): number {
  // If same currency, no conversion needed
  if (fromCurrency === targetCurrency) {
    return amount;
  }

  // Convert to wallet default currency first
  let amountInDefaultCurrency: number;
  if (fromCurrency === walletDefaultCurrency) {
    // Transaction is already in default currency
    amountInDefaultCurrency = amount;
  } else if (fromRateToDefaultCurrency && fromRateToDefaultCurrency > 0) {
    // rateToDefaultCurrency: 1 unit of fromCurrency = ? units of defaultCurrency
    amountInDefaultCurrency = amount * fromRateToDefaultCurrency;
  } else {
    // No exchange rate available, cannot convert
    // This should not happen in normal operation, but if it does, we should log a warning
    // For now, return 0 to exclude from calculations (this indicates missing rate data)
    console.warn(
      `Missing exchange rate for ${fromCurrency} to ${walletDefaultCurrency}. Transaction excluded from summary.`
    );
    return 0;
  }

  // If target currency is the same as default currency, return as is
  if (targetCurrency === walletDefaultCurrency) {
    return amountInDefaultCurrency;
  }

  // If target currency is different from default currency, we would need a rate
  // For now, since we're always converting to default currency, this shouldn't happen
  // But if it does, return the default currency amount
  return amountInDefaultCurrency;
}

/**
 * Calculate monthly summary from transactions
 * All amounts are converted to wallet default currency using rateToDefaultCurrency
 */
export function calculateMonthlySummary(
  transactions: Array<{
    id: string;
    type: string;
    date: Date;
    amount: number;
    currency: string;
    rateToDefaultCurrency: number | null;
    name: string | null;
    note: string | null;
    tag: {
      id: string;
      name: string;
      iconKey: string;
    };
  }>,
  walletDefaultCurrency: string
): {
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
  incomes: TransactionSummaryItem[];
  expenses: TransactionSummaryItem[];
} {
  let totalIncome = 0;
  let totalExpense = 0;
  const incomes: TransactionSummaryItem[] = [];
  const expenses: TransactionSummaryItem[] = [];

  for (const transaction of transactions) {
    const convertedAmount = convertToCurrency(
      transaction.amount,
      transaction.currency,
      transaction.rateToDefaultCurrency,
      walletDefaultCurrency,
      walletDefaultCurrency // Target is always default currency
    );

    const summaryItem: TransactionSummaryItem = {
      id: transaction.id,
      date: transaction.date,
      amount: convertedAmount,
      currency: walletDefaultCurrency,
      name: transaction.name,
      note: transaction.note,
      tag: transaction.tag,
    };

    if (transaction.type === "INCOME") {
      totalIncome += convertedAmount;
      incomes.push(summaryItem);
    } else if (transaction.type === "EXPENSE") {
      totalExpense += convertedAmount;
      expenses.push(summaryItem);
    }
  }

  return {
    totalIncome,
    totalExpense,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
    incomes,
    expenses,
  };
}

