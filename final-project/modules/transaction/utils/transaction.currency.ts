/**
 * Transaction currency and exchange rate utilities
 * 
 * This module handles currency determination and exchange rate logic
 * for transaction operations.
 */

import { transactionRepository } from "../repositories/transaction.repository";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";
import { DEFAULT_CURRENCY } from "@/config/constants";
import type { CreateTransactionData, UpdateTransactionData, Transaction } from "../domain/transaction.types";

/**
 * Determine currency for a new transaction
 */
export async function determineCurrency(
  walletId: string,
  userId: string,
  providedCurrency?: string
): Promise<string> {
  if (providedCurrency) {
    return providedCurrency;
  }

  // Get last transaction's currency
  const lastTransaction = await transactionRepository.findLastTransactionByWallet(walletId);
  if (lastTransaction?.currency) {
    return lastTransaction.currency;
  }

  // Get wallet default currency
  const wallet = await walletRepository.findById(walletId, userId);
  if (wallet?.defaultCurrency) {
    return wallet.defaultCurrency;
  }

  // Fallback to default
  return DEFAULT_CURRENCY;
}

/**
 * Determine exchange rate for a transaction (to wallet default currency)
 */
export async function determineExchangeRateToDefaultCurrency(
  walletId: string,
  currency: string,
  walletDefaultCurrency: string,
  providedRate?: number | null
): Promise<number | null> {
  // If rate is explicitly provided (including null), use it
  if (providedRate !== undefined) {
    return providedRate;
  }

  // If currency is same as wallet default currency, no exchange rate needed
  if (currency === walletDefaultCurrency) {
    return null;
  }

  // Get last used rate for this currency
  const lastRate = await transactionRepository.findLastExchangeRateToDefaultCurrency(walletId, currency);
  return lastRate?.rateToDefaultCurrency ?? null;
}

/**
 * Determine exchange rate for transaction update (to wallet default currency)
 */
export async function determineUpdateExchangeRateToDefaultCurrency(
  walletId: string,
  existingTransaction: { currency: string; rateToDefaultCurrency: number | null },
  walletDefaultCurrency: string,
  newCurrency?: string,
  providedRate?: number | null
): Promise<number | null> {
  // If rate is explicitly provided, use it
  if (providedRate !== undefined) {
    return providedRate;
  }

  // If currency changed, try to get last exchange rate for new currency
  if (newCurrency !== undefined && newCurrency !== existingTransaction.currency) {
    if (newCurrency !== walletDefaultCurrency) {
      const lastRate = await transactionRepository.findLastExchangeRateToDefaultCurrency(walletId, newCurrency);
      return lastRate?.rateToDefaultCurrency ?? null;
    }
    return null;
  }

  // Keep existing rate
  return existingTransaction.rateToDefaultCurrency;
}

