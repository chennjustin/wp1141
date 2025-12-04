"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createTransactionAction } from "@/modules/transaction/routes/create-transaction";
import { listTagsAction } from "@/modules/tag/routes/list-tags";
import type { TransactionType } from "@/modules/transaction/domain/transaction.types";

interface Tag {
  id: string;
  name: string;
}

const CURRENCIES = ["TWD", "USD", "EUR", "JPY", "CNY"];

export default function NewTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params.walletId as string;

  useEffect(() => {
    if (!walletId) {
      console.error("WalletId is missing from params");
      router.push("/wallets");
    }
  }, [walletId, router]);

  const [transactionType, setTransactionType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tagId, setTagId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("TWD");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [calculatorDisplay, setCalculatorDisplay] = useState<string>("0");
  const [calculatorExpression, setCalculatorExpression] = useState<string>(""); // 完整運算式顯示
  const [calculatorPreviousValue, setCalculatorPreviousValue] = useState<number | null>(null);
  const [calculatorOperation, setCalculatorOperation] = useState<string | null>(null);
  const [calculatorCurrentInput, setCalculatorCurrentInput] = useState<string>("0"); // 當前輸入的數字
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // 由運算式字串中抓出最後一個數字（給運算用）
  const extractLastNumber = (expr: string): string => {
    const match = expr.match(/([0-9]*\.?[0-9]*)\s*$/);
    const num = match?.[1] ?? "";
    return num || "0";
  };

  // Calculator logic
  const handleCalculatorInput = (value: string) => {
    if (value === "AC") {
      setCalculatorDisplay("0");
      setCalculatorExpression("");
      setCalculatorCurrentInput("0");
      setCalculatorPreviousValue(null);
      setCalculatorOperation(null);
    } else if (value === "←") {
      // 刪除顯示字串最後一個字元
      setCalculatorDisplay((prev) => {
        if (prev.length <= 1) return "0";
        const next = prev.slice(0, -1);
        setCalculatorExpression(next === "0" ? "" : next);
        setCalculatorCurrentInput(extractLastNumber(next));
        return next || "0";
      });
    } else if (value === "OK") {
      // 如果有運算式，先計算結果
      if (calculatorOperation && calculatorPreviousValue !== null) {
        const current = parseFloat(calculatorCurrentInput);
        if (!isNaN(current)) {
          let result = 0;
          switch (calculatorOperation) {
            case "+":
              result = calculatorPreviousValue + current;
              break;
            case "-":
              result = calculatorPreviousValue - current;
              break;
            case "×":
              result = calculatorPreviousValue * current;
              break;
            case "÷":
              result = current !== 0 ? calculatorPreviousValue / current : 0;
              break;
          }
          setAmount(result.toFixed(2));
          setCalculatorDisplay("0");
          setCalculatorExpression("");
          setCalculatorCurrentInput("0");
          setCalculatorPreviousValue(null);
          setCalculatorOperation(null);
        }
      } else {
        // 沒有運算，直接使用當前輸入
        const numValue = parseFloat(calculatorCurrentInput);
        if (!isNaN(numValue) && numValue > 0) {
          setAmount(numValue.toFixed(2));
          setCalculatorDisplay("0");
          setCalculatorExpression("");
          setCalculatorCurrentInput("0");
          setCalculatorPreviousValue(null);
          setCalculatorOperation(null);
        }
      }
    } else {
      // 輸入數字或小數點
      setCalculatorCurrentInput((prev) => {
        let newValue = "";
        if (prev === "0" && value !== ".") {
          newValue = value;
        } else if (value === "." && prev.includes(".")) {
          newValue = prev;
        } else {
          newValue = prev + value;
        }
        // 更新顯示（含運算符號）
        if (calculatorExpression) {
          setCalculatorDisplay(calculatorExpression + newValue);
        } else {
          setCalculatorDisplay(newValue);
        }
        return newValue;
      });
    }
  };

  const handleCalculatorOperation = (op: string) => {
    const current = parseFloat(calculatorCurrentInput);
    if (isNaN(current)) return;

    if (calculatorPreviousValue === null) {
      // First operation - store current value and operation
      setCalculatorPreviousValue(current);
      setCalculatorOperation(op);
      // 顯示運算式：例如 "100 +"
      const expression = `${current} ${op}`;
      setCalculatorExpression(expression);
      setCalculatorDisplay(expression);
      setCalculatorCurrentInput("0");
    } else if (calculatorOperation) {
      // 已經有運算，先計算結果，然後繼續新的運算
      let result = 0;
      switch (calculatorOperation) {
        case "+":
          result = calculatorPreviousValue + current;
          break;
        case "-":
          result = calculatorPreviousValue - current;
          break;
        case "×":
          result = calculatorPreviousValue * current;
          break;
        case "÷":
          result = current !== 0 ? calculatorPreviousValue / current : 0;
          break;
      }
      setCalculatorPreviousValue(result);
      setCalculatorOperation(op);
      // 顯示新的運算式：例如 "300 ×"
      const expression = `${result} ${op}`;
      setCalculatorExpression(expression);
      setCalculatorDisplay(expression);
      setCalculatorCurrentInput("0");
    } else {
      // No previous operation, just set the new one
      setCalculatorPreviousValue(current);
      setCalculatorOperation(op);
      const expression = `${current} ${op}`;
      setCalculatorExpression(expression);
      setCalculatorDisplay(expression);
      setCalculatorCurrentInput("0");
    }
  };

  const handleClear = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setTagId("");
    setName("");
    setCurrency("TWD");
    setAmount("");
    setNote("");
    setCalculatorDisplay("0");
    setCalculatorExpression("");
    setCalculatorCurrentInput("0");
    setCalculatorPreviousValue(null);
    setCalculatorOperation(null);
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
    if (!amount || parseFloat(amount) <= 0) {
      setError("請輸入有效的金額");
      return;
    }
    if (!date) {
      setError("請選擇日期");
      return;
    }

    setLoading(true);

    try {
      const result = await createTransactionAction({
        walletId,
        date: new Date(date).toISOString(),
        amount: parseFloat(amount),
        currency,
        name: name || null,
        note: note || null,
        type: transactionType,
        tagId,
      });

      if (result.success) {
        router.push("/wallets");
      } else {
        setError(result.error?.toString() || "創建交易失敗");
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
      {/* Header Section - Back, Type Toggle, Delete */}
      <header className="relative -mx-4 mb-4 flex items-center justify-between bg-[#D2D2D2] px-4 py-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10"
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
                  ? "bg-black text-white"
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
                  ? "bg-black text-white"
                  : "bg-transparent text-black"
              }`}
            >
              支出
            </button>
          </div>

          {/* Right Side - Delete Icon */}
          <div className="flex flex-col items-end text-right text-xs leading-snug text-black">
            <button
              type="button"
              onClick={handleClear}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10"
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
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col bg-[#D2D2D2]">
          {/* Form area - takes remaining space, notes can grow */}
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col gap-2"
          >
            {/* Date Block */}
            <div className="relative shrink-0">
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
                  <span className="text-sm font-medium text-black">{formatDate(date)}</span>
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
                <div className="absolute z-20 mt-1 w-full rounded-xl bg-white p-2 shadow-lg">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setShowDatePicker(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-black"
                  />
                </div>
              )}
            </div>

            {/* Category + Item Row - Side by Side */}
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {/* Category Dropdown */}
              <div className="relative">
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
                  <div className="absolute z-20 mt-1 w-full rounded-xl bg-white shadow-lg">
                    <div className="max-h-32 overflow-y-auto py-1">
                      {tags.map((tag) => (
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
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Item/Note Input */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="品項/備註"
                className="h-10 w-full rounded-full bg-white px-3 py-2 text-xs text-black placeholder:text-gray-400 shadow-sm"
              />
            </div>

            {/* Currency + Amount Row - Side by Side */}
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {/* Currency Dropdown */}
              <div className="relative">
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
                  <div className="absolute z-20 mt-1 w-full rounded-xl bg-white shadow-lg">
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

              {/* Amount Display - 顯示運算式，可用游標編輯 */}
              <input
                type="text"
                inputMode="decimal"
                value={calculatorDisplay === "0" && !calculatorExpression && !amount ? "" : calculatorDisplay}
                onChange={(e) => {
                  const val = e.target.value;
                  const display = val === "" ? "0" : val;
                  setCalculatorDisplay(display);
                  setCalculatorExpression(display === "0" ? "" : display);
                  setCalculatorCurrentInput(extractLastNumber(display));
                }}
                placeholder="金額"
                className="h-10 w-full rounded-full bg-white px-3 py-2 text-xs text-black placeholder:text-gray-400 shadow-sm text-left"
              />
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
              <div className="shrink-0 rounded-lg bg-red-100 px-2 py-1.5 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 h-10 w-full rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "提交中..." : "提交"}
            </button>
          </form>

          <div className="mt-auto shrink-0 bg-[#D2D2D2] pb-0 pt-10">
          <div className="grid grid-cols-5 gap-2 pb-1">
            {/* Row 1: 7, 8, 9, ÷, AC */}
            <button
              type="button"
              onClick={() => handleCalculatorInput("7")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("8")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("9")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorOperation("÷")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              ÷
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("AC")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              AC
            </button>

            {/* Row 2: 4, 5, 6, ×, ← */}
            <button
              type="button"
              onClick={() => handleCalculatorInput("4")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("5")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("6")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorOperation("×")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              ×
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("←")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              ←
            </button>

            {/* Row 3: 1, 2, 3, ＋, OK */}
            <button
              type="button"
              onClick={() => handleCalculatorInput("1")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("2")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("3")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorOperation("+")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              ＋
            </button>
            {/* OK 佔兩格（兩列） */}
            <button
              type="button"
              onClick={() => handleCalculatorInput("OK")}
              className="row-span-2 flex h-full items-center justify-center rounded-full bg-green-500 text-lg font-medium text-white active:bg-green-600"
            >
              OK
            </button>

            {/* Row 4: 00, 0, ., − */}
            <button
              type="button"
              onClick={() => handleCalculatorInput("00")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              00
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput("0")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorInput(".")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              .
            </button>
            <button
              type="button"
              onClick={() => handleCalculatorOperation("-")}
              className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
            >
              −
            </button>
          </div>
          </div>
        </div>
    </div>
  );
}
