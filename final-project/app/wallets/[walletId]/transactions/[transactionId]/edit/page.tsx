"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getTransactionAction } from "@/modules/transaction/routes/get-transaction";
import { updateTransactionAction } from "@/modules/transaction/routes/update-transaction";
import { deleteTransactionAction } from "@/modules/transaction/routes/delete-transaction";
import { listTagsAction } from "@/modules/tag/routes/list-tags";
import type { TransactionType, Transaction } from "@/modules/transaction/domain/transaction.types";
import { CalculatorKeypad } from "@/ui/components/CalculatorKeypad";
import { TagIcon } from "@/ui/utils/tag-icon";
import { useWallet } from "@/hooks/useWallet";

/**
 * Tag with iconKey (extended interface for UI)
 */
interface TagWithIcon {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  iconKey: string;
}

/**
 * Get tag background color based on iconKey
 */
function getTagColor(iconKey: string): string {
  const colorMap: Record<string, string> = {
    // Default
    tag: "bg-gray-100",
    
    // System expense tags (Full IDs only)
    "system-tag-food": "bg-orange-100",
    "system-tag-drinks": "bg-amber-100",
    "system-tag-entertainment": "bg-purple-100",
    "system-tag-transportation": "bg-blue-100",
    "system-tag-shopping": "bg-sky-100",
    "system-tag-bills": "bg-amber-100",
    "system-tag-healthcare": "bg-red-100",
    "system-tag-education": "bg-indigo-100",
    "system-tag-travel": "bg-cyan-100",
    "system-tag-other": "bg-slate-200",
    
    // System income tags (Full IDs only)
    "system-tag-salary": "bg-green-100",
    "system-tag-bonus": "bg-emerald-100",
    "system-tag-investment": "bg-teal-100",
    "system-tag-gift": "bg-pink-100",
  };
  return colorMap[iconKey] || "bg-gray-100";
}

const CURRENCIES = ["TWD", "USD", "EUR", "JPY", "CNY"];

/**
 * Edit Transaction page
 * 
 * This page allows users to edit an existing transaction.
 * Users can modify all fields, change the tag, and delete the transaction.
 */
