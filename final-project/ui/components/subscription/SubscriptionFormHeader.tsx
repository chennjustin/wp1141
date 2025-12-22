"use client";

import { TagIcon } from "@/ui/utils/tag-icon";
import { getTagColor, formatAmountString } from "@/ui/utils/subscription-utils";
import type { TagWithIcon } from "@/hooks/subscription/useSubscriptionForm";
import type { AmountMode } from "@/hooks/subscription/useSubscriptionForm";

interface SubscriptionFormHeaderProps {
  tag: TagWithIcon;
  amountMode: AmountMode;
  monthlyAmount: string;
  totalAmount: string;
  originalTotalAmount: string;
  calculatorExpression: string;
  showCalculator: boolean;
  calculatorFor: "total" | "monthly";
  calculatedMonthlyAmount: number | null;
  calculatedTotalAmount: number | null;
  onAmountClick: (forWhat: "total" | "monthly") => void;
  onModeChange: (mode: AmountMode) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export function SubscriptionFormHeader({
  tag,
  amountMode,
  monthlyAmount,
  totalAmount,
  originalTotalAmount,
  calculatorExpression,
  showCalculator,
  calculatorFor,
  calculatedMonthlyAmount,
  calculatedTotalAmount,
  onAmountClick,
  onModeChange,
  onBack,
  onSubmit,
  loading,
}: SubscriptionFormHeaderProps) {
  const headerBgColor = getTagColor(tag.iconKey);

  return (
    <div className={`${headerBgColor} -mt-4 px-4 pt-4`}>
      <div className="relative flex items-center justify-between pt-3 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          aria-label="返回"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="完成"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <TagIcon
              iconKey={tag.iconKey}
              size={24}
              color="currentColor"
              className="text-gray-700"
            />
          </div>

          <div className="flex-1">
            <div className="text-black text-sm mb-1">{tag.name}</div>
            {amountMode === "monthly" ? (
              <button
                type="button"
                onClick={() => onAmountClick("monthly")}
                className="text-black text-4xl font-semibold hover:opacity-80 transition-opacity text-left relative"
              >
                <span>
                  {calculatorExpression || formatAmountString(monthlyAmount)}
                </span>
                {showCalculator && calculatorFor === "monthly" && (
                  <span className="inline-block w-0.5 h-8 bg-black ml-1 animate-pulse" />
                )}
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => onAmountClick("total")}
                  className="text-black text-4xl font-semibold hover:opacity-80 transition-opacity text-left relative"
                >
                  <span>
                    {calculatorExpression || (() => {
                      // Use originalTotalAmount if available, otherwise use totalAmount
                      const amountToShow = originalTotalAmount || totalAmount;
                      if (!amountToShow) return formatAmountString("0");
                      
                      // If the amount has decimal places, round to integer
                      const num = parseFloat(amountToShow);
                      if (!isNaN(num)) {
                        const rounded = Math.round(num);
                        return formatAmountString(rounded.toString());
                      }
                      return formatAmountString(amountToShow);
                    })()}
                  </span>
                  {showCalculator && calculatorFor === "total" && (
                    <span className="inline-block w-0.5 h-8 bg-black ml-1 animate-pulse" />
                  )}
                </button>
                {calculatedMonthlyAmount !== null && (
                  <div className="text-black text-sm mt-1">
                    每月: {formatAmountString(calculatedMonthlyAmount.toFixed(2))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Amount Mode Selection */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onModeChange("total")}
            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors rounded ${
              amountMode === "total"
                ? "bg-black/20 text-black"
                : "bg-white/50 text-black/70 hover:bg-white/70"
            }`}
          >
            填寫總金額
          </button>
          <button
            type="button"
            onClick={() => onModeChange("monthly")}
            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors rounded ${
              amountMode === "monthly"
                ? "bg-black/20 text-black"
                : "bg-white/50 text-black/70 hover:bg-white/70"
            }`}
          >
            填寫每月金額
          </button>
        </div>
      </div>
    </div>
  );
}

