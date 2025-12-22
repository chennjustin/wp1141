/**
 * Wallet statistics page
 * 
 * This page displays statistical analysis and charts for a specific wallet.
 * Features include:
 * - Donut chart and bar chart visualization
 * - Income/expense toggle
 * - Month and year period selection
 * - Category breakdown with colors
 * 
 * Route: /wallets/[walletId]/statistics
 */

"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import {
  processTransactionsByCategory,
  calculateTotalAmount,
} from "@/ui/utils/statistics";
import { DonutChart } from "@/ui/components/wallet/statistics/DonutChart";
import { BarChart } from "@/ui/components/wallet/statistics/BarChart";
import { CategoryLegend } from "@/ui/components/wallet/statistics/CategoryLegend";
import type { Transaction } from "@/modules/transaction/domain/transaction.types";

type PeriodType = "month" | "year";
type ChartType = "donut" | "bar";
type TransactionType = "INCOME" | "EXPENSE";

/**
 * Custom hook to fetch all transactions for a year
 * 
 * Fetches transactions for all 12 months in the given year and aggregates them.
 * This is a simplified implementation that fetches each month sequentially.
 * In production, you might want a dedicated API endpoint for year data.
 */
function useYearTransactions(
  walletId: string | null,
  year: number,
  enabled: boolean
) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions for each month
  const month1 = useWalletTransactions({
    walletId,
    year,
    month: 1,
    enabled: enabled && walletId !== null,
  });
  const month2 = useWalletTransactions({
    walletId,
    year,
    month: 2,
    enabled: enabled && walletId !== null,
  });
  const month3 = useWalletTransactions({
    walletId,
    year,
    month: 3,
    enabled: enabled && walletId !== null,
  });
  const month4 = useWalletTransactions({
    walletId,
    year,
    month: 4,
    enabled: enabled && walletId !== null,
  });
  const month5 = useWalletTransactions({
    walletId,
    year,
    month: 5,
    enabled: enabled && walletId !== null,
  });
  const month6 = useWalletTransactions({
    walletId,
    year,
    month: 6,
    enabled: enabled && walletId !== null,
  });
  const month7 = useWalletTransactions({
    walletId,
    year,
    month: 7,
    enabled: enabled && walletId !== null,
  });
  const month8 = useWalletTransactions({
    walletId,
    year,
    month: 8,
    enabled: enabled && walletId !== null,
  });
  const month9 = useWalletTransactions({
    walletId,
    year,
    month: 9,
    enabled: enabled && walletId !== null,
  });
  const month10 = useWalletTransactions({
    walletId,
    year,
    month: 10,
    enabled: enabled && walletId !== null,
  });
  const month11 = useWalletTransactions({
    walletId,
    year,
    month: 11,
    enabled: enabled && walletId !== null,
  });
  const month12 = useWalletTransactions({
    walletId,
    year,
    month: 12,
    enabled: enabled && walletId !== null,
  });

  // Aggregate all months' transactions
  useMemo(() => {
    if (!enabled || !walletId) {
      setAllTransactions([]);
      setLoading(false);
      return;
    }

    const allMonths = [
      month1,
      month2,
      month3,
      month4,
      month5,
      month6,
      month7,
      month8,
      month9,
      month10,
      month11,
      month12,
    ];

    const isLoading = allMonths.some((m) => m.loading);
    const hasError = allMonths.some((m) => m.error);

    if (hasError) {
      const firstError = allMonths.find((m) => m.error);
      setError(firstError?.error || "Failed to fetch year data");
      setLoading(false);
      return;
    }

    if (isLoading) {
      setLoading(true);
      return;
    }

    // Combine all transactions from all months
    const combined = allMonths.flatMap((m) => m.data || []);
    setAllTransactions(combined);
    setLoading(false);
    setError(null);
  }, [
    enabled,
    walletId,
    month1.data,
    month1.loading,
    month1.error,
    month2.data,
    month2.loading,
    month2.error,
    month3.data,
    month3.loading,
    month3.error,
    month4.data,
    month4.loading,
    month4.error,
    month5.data,
    month5.loading,
    month5.error,
    month6.data,
    month6.loading,
    month6.error,
    month7.data,
    month7.loading,
    month7.error,
    month8.data,
    month8.loading,
    month8.error,
    month9.data,
    month9.loading,
    month9.error,
    month10.data,
    month10.loading,
    month10.error,
    month11.data,
    month11.loading,
    month11.error,
    month12.data,
    month12.loading,
    month12.error,
  ]);

  return { data: allTransactions, loading, error };
}

