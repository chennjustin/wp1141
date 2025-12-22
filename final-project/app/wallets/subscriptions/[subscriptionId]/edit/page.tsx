"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { updateSubscriptionAction } from "@/modules/subscription/routes/update-subscription";
import { getSubscriptionAction } from "@/modules/subscription/routes/get-subscription";
import { CalculatorKeypad } from "@/ui/components/CalculatorKeypad";
import { TagIcon } from "@/ui/utils/tag-icon";
import { useCurrentWallet } from "@/hooks/useCurrentWallet";
import { useWallets } from "@/hooks/useWallet";

/**
 * Tag with iconKey
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
    food: "bg-orange-100",
    drinks: "bg-amber-100",
    entertainment: "bg-purple-100",
    transportation: "bg-blue-100",
    shopping: "bg-sky-100",
    bills: "bg-amber-100",
    healthcare: "bg-red-100",
    education: "bg-indigo-100",
    travel: "bg-cyan-100",
    other: "bg-slate-200",
    salary: "bg-green-100",
    bonus: "bg-emerald-100",
    investment: "bg-teal-100",
    gift: "bg-pink-100",
    freelance: "bg-lime-100",
    interest: "bg-blue-100",
    refund: "bg-rose-100",
    dividend: "bg-violet-100",
    tag: "bg-gray-100",
  };
  return colorMap[iconKey] || "bg-gray-100";
}

const CURRENCIES = ["TWD", "USD", "EUR", "JPY", "CNY"];

/**
 * Amount input mode: total amount or monthly amount
 */
type AmountMode = "total" | "monthly";

/**
 * Interval type for billing cycle
 */
type IntervalType = "day" | "week" | "month" | "year" | "custom";

/**
 * Edit Subscription page
 * 
 * This page allows editing an existing subscription.
 */