export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const walletId = params.walletId as string;
  const transactionId = params.transactionId as string;

  // Get tagId and type from URL parameters (when returning from tag selection)
  const tagIdFromUrl = searchParams.get("tagId");
  const typeFromUrl = searchParams.get("type") as TransactionType | null;
  
  // Get source page from URL parameters (where user came from)
  const fromPage = searchParams.get("from") || "home"; // Default to "home" if not specified

  // State for transaction data
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingTransaction, setFetchingTransaction] = useState(true);

  // Form state
  const [transactionType, setTransactionType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [tagId, setTagId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("TWD");
  const [rateToDefaultCurrency, setRateToDefaultCurrency] = useState<string>("");
  const [rateMode, setRateMode] = useState<"last" | "manual" | "current">("last");
  const [rateInputError, setRateInputError] = useState<string | null>(null);
  const [fetchingCurrentRate, setFetchingCurrentRate] = useState(false);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<TagWithIcon | null>(null);
  const [fetchingTag, setFetchingTag] = useState(false);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showRateInput, setShowRateInput] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorExpression, setCalculatorExpression] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fetchingLastRate, setFetchingLastRate] = useState(false);

  // Get wallet information
  const { wallet, loading: walletLoading } = useWallet(walletId);

  // Fetch transaction data on mount
  useEffect(() => {
    async function fetchTransaction() {
      try {
        const result = await getTransactionAction(transactionId);
        if (result.success && result.data) {
          const tx = result.data;
          setTransaction(tx);
          
          // Pre-fill form fields
          setTransactionType(tx.type);
          setTagId(tx.tagId);
          
          // Format date and time
          const txDate = new Date(tx.date);
          const year = txDate.getFullYear();
          const month = String(txDate.getMonth() + 1).padStart(2, "0");
          const day = String(txDate.getDate()).padStart(2, "0");
          setDate(`${year}-${month}-${day}`);
          
          const hours = String(txDate.getHours()).padStart(2, "0");
          const minutes = String(txDate.getMinutes()).padStart(2, "0");
          setTime(`${hours}:${minutes}`);
          
          setName(tx.name || "");
          setCurrency(tx.currency);
          if (tx.rateToDefaultCurrency) {
            setRateToDefaultCurrency(tx.rateToDefaultCurrency.toString());
            setRateMode("manual");
          } else {
            setRateToDefaultCurrency("");
            setRateMode("last");
          }
          setAmount(tx.amount.toString());
          setNote(tx.note || "");
          
          // Set selected tag
          setSelectedTag({
            id: tx.tag.id,
            name: tx.tag.name,
            type: tx.type,
            iconKey: tx.tag.iconKey,
          });
        } else {
          setError(result.error?.toString() || "無法載入交易資料");
        }
      } catch (err) {
        console.error("Failed to fetch transaction", err);
        setError(err instanceof Error ? err.message : "載入失敗");
      } finally {
        setFetchingTransaction(false);
      }
    }
    fetchTransaction();
  }, [transactionId]);

  // Handle tag change from URL parameters (when returning from tag selection)
  useEffect(() => {
    if (tagIdFromUrl && typeFromUrl && transaction) {
      setTagId(tagIdFromUrl);
      setTransactionType(typeFromUrl);
      fetchTagById(tagIdFromUrl);
    }
  }, [tagIdFromUrl, typeFromUrl, transaction]);

  // Show/hide rate input based on currency and wallet default currency
  useEffect(() => {
    if (wallet && currency) {
      setShowRateInput(currency !== wallet.defaultCurrency);
      if (currency === wallet.defaultCurrency) {
        setRateToDefaultCurrency("");
        setRateMode("last");
      }
    }
  }, [wallet, currency]);

  // Fetch last exchange rate when currency changes or rateMode is "last"
  useEffect(() => {
    async function fetchLastRate() {
      if (!wallet || !currency || currency === wallet.defaultCurrency || rateMode !== "last") {
        return;
      }

      setFetchingLastRate(true);
      try {
        const response = await fetch(`/api/transactions/last-rate?walletId=${walletId}&currency=${currency}`);
        if (response.ok) {
          const data = await response.json();
          if (data.rateToDefaultCurrency) {
            setRateToDefaultCurrency(data.rateToDefaultCurrency.toString());
          } else {
            setRateToDefaultCurrency("");
          }
        } else {
          setRateToDefaultCurrency("");
        }
      } catch (err) {
        console.error("Failed to fetch last rate", err);
        setRateToDefaultCurrency("");
      } finally {
        setFetchingLastRate(false);
      }
    }

    fetchLastRate();
  }, [wallet, currency, rateMode, walletId]);

  // Fetch current exchange rate when currency changes and rateMode is "manual" or "current"
  useEffect(() => {
    async function fetchCurrentRate() {
      if (!wallet || !currency || currency === wallet.defaultCurrency || (rateMode !== "manual" && rateMode !== "current")) {
        if (rateMode !== "current") {
          setCurrentRate(null);
        }
        return;
      }

      setFetchingCurrentRate(true);
      try {
        const response = await fetch(`/api/transactions/current-rate?from=${currency}&to=${wallet.defaultCurrency}`);
        if (response.ok) {
          const data = await response.json();
          if (data.rate) {
            setCurrentRate(data.rate);
            // If in "current" mode, automatically set the rate
            if (rateMode === "current") {
              setRateToDefaultCurrency(data.rate.toString());
            }
          } else {
            setCurrentRate(null);
            if (rateMode === "current") {
              setRateToDefaultCurrency("");
            }
          }
        } else {
          setCurrentRate(null);
          if (rateMode === "current") {
            setRateToDefaultCurrency("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch current rate", err);
        setCurrentRate(null);
        if (rateMode === "current") {
          setRateToDefaultCurrency("");
        }
      } finally {
        setFetchingCurrentRate(false);
      }
    }

    fetchCurrentRate();
  }, [wallet, currency, rateMode]);

  // Fetch tag by ID
  async function fetchTagById(tagIdToFetch: string) {
    setFetchingTag(true);
    try {
      const result = await listTagsAction({ filter: "all" });
      if (result.success && result.data) {
        const tags = result.data as unknown as TagWithIcon[];
        const tag = tags.find((t) => t.id === tagIdToFetch);
        if (tag) {
          setSelectedTag(tag);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tag", err);
    } finally {
      setFetchingTag(false);
    }
  }

  // Auto-save calculator expression when clicking outside calculator
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // If calculator is open and user clicks outside, save the expression
      if (showCalculator && calculatorExpression) {
        if (!target.closest('[data-calculator]')) {
          try {
            const { evaluate } = require("@/lib/calculator");
            const result = evaluate(calculatorExpression);
            if (!isNaN(result) && isFinite(result)) {
              setAmount(result.toFixed(2));
              setCalculatorExpression("");
            }
          } catch {
            // If expression is invalid, just clear it
            setCalculatorExpression("");
          }
          setShowCalculator(false);
        }
      }
      
      // Close dropdowns when clicking outside (but not inside the dropdown itself)
      if (
        !target.closest('[data-dropdown="currency"]') &&
        !target.closest('[data-dropdown="date"]')
      ) {
        setShowCurrencyDropdown(false);
        // Only close date picker if clicking outside, not when interacting with date inputs
        if (!target.closest('input[type="date"]') && !target.closest('input[type="time"]')) {
          setShowDatePicker(false);
        }
      }
    };

    if (showCalculator || showCurrencyDropdown || showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCalculator, showCurrencyDropdown, showDatePicker, calculatorExpression]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Format amount for display
  const formatAmount = (amountString: string) => {
    if (!amountString) return "$0";
    const num = parseFloat(amountString);
    if (isNaN(num)) return "$0";
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Validate rate input: accepts integers or decimals with max 2 decimal places
  const validateRateInput = (value: string): boolean => {
    if (!value || value.trim() === "") {
      return true; // Empty is valid (will be handled by form validation)
    }
    // Check if it's a valid number
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return false;
    }
    // Check decimal places (max 2)
    const decimalParts = value.split(".");
    if (decimalParts.length > 2) {
      return false; // Multiple decimal points
    }
    if (decimalParts.length === 2 && decimalParts[1].length > 2) {
      return false; // More than 2 decimal places
    }
    return true;
  };

  // Handle rate input change with validation
  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRateInputError(null);
    
    if (validateRateInput(value)) {
      setRateToDefaultCurrency(value);
    } else {
      setRateInputError("輸入格式錯誤");
      // Still update the value so user can see what they typed, but show error
      setRateToDefaultCurrency(value);
    }
  };

  // Hide calculator when other fields are focused
  const handleHideCalculator = () => {
    setShowCalculator(false);
    setShowDatePicker(false);
    setShowCurrencyDropdown(false);
  };

  // Show calculator when amount is clicked
  const handleAmountClick = () => {
    // If there's an existing amount, set it as calculator expression for continued editing
    if (amount && !calculatorExpression) {
      // Remove formatting symbols ($ and commas), keep only numbers
      const cleanAmount = amount.replace(/[$,]/g, '');
      setCalculatorExpression(cleanAmount);
    }
    setShowCalculator(true);
    setShowDatePicker(false);
    setShowCurrencyDropdown(false);
  };

  // Handle tag click - navigate to tag selection page
  const handleTagClick = () => {
    router.push(`/wallets/${walletId}/transactions/${transactionId}/edit/tag?from=${fromPage}`);
  };

  // Navigate back to the source page
  const navigateBack = () => {
    if (fromPage === "history") {
      router.push(`/wallets/${walletId}/history`);
    } else {
      // Default to home page
      router.push(`/wallets/${walletId}`);
    }
  };

  // Handle back button - navigate back to source page
  const handleBack = () => {
    navigateBack();
  };

  // Handle form submission
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
    // Validate rate input if in manual mode and rate is required
    if (showRateInput && rateMode === "manual" && rateInputError) {
      setError("匯率輸入格式錯誤");
      return;
    }
    if (showRateInput && rateMode === "manual" && rateToDefaultCurrency) {
      if (!validateRateInput(rateToDefaultCurrency)) {
        setError("匯率輸入格式錯誤");
        return;
      }
    }

    setLoading(true);

    try {
      // Combine date and time into ISO string
      const [hours, minutes] = time.split(":").map(Number);
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes, 0, 0);

      // Determine rateToDefaultCurrency
      let finalRateToDefaultCurrency: number | null = null;
      if (showRateInput && rateToDefaultCurrency) {
        const parsedRate = parseFloat(rateToDefaultCurrency);
        if (!isNaN(parsedRate) && parsedRate > 0) {
          finalRateToDefaultCurrency = parsedRate;
        }
      }

      const result = await updateTransactionAction(transactionId, {
        date: dateTime.toISOString(),
        amount: parseFloat(amount),
        currency,
        rateToDefaultCurrency: finalRateToDefaultCurrency,
        name: name || null,
        note: note || null,
        type: transactionType,
        tagId,
      });

      if (result.success) {
        navigateBack();
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const errorMessage = result.error?.toString() || "更新交易失敗";
        setError(errorMessage);
        setTimeout(() => {
          const errorElement = document.querySelector('[data-error]');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新交易失敗");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const result = await deleteTransactionAction(transactionId);

      if (result.success) {
        navigateBack();
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const errorMessage = result.error?.toString() || "刪除交易失敗";
        setError(errorMessage);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除交易失敗");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (fetchingTransaction) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-gray-500">載入中...</span>
      </div>
    );
  }

  if (!transaction || error) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">{error || "無法載入交易資料"}</span>
      </div>
    );
  }

  if (fetchingTag || !selectedTag) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-gray-500">載入中...</span>
      </div>
    );
  }

  // Use tag background color for header
  const headerBgColor = selectedTag ? getTagColor(selectedTag.iconKey) : "bg-gray-100";

  return (
    <div className="flex h-full flex-col relative -mx-4">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Form area */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Combined Header and Amount Section - Full width continuous block (區塊 A) - Extends to top edge */}
          <div className={`${headerBgColor} -mt-4 px-4 pt-4`}>
            {/* Header row with back and checkmark */}
            <div className="relative flex items-center justify-between pt-3 pb-2">
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
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

              {/* Checkmark/Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
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

            {/* Amount Section - Compact */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3">
                {/* Tag Icon - Clickable to change tag */}
                <button
                  type="button"
                  onClick={handleTagClick}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white hover:opacity-80 transition-opacity"
                  aria-label="更改分類"
                >
                  <TagIcon
                    iconKey={selectedTag.iconKey}
                    size={24}
                    color="currentColor"
                    className="text-gray-700"
                  />
                </button>

                {/* Tag Name and Amount */}
                <div className="flex-1">
                  {/* Tag name - clickable to change tag */}
                  <button
                    type="button"
                    onClick={handleTagClick}
                    className="text-black text-sm mb-1 hover:opacity-80 transition-opacity text-left block w-full"
                  >
                    {selectedTag.name}
                  </button>
                  {/* Clickable Amount */}
                  <button
                    type="button"
                    onClick={handleAmountClick}
                    className="text-black text-4xl font-semibold hover:opacity-80 transition-opacity text-left relative block w-full"
                  >
                    <span className={showCalculator ? "" : ""}>
                      {calculatorExpression || formatAmount(amount)}
                    </span>
                    {showCalculator && (
                      <span className="inline-block w-0.5 h-8 bg-black ml-1 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Section - Middle (區塊 B) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
            {/* 1. Description - 明細描述 */}
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
                onChange={(e) => setName(e.target.value)}
                onFocus={handleHideCalculator}
                placeholder="編輯描述"
                className="w-full h-10 px-3 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* 2. Date and Time - 日期+時間 */}
            <div className="relative" data-dropdown="date">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <label className="text-xs text-gray-600">日期</label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowCurrencyDropdown(false);
                  setShowCalculator(false);
                }}
                className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
              >
                <span className="text-sm text-black">
                  {formatDate(date)} {formatTime(time)}
                </span>
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
              </button>
              {showDatePicker && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 p-3 shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-9 px-2 border border-gray-200 text-sm text-black focus:outline-none focus:border-gray-400"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-9 px-2 border border-gray-200 text-sm text-black focus:outline-none focus:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="w-full h-9 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      確認
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Currency - 幣別 */}
            <div className="relative" data-dropdown="currency">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <label className="text-xs text-gray-600">幣別</label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCurrencyDropdown(!showCurrencyDropdown);
                  setShowDatePicker(false);
                  setShowCalculator(false);
                  setShowRateInput(false);
                }}
                className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
              >
                <span className="text-sm text-black">{currency}</span>
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
              </button>
              {showCurrencyDropdown && (
                <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                  <div className="py-1">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => {
                          setCurrency(curr);
                          setShowCurrencyDropdown(false);
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

            {/* 3.5. Exchange Rate - 匯率 (only show if currency differs from wallet default) */}
            {showRateInput && wallet && (
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
                  {/* Rate mode selection - Three buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (rateMode !== "last") {
                          setRateMode("last");
                          setRateToDefaultCurrency("");
                          setRateInputError(null);
                        }
                      }}
                      className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
                        rateMode === "last"
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      上次匯率
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRateMode("manual");
                        setRateToDefaultCurrency("");
                        setRateInputError(null);
                      }}
                      className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
                        rateMode === "manual"
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      手動輸入
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRateMode("current");
                        setRateInputError(null);
                        // useEffect will fetch and set the current rate
                      }}
                      className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
                        rateMode === "current"
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      當日匯率
                    </button>
                  </div>
                  {/* Rate input */}
                  {rateMode === "last" ? (
                    <div className="h-10 px-3 bg-gray-50 border-b border-gray-200 flex items-center">
                      {fetchingLastRate ? (
                        <span className="text-sm text-gray-500">載入中...</span>
                      ) : rateToDefaultCurrency ? (
                        <span className="text-sm text-black">
                          1 {currency} = {parseFloat(rateToDefaultCurrency).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {wallet.defaultCurrency}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">沒有找到上次使用的匯率</span>
                      )}
                    </div>
                  ) : rateMode === "current" ? (
                    <div className="h-10 px-3 bg-gray-50 border-b border-gray-200 flex items-center">
                      {fetchingCurrentRate ? (
                        <span className="text-sm text-gray-500">載入中...</span>
                      ) : rateToDefaultCurrency ? (
                        <span className="text-sm text-black">
                          1 {currency} = {parseFloat(rateToDefaultCurrency).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {wallet.defaultCurrency}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">無法取得當日匯率</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rateToDefaultCurrency}
                        onChange={handleRateInputChange}
                        onFocus={handleHideCalculator}
                        placeholder="請輸入數字"
                        className={`w-full h-10 px-3 bg-white border-b text-sm text-black placeholder:text-gray-400 focus:outline-none ${
                          rateInputError
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-gray-400"
                        }`}
                      />
                      {rateInputError && (
                        <p className="text-xs text-red-500 px-3">{rateInputError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Notes - 備註 */}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <label className="text-xs text-gray-600">備註</label>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onFocus={handleHideCalculator}
                placeholder="可填寫詳細說明"
                rows={4}
                className="w-full px-3 py-2 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 resize-none focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Error message */}
            {error && (
              <div data-error className="px-3 py-2 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-4 pb-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="w-full rounded-lg border-2 border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                刪除
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* Calculator - Overlay style (區塊 C) - Inside phone container */}
      {showCalculator && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-white transition-transform duration-200" data-calculator onClick={(e) => e.stopPropagation()}>
          <CalculatorKeypad
            key={`calc-${showCalculator}-${amount}`}
            initialValue={calculatorExpression || (amount ? amount.replace(/[$,]/g, '') : "")}
            onConfirm={(result: number) => {
              setAmount(result.toFixed(2));
              setShowCalculator(false);
              setCalculatorExpression("");
            }}
            onExpressionChange={(expr: string) => {
              setCalculatorExpression(expr);
            }}
            clearOnConfirm={true}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-black mb-2">確認刪除</h3>
            <p className="text-sm text-gray-600 mb-4">確定要刪除這筆交易嗎？此操作無法復原。</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors rounded"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {deleting ? "刪除中..." : "刪除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

