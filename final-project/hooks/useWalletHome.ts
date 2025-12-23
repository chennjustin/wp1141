/**
 * Wallet home page hook
 * 
 * This hook encapsulates all business logic for the wallet home page,
 * including data fetching, state management, and data transformation.
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWallets, useWallet } from "@/hooks/useWallet";
import { useUserCarrier } from "@/hooks/useCarrier";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useDailyTransactions } from "@/hooks/useDailyTransactions";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import type { Transaction } from "@/modules/transaction/domain/transaction.types";

/**
 * Transaction display format
 */
export interface DisplayTransaction {
  id: string;
  title: string;
  amount: number | null; // null when current user didn't pay anything
  currency: string;
  time: string;
}

/**
 * Hook for wallet home page logic
 * 
 * @param walletId - Optional wallet ID. If provided, uses that specific wallet.
 *                   If not provided, uses the first wallet from the wallets list.
 */
export function useWalletHome(walletId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { wallets, loading: walletsLoading } = useWallets();
  const { wallet: walletById, loading: walletByIdLoading } = useWallet(walletId);
  const { carrier, loading: carrierLoading } = useUserCarrier();

  // Determine active wallet: use walletById if walletId is provided, otherwise use first wallet
  const activeWallet = useMemo(() => {
    return walletById ?? wallets[0] ?? null;
  }, [walletById, wallets]);

  const [showAmounts, setShowAmounts] = useState(true);
  const [brightCarrier, setBrightCarrier] = useState(true);
  
  // Track loading state with minimum display time (0.3 seconds)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loadingStartTimeRef = useRef<number | null>(null);
  const minLoadingTime = 300; // 0.3 seconds in milliseconds

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const carrierCode = carrier?.carrierCode || "";
  const hasRealCarrier = !!carrier;

  // Fetch all transactions for current month to calculate user-specific summary
  const {
    data: monthlyTransactions,
    loading: monthlyTransactionsLoading,
    error: monthlyTransactionsError,
  } = useWalletTransactions({
    walletId: activeWallet?.id ?? null,
    year,
    month,
    enabled: !!activeWallet,
  });

  /**
   * Get current user's paid amount from transaction payers
   * Returns 0 if current user didn't pay anything
   */
  const getUserPaidAmount = (transaction: Transaction): number => {
    if (!currentUserId || !transaction.payers || transaction.payers.length === 0) {
      return 0;
    }
    const userPayer = transaction.payers.find((payer) => payer.payerId === currentUserId);
    return userPayer ? userPayer.paidAmount : 0;
  };

  /**
   * Convert amount to wallet default currency
   */
  const convertToDefaultCurrency = (
    amount: number,
    currency: string,
    rateToDefaultCurrency: number | null,
    walletDefaultCurrency: string
  ): number => {
    if (currency === walletDefaultCurrency) {
      return amount;
    }
    if (!rateToDefaultCurrency || rateToDefaultCurrency <= 0) {
      return 0;
    }
    return amount * rateToDefaultCurrency;
  };

  // Calculate monthly summary based on current user's paid amounts
  const { incomeTotal, expenseTotal } = useMemo(() => {
    if (!activeWallet || !monthlyTransactions || monthlyTransactions.length === 0) {
      return { incomeTotal: 0, expenseTotal: 0 };
    }

    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of monthlyTransactions) {
      const userPaidAmount = getUserPaidAmount(transaction);
      if (userPaidAmount === 0) {
        continue; // User didn't pay anything for this transaction
      }

      const convertedAmount = convertToDefaultCurrency(
        userPaidAmount,
        transaction.currency,
        transaction.rateToDefaultCurrency,
        activeWallet.defaultCurrency
      );

      if (transaction.type === "INCOME") {
        totalIncome += convertedAmount;
      } else if (transaction.type === "EXPENSE") {
        totalExpense += convertedAmount;
      }
    }

    return { incomeTotal: totalIncome, expenseTotal: totalExpense };
  }, [monthlyTransactions, activeWallet, currentUserId]);

  // Use loading state from transactions fetch
  const summaryLoading = monthlyTransactionsLoading;
  const summaryError = monthlyTransactionsError;

  // Fetch daily transactions for today with refetch capability
  const {
    data: dailyTransactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useDailyTransactions({
    walletId: activeWallet?.id ?? null,
    date: today,
    enabled: !!activeWallet,
  });

  // Transform transactions for display
  // Convert Transaction to UI format: { id, title, amount, time }
  const displayTransactions = useMemo(() => {
    return dailyTransactions.map((tx) => {
      // Use transaction name or tag name as title
      const title = tx.name || tx.tag.name || "未命名交易";

      // Calculate display amount based on transaction type
      // INCOME transactions are positive, EXPENSE transactions are negative
      const displayAmount = tx.type === "INCOME" ? tx.amount : -tx.amount;

      // Format time from transaction date (HH:mm format)
      const transactionDate = new Date(tx.date);
      const hours = transactionDate.getHours().toString().padStart(2, "0");
      const minutes = transactionDate.getMinutes().toString().padStart(2, "0");
      const time = `${hours}:${minutes}`;

      return {
        id: tx.id,
        title,
        amount: displayAmount,
        currency: tx.currency,
        time,
      };
    });
  }, [dailyTransactions]);

  const handleAddTransaction = () => {
    if (!activeWallet) return;
    router.push(`/wallets/${activeWallet.id}/transactions/new/tag`);
  };

  // Manage loading state with minimum display time
  // Consider both walletsLoading and walletByIdLoading
  const isLoading = walletId ? walletByIdLoading : walletsLoading;
  
  useEffect(() => {
    if (isLoading) {
      // Start loading
      if (loadingStartTimeRef.current === null) {
        loadingStartTimeRef.current = Date.now();
        setIsInitialLoading(true);
      }
    } else {
      // Loading finished, check if minimum time has passed
      if (loadingStartTimeRef.current !== null) {
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          // Wait for remaining time before hiding loading
          const timer = setTimeout(() => {
            setIsInitialLoading(false);
            loadingStartTimeRef.current = null;
          }, remainingTime);
          
          return () => clearTimeout(timer);
        } else {
          // Minimum time already passed, hide loading immediately
          setIsInitialLoading(false);
          loadingStartTimeRef.current = null;
        }
      }
    }
  }, [isLoading, minLoadingTime]);

  // Refetch data when returning from transaction creation page
  useEffect(() => {
    // Refetch transactions when wallet is loaded and pathname matches
    if (activeWallet && pathname === `/wallets/${activeWallet.id}`) {
      // Small delay to ensure navigation is complete
      const timer = setTimeout(() => {
        refetchTransactions();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeWallet?.id, pathname, refetchTransactions]);

  // Also refetch when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && activeWallet) {
        refetchTransactions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeWallet, refetchTransactions]);

  return {
    // Wallet data
    activeWallet,
    walletsLoading: isLoading,
    
    // Carrier data
    carrier,
    carrierLoading,
    carrierCode,
    hasRealCarrier,
    
    // Monthly summary data
    year,
    month,
    incomeTotal,
    expenseTotal,
    summaryLoading,
    summaryError,
    
    // Daily transactions data
    displayTransactions,
    transactionsLoading,
    transactionsError,
    
    // UI state
    showAmounts,
    setShowAmounts,
    brightCarrier,
    setBrightCarrier,
    
    // Loading state
    isInitialLoading,
    
    // Handlers
    handleAddTransaction,
    
    // Refetch functions
    refetchTransactions,
  };
}

