/**
 * Daily transactions section component
 * 
 * Displays a list of transactions for a specific date with day navigation.
 * Users can navigate to previous/next day to view transactions.
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { History, Calendar } from "lucide-react";
import { useDailyTransactions } from "@/hooks/useDailyTransactions";
import type { DisplayTransaction } from "@/hooks/useWalletHome";
import type { Transaction } from "@/modules/transaction/domain/transaction.types";

interface DailyTransactionsSectionProps {
  walletId: string;
}

/**
 * Convert Transaction to DisplayTransaction format
 * 
 * Transforms the Transaction entity from the API into the display format
 * used by the UI component, including title, amount, and time formatting.
 */
function transformTransactionToDisplay(tx: Transaction): DisplayTransaction {
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
}

export function DailyTransactionsSection({
  walletId,
}: DailyTransactionsSectionProps) {
  const router = useRouter();
  
  // Get current date for default selection and comparison
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // State for selected date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Fetch transactions for selected date
  const {
    data: dailyTransactions,
    loading,
    error,
  } = useDailyTransactions({
    walletId,
    date: selectedDate,
    enabled: !!walletId,
  });

  // Transform transactions for display
  const displayTransactions = useMemo(() => {
    return dailyTransactions.map(transformTransactionToDisplay);
  }, [dailyTransactions]);

  // Check if selected date is today
  const isToday = useMemo(() => {
    return selectedDate.getTime() === today.getTime();
  }, [selectedDate, today]);

  // Format date label (month and day only)
  const dateLabel = useMemo(() => {
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    return `${month} 月 ${day} 日`;
  }, [selectedDate]);

  // Handle previous day navigation
  const handlePreviousDay = () => {
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setSelectedDate(previousDate);
  };

  // Handle next day navigation
  const handleNextDay = () => {
    if (isToday) {
      return; // Disabled when at today
    }
    
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Don't allow navigating to future dates
    // Only allow if nextDate is today or in the past
    if (nextDate.getTime() <= today.getTime()) {
      setSelectedDate(nextDate);
    }
  };

  // Handle view history button click
  const handleViewHistory = () => {
    router.push(`/wallets/${walletId}/history`);
  };

  // Handle back to today button click
  const handleBackToToday = () => {
    setSelectedDate(today);
  };

  // Get empty state message based on selected date
  const getEmptyMessage = () => {
    if (isToday) {
      return "今天還沒有交易記錄";
    }
    return "當天還沒有交易記錄";
  };

  return (
    <section className="relative flex min-h-0 flex-1 flex-col rounded-xl pl-4 pr-2 pt-4 pb-4 text-sm" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
      <div className="mb-2 flex items-center justify-between pr-2">
        <span className="text-sm font-normal text-gray-600">明細</span>
        <div className="relative flex items-center gap-3">
          {/* Previous day button */}
          <button
            type="button"
            onClick={handlePreviousDay}
            className="flex items-center justify-center text-sm font-medium text-black hover:bg-black/5 rounded transition-colors"
            aria-label="Previous day"
          >
            ◀
          </button>

          {/* Date label */}
          <h2 className={`text-sm font-medium transition-colors ${
            isToday ? "text-black" : "text-blue-600"
          }`}>
            {dateLabel}
          </h2>

          {/* Next day button */}
          <button
            type="button"
            onClick={handleNextDay}
            disabled={isToday}
            className={`flex items-center justify-center text-sm font-medium rounded transition-colors ${
              isToday
                ? "text-black/30 cursor-not-allowed"
                : "text-black hover:bg-black/5"
            }`}
            aria-label="Next day"
          >
            ▶
          </button>
          
          {/* Back to today button - only show when not on today, absolute positioned */}
          {!isToday && (
            <button
              type="button"
              className="absolute left-full ml-5 flex items-center justify-center transition-opacity hover:opacity-70"
              onClick={handleBackToToday}
              aria-label="Return to today"
            >
              <Calendar className="text-gray-500 transition-colors" size={16} strokeWidth={2} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleViewHistory}
          className="flex items-center justify-center transition-opacity hover:opacity-70"
          aria-label="View transaction history"
        >
          <History className="text-gray-500 transition-colors" size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto pr-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">載入中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-red-500" title={error}>
              載入失敗
            </span>
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">{getEmptyMessage()}</span>
          </div>
        ) : (
          <ul className="pr-2">
            {displayTransactions.map((tx, index) => (
              <li key={tx.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-black">{tx.title}</span>
                    <span className="text-xs text-black/50">{tx.time}</span>
                  </div>
                  <span
                    className={`text-sm font-semibold text-black ${
                      tx.amount >= 0 ? "" : ""
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : "-"}
                    {Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
                {index < displayTransactions.length - 1 && (
                  <div className="border-b border-[#E8E8E8]" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

