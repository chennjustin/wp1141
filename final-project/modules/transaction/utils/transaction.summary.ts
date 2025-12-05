/**
 * Transaction summary utilities
 * 
 * This module handles calculation and currency conversion for transaction summaries.
 */

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Transaction, TransactionSummaryItem } from "../domain/transaction.types";

/**
 * Convert amount to target currency
 * If target currency is NTD, use rateToNTD
 * If target currency is the same as transaction currency, return original amount
 * Otherwise, convert via NTD (transaction -> NTD -> target)
 */
function convertToCurrency(
  amount: number,
  fromCurrency: string,
  fromRateToNTD: number | null,
  targetCurrency: string,
  targetRateToNTD: number | null
): number {
  // If same currency, no conversion needed
  if (fromCurrency === targetCurrency) {
    return amount;
  }

  // Convert to NTD first
  let amountInNTD: number;
  if (fromCurrency === DEFAULT_CURRENCY) {
    amountInNTD = amount;
  } else if (fromRateToNTD) {
    amountInNTD = amount * fromRateToNTD;
  } else {
    // No exchange rate available, cannot convert
    // Return 0 or throw error? For now, return 0
    return 0;
  }

  // Convert from NTD to target currency
  if (targetCurrency === DEFAULT_CURRENCY) {
    return amountInNTD;
  } else if (targetRateToNTD) {
    return amountInNTD / targetRateToNTD;
  } else {
    // No exchange rate available for target currency
    // Return NTD amount if target is not NTD but no rate
    return amountInNTD;
  }
}

/**
 * Calculate monthly summary from transactions
 */
export function calculateMonthlySummary(
  transactions: Array<{
    id: string;
    type: string;
    date: Date;
    amount: number;
    currency: string;
    rateToNTD: number | null;
    name: string | null;
    note: string | null;
    tag: {
      id: string;
      name: string;
      iconKey: string;
    };
  }>,
  targetCurrency: string = DEFAULT_CURRENCY,
  targetRateToNTD: number | null = null
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
      transaction.rateToNTD,
      targetCurrency,
      targetRateToNTD
    );

    const summaryItem: TransactionSummaryItem = {
      id: transaction.id,
      date: transaction.date,
      amount: convertedAmount,
      currency: targetCurrency,
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

