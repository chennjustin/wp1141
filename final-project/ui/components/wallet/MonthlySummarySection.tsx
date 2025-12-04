/**
 * Monthly summary section component
 * 
 * Displays income and expense totals for the current month
 * with a toggle to show/hide amounts.
 */

"use client";

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
    <section className="rounded-xl bg-white p-4 text-black">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-black">
          {year} 年 {month.toString().padStart(2, "0")} 月
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
          onClick={onToggleAmounts}
          aria-label="Toggle amounts visibility"
        >
          <span className="text-lg text-black relative inline-block">
            {showAmounts ? (
              "👁"
            ) : (
              <span className="relative inline-block">
                <span>👁</span>
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-black text-xl leading-none" style={{ transform: 'rotate(-45deg)' }}>/</span>
                </span>
              </span>
            )}
          </span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-black/70">收入</span>
          <span className="text-xl font-semibold text-black">
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
          <span className="text-xl font-semibold text-black">
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

