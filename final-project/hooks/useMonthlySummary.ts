/**
 * Monthly summary React hook
 * 
 * This hook provides functionality to fetch monthly transaction summary
 * from the API, including total income and expense for a specific month.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { MonthlySummary } from "@/modules/transaction/domain/transaction.types";

interface UseMonthlySummaryParams {
  walletId: string | null;
  year: number;
  month: number; // 1-12
  targetCurrency?: string; // Optional target currency (defaults to TWD)
  enabled?: boolean; // Whether to fetch data (defaults to true)
}

interface UseMonthlySummaryResult {
  data: MonthlySummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch monthly transaction summary
 * 
 * This hook fetches the monthly summary (total income and expense) for a given
 * wallet, year, and month. It automatically refetches when dependencies change.
 * 
 * @param params - Parameters for fetching monthly summary
 * @returns Monthly summary data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, loading, error } = useMonthlySummary({
 *   walletId: activeWallet?.id ?? null,
 *   year: 2024,
 *   month: 12,
 * });
 * ```
 */
export function useMonthlySummary({
  walletId,
  year,
  month,
  targetCurrency,
  enabled = true,
}: UseMonthlySummaryParams): UseMonthlySummaryResult {
  const { data: session, status } = useSession();
  const [data, setData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
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

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        walletId,
        year: year.toString(),
        month: month.toString(),
      });

      // Add targetCurrency if provided
      if (targetCurrency) {
        params.append("targetCurrency", targetCurrency);
      }

      // Fetch monthly summary from API
      const response = await fetch(`/api/transactions/summary?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch monthly summary: ${response.statusText}`
        );
      }

      const summaryData: MonthlySummary = await response.json();
      setData(summaryData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch monthly summary";
      setError(errorMessage);
      console.error("[useMonthlySummary] Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  }, [walletId, year, month, targetCurrency, enabled, session, status]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    loading,
    error,
    refetch: fetchSummary,
  };
}

