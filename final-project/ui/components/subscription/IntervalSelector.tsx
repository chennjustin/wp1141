"use client";

import type { IntervalType } from "@/ui/utils/subscription-utils";

interface IntervalSelectorProps {
  intervalType: IntervalType;
  selectedUnit: "day" | "week" | "month" | "year";
  customIntervalMonths: string;
  customIntervalUnit: "day" | "week" | "month" | "year";
  onUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onCustomChange: (value: string) => void;
  onCustomUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onSetCustom: () => void;
  onHideCalculator: () => void;
}

export function IntervalSelector({
  intervalType,
  selectedUnit,
  customIntervalMonths,
  customIntervalUnit,
  onUnitChange,
  onCustomChange,
  onCustomUnitChange,
  onSetCustom,
  onHideCalculator,
}: IntervalSelectorProps) {
  const unitLabels: Record<"day" | "week" | "month" | "year", string> = {
    day: "日",
    week: "週",
    month: "月",
    year: "年",
  };

  const customPlaceholders: Record<"day" | "week" | "month" | "year", string> = {
    day: "天數",
    week: "週數",
    month: "月數",
    year: "年數",
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <label className="text-xs text-gray-600">扣款週期</label>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {(["day", "week", "month", "year"] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => {
                onUnitChange(unit);
                onCustomUnitChange(unit);
              }}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                intervalType !== "custom" && selectedUnit === unit
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {unitLabels[unit]}
            </button>
          ))}
        </div>
        {intervalType === "custom" && (
          <div className="space-y-2">
            <input
              type="number"
              value={customIntervalMonths}
              onChange={(e) => onCustomChange(e.target.value)}
              onFocus={onHideCalculator}
              placeholder={customPlaceholders[customIntervalUnit]}
              min="0.1"
              step="0.1"
              className="w-full h-10 px-3 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
            />
          </div>
        )}
        <button
          type="button"
          onClick={onSetCustom}
          className={`w-full px-3 py-1.5 text-sm font-medium transition-colors ${
            intervalType === "custom"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          自訂
        </button>
      </div>
    </div>
  );
}

