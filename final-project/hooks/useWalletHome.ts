/**
 * Wallet home page hook
 * 
 * This hook encapsulates all business logic for the wallet home page,
 * including data fetching, state management, and data transformation.
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWallets, useWallet } from "@/hooks/useWallet";
import { useUserCarrier } from "@/hooks/useCarrier";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useDailyTransactions } from "@/hooks/useDailyTransactions";

/**
 * Transaction display format
 */
export interface DisplayTransaction {
  id: string;
  title: string;
  amount: number;
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

  // Fetch monthly summary from API with refetch capability
  const {
    data: monthlySummary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useMonthlySummary({
    walletId: activeWallet?.id ?? null,
    year,
    month,
    enabled: !!activeWallet,
  });

  // Use API data if available, otherwise fallback to 0
  const incomeTotal = monthlySummary?.totalIncome ?? 0;
  const expenseTotal = monthlySummary?.totalExpense ?? 0;

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
    // Refetch transactions and summary when wallet is loaded and pathname matches
    if (activeWallet && pathname === `/wallets/${activeWallet.id}`) {
      // Small delay to ensure navigation is complete
      const timer = setTimeout(() => {
        refetchTransactions();
        refetchSummary();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeWallet?.id, pathname, refetchTransactions, refetchSummary]);

  // Also refetch when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && activeWallet) {
        refetchTransactions();
        refetchSummary();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeWallet, refetchTransactions, refetchSummary]);

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
    refetchSummary,
  };
}

