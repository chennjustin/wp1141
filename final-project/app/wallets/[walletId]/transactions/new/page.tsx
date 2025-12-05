"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createTransactionAction } from "@/modules/transaction/routes/create-transaction";
import { listTagsAction } from "@/modules/tag/routes/list-tags";
import type { TransactionType } from "@/modules/transaction/domain/transaction.types";
import { CalculatorKeypad } from "@/ui/components/CalculatorKeypad";

interface Tag {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
}

const CURRENCIES = ["TWD", "USD", "EUR", "JPY", "CNY"];

export default function NewTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params.walletId as string;

  useEffect(() => {
    if (!walletId) {
      console.error("WalletId is missing from params");
      // Redirect to /wallets which will automatically redirect to default wallet
      router.push("/wallets");
    }
  }, [walletId, router]);

  const [transactionType, setTransactionType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tagId, setTagId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("TWD");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [calculatorExpression, setCalculatorExpression] = useState<string>(""); // 計算機運算式，用於顯示在金額欄位
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Fetch tags on mount
  useEffect(() => {
    async function fetchTags() {
      try {
        const result = await listTagsAction({ filter: "all" });
        if (result.success && result.data) {
          setTags(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch tags", err);
      }
    }
    fetchTags();
  }, []);

  // Reset tag when transaction type changes
  useEffect(() => {
    setTagId("");
  }, [transactionType]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[data-dropdown="category"]') &&
        !target.closest('[data-dropdown="currency"]') &&
        !target.closest('[data-dropdown="date"]')
      ) {
        setShowCategoryDropdown(false);
        setShowCurrencyDropdown(false);
        setShowDatePicker(false);
      }
    };

    if (showCategoryDropdown || showCurrencyDropdown || showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCategoryDropdown, showCurrencyDropdown, showDatePicker]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString; // Already in HH:mm format
  };

  const handleClear = () => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${minutes}`);
    setTagId("");
    setName("");
    setCurrency("TWD");
    setAmount("");
    setNote("");
    setCalculatorExpression("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!tagId) {
      setError("請選擇分類");
      return;
    }
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setError("請輸入有效的金額");
      return;
    }
    if (!date) {
      setError("請選擇日期");
      return;
    }
    if (!time || !time.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
      setError("請選擇有效的時間");
      return;
    }

    setLoading(true);

    try {
      // Combine date and time into ISO string
      const [hours, minutes] = time.split(":").map(Number);
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes, 0, 0);

      const result = await createTransactionAction({
        walletId,
        date: dateTime.toISOString(),
        amount: parseFloat(amount),
        currency,
        name: name || null,
        note: note || null,
        type: transactionType,
        tagId,
      });

      if (result.success) {
        // Navigate to wallet detail page and refresh data
        router.push(`/wallets/${walletId}`);
        // Use setTimeout to ensure navigation completes before refresh
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const errorMessage = result.error?.toString() || "創建交易失敗";
        setError(errorMessage);
        // Scroll to error message
        setTimeout(() => {
          const errorElement = document.querySelector('[data-error]');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "創建交易失敗");
    } finally {
      setLoading(false);
    }
  };

  const selectedTag = tags.find((t) => t.id === tagId);

  return (
    <div className="flex h-full flex-col">
      {/* Header Section - Back, Type Toggle, Clear */}
      <header className="relative -mx-4 flex items-center justify-between px-4 py-3 bg-[#E8E8E8]">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          aria-label="返回"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Transaction Type Toggle - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0 rounded-full bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setTransactionType("INCOME")}
            className={`rounded-full px-5 py-1.5 text-xs font-medium transition-colors ${
              transactionType === "INCOME"
                ? "bg-green-500 text-white"
                : "bg-transparent text-black"
            }`}
          >
            收入
          </button>
          <button
            type="button"
            onClick={() => setTransactionType("EXPENSE")}
            className={`rounded-full px-5 py-1.5 text-xs font-medium transition-colors ${
              transactionType === "EXPENSE"
                ? "bg-red-500 text-white"
                : "bg-transparent text-black"
            }`}
          >
            支出
          </button>
        </div>

        {/* Right Side - Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          aria-label="清除"
        >
          <svg
            className="h-4 w-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </header>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          {/* Form area - takes remaining space, notes can grow */}
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            {/* Date and Time Block */}
            <div className="relative shrink-0" data-dropdown="date">
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowCategoryDropdown(false);
                  setShowCurrencyDropdown(false);
                }}
                className="flex h-10 w-full items-center justify-between rounded-full bg-white px-4 py-2 text-left shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-black">
                    {formatDate(date)} {formatTime(time)}
                  </span>
                </div>
                <svg
                  className="h-3 w-3 text-gray-400"
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
              </button>
              {showDatePicker && (
                <div className="absolute z-30 mt-1 w-full rounded-xl bg-white p-2 shadow-lg">
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-black"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="w-full rounded-lg bg-black px-4 py-2 text-xs font-medium text-white"
                    >
                      確認
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Category + Item Row - Side by Side */}
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {/* Category Dropdown */}
              <div className="relative" data-dropdown="category">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowCurrencyDropdown(false);
                    setShowDatePicker(false);
                  }}
                  className="flex h-10 w-full items-center justify-between rounded-full bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-xs font-medium text-black">
                    {selectedTag ? selectedTag.name : "分類"}
                  </span>
                  <svg
                    className="h-3 w-3 text-gray-400"
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
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-30 mt-1 w-full rounded-xl bg-white shadow-lg">
                    <div className="max-h-32 overflow-y-auto py-1">
                      {tags.filter((tag) => tag.type === transactionType).length === 0 ? (
                        <div className="px-3 py-2 text-center text-xs text-gray-500">
                          暫無可用分類
                        </div>
                      ) : (
                        tags
                          .filter((tag) => tag.type === transactionType)
                          .map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setTagId(tag.id);
                                setShowCategoryDropdown(false);
                              }}
                              className="flex h-9 w-full items-center px-3 py-1.5 text-left text-xs text-black hover:bg-gray-100"
                            >
                              {tag.name}
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Item Input */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="品項"
                className="h-10 w-full rounded-full bg-white px-3 py-2 text-xs text-black placeholder:text-gray-400 shadow-sm"
              />
            </div>

            {/* Currency + Amount Row - Side by Side */}
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {/* Currency Dropdown */}
              <div className="relative" data-dropdown="currency">
                <button
                  type="button"
                  onClick={() => {
                    setShowCurrencyDropdown(!showCurrencyDropdown);
                    setShowCategoryDropdown(false);
                    setShowDatePicker(false);
                  }}
                  className="flex h-10 w-full items-center justify-between rounded-full bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-xs font-medium text-black">{currency}</span>
                  <svg
                    className="h-3 w-3 text-gray-400"
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
                </button>
                {showCurrencyDropdown && (
                  <div className="absolute z-30 mt-1 w-full rounded-xl bg-white shadow-lg">
                    <div className="py-1">
                      {CURRENCIES.map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => {
                            setCurrency(curr);
                            setShowCurrencyDropdown(false);
                          }}
                          className="flex h-9 w-full items-center px-3 py-1.5 text-left text-xs text-black hover:bg-gray-100"
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Display - 顯示計算機運算式 */}
              <div className="flex h-10 w-full items-center rounded-full bg-white px-3 py-2 shadow-sm">
                <span className={`text-xs font-medium ${
                  calculatorExpression || amount ? "text-black" : "text-gray-400"
                }`}>
                  {calculatorExpression || amount || "金額"}
                </span>
              </div>
            </div>

            {/* Notes - Flexible block that can expand/contract */}
            <div className="flex min-h-[80px] flex-1">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="備註"
                className="h-full w-full rounded-xl bg-white px-3 py-2 text-xs text-black placeholder:text-gray-400 shadow-sm resize-none"
              />
            </div>

            {/* Error message */}
            {error && (
              <div data-error className="shrink-0 rounded-lg bg-red-100 px-2 py-1.5 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`shrink-0 h-10 w-full rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50 ${
                transactionType === "INCOME" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {loading ? "提交中..." : "提交"}
            </button>
          </form>

          <CalculatorKeypad
            onConfirm={(result: number) => {
              setAmount(result.toFixed(2));
            }}
            onExpressionChange={(expr: string) => {
              setCalculatorExpression(expr);
            }}
            clearOnConfirm={true}
          />
        </div>
    </div>
  );
}
