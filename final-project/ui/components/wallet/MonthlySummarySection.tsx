/**
 * Monthly summary section component
 * 
 * Displays income and expense totals for the current month
 * with a toggle to show/hide amounts.
 */

"use client";

import { Eye, EyeOff } from "lucide-react";

interface MonthlySummarySectionProps {
  year: number;
  month: number;
  incomeTotal: number;
  expenseTotal: number;
  loading: boolean;
  error: string | null;
  showAmounts: boolean;
  onToggleAmounts: () => void;
}

export function MonthlySummarySection({
  year,
  month,
  incomeTotal,
  expenseTotal,
  loading,
  error,
  showAmounts,
  onToggleAmounts,
}: MonthlySummarySectionProps) {
  return (
    <section className="rounded-xl p-4" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-normal text-gray-500">
          {year} 年 {month.toString().padStart(2, "0")} 月
        </span>
        <button
          type="button"
          className="flex items-center justify-center transition-opacity hover:opacity-70"
          onClick={onToggleAmounts}
          aria-label="Toggle amounts visibility"
        >
          {showAmounts ? (
            <Eye className="text-gray-500 transition-colors" size={20} strokeWidth={2} />
          ) : (
            <EyeOff className="text-gray-500 transition-colors" size={20} strokeWidth={2} />
          )}
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-black/70">收入</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--income-color)' }}>
            {loading ? (
              <span className="text-sm text-black/50">載入中...</span>
            ) : error ? (
              <span className="text-sm text-red-500" title={error}>
                載入失敗
              </span>
            ) : showAmounts ? (
              incomeTotal.toLocaleString()
            ) : (
              "*".repeat(incomeTotal.toString().length || 1)
            )}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 items-end text-right">
          <span className="text-xs text-black/70">支出</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--expense-color)' }}>
            {loading ? (
              <span className="text-sm text-black/50">載入中...</span>
            ) : error ? (
              <span className="text-sm text-red-500" title={error}>
                載入失敗
              </span>
            ) : showAmounts ? (
              expenseTotal.toLocaleString()
            ) : (
              "*".repeat(expenseTotal.toString().length || 1)
            )}
          </span>
        </div>
      </div>
    </section>
  );
}

