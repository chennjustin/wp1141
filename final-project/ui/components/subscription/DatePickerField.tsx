"use client";

import { formatDate } from "@/ui/utils/subscription-utils";

interface DatePickerFieldProps {
  label: string;
  value: string;
  minDate?: string;
  onChange: (value: string) => void;
  onSetPermanent?: () => void;
  isOpen: boolean;
  onToggle: () => void;
  dropdownId: string;
}

export function DatePickerField({
  label,
  value,
  minDate,
  onChange,
  onSetPermanent,
  isOpen,
  onToggle,
  dropdownId,
}: DatePickerFieldProps) {
  return (
    <div className="relative" data-dropdown={dropdownId}>
      <div className="flex items-center gap-2 mb-2">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <label className="text-xs text-gray-600">{label}</label>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
      >
        <span className="text-sm text-black">
          {value ? formatDate(value) : onSetPermanent ? "永久" : "選擇日期"}
        </span>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {onSetPermanent ? (
            <div className="space-y-3">
              <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={minDate}
                className="w-full h-9 px-2 border border-gray-200 text-sm text-black focus:outline-none focus:border-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  onSetPermanent();
                }}
                className="w-full h-9 bg-gray-100 text-black text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                設為永久
              </button>
            </div>
          ) : (
            <input
              type="date"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              min={minDate}
              className="w-full h-9 px-2 border border-gray-200 text-sm text-black focus:outline-none focus:border-gray-400"
            />
          )}
        </div>
      )}
    </div>
  );
}

