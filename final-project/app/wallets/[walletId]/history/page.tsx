"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { groupTransactionsByDate, type DailyTransactionGroup } from "@/ui/utils/transaction-grouping";
import { TagIcon } from "@/ui/utils/tag-icon";
import { Loading } from "@/ui/components/common/Loading";

/**
 * Wallet history page
 * 
 * This page displays detailed transaction history for a specific wallet,
 * grouped by date with daily summaries. Users can select different months
 * to view historical transactions.
 * 
 * Route: /wallets/[walletId]/history
 */
export default function WalletHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params?.walletId as string | null;
  const { wallet, loading: walletLoading } = useWallet(walletId);

  // Get current date for default month selection
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  // Fetch transactions for selected month
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useWalletTransactions({
    walletId: wallet?.id ?? null,
    year: selectedYear,
    month: selectedMonth,
    enabled: !!wallet,
  });

  // Group transactions by date
  const dailyGroups = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  // Check if current selected month is the current month
  const isCurrentMonth = useMemo(() => {
    return selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;
  }, [selectedYear, selectedMonth, today]);

  // Format month label
  const monthLabel = useMemo(() => {
    return `${selectedYear} 年 ${selectedMonth} 月`;
  }, [selectedYear, selectedMonth]);

  // Handle previous month navigation
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Handle next month navigation
  const handleNextMonth = () => {
    if (isCurrentMonth) {
      return; // Disabled when at current month
    }
    
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Handle statistics icon click - navigate to statistics page
  const handleStatisticsClick = () => {
    router.push("/wallets/statistics");
  };

  // Format amount with sign and color
  const formatAmount = (amount: number, type: "INCOME" | "EXPENSE") => {
    const sign = type === "INCOME" ? "+" : "-";
    const colorStyle = type === "INCOME" 
      ? { color: 'var(--income-color)' }
      : { color: 'var(--expense-color)' };
    return { sign, colorStyle, formatted: Math.abs(amount).toLocaleString() };
  };

  if (walletLoading) {
    return <Loading />;
  }

  if (!wallet) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">錢包不存在或無權限存取</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header section with title and statistics icon */}
      <section className="flex items-center justify-between">
        {/* Left spacer - same width as right button to center the middle content */}
        <div className="w-8" />

        {/* Center: Month navigation and title */}
        <div className="flex items-center gap-3">
          {/* Previous month button */}
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="flex items-center justify-center text-lg font-medium text-black hover:bg-black/5 rounded transition-colors"
            aria-label="Previous month"
          >
            ◀
          </button>

          {/* Month title */}
          <h1 className="text-lg font-medium text-black">
            {monthLabel}
          </h1>

          {/* Next month button */}
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className={`flex items-center justify-center text-lg font-medium rounded transition-colors ${
              isCurrentMonth
                ? "text-black/30 cursor-not-allowed"
                : "text-black hover:bg-black/5"
            }`}
            aria-label="Next month"
          >
            ▶
          </button>
        </div>

        {/* Right: Statistics icon (bar chart) */}
        <button
          type="button"
          onClick={handleStatisticsClick}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="View statistics"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-black"
          >
            {/* Baseline */}
            <line
              x1="4"
              y1="20"
              x2="20"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Bar 1 - short */}
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
            {/* Bar 2 - medium */}
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
            {/* Bar 3 - tallest */}
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
        </button>
      </section>

      {/* Transactions list */}
      <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">載入中...</span>
          </div>
        ) : transactionsError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <span className="text-sm text-red-500" title={transactionsError}>
              載入失敗
            </span>
            <span className="text-xs text-black/50">{transactionsError}</span>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">本月還沒有交易記錄</span>
          </div>
        ) : dailyGroups.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">本月還沒有交易記錄</span>
          </div>
        ) : (
          dailyGroups.map((group) => (
            <DailyTransactionCard 
              key={group.dateKey} 
              group={group} 
              formatAmount={formatAmount}
              walletId={wallet.id}
            />
          ))
        )}
      </section>
    </div>
  );
}

/**
 * Daily transaction card component
 * 
 * Displays a single day's transactions with summary information.
 */
function DailyTransactionCard({
  group,
  formatAmount,
  walletId,
}: {
  group: DailyTransactionGroup;
  formatAmount: (amount: number, type: "INCOME" | "EXPENSE") => {
    sign: string;
    colorStyle: React.CSSProperties;
    formatted: string;
  };
  walletId: string;
}) {
  const router = useRouter();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  // Calculate daily net amount and determine color
  const netAmount = group.netAmount;
  const dailyAmountColor = netAmount >= 0 
    ? { color: 'var(--income-color)' }
    : { color: 'var(--expense-color)' };
  const dailyAmountSign = netAmount >= 0 ? "+" : "-";
  const dailyAmountFormatted = Math.abs(netAmount).toLocaleString();

  // Handle transaction click - navigate to edit page
  const handleTransactionClick = (transactionId: string) => {
    // TODO: Navigate to transaction edit page when implemented
    // router.push(`/wallets/${walletId}/transactions/${transactionId}/edit`);
  };

  const handleDeleteTransaction = async (e: React.MouseEvent, transactionId: string) => {
    e.stopPropagation();
    
    if (!confirm("確定要刪除此交易嗎？")) {
      return;
    }

    try {
      setDeletingIds((prev) => new Set(prev).add(transactionId));
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "刪除失敗");
      }

      // Reload page to refresh transaction list
      router.refresh();
    } catch (err) {
      console.error("Failed to delete transaction", err);
      alert(err instanceof Error ? err.message : "刪除失敗");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  return (
    <div className="rounded border border-black p-4" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
      {/* Date header with daily summary */}
      <div className="mb-3 flex items-center justify-between border-b border-black/20 pb-2">
        <span className="text-sm font-medium text-black">{group.dateLabel}</span>
        <span className="text-sm font-semibold" style={dailyAmountColor}>
          ${dailyAmountSign}{dailyAmountFormatted}
        </span>
      </div>

      {/* Transaction list */}
      <div className="flex flex-col gap-2">
        {group.transactions.map((transaction, index) => {
          const itemName = transaction.name || transaction.tag?.name || "未命名交易";
          const { sign, colorStyle, formatted } = formatAmount(
            transaction.amount,
            transaction.type
          );
          
          // Get iconKey with fallback
          const iconKey = transaction.tag?.iconKey || "tag";

          const isDeleting = deletingIds.has(transaction.id);

          return (
            <div key={transaction.id}>
              <div className="flex items-center gap-2 group">
                <button
                  type="button"
                  onClick={() => handleTransactionClick(transaction.id)}
                  className="flex-1 flex items-center justify-between py-2 hover:bg-black/5 transition-colors rounded"
                >
                  {/* Left: Icon */}
                  <div className="flex h-8 w-8 items-center justify-center flex-shrink-0">
                    <TagIcon iconKey={iconKey} />
                  </div>

                  {/* Center: Item name */}
                  <div className="flex-1 px-3 text-left">
                    <span className="text-sm text-black">{itemName}</span>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold" style={colorStyle}>
                      ${sign}{formatted}
                    </span>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteTransaction(e, transaction.id)}
                  disabled={isDeleting}
                  className="flex-shrink-0 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="刪除交易"
                >
                  {isDeleting ? "刪除中" : "刪除"}
                </button>
              </div>

              {/* Separator line (except for last item) */}
              {index < group.transactions.length - 1 && (
                <div className="border-b border-[#E8E8E8] mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