export default function WalletStatisticsPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params?.walletId as string | null;
  const { wallet, loading: walletLoading } = useWallet(walletId || "");

  // Get current date for default selection
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("month");
  const [chartType, setChartType] = useState<ChartType>("donut");
  const [transactionType, setTransactionType] =
    useState<TransactionType>("EXPENSE");

  // Fetch transactions based on selected period
  const {
    data: monthTransactions,
    loading: monthLoading,
    error: monthError,
  } = useWalletTransactions({
    walletId: wallet?.id ?? null,
    year: selectedYear,
    month: selectedMonth,
    enabled: !!wallet && selectedPeriod === "month",
  });

  const {
    data: yearTransactions,
    loading: yearLoading,
    error: yearError,
  } = useYearTransactions(
    wallet?.id ?? null,
    selectedYear,
    !!wallet && selectedPeriod === "year"
  );

  // Use appropriate data based on selected period
  const transactions =
    selectedPeriod === "month" ? monthTransactions : yearTransactions;
  const transactionsLoading =
    selectedPeriod === "month" ? monthLoading : yearLoading;
  const transactionsError =
    selectedPeriod === "month" ? monthError : yearError;

  // Process transactions by category
  const categoryStats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return processTransactionsByCategory(transactions, transactionType);
  }, [transactions, transactionType]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return 0;
    }
    return calculateTotalAmount(transactions, transactionType);
  }, [transactions, transactionType]);

  // Check if current selected month is the current month
  const isCurrentMonth = useMemo(() => {
    return (
      selectedYear === today.getFullYear() &&
      selectedMonth === today.getMonth() + 1
    );
  }, [selectedYear, selectedMonth, today]);

  // Format period label
  const periodLabel = useMemo(() => {
    if (selectedPeriod === "month") {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    } else {
      return `${selectedYear}`;
    }
  }, [selectedPeriod, selectedYear, selectedMonth]);

  // Handle previous period navigation
  const handlePreviousPeriod = () => {
    if (selectedPeriod === "month") {
      if (selectedMonth === 1) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(12);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      setSelectedYear(selectedYear - 1);
    }
  };

  // Handle next period navigation
  const handleNextPeriod = () => {
    if (selectedPeriod === "month") {
      if (isCurrentMonth) {
        return; // Disabled when at current month
      }
      if (selectedMonth === 12) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      const currentYear = today.getFullYear();
      if (selectedYear < currentYear) {
        setSelectedYear(selectedYear + 1);
      }
    }
  };

  // Handle back to history page
  const handleBackToHistory = () => {
    if (walletId) {
      router.push(`/wallets/${walletId}/history`);
    }
  };

  // Toggle chart type
  const handleChartTypeToggle = () => {
    setChartType((prev) => (prev === "donut" ? "bar" : "donut"));
  };

  // Toggle transaction type
  const handleTransactionTypeToggle = () => {
    setTransactionType((prev) => (prev === "INCOME" ? "EXPENSE" : "INCOME"));
  };

  if (walletLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-black/50">Loading...</span>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">
          Wallet not found or no access permission
        </span>
      </div>
    );
  }

  const isLoading = transactionsLoading;
  const hasError = !!transactionsError;
  const hasData = categoryStats.length > 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header section with back button and chart toggle */}
      <section className="flex items-center justify-between">
        {/* Left: Back button */}
        <button
          type="button"
          onClick={handleBackToHistory}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors shadow-md"
          aria-label="Back to history"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-black"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Center: Period navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePreviousPeriod}
            className="flex items-center justify-center text-lg font-medium text-black hover:bg-black/5 rounded transition-colors"
            aria-label="Previous period"
          >
            ◀
          </button>

          <h1 className="text-lg font-medium text-black">{periodLabel}</h1>

          <button
            type="button"
            onClick={handleNextPeriod}
            disabled={
              selectedPeriod === "month" ? isCurrentMonth : selectedYear >= today.getFullYear()
            }
            className={`flex items-center justify-center text-lg font-medium rounded transition-colors ${
              (selectedPeriod === "month" && isCurrentMonth) ||
              (selectedPeriod === "year" && selectedYear >= today.getFullYear())
                ? "text-black/30 cursor-not-allowed"
                : "text-black hover:bg-black/5"
            }`}
            aria-label="Next period"
          >
            ▶
          </button>
        </div>

        {/* Right: Chart type toggle */}
        <button
          type="button"
          onClick={handleChartTypeToggle}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Toggle chart type"
        >
          {chartType === "donut" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              {/* Bar chart icon */}
              <line
                x1="4"
                y1="20"
                x2="20"
                y2="20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect
                x="5"
                y="16"
                width="3"
                height="4"
                rx="0.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="11"
                y="12"
                width="3"
                height="8"
                rx="0.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="17"
                y="6"
                width="3"
                height="14"
                rx="0.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              {/* Donut chart icon */}
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
        </button>
      </section>

      {/* Period type tabs */}
      <section className="flex gap-2">
        <button
          type="button"
          onClick={() => setSelectedPeriod("month")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedPeriod === "month"
              ? "bg-yellow-400 text-black"
              : "bg-white text-black/70 hover:bg-black/5"
          }`}
        >
          MTH
        </button>
        <button
          type="button"
          onClick={() => setSelectedPeriod("year")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedPeriod === "year"
              ? "bg-yellow-400 text-black"
              : "bg-white text-black/70 hover:bg-black/5"
          }`}
        >
          Year
        </button>
      </section>

      {/* Transaction type toggle */}
      <section className="flex gap-2">
        <button
          type="button"
          onClick={handleTransactionTypeToggle}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            transactionType === "EXPENSE"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-white text-black/70 hover:bg-black/5 border border-black/10"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={handleTransactionTypeToggle}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            transactionType === "INCOME"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-white text-black/70 hover:bg-black/5 border border-black/10"
          }`}
        >
          Income
        </button>
      </section>

      {/* Chart display area */}
      <section className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">Loading...</span>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <span className="text-sm text-red-500" title={transactionsError || undefined}>
              Failed to load
            </span>
            <span className="text-xs text-black/50">
              {transactionsError}
            </span>
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">
              No {transactionType.toLowerCase()} data for this period
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Chart */}
            <div className="rounded-xl bg-white p-4">
              {chartType === "donut" ? (
                <DonutChart
                  data={categoryStats}
                  totalAmount={totalAmount}
                  currency={wallet.defaultCurrency}
                />
              ) : (
                <BarChart data={categoryStats} />
              )}
            </div>

            {/* Category legend */}
            <div className="rounded-xl bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-black">Details</h2>
              </div>
              <CategoryLegend
                categories={categoryStats}
                currency={wallet.defaultCurrency}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
