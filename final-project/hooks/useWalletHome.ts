/**
 * Wallet home page hook
 * 
 * This hook encapsulates all business logic for the wallet home page,
 * including data fetching, state management, and data transformation.
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "@/hooks/useWallet";
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
  time: string;
}

/**
 * Hook for wallet home page logic
 */
export function useWalletHome() {
  const router = useRouter();
  const { wallets, loading: walletsLoading } = useWallets();
  const { carrier, loading: carrierLoading } = useUserCarrier();

  // For now we treat the first wallet as the active wallet on this page
  const activeWallet = wallets[0] ?? null;

  const [showAmounts, setShowAmounts] = useState(true);
  const [brightCarrier, setBrightCarrier] = useState(true);
  
  // Track loading state with minimum display time (0.3 seconds)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loadingStartTimeRef = useRef<number | null>(null);
  const minLoadingTime = 300; // 0.3 seconds in milliseconds

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const carrierCode = carrier?.carrierCode || "/ABCDEF";
  const hasRealCarrier = !!carrier;

  // Fetch monthly summary from API
  const {
    data: monthlySummary,
    loading: summaryLoading,
    error: summaryError,
  } = useMonthlySummary({
    walletId: activeWallet?.id ?? null,
    year,
    month,
    enabled: !!activeWallet,
  });

  // Use API data if available, otherwise fallback to 0
  const incomeTotal = monthlySummary?.totalIncome ?? 0;
  const expenseTotal = monthlySummary?.totalExpense ?? 0;

  // Fetch daily transactions for today
  const {
    data: dailyTransactions,
    loading: transactionsLoading,
    error: transactionsError,
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
        time,
      };
    });
  }, [dailyTransactions]);

  const handleAddTransaction = () => {
    if (!activeWallet) return;
    router.push(`/wallets/${activeWallet.id}/transactions/new`);
  };

  // Manage loading state with minimum display time
  useEffect(() => {
    if (walletsLoading) {
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
  }, [walletsLoading, minLoadingTime]);

  return {
    // Wallet data
    activeWallet,
    walletsLoading,
    
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
  };
}

