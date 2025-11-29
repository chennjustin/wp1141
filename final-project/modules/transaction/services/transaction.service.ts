/**
 * Transaction service
 * 
 * This module contains business logic for Transaction operations.
 * It orchestrates repository calls and implements domain rules
 * such as authorization, validation, and data transformation.
 */

import { transactionRepository } from "../repositories/transaction.repository";
import { walletRepository } from "@/modules/wallet/repositories/wallet.repository";
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionServiceResult,
  MonthlySummaryFilters,
  MonthlySummary,
} from "../domain/transaction.types";
import {
  NotFoundError,
  ValidationError,
} from "../domain/transaction.errors";
import {
  validateRequiredFields,
  validateAmount,
  validatePayers,
  validateShares,
  validateTag,
} from "../utils/transaction.validators";
import {
  determineCurrency,
  determineExchangeRate,
  determineUpdateExchangeRate,
} from "../utils/transaction.currency";
import { handleTransactionError } from "../utils/transaction.error-handler";
import { calculateMonthlySummary } from "../utils/transaction.summary";
import { DEFAULT_CURRENCY } from "@/config/constants";

/**
 * Transaction service interface
 */
export const transactionService = {
  /**
   * Get transaction by ID with authorization check
   */
  async getTransactionById(
    transactionId: string,
    userId: string
  ): Promise<TransactionServiceResult<Transaction>> {
    const transaction = await transactionRepository.findById(
      transactionId,
      userId
    );

    if (!transaction) {
      return {
        success: false,
        error: new NotFoundError("Transaction not found or access denied"),
      };
    }

    return {
      success: true,
      data: transaction as Transaction,
    };
  },

  /**
   * Get transactions by wallet with filters
   */
  async getTransactionsByWallet(
    filters: TransactionFilters,
    userId: string
  ): Promise<TransactionServiceResult<Transaction[]>> {
    // Check wallet access
    const hasAccess = await transactionRepository.hasAccess(
      filters.walletId,
      userId
    );

    if (!hasAccess) {
      return {
        success: false,
        error: new NotFoundError("Wallet not found or access denied"),
      };
    }

    const transactions = await transactionRepository.findByWalletId(filters);
    return {
      success: true,
      data: transactions as Transaction[],
    };
  },

  /**
   * Create transaction with default currency and exchange rate logic
   */
  async createTransaction(
    userId: string,
    data: CreateTransactionData
  ): Promise<TransactionServiceResult<Transaction>> {
    // Validate required fields
    const requiredFieldsError = validateRequiredFields(data);
    if (requiredFieldsError) {
      return { success: false, error: requiredFieldsError };
    }

    // Validate wallet access
    const hasAccess = await transactionRepository.hasAccess(
      data.walletId!,
      userId
    );
    if (!hasAccess) {
      return {
        success: false,
        error: new NotFoundError("Wallet not found or access denied"),
      };
    }

    // Validate amount
    const amountError = validateAmount(data.amount);
    if (amountError) {
      return { success: false, error: amountError };
    }

    // Get wallet for default currency
    const wallet = await walletRepository.findById(data.walletId!, userId);
    if (!wallet) {
      return {
        success: false,
        error: new NotFoundError("Wallet not found"),
      };
    }

    // Determine currency and exchange rate
    const currency = await determineCurrency(
      data.walletId!,
      userId,
      data.currency
    );
    const rateToNTD = await determineExchangeRate(
      data.walletId!,
      currency,
      data.rateToNTD
    );

    // Validate payers
    const payersError = await validatePayers(data.payers, data.amount!);
    if (payersError) {
      return { success: false, error: payersError };
    }

    // Validate shares
    const sharesError = await validateShares(data.shares, data.amount!);
    if (sharesError) {
      return { success: false, error: sharesError };
    }

    // Validate tag
    const tagError = await validateTag(data.tagId!);
    if (tagError) {
      return { success: false, error: tagError };
    }

    try {
      // Create transaction
      const transaction = await transactionRepository.create(userId, {
        ...data,
        currency,
        rateToNTD: rateToNTD ?? null,
      });

      // Fetch complete transaction with relations
      const completeTransaction = await transactionRepository.findById(
        transaction.id,
        userId
      );

      return {
        success: true,
        data: completeTransaction as Transaction,
      };
    } catch (error: any) {
      const handledError = handleTransactionError(error, "create");
      return { success: false, error: handledError };
    }
  },

  /**
   * Update transaction with authorization check
   */
  async updateTransaction(
    transactionId: string,
    userId: string,
    data: UpdateTransactionData
  ): Promise<TransactionServiceResult<Transaction>> {
    // Check transaction exists and user has access
    const existingTransaction = await transactionRepository.findById(
      transactionId,
      userId
    );

    if (!existingTransaction) {
      return {
        success: false,
        error: new NotFoundError("Transaction not found or access denied"),
      };
    }

    // Validate amount if provided
    const amountError = validateAmount(data.amount);
    if (amountError) {
      return { success: false, error: amountError };
    }

    // Validate payers and shares if provided
    const finalAmount = data.amount ?? existingTransaction.amount;

    const payersError = await validatePayers(data.payers, finalAmount);
    if (payersError) {
      return { success: false, error: payersError };
    }

    const sharesError = await validateShares(data.shares, finalAmount);
    if (sharesError) {
      return { success: false, error: sharesError };
    }

    // Validate tagId if provided
    const tagIdToValidate = data.tagId ?? existingTransaction.tagId;
    if (!tagIdToValidate) {
      return {
        success: false,
        error: new ValidationError("Tag ID is required"),
      };
    }

    const tagError = await validateTag(tagIdToValidate);
    if (tagError) {
      return { success: false, error: tagError };
    }

    // Determine exchange rate for update
    const rateToNTD = await determineUpdateExchangeRate(
      existingTransaction.walletId,
      existingTransaction,
      data.currency,
      data.rateToNTD
    );

    try {
      await transactionRepository.update(transactionId, {
        ...data,
        rateToNTD,
      });

      // Fetch updated transaction
      const updatedTransaction = await transactionRepository.findById(
        transactionId,
        userId
      );

      if (!updatedTransaction) {
        return {
          success: false,
          error: new NotFoundError("Transaction not found after update"),
        };
      }

      return {
        success: true,
        data: updatedTransaction as Transaction,
      };
    } catch (error: any) {
      const handledError = handleTransactionError(error, "update");
      return { success: false, error: handledError };
    }
  },

  /**
   * Delete transaction with authorization check
   */
  async deleteTransaction(
    transactionId: string,
    userId: string
  ): Promise<TransactionServiceResult<void>> {
    // Check transaction exists and user has access
    const transaction = await transactionRepository.findById(
      transactionId,
      userId
    );

    if (!transaction) {
      return {
        success: false,
        error: new NotFoundError("Transaction not found or access denied"),
      };
    }

    try {
      await transactionRepository.softDelete(transactionId);
      return {
        success: true,
      };
    } catch (error: any) {
      const handledError = handleTransactionError(error, "delete");
      return { success: false, error: handledError };
    }
  },

  /**
   * Get monthly summary with income and expense totals
   */
  async getMonthlySummary(
    filters: MonthlySummaryFilters,
    userId: string
  ): Promise<TransactionServiceResult<MonthlySummary>> {
    // Validate wallet access
    const hasAccess = await transactionRepository.hasAccess(
      filters.walletId,
      userId
    );
    if (!hasAccess) {
      return {
        success: false,
        error: new NotFoundError("Wallet not found or access denied"),
      };
    }

    // Validate month
    if (filters.month < 1 || filters.month > 12) {
      return {
        success: false,
        error: new ValidationError("Month must be between 1 and 12"),
      };
    }

    try {
      // Get transactions for the month
      const transactions = await transactionRepository.findMonthlyTransactions(
        filters
      );

      // Determine target currency (default to NTD)
      const targetCurrency = filters.targetCurrency || DEFAULT_CURRENCY;

      // Get exchange rate for target currency if needed
      let targetRateToNTD: number | null = null;
      if (targetCurrency !== DEFAULT_CURRENCY) {
        const lastRate = await transactionRepository.findLastExchangeRate(
          filters.walletId,
          targetCurrency
        );
        targetRateToNTD = lastRate?.rateToNTD ?? null;
      }

      // Calculate summary
      const summary = calculateMonthlySummary(
        transactions,
        targetCurrency,
        targetRateToNTD
      );

      const result: MonthlySummary = {
        walletId: filters.walletId,
        year: filters.year,
        month: filters.month,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        netAmount: summary.totalIncome - summary.totalExpense,
        currency: targetCurrency,
        incomeCount: summary.incomeCount,
        expenseCount: summary.expenseCount,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      const handledError = handleTransactionError(error, "get");
      return { success: false, error: handledError };
    }
  },
};

