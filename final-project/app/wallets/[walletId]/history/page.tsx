"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { groupTransactionsByDate, type DailyTransactionGroup } from "@/ui/utils/transaction-grouping";
import { TagIcon } from "@/ui/utils/tag-icon";

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

  // Generate month options for dropdown (last 12 months)
  const monthOptions = useMemo(() => {
    const options: Array<{ year: number; month: number; label: string }> = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const label = `${year} 年 ${month} 月`;
      
      options.push({ year, month, label });
    }
    
    return options;
  }, []);

  // Handle month selection change
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const [year, month] = value.split("-").map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Handle statistics icon click (placeholder)
  const handleStatisticsClick = () => {
    if (walletId) {
      router.push(`/wallets/${walletId}/statistics`);
    }
  };

  // Format amount with sign and color
  const formatAmount = (amount: number, type: "INCOME" | "EXPENSE") => {
    const sign = type === "INCOME" ? "+" : "-";
    const colorClass = type === "INCOME" ? "text-blue-500" : "text-red-500";
    return { sign, colorClass, formatted: Math.abs(amount).toLocaleString() };
  };

  if (walletLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-black/50">載入中...</span>
      </div>
    );
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
        <div className="flex items-center gap-3">
          {/* Month selector */}
          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={handleMonthChange}
            className="rounded border border-black bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            {monthOptions.map((option) => (
              <option key={`${option.year}-${option.month}`} value={`${option.year}-${option.month}`}>
                {option.label}
              </option>
            ))}
          </select>
          
          <h1 className="text-lg font-medium text-black">
            {selectedMonth} 月收支明細
          </h1>
        </div>

        {/* Statistics icon (pie chart) */}
        <button
          type="button"
          onClick={handleStatisticsClick}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="View statistics"
        >
          <span className="text-xl">📊</span>
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
    colorClass: string;
    formatted: string;
  };
  walletId: string;
}) {
  const router = useRouter();
  
  // Calculate daily net amount and determine color
  const netAmount = group.netAmount;
  const dailyAmountColor = netAmount >= 0 ? "text-blue-500" : "text-red-500";
  const dailyAmountSign = netAmount >= 0 ? "+" : "-";
  const dailyAmountFormatted = Math.abs(netAmount).toLocaleString();

  // Handle transaction click - navigate to edit page
  const handleTransactionClick = (transactionId: string) => {
    // TODO: Navigate to transaction edit page when implemented
    // router.push(`/wallets/${walletId}/transactions/${transactionId}/edit`);
  };

  return (
    <div className="rounded border border-black bg-white p-4">
      {/* Date header with daily summary */}
      <div className="mb-3 flex items-center justify-between border-b border-black/20 pb-2">
        <span className="text-sm font-medium text-black">{group.dateLabel}</span>
        <span className={`text-sm font-semibold ${dailyAmountColor}`}>
          ${dailyAmountSign}{dailyAmountFormatted}
        </span>
      </div>

      {/* Transaction list */}
      <div className="flex flex-col gap-2">
        {group.transactions.map((transaction, index) => {
          const itemName = transaction.name || transaction.tag?.name || "未命名交易";
          const { sign, colorClass, formatted } = formatAmount(
            transaction.amount,
            transaction.type
          );
          
          // Get iconKey with fallback
          const iconKey = transaction.tag?.iconKey || "tag";

          return (
            <div key={transaction.id}>
              <button
                type="button"
                onClick={() => handleTransactionClick(transaction.id)}
                className="w-full flex items-center justify-between py-2 hover:bg-black/5 transition-colors rounded"
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
                  <span className={`text-sm font-semibold ${colorClass}`}>
                    ${sign}{formatted}
                  </span>
                </div>
              </button>

              {/* Separator line (except for last item) */}
              {index < group.transactions.length - 1 && (
                <div className="border-b border-[#E8E8E8]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