export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { wallets } = useWallets();
  
  const subscriptionId = params.subscriptionId as string;
  
  // Get walletId from search params or use current wallet
  const walletIdParam = searchParams.get("walletId");
  const currentWallet = useCurrentWallet({ 
    wallets, 
    currentWalletId: walletIdParam || null 
  });
  const walletId = walletIdParam || currentWallet?.id;

  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tagId, setTagId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("TWD");
  const [amountMode, setAmountMode] = useState<AmountMode>("monthly");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [monthlyAmount, setMonthlyAmount] = useState<string>("");
  const [originalTotalAmount, setOriginalTotalAmount] = useState<string>(""); // Store original total amount input
  const [intervalType, setIntervalType] = useState<IntervalType>("month");
  const [selectedUnit, setSelectedUnit] = useState<"day" | "week" | "month" | "year">("month");
  const [customIntervalMonths, setCustomIntervalMonths] = useState<string>("1");
  const [customIntervalUnit, setCustomIntervalUnit] = useState<"day" | "week" | "month" | "year">("month");
  const [calculatorExpression, setCalculatorExpression] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<TagWithIcon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [fetchingSubscription, setFetchingSubscription] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorFor, setCalculatorFor] = useState<"total" | "monthly">("monthly");

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      if (!subscriptionId) return;
      try {
        setFetchingSubscription(true);
        const result = await getSubscriptionAction(subscriptionId);
        if (result.success && result.data) {
          const sub = result.data;
          setTransactionType(sub.type);
          setStartDate(new Date(sub.startDate).toISOString().split("T")[0]);
          setEndDate(sub.endDate ? new Date(sub.endDate).toISOString().split("T")[0] : "");
          setTagId(sub.tagId);
          setCurrency(sub.currency);
          setName(sub.name || "");
          
          // Determine amount mode based on endDate
          // If endDate exists, it's likely total amount mode
          // We need to calculate the total amount from monthly amount
          if (sub.endDate) {
            setAmountMode("total");
            // Calculate total amount from monthly amount
            const start = new Date(sub.startDate);
            const end = new Date(sub.endDate);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const totalMonths = diffDays / (30 * sub.intervalMonths);
            if (totalMonths > 0) {
              const calculatedTotal = sub.amount * totalMonths;
              const roundedTotal = Math.round(calculatedTotal * 100) / 100;
              const totalAmountStr = roundedTotal.toFixed(2);
              setTotalAmount(totalAmountStr);
              setOriginalTotalAmount(totalAmountStr); // Save as original total amount (calculated from monthly)
            }
            const roundedMonthly = Math.round(sub.amount * 100) / 100;
            setMonthlyAmount(roundedMonthly.toFixed(2));
          } else {
            setAmountMode("monthly");
            const roundedAmount = Math.round(sub.amount * 100) / 100;
            setMonthlyAmount(roundedAmount.toFixed(2));
          }
           
          // Determine interval type
          if (Math.abs(sub.intervalMonths - 0.033) < 0.001) {
            setIntervalType("day");
            setSelectedUnit("day");
            setCustomIntervalUnit("day");
          } else if (Math.abs(sub.intervalMonths - 0.25) < 0.001) {
            setIntervalType("week");
            setSelectedUnit("week");
            setCustomIntervalUnit("week");
          } else if (Math.abs(sub.intervalMonths - 1) < 0.001) {
            setIntervalType("month");
            setSelectedUnit("month");
            setCustomIntervalUnit("month");
          } else if (Math.abs(sub.intervalMonths - 12) < 0.001) {
            setIntervalType("year");
            setSelectedUnit("year");
            setCustomIntervalUnit("year");
          } else {
            setIntervalType("custom");
            // Try to determine the unit by checking if it's divisible by common values
            if (sub.intervalMonths < 0.1) {
              // Likely days
              setSelectedUnit("day");
              setCustomIntervalUnit("day");
              setCustomIntervalMonths((sub.intervalMonths / 0.033).toString());
            } else if (sub.intervalMonths < 0.5) {
              // Likely weeks
              setSelectedUnit("week");
              setCustomIntervalUnit("week");
              setCustomIntervalMonths((sub.intervalMonths / 0.25).toString());
            } else if (sub.intervalMonths < 6) {
              // Likely months
              setSelectedUnit("month");
              setCustomIntervalUnit("month");
              setCustomIntervalMonths(sub.intervalMonths.toString());
            } else {
              // Likely years
              setSelectedUnit("year");
              setCustomIntervalUnit("year");
              setCustomIntervalMonths((sub.intervalMonths / 12).toString());
            }
          }

          // Set tag
          if (sub.tag) {
            setSelectedTag({
              id: sub.tag.id,
              name: sub.tag.name,
              type: sub.type,
              iconKey: sub.tag.iconKey,
            });
          }
        } else {
          setError(result.error?.toString() || "載入訂閱失敗");
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
        setError(err instanceof Error ? err.message : "載入訂閱失敗");
      } finally {
        setFetchingSubscription(false);
      }
    }
    fetchSubscription();
  }, [subscriptionId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[data-dropdown="currency"]') &&
        !target.closest('[data-dropdown="startDate"]') &&
        !target.closest('[data-dropdown="endDate"]')
      ) {
        setShowCurrencyDropdown(false);
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
      }
    };

    if (showCurrencyDropdown || showStartDatePicker || showEndDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCurrencyDropdown, showStartDatePicker, showEndDatePicker]);

  // Calculate monthly amount from total amount
  const calculatedMonthlyAmount = useMemo(() => {
    if (amountMode !== "total" || !totalAmount || !endDate || !startDate) {
      return null;
    }

    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return null;

    // Calculate interval months
    let intervalMonths = 1;
    if (intervalType === "day") {
      intervalMonths = 0.033;
    } else if (intervalType === "week") {
      intervalMonths = 0.25;
    } else if (intervalType === "month") {
      intervalMonths = 1;
    } else if (intervalType === "year") {
      intervalMonths = 12;
    } else if (intervalType === "custom") {
      const value = parseFloat(customIntervalMonths) || 1;
      // Convert custom value to months based on selected unit
      if (customIntervalUnit === "day") {
        intervalMonths = value * 0.033;
      } else if (customIntervalUnit === "week") {
        intervalMonths = value * 0.25;
      } else if (customIntervalUnit === "month") {
        intervalMonths = value;
      } else if (customIntervalUnit === "year") {
        intervalMonths = value * 12;
      } else {
        intervalMonths = value;
      }
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const totalMonths = diffDays / (30 * intervalMonths);

    if (totalMonths <= 0) return null;

    const monthly = total / totalMonths;
    return Math.round(monthly * 100) / 100; // Round to 2 decimal places
  }, [amountMode, totalAmount, startDate, endDate, intervalType, customIntervalMonths, customIntervalUnit]);

  // Calculate total amount from monthly amount
  const calculatedTotalAmount = useMemo(() => {
    if (amountMode !== "monthly" || !monthlyAmount || !endDate || !startDate) {
      return null;
    }

    const monthly = parseFloat(monthlyAmount);
    if (isNaN(monthly) || monthly <= 0) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return null;

    // Calculate interval months
    let intervalMonths = 1;
    if (intervalType === "day") {
      intervalMonths = 0.033;
    } else if (intervalType === "week") {
      intervalMonths = 0.25;
    } else if (intervalType === "month") {
      intervalMonths = 1;
    } else if (intervalType === "year") {
      intervalMonths = 12;
    } else if (intervalType === "custom") {
      const value = parseFloat(customIntervalMonths) || 1;
      // Convert custom value to months based on selected unit
      if (customIntervalUnit === "day") {
        intervalMonths = value * 0.033;
      } else if (customIntervalUnit === "week") {
        intervalMonths = value * 0.25;
      } else if (customIntervalUnit === "month") {
        intervalMonths = value;
      } else if (customIntervalUnit === "year") {
        intervalMonths = value * 12;
      } else {
        intervalMonths = value;
      }
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const totalMonths = diffDays / (30 * intervalMonths);

    if (totalMonths <= 0) return null;

    const total = monthly * totalMonths;
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }, [amountMode, monthlyAmount, startDate, endDate, intervalType, customIntervalMonths, customIntervalUnit]);

  // Get interval months value
  const intervalMonths = useMemo(() => {
    if (intervalType === "day") return 0.033;
    if (intervalType === "week") return 0.25;
    if (intervalType === "month") return 1;
    if (intervalType === "year") return 12;
    if (intervalType === "custom") {
      const value = parseFloat(customIntervalMonths) || 1;
      // Convert custom value to months based on selected unit
      if (customIntervalUnit === "day") return value * 0.033;
      if (customIntervalUnit === "week") return value * 0.25;
      if (customIntervalUnit === "month") return value;
      if (customIntervalUnit === "year") return value * 12;
      return value;
    }
    return 1;
  }, [intervalType, customIntervalMonths, customIntervalUnit]);


  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "選擇日期";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // Format amount for display
  const formatAmount = (amountString: string) => {
    if (!amountString) return "$0";
    const num = parseFloat(amountString);
    if (isNaN(num)) return "$0";
    const rounded = Math.round(num * 100) / 100;
    return `$${rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Hide calculator when other fields are focused
  const handleHideCalculator = () => {
    setShowCalculator(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowCurrencyDropdown(false);
  };

  // Show calculator for amount input
  const handleAmountClick = (forWhat: "total" | "monthly") => {
    setCalculatorFor(forWhat);
    setShowCalculator(true);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowCurrencyDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!tagId) {
      setError("請選擇分類");
      return;
    }
    if (!startDate) {
      setError("請選擇開始日期");
      return;
    }
    if (amountMode === "total") {
      if (!endDate) {
        setError("填寫總金額時必須選擇結束日期");
        return;
      }
      if (!totalAmount || parseFloat(totalAmount) <= 0 || isNaN(parseFloat(totalAmount))) {
        setError("請輸入有效的總金額");
        return;
      }
      if (calculatedMonthlyAmount === null || calculatedMonthlyAmount <= 0) {
        setError("無法計算每月金額，請檢查日期和金額");
        return;
      }
    } else {
      // Monthly mode: don't require endDate, clear it if exists
      if (!monthlyAmount || parseFloat(monthlyAmount) <= 0 || isNaN(parseFloat(monthlyAmount))) {
        setError("請輸入有效的每月金額");
        return;
      }
    }

    setLoading(true);

    try {
      const finalAmount = amountMode === "total" 
        ? Math.round((calculatedMonthlyAmount || 0) * 100) / 100
        : Math.round(parseFloat(monthlyAmount) * 100) / 100;

      console.log("[EditSubscription] Updating subscription:", {
        subscriptionId,
        tagId,
        type: transactionType,
        amount: finalAmount,
        currency,
        startDate,
        endDate,
        intervalMonths,
      });

      const result = await updateSubscriptionAction(subscriptionId, {
        tagId,
        type: transactionType,
        amount: finalAmount,
        currency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        intervalMonths: intervalMonths,
        nextBilling: new Date(startDate), // Update nextBilling to startDate
        name: name || null,
      });

      console.log("[EditSubscription] Update result:", result);

      if (result.success) {
        router.push(`/wallets/subscriptions${walletId ? `?walletId=${walletId}` : ""}`);
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const errorMessage = result.error?.toString() || "更新訂閱失敗";
        console.error("[EditSubscription] Update failed:", errorMessage);
        setError(errorMessage);
        setTimeout(() => {
          const errorElement = document.querySelector('[data-error]');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (err) {
      console.error("[EditSubscription] Unexpected error:", err);
      setError(err instanceof Error ? err.message : "更新訂閱失敗");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSubscription) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-gray-500">載入中...</span>
      </div>
    );
  }

  if (!selectedTag || !tagId) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">無法載入訂閱資訊</span>
      </div>
    );
  }

  // Use tag background color for header
  const headerBgColor = selectedTag ? getTagColor(selectedTag.iconKey) : "bg-gray-100";

  return (
    <div className="flex h-full flex-col relative -mx-4">
      <div className="flex min-h-0 flex-1 flex-col">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Header and Amount Section */}
          <div className={`${headerBgColor} -mt-4 px-4 pt-4`}>
            <div className="relative flex items-center justify-between pt-3 pb-2">
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

            <div className="px-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <TagIcon
                    iconKey={selectedTag.iconKey}
                    size={24}
                    color="currentColor"
                    className="text-gray-700"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-black text-sm mb-1">{selectedTag.name}</div>
                  {amountMode === "monthly" ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => handleAmountClick("monthly")}
                        className="text-black text-4xl font-semibold hover:opacity-80 transition-opacity text-left"
                      >
                        {calculatorExpression || formatAmount(monthlyAmount)}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => handleAmountClick("total")}
                        className="text-black text-4xl font-semibold hover:opacity-80 transition-opacity text-left"
                      >
                        {calculatorExpression || formatAmount(totalAmount)}
                      </button>
                      {calculatedMonthlyAmount !== null && (
                        <div className="text-black text-sm mt-1">
                          每月: {formatAmount(calculatedMonthlyAmount.toFixed(2))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
               {/* Amount Mode Selection in Header */}
               <div className="mt-4 flex gap-2">
                 <button
                   type="button"
                   onClick={() => {
                     // When switching to total mode:
                     // If we have an original total amount (user previously input total), restore it
                     // Otherwise, calculate from monthly amount
                     if (amountMode === "monthly") {
                       if (originalTotalAmount) {
                         // Restore original total amount that user input
                         setTotalAmount(originalTotalAmount);
                       } else if (monthlyAmount && endDate && startDate) {
                         // Calculate total from monthly if no original total exists
                         const calculatedTotal = calculatedTotalAmount;
                         if (calculatedTotal !== null) {
                           setTotalAmount(calculatedTotal.toFixed(2));
                         }
                       }
                     }
                     setAmountMode("total");
                     setCalculatorExpression("");
                   }}
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
                   onClick={() => {
                     // When switching to monthly mode, save current total amount as original
                     // and calculate monthly from total
                     if (amountMode === "total" && totalAmount) {
                       // Save the current total amount as original (user's input)
                       setOriginalTotalAmount(totalAmount);
                       // Calculate monthly from total
                       if (endDate && startDate) {
                         const calculatedMonthly = calculatedMonthlyAmount;
                         if (calculatedMonthly !== null) {
                           setMonthlyAmount(calculatedMonthly.toFixed(2));
                         }
                       }
                     }
                     setAmountMode("monthly");
                     setCalculatorExpression("");
                   }}
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

          {/* Form Fields Section */}
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

            {/* 2. Start Date and End Date - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="relative" data-dropdown="startDate">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <label className="text-xs text-gray-600">開始扣款日期</label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowStartDatePicker(!showStartDatePicker);
                    setShowEndDatePicker(false);
                    setShowCurrencyDropdown(false);
                    setShowCalculator(false);
                  }}
                  className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
                >
                  <span className="text-sm text-black">{formatDate(startDate)}</span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStartDatePicker && (
                  <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 p-3 shadow-lg">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setShowStartDatePicker(false);
                      }}
                      className="w-full h-9 px-2 border border-gray-200 text-sm text-black focus:outline-none focus:border-gray-400"
                    />
                  </div>
                )}
              </div>

              {/* End Date */}
              <div className="relative" data-dropdown="endDate">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <label className="text-xs text-gray-600">結束日期</label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEndDatePicker(!showEndDatePicker);
                    setShowStartDatePicker(false);
                    setShowCurrencyDropdown(false);
                    setShowCalculator(false);
                  }}
                  className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
                >
                  <span className="text-sm text-black">{endDate ? formatDate(endDate) : "永久"}</span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showEndDatePicker && (
                  <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 p-3 shadow-lg">
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setShowEndDatePicker(false);
                        }}
                        min={startDate}
                        className="w-full h-9 px-2 border border-gray-200 text-sm text-black focus:outline-none focus:border-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEndDate("");
                          setShowEndDatePicker(false);
                        }}
                        className="w-full h-9 bg-gray-100 text-black text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        設為永久
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Currency */}
            <div className="relative" data-dropdown="currency">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <label className="text-xs text-gray-600">幣別</label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCurrencyDropdown(!showCurrencyDropdown);
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                  setShowCalculator(false);
                }}
                className="flex h-10 w-full items-center justify-between px-3 bg-white border-b border-gray-200 text-left hover:border-gray-400 transition-colors"
              >
                <span className="text-sm text-black">{currency}</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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


             {/* Interval Type */}
             <div>
               <div className="flex items-center gap-2 mb-2">
                 <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                         setSelectedUnit(unit);
                         setIntervalType(unit);
                         setCustomIntervalUnit(unit);
                       }}
                       className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                         intervalType !== "custom" && selectedUnit === unit
                           ? "bg-gray-900 text-white"
                           : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                       }`}
                     >
                       {unit === "day" ? "日" : unit === "week" ? "週" : unit === "month" ? "月" : "年"}
                     </button>
                   ))}
                 </div>
                 {intervalType === "custom" && (
                   <div className="space-y-2">
                     <input
                       type="number"
                       value={customIntervalMonths}
                       onChange={(e) => setCustomIntervalMonths(e.target.value)}
                       onFocus={handleHideCalculator}
                       placeholder={customIntervalUnit === "day" ? "天數" : customIntervalUnit === "week" ? "週數" : customIntervalUnit === "month" ? "月數" : "年數"}
                       min="0.1"
                       step="0.1"
                       className="w-full h-10 px-3 bg-white border-b border-gray-200 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
                     />
                   </div>
                 )}
                 <button
                   type="button"
                   onClick={() => {
                     setIntervalType("custom");
                     setCustomIntervalUnit(selectedUnit);
                   }}
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

            {/* Error message */}
            {error && (
              <div data-error className="px-3 py-2 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Calculator */}
      {showCalculator && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-white transition-transform duration-200">
          <CalculatorKeypad
            onConfirm={(result: number) => {
              const roundedResult = Math.round(result * 100) / 100;
              if (calculatorFor === "total") {
                setTotalAmount(roundedResult.toFixed(2));
              } else {
                setMonthlyAmount(roundedResult.toFixed(2));
              }
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
    </div>
  );
}

