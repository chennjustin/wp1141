/**
 * Daily transactions React hook
 * 
 * This hook provides functionality to fetch daily transactions
 * for a specific wallet and date from the API.
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { listTransactionsAction } from "@/modules/transaction/routes/list-transactions";
import type { Transaction } from "@/modules/transaction/domain/transaction.types";

interface UseDailyTransactionsParams {
  walletId: string | null;
  date: Date; // The date to fetch transactions for
  enabled?: boolean; // Whether to fetch data (defaults to true)
}

interface UseDailyTransactionsResult {
  data: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch daily transactions for a specific date
 * 
 * This hook fetches all transactions for a given wallet on a specific date.
 * It automatically refetches when dependencies change.
 * 
 * @param params - Parameters for fetching daily transactions
 * @returns Array of transactions, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, loading, error } = useDailyTransactions({
 *   walletId: activeWallet?.id ?? null,
 *   date: new Date(),
 * });
 * ```
 */
export function useDailyTransactions({
  walletId,
  date,
  enabled = true,
}: UseDailyTransactionsParams): UseDailyTransactionsResult {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the last queried parameters to avoid unnecessary refetches
  const lastQueryRef = useRef<{
    walletId: string | null;
    dateKey: string; // ISO date string for the day (YYYY-MM-DD)
  } | null>(null);

  // Memoize date key to avoid unnecessary re-renders when date object reference changes
  // Convert date to ISO string and extract date part (YYYY-MM-DD) for stable comparison
  // Use date's time value for comparison - this ensures we only recalculate when the actual date changes
  const dateTimestamp = date.getTime();
  const dateKey = useMemo(() => {
    return date.toISOString().split("T")[0];
  }, [dateTimestamp]);

  const fetchTransactions = useCallback(
    async (forceRefetch = false) => {
      // Don't fetch if not authenticated or walletId is missing
      if (
        !enabled ||
        status !== "authenticated" ||
        !session?.user?.id ||
        !walletId
      ) {
        setLoading(false);
        return;
      }

      // Use memoized dateKey for comparison

      // Skip fetch if we've already queried for the same walletId and date
      // unless forceRefetch is true
      if (
        !forceRefetch &&
        lastQueryRef.current &&
        lastQueryRef.current.walletId === walletId &&
        lastQueryRef.current.dateKey === dateKey
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate start and end of the day in UTC
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await listTransactionsAction({
          walletId,
          startDate: startOfDay,
          endDate: endOfDay,
        });

        if (result.success && result.data) {
          const transactions = result.data;

          // Sort transactions by date (most recent first)
          const sortedTransactions = transactions.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          });

          // Update last query reference after successful fetch
          lastQueryRef.current = {
            walletId,
            dateKey,
          };

          setData(sortedTransactions);
        } else {
          const errorMsg = result.error instanceof Error 
            ? result.error.message 
            : String(result.error || "Failed to fetch transactions");
          setError(errorMsg);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch transactions";
        setError(errorMessage);
        console.error("[useDailyTransactions] Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [walletId, date, dateKey, enabled, session, status]
  );

  useEffect(() => {
    // Check if parameters have changed
    const hasParamsChanged =
      !lastQueryRef.current ||
      lastQueryRef.current.walletId !== walletId ||
      lastQueryRef.current.dateKey !== dateKey;

    if (hasParamsChanged) {
      // Clear data when parameters change
      setData([]);
      setError(null);
      // Reset lastQueryRef to allow fetch
      lastQueryRef.current = null;
      fetchTransactions(false);
    }
  }, [walletId, dateKey, fetchTransactions]);

  // Refetch function that forces a new query even if parameters haven't changed
  const refetch = useCallback(() => {
    return fetchTransactions(true);
  }, [fetchTransactions]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

