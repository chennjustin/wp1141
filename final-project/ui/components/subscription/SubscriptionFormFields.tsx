"use client";

import { DatePickerField } from "./DatePickerField";
import { CurrencySelector } from "./CurrencySelector";
import { IntervalSelector } from "./IntervalSelector";
import type { IntervalType } from "@/ui/utils/subscription-utils";
import type { CreateTransactionPayerData, CreateTransactionShareData } from "@/modules/transaction/domain/transaction.types";

interface SubscriptionFormFieldsProps {
  name: string;
  startDate: string;
  endDate: string;
  currency: string;
  rateToDefaultCurrency?: string;
  rateMode?: "last" | "manual";
  showRateInput?: boolean;
  walletDefaultCurrency?: string;
  fetchingLastRate?: boolean;
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
  onRateToDefaultCurrencyChange?: (value: string) => void;
  onRateModeChange?: (mode: "last" | "manual") => void;
  onIntervalTypeChange: (type: IntervalType) => void;
  onSelectedUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onCustomIntervalMonthsChange: (value: string) => void;
  onCustomIntervalUnitChange: (unit: "day" | "week" | "month" | "year") => void;
  onToggleStartDatePicker: () => void;
  onToggleEndDatePicker: () => void;
  onToggleCurrencyDropdown: () => void;
  onHideCalculator: () => void;
  selectedPayers?: CreateTransactionPayerData[];
  selectedShares?: CreateTransactionShareData[];
  splitMethod?: "even" | "custom";
  showPayerSelector?: boolean;
  showShareSelector?: boolean;
  onTogglePayerSelector?: () => void;
  onToggleShareSelector?: () => void;
  walletMembers?: Array<{ userId: string; user: { name: string; email?: string | null } }>;
}

export function SubscriptionFormFields({
  name,
  startDate,
  endDate,
  currency,
  rateToDefaultCurrency = "",
  rateMode = "last",
  showRateInput = false,
  walletDefaultCurrency,
  fetchingLastRate = false,
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
  onRateToDefaultCurrencyChange,
  onRateModeChange,
  onIntervalTypeChange,
  onSelectedUnitChange,
  onCustomIntervalMonthsChange,
  onCustomIntervalUnitChange,
  onToggleStartDatePicker,
  onToggleEndDatePicker,
  onToggleCurrencyDropdown,
  onHideCalculator,
  selectedPayers = [],
  selectedShares = [],
  splitMethod = "custom",
  showPayerSelector = false,
  showShareSelector = false,
  onTogglePayerSelector,
  onToggleShareSelector,
  walletMembers = [],
}: SubscriptionFormFieldsProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
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
          <label className="text-xs text-gray-600">明細描述</label>
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

      {/* Exchange Rate - 匯率 (only show if currency differs from wallet default) */}
      {showRateInput && walletDefaultCurrency && onRateToDefaultCurrencyChange && onRateModeChange && (
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <label className="text-xs text-gray-600">匯率</label>
          </div>
          <div className="space-y-2">
            {/* Rate mode selection */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onRateModeChange("last");
                  onRateToDefaultCurrencyChange("");
                }}
                className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
                  rateMode === "last"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-200 hover:border-gray-400"
                }`}
              >
                使用上次匯率
              </button>
              <button
                type="button"
                onClick={() => {
                  onRateModeChange("manual");
                  onRateToDefaultCurrencyChange("");
                }}
                className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
                  rateMode === "manual"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-200 hover:border-gray-400"
                }`}
              >
                手動輸入
              </button>
            </div>
            {/* Rate input */}
            {rateMode === "last" ? (
              <div className="h-10 px-3 bg-gray-50 border-b border-gray-200 flex items-center">
                {fetchingLastRate ? (
                  <span className="text-sm text-gray-500">載入中...</span>
                ) : rateToDefaultCurrency ? (
                  <span className="text-sm text-black">
                    1 {currency} = {parseFloat(rateToDefaultCurrency).toLocaleString()} {walletDefaultCurrency}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">沒有找到上次使用的匯率</span>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateToDefaultCurrency}
                  onChange={(e) => onRateToDefaultCurrencyChange(e.target.value)}
                  onFocus={onHideCalculator}
                  placeholder={`1 ${currency} = ? ${walletDefaultCurrency}`}
                  className="w-full h-10 px-3 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
                />
                <p className="text-xs text-gray-500 px-3">
                  1 {currency} = ? {walletDefaultCurrency}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interval Type */}
      <IntervalSelector
        intervalType={intervalType}
        selectedUnit={selectedUnit}
        customIntervalMonths={customIntervalMonths}
        customIntervalUnit={customIntervalUnit}
        onUnitChange={(unit) => {
          onSelectedUnitChange(unit);
          onIntervalTypeChange(unit);
          onCustomIntervalUnitChange(unit);
        }}
        onCustomChange={onCustomIntervalMonthsChange}
        onCustomUnitChange={onCustomIntervalUnitChange}
        onSetCustom={() => {
          onIntervalTypeChange("custom");
          onCustomIntervalUnitChange(selectedUnit);
        }}
        onHideCalculator={onHideCalculator}
      />

      {/* Payer - 誰先付錢 */}
      {onTogglePayerSelector && (
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
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <label className="text-xs text-gray-600">誰先付錢</label>
          </div>
          <button
            type="button"
            onClick={onTogglePayerSelector}
            className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
          >
            <span className="text-sm text-black">
              {selectedPayers.length > 0
                ? selectedPayers.length === 1
                  ? walletMembers.find((m) => m.userId === selectedPayers[0].payerId)?.user.name || "已選擇"
                  : `${selectedPayers.length} 人`
                : "我自己"}
            </span>
            <div className="flex items-center gap-2">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Share - 如何分 */}
      {onToggleShareSelector && (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <label className="text-xs text-gray-600">如何分</label>
          </div>
          <button
            type="button"
            onClick={onToggleShareSelector}
            className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
          >
            <span className="text-sm text-black">
              {splitMethod === "even" ? "平均分攤" : "自訂金額"}
            </span>
            <div className="flex items-center gap-2">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

