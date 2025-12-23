"use client";

import { useState, useMemo, useEffect } from "react";
import type { IntervalType } from "@/ui/utils/subscription-utils";

interface IntervalSelectorProps {
  intervalType: IntervalType;
  selectedUnit: "day" | "week" | "month" | "year";
  customIntervalMonths: string;
  customIntervalUnit: "day" | "week" | "month" | "year";
  startDate: string;
  onUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onCustomChange: (value: string) => void;
  onCustomUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onHideCalculator: () => void;
}

export function IntervalSelector({
  intervalType,
  selectedUnit,
  customIntervalMonths,
  customIntervalUnit,
  startDate,
  onUnitChange,
  onCustomChange,
  onCustomUnitChange,
  onHideCalculator,
}: IntervalSelectorProps) {
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const unitLabels: Record<"day" | "week" | "month" | "year", string> = {
    day: "日",
    week: "週",
    month: "月",
    year: "年",
  };

  const weekdayLabels = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

  // Get the current interval value (default to 1 if empty)
  const intervalValue = customIntervalMonths || "1";
  const currentUnit = intervalType === "custom" ? customIntervalUnit : selectedUnit;

  // Parse startDate to get day, month, and weekday
  const { day, month, weekday } = useMemo(() => {
    if (!startDate) {
      return { day: 1, month: 1, weekday: 0 };
    }

    const dateParts = startDate.split("-");
    if (dateParts.length !== 3) {
      return { day: 1, month: 1, weekday: 0 };
    }

    const year = parseInt(dateParts[0], 10);
    const monthNum = parseInt(dateParts[1], 10) - 1;
    const dayNum = parseInt(dateParts[2], 10);

    const date = new Date(year, monthNum, dayNum);
    if (isNaN(date.getTime())) {
      return { day: 1, month: 1, weekday: 0 };
    }

    // getDay() returns 0 (Sunday) to 6 (Saturday)
    // We need to convert to 0 (Monday) to 6 (Sunday)
    let weekdayNum = date.getDay() - 1;
    if (weekdayNum < 0) weekdayNum = 6; // Sunday becomes 6

    return { day: dayNum, month: monthNum + 1, weekday: weekdayNum };
  }, [startDate]);

  const [selectedDay, setSelectedDay] = useState(day);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedWeekday, setSelectedWeekday] = useState(weekday);

  // Update selected day, month, and weekday when startDate changes
  useEffect(() => {
    if (startDate) {
      const dateParts = startDate.split("-");
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const monthNum = parseInt(dateParts[1], 10) - 1;
        const dayNum = parseInt(dateParts[2], 10);
        const date = new Date(year, monthNum, dayNum);
        if (!isNaN(date.getTime())) {
          setSelectedDay(dayNum);
          setSelectedMonth(monthNum + 1);
          let weekdayNum = date.getDay() - 1;
          if (weekdayNum < 0) weekdayNum = 6;
          setSelectedWeekday(weekdayNum);
        }
      }
    }
  }, [startDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown="unit"]')) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Handle unit selection
  const handleUnitSelect = (unit: "day" | "week" | "month" | "year") => {
    onUnitChange(unit);
    onCustomUnitChange(unit);
    setShowUnitDropdown(false);
    onHideCalculator();
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
        <label className="text-xs text-gray-600">扣款頻率</label>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-700 h-10 flex items-center">每</span>
        <input
          type="number"
          value={intervalValue}
          onChange={(e) => {
            const value = e.target.value;
            onCustomChange(value);
          }}
          onFocus={onHideCalculator}
          min="1"
          step="1"
          className="w-16 h-10 px-3 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400 text-center"
        />
        <div className="relative" data-dropdown="unit">
          <button
            type="button"
            onClick={() => {
              setShowUnitDropdown(!showUnitDropdown);
              onHideCalculator();
            }}
            className="flex h-10 items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
          >
            <span className="text-sm text-black">{unitLabels[currentUnit]}</span>
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showUnitDropdown && (
            <div className="absolute z-[60] mt-1 bg-white border border-gray-200 shadow-lg min-w-[80px]">
              <div className="py-1">
                {(["day", "week", "month", "year"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleUnitSelect(unit)}
                    className="flex h-9 w-full items-center px-3 text-left text-sm text-black hover:bg-gray-100 transition-colors"
                  >
                    {unitLabels[unit]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Show "的" and date/weekday text for week, month, year */}
        {currentUnit !== "day" && (
          <>
            <span className="text-sm text-gray-700 h-10 flex items-center">的</span>
            {currentUnit === "week" && (
              <span className="text-sm text-gray-700 h-10 flex items-center">
                {weekdayLabels[selectedWeekday]}
              </span>
            )}
            {currentUnit === "month" && (
              <span className="text-sm text-gray-700 h-10 flex items-center">
                {selectedDay} 號
              </span>
            )}
            {currentUnit === "year" && (
              <span className="text-sm text-gray-700 h-10 flex items-center">
                {selectedMonth}/{selectedDay}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
