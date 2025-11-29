/**
 * Transaction summary utilities
 * 
 * This module handles calculation and currency conversion for transaction summaries.
 */

import { DEFAULT_CURRENCY } from "@/config/constants";
import type { Transaction } from "../domain/transaction.types";

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
    type: string;
    amount: number;
    currency: string;
    rateToNTD: number | null;
  }>,
  targetCurrency: string = DEFAULT_CURRENCY,
  targetRateToNTD: number | null = null
): {
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
} {
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const transaction of transactions) {
    const convertedAmount = convertToCurrency(
      transaction.amount,
      transaction.currency,
      transaction.rateToNTD,
      targetCurrency,
      targetRateToNTD
    );

    if (transaction.type === "INCOME") {
      totalIncome += convertedAmount;
      incomeCount++;
    } else if (transaction.type === "EXPENSE") {
      totalExpense += convertedAmount;
      expenseCount++;
    }
  }

  return {
    totalIncome,
    totalExpense,
    incomeCount,
    expenseCount,
  };
}

