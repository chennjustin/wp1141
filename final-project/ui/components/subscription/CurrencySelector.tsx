"use client";

import { CURRENCIES } from "@/ui/utils/subscription-utils";

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function CurrencySelector({
  value,
  onChange,
  isOpen,
  onToggle,
}: CurrencySelectorProps) {
  return (
    <div className="relative" data-dropdown="currency">
      <div className="flex items-center gap-2 mb-2">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <label className="text-xs text-gray-600">幣別</label>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
      >
        <span className="text-sm text-black">{value}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
          <div className="py-1">
            {CURRENCIES.map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => {
                  onChange(curr);
                  onToggle();
                }}
                className="flex h-9 w-full items-center px-3 text-left text-sm text-black hover:bg-gray-100 transition-colors"
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

