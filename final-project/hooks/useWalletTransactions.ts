/**
 * Wallet transactions React hook
 * 
 * This hook provides functionality to fetch transactions
 * for a specific wallet and month from the API.
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { Transaction } from "@/modules/transaction/domain/transaction.types";

interface UseWalletTransactionsParams {
  walletId: string | null;
  year: number;
  month: number; // 1-12
  enabled?: boolean; // Whether to fetch data (defaults to true)
}

interface UseWalletTransactionsResult {
  data: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch wallet transactions for a specific month
 * 
 * This hook fetches all transactions for a given wallet within a specific month.
 * It automatically refetches when dependencies change.
 * 
 * @param params - Parameters for fetching transactions
 * @returns Array of transactions, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, loading, error } = useWalletTransactions({
 *   walletId: wallet?.id ?? null,
 *   year: 2025,
 *   month: 12,
 * });
 * ```
 */
export function useWalletTransactions({
  walletId,
  year,
  month,
  enabled = true,
}: UseWalletTransactionsParams): UseWalletTransactionsResult {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the last queried parameters to avoid unnecessary refetches
  const lastQueryRef = useRef<{
    walletId: string | null;
    year: number;
    month: number;
  } | null>(null);

  // Memoize query key to avoid unnecessary re-renders
  const queryKey = useMemo(() => {
    return `${walletId}-${year}-${month}`;
  }, [walletId, year, month]);

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

      // Validate month range
      if (month < 1 || month > 12) {
        setError("Month must be between 1 and 12");
        setLoading(false);
        return;
      }

      // Validate year range
      if (year < 2000 || year > 2100) {
        setError("Year must be between 2000 and 2100");
        setLoading(false);
        return;
      }

      // Skip fetch if we've already queried for the same parameters
      // unless forceRefetch is true
      if (
        !forceRefetch &&
        lastQueryRef.current &&
        lastQueryRef.current.walletId === walletId &&
        lastQueryRef.current.year === year &&
        lastQueryRef.current.month === month
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate start and end of the month
        const startDate = new Date(year, month - 1, 1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Build query parameters
        const params = new URLSearchParams({
          walletId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        // Fetch transactions from API
        const response = await fetch(`/api/transactions?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to fetch transactions: ${response.statusText}`
          );
        }

        const transactions: Transaction[] = await response.json();

        // Sort transactions by date (most recent first)
        const sortedTransactions = transactions.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });

        // Update last query reference after successful fetch
        lastQueryRef.current = {
          walletId,
          year,
          month,
        };

        setData(sortedTransactions);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch transactions";
        setError(errorMessage);
        console.error("[useWalletTransactions] Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [walletId, year, month, enabled, session, status]
  );

  useEffect(() => {
    // Check if parameters have changed
    const hasParamsChanged =
      !lastQueryRef.current ||
      lastQueryRef.current.walletId !== walletId ||
      lastQueryRef.current.year !== year ||
      lastQueryRef.current.month !== month;

    if (hasParamsChanged) {
      // Clear data when parameters change
      setData([]);
      setError(null);
      // Reset lastQueryRef to allow fetch
      lastQueryRef.current = null;
      fetchTransactions(false);
    }
  }, [walletId, year, month, fetchTransactions]);

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

