/**
 * Daily transactions section component
 * 
 * Displays a list of transactions for the current day.
 */

"use client";

import type { DisplayTransaction } from "@/hooks/useWalletHome";

interface DailyTransactionsSectionProps {
  transactions: DisplayTransaction[];
  loading: boolean;
  error: string | null;
}

export function DailyTransactionsSection({
  transactions,
  loading,
  error,
}: DailyTransactionsSectionProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-4 text-sm">
      <h2 className="mb-2 text-sm font-medium text-black">當天款項</h2>
      <div className="mt-1 flex-1 overflow-y-auto">
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
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">今天還沒有交易記錄</span>
          </div>
        ) : (
          <ul>
            {transactions.map((tx, index) => (
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
                {index < transactions.length - 1 && (
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

