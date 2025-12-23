"use client";

import { DatePickerField } from "./DatePickerField";
import { CurrencySelector } from "./CurrencySelector";
import { IntervalSelector } from "./IntervalSelector";
import type { IntervalType } from "@/ui/utils/subscription-utils";

interface SubscriptionFormFieldsProps {
  name: string;
  startDate: string;
  endDate: string;
  currency: string;
  intervalType: IntervalType;
  selectedUnit: "day" | "week" | "month" | "year";
  customIntervalMonths: string;
  customIntervalUnit: "day" | "week" | "month" | "year";
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  showCurrencyDropdown: boolean;
  onNameChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onIntervalTypeChange: (type: IntervalType) => void;
  onSelectedUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onCustomIntervalMonthsChange: (value: string) => void;
  onCustomIntervalUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onToggleStartDatePicker: () => void;
  onToggleEndDatePicker: () => void;
  onToggleCurrencyDropdown: () => void;
  onHideCalculator: () => void;
}

export function SubscriptionFormFields({
  name,
  startDate,
  endDate,
  currency,
  intervalType,
  selectedUnit,
  customIntervalMonths,
  customIntervalUnit,
  showStartDatePicker,
  showEndDatePicker,
  showCurrencyDropdown,
  onNameChange,
  onStartDateChange,
  onEndDateChange,
  onCurrencyChange,
  onIntervalTypeChange,
  onSelectedUnitChange,
  onCustomIntervalMonthsChange,
  onCustomIntervalUnitChange,
  onToggleStartDatePicker,
  onToggleEndDatePicker,
  onToggleCurrencyDropdown,
  onHideCalculator,
}: SubscriptionFormFieldsProps) {
  return (
    <div className="flex-1 px-4 py-4 space-y-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Description */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <label className="text-xs text-gray-600">款項</label>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onFocus={onHideCalculator}
          placeholder="編輯描述"
          className="w-full h-10 px-3 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Start Date and End Date */}
      <div className="grid grid-cols-2 gap-3">
        <DatePickerField
          label="開始扣款日期"
          value={startDate}
          onChange={onStartDateChange}
          isOpen={showStartDatePicker}
          onToggle={onToggleStartDatePicker}
          dropdownId="startDate"
        />
        <DatePickerField
          label="結束日期"
          value={endDate}
          minDate={startDate}
          onChange={onEndDateChange}
          onSetPermanent={() => {
            onEndDateChange("");
            onToggleEndDatePicker();
          }}
          isOpen={showEndDatePicker}
          onToggle={onToggleEndDatePicker}
          dropdownId="endDate"
        />
      </div>

      {/* Currency */}
      <CurrencySelector
        value={currency}
        onChange={onCurrencyChange}
        isOpen={showCurrencyDropdown}
        onToggle={onToggleCurrencyDropdown}
      />

      {/* Interval Type */}
      <IntervalSelector
        intervalType={intervalType}
        selectedUnit={selectedUnit}
        customIntervalMonths={customIntervalMonths}
        customIntervalUnit={customIntervalUnit}
        startDate={startDate}
        onUnitChange={(unit) => {
          onSelectedUnitChange(unit);
          onIntervalTypeChange(unit);
          onCustomIntervalUnitChange(unit);
        }}
        onCustomChange={onCustomIntervalMonthsChange}
        onCustomUnitChange={onCustomIntervalUnitChange}
        onHideCalculator={onHideCalculator}
      />
    </div>
  );
}

