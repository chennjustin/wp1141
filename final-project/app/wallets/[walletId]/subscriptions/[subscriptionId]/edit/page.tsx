"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateSubscriptionAction } from "@/modules/subscription/routes/update-subscription";
import { getSubscriptionAction } from "@/modules/subscription/routes/get-subscription";
import { CalculatorKeypad } from "@/ui/components/CalculatorKeypad";
import { SubscriptionFormHeader } from "@/ui/components/subscription/SubscriptionFormHeader";
import { SubscriptionFormFields } from "@/ui/components/subscription/SubscriptionFormFields";
import { useSubscriptionForm } from "@/hooks/subscription/useSubscriptionForm";
import { useAmountCalculation } from "@/hooks/subscription/useAmountCalculation";
import { useSubscriptionDropdowns } from "@/hooks/subscription/useSubscriptionDropdowns";

/**
 * Edit Subscription page
 * 
 * This page allows editing an existing subscription.
 */
export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params.walletId as string;
  const subscriptionId = params.subscriptionId as string;

  // Form state management
  const { state, actions } = useSubscriptionForm();

  // Dropdown state management
  const {
    showStartDatePicker,
    setShowStartDatePicker,
    showEndDatePicker,
    setShowEndDatePicker,
    showCurrencyDropdown,
    setShowCurrencyDropdown,
    showCalculator,
    setShowCalculator,
    calculatorFor,
    setCalculatorFor,
    handleHideCalculator,
  } = useSubscriptionDropdowns();

  // Amount calculations
  const { intervalMonths, calculatedMonthlyAmount, calculatedTotalAmount } = useAmountCalculation(
    state.amountMode,
    state.totalAmount,
    state.monthlyAmount,
    state.startDate,
    state.endDate,
    state.intervalType,
    state.customIntervalMonths,
    state.customIntervalUnit
  );

  const [fetchingSubscription, setFetchingSubscription] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      if (!subscriptionId) return;
      try {
        setFetchingSubscription(true);
        const result = await getSubscriptionAction(subscriptionId);
        if (result.success && result.data) {
          const sub = result.data;
          actions.setTransactionType(sub.type);
          actions.setStartDate(new Date(sub.startDate).toISOString().split("T")[0]);
          actions.setEndDate(sub.endDate ? new Date(sub.endDate).toISOString().split("T")[0] : "");
          actions.setTagId(sub.tagId);
          actions.setCurrency(sub.currency);
          actions.setName(sub.name || "");

          // Determine amount mode based on endDate
          if (sub.endDate) {
            actions.setAmountMode("total");
            // Calculate total amount from monthly amount
            const start = new Date(sub.startDate);
            const end = new Date(sub.endDate);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const totalMonths = diffDays / (30 * sub.intervalMonths);
            if (totalMonths > 0) {
              const calculatedTotal = sub.amount * totalMonths;
              // Round to integer if there are decimal places
              const roundedTotal = Math.round(calculatedTotal);
              const totalAmountStr = roundedTotal.toString();
              actions.setTotalAmount(totalAmountStr);
              actions.setOriginalTotalAmount(totalAmountStr);
            }
            const roundedMonthly = Math.round(sub.amount * 100) / 100;
            actions.setMonthlyAmount(roundedMonthly.toFixed(2));
          } else {
            actions.setAmountMode("monthly");
            const roundedAmount = Math.round(sub.amount * 100) / 100;
            actions.setMonthlyAmount(roundedAmount.toFixed(2));
          }

          // Determine interval type
          if (Math.abs(sub.intervalMonths - 0.033) < 0.001) {
            actions.setIntervalType("day");
            actions.setSelectedUnit("day");
            actions.setCustomIntervalUnit("day");
          } else if (Math.abs(sub.intervalMonths - 0.25) < 0.001) {
            actions.setIntervalType("week");
            actions.setSelectedUnit("week");
            actions.setCustomIntervalUnit("week");
          } else if (Math.abs(sub.intervalMonths - 1) < 0.001) {
            actions.setIntervalType("month");
            actions.setSelectedUnit("month");
            actions.setCustomIntervalUnit("month");
          } else if (Math.abs(sub.intervalMonths - 12) < 0.001) {
            actions.setIntervalType("year");
            actions.setSelectedUnit("year");
            actions.setCustomIntervalUnit("year");
          } else {
            actions.setIntervalType("custom");
            if (sub.intervalMonths < 0.1) {
              actions.setSelectedUnit("day");
              actions.setCustomIntervalUnit("day");
              actions.setCustomIntervalMonths((sub.intervalMonths / 0.033).toString());
            } else if (sub.intervalMonths < 0.5) {
              actions.setSelectedUnit("week");
              actions.setCustomIntervalUnit("week");
              actions.setCustomIntervalMonths((sub.intervalMonths / 0.25).toString());
            } else if (sub.intervalMonths < 6) {
              actions.setSelectedUnit("month");
              actions.setCustomIntervalUnit("month");
              actions.setCustomIntervalMonths(sub.intervalMonths.toString());
            } else {
              actions.setSelectedUnit("year");
              actions.setCustomIntervalUnit("year");
              actions.setCustomIntervalMonths((sub.intervalMonths / 12).toString());
            }
          }

          // Set tag
          if (sub.tag) {
            actions.setSelectedTag({
              id: sub.tag.id,
              name: sub.tag.name,
              type: sub.type,
              iconKey: sub.tag.iconKey,
            });
          }
        } else {
          actions.setError(result.error?.toString() || "載入訂閱失敗");
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
        actions.setError(err instanceof Error ? err.message : "載入訂閱失敗");
      } finally {
        setFetchingSubscription(false);
      }
    }
    fetchSubscription();
  }, [subscriptionId]);

  // Auto-save calculator expression when clicking outside calculator
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (showCalculator && state.calculatorExpression) {
        if (!target.closest('[data-calculator]')) {
          try {
            const { evaluate } = require("@/lib/calculator");
            const result = evaluate(state.calculatorExpression);
            if (!isNaN(result) && isFinite(result)) {
              const roundedResult = Math.round(result * 100) / 100;
              if (calculatorFor === "total") {
                actions.setTotalAmount(roundedResult.toFixed(2));
              } else {
                actions.setMonthlyAmount(roundedResult.toFixed(2));
              }
              actions.setCalculatorExpression("");
            }
          } catch {
            actions.setCalculatorExpression("");
          }
          setShowCalculator(false);
        }
      }
    };

    if (showCalculator) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCalculator, state.calculatorExpression, calculatorFor]);

  // Show calculator for amount input
  const handleAmountClick = (forWhat: "total" | "monthly") => {
    setCalculatorFor(forWhat);
    if (forWhat === "total" && state.totalAmount && !state.calculatorExpression) {
      const cleanAmount = state.totalAmount.replace(/[$,]/g, "");
      actions.setCalculatorExpression(cleanAmount);
    } else if (forWhat === "monthly" && state.monthlyAmount && !state.calculatorExpression) {
      const cleanAmount = state.monthlyAmount.replace(/[$,]/g, "");
      actions.setCalculatorExpression(cleanAmount);
    }
    setShowCalculator(true);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowCurrencyDropdown(false);
  };

  // Handle amount mode change
  const handleModeChange = (mode: "total" | "monthly") => {
    if (mode === "total") {
      if (state.amountMode === "monthly") {
        if (state.originalTotalAmount) {
          actions.setTotalAmount(state.originalTotalAmount);
        } else if (state.monthlyAmount && state.endDate && state.startDate) {
          if (calculatedTotalAmount !== null) {
            // Round to integer if there are decimal places
            const roundedTotal = Math.round(calculatedTotalAmount);
            actions.setTotalAmount(roundedTotal.toString());
            // Save as original when switching from monthly to total
            actions.setOriginalTotalAmount(roundedTotal.toString());
          }
        }
      }
      actions.setAmountMode("total");
      actions.setCalculatorExpression("");
    } else {
      if (state.amountMode === "total" && state.totalAmount) {
        // Only save as original if it's a user input (not calculated)
        if (!state.originalTotalAmount) {
          actions.setOriginalTotalAmount(state.totalAmount);
        }
        if (state.endDate && state.startDate) {
          if (calculatedMonthlyAmount !== null) {
            actions.setMonthlyAmount(calculatedMonthlyAmount.toFixed(2));
          }
        }
      }
      actions.setAmountMode("monthly");
      actions.setCalculatorExpression("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    actions.setError(null);

    // Validation
    if (!state.tagId) {
      actions.setError("請選擇分類");
      return;
    }
    if (!state.startDate) {
      actions.setError("請選擇開始日期");
      return;
    }
    if (state.amountMode === "total") {
      if (!state.endDate) {
        actions.setError("填寫總金額時必須選擇結束日期");
        return;
      }
      if (!state.totalAmount || parseFloat(state.totalAmount) <= 0 || isNaN(parseFloat(state.totalAmount))) {
        actions.setError("請輸入有效的總金額");
        return;
      }
      if (calculatedMonthlyAmount === null || calculatedMonthlyAmount <= 0) {
        actions.setError("無法計算每月金額，請檢查日期和金額");
        return;
      }
    } else {
      if (!state.monthlyAmount || parseFloat(state.monthlyAmount) <= 0 || isNaN(parseFloat(state.monthlyAmount))) {
        actions.setError("請輸入有效的每月金額");
        return;
      }
    }

    actions.setLoading(true);

    try {
      const finalAmount =
        state.amountMode === "total"
          ? Math.round((calculatedMonthlyAmount || 0) * 100) / 100
          : Math.round(parseFloat(state.monthlyAmount) * 100) / 100;

      const result = await updateSubscriptionAction(subscriptionId, {
        tagId: state.tagId,
        type: state.transactionType,
        amount: finalAmount,
        currency: state.currency,
        startDate: new Date(state.startDate),
        endDate: state.endDate ? new Date(state.endDate) : null,
        intervalMonths: intervalMonths,
        nextBilling: new Date(state.startDate),
        name: state.name || null,
      });

      if (result.success) {
        router.push(`/wallets/${walletId}/subscriptions`);
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const errorMessage = result.error?.toString() || "更新訂閱失敗";
        actions.setError(errorMessage);
        setTimeout(() => {
          const errorElement = document.querySelector('[data-error]');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : "更新訂閱失敗");
    } finally {
      actions.setLoading(false);
    }
  };

  // Save calculator expression before hiding
  const handleSaveCalculatorExpression = () => {
    if (state.calculatorExpression) {
      try {
        const { evaluate } = require("@/lib/calculator");
        const result = evaluate(state.calculatorExpression);
        if (!isNaN(result) && isFinite(result)) {
          if (calculatorFor === "total") {
            const roundedResult = Math.round(result * 100) / 100;
            actions.setTotalAmount(roundedResult.toFixed(2));
            // Save original total amount when user inputs it
            actions.setOriginalTotalAmount(roundedResult.toFixed(2));
          } else {
            actions.setMonthlyAmount(result.toFixed(2));
          }
          actions.setCalculatorExpression("");
        }
      } catch {
        actions.setCalculatorExpression("");
      }
    }
  };

  if (fetchingSubscription) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-gray-500">載入中...</span>
      </div>
    );
  }

  if (!state.selectedTag || !state.tagId) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">無法載入訂閱資訊</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col relative -mx-4">
      <div className="flex min-h-0 flex-1 flex-col">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header and Amount Section */}
          <SubscriptionFormHeader
            tag={state.selectedTag}
            amountMode={state.amountMode}
            monthlyAmount={state.monthlyAmount}
            totalAmount={state.totalAmount}
            originalTotalAmount={state.originalTotalAmount}
            calculatorExpression={state.calculatorExpression}
            showCalculator={showCalculator}
            calculatorFor={calculatorFor}
            calculatedMonthlyAmount={calculatedMonthlyAmount}
            calculatedTotalAmount={calculatedTotalAmount}
            onAmountClick={handleAmountClick}
            onModeChange={handleModeChange}
            onBack={() => router.back()}
            onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            loading={state.loading}
          />

          {/* Form Fields Section */}
          <SubscriptionFormFields
            name={state.name}
            startDate={state.startDate}
            endDate={state.endDate}
            currency={state.currency}
            intervalType={state.intervalType}
            selectedUnit={state.selectedUnit}
            customIntervalMonths={state.customIntervalMonths}
            customIntervalUnit={state.customIntervalUnit}
            showStartDatePicker={showStartDatePicker}
            showEndDatePicker={showEndDatePicker}
            showCurrencyDropdown={showCurrencyDropdown}
            onNameChange={actions.setName}
            onStartDateChange={actions.setStartDate}
            onEndDateChange={actions.setEndDate}
            onCurrencyChange={actions.setCurrency}
            onIntervalTypeChange={actions.setIntervalType}
            onSelectedUnitChange={actions.setSelectedUnit}
            onCustomIntervalMonthsChange={actions.setCustomIntervalMonths}
            onCustomIntervalUnitChange={actions.setCustomIntervalUnit}
            onToggleStartDatePicker={() => {
              setShowStartDatePicker(!showStartDatePicker);
              setShowEndDatePicker(false);
              setShowCurrencyDropdown(false);
              setShowCalculator(false);
            }}
            onToggleEndDatePicker={() => {
              setShowEndDatePicker(!showEndDatePicker);
              setShowStartDatePicker(false);
              setShowCurrencyDropdown(false);
              setShowCalculator(false);
            }}
            onToggleCurrencyDropdown={() => {
              setShowCurrencyDropdown(!showCurrencyDropdown);
              setShowStartDatePicker(false);
              setShowEndDatePicker(false);
              setShowCalculator(false);
            }}
            onHideCalculator={() => handleHideCalculator(handleSaveCalculatorExpression)}
          />

          {/* Error message */}
          {state.error && (
            <div data-error className="px-3 py-2 bg-red-50 text-red-600 text-sm">
              {state.error}
            </div>
          )}
        </form>
      </div>

      {/* Calculator */}
      {showCalculator && (
        <div
          className="absolute bottom-0 left-0 right-0 z-50 bg-white transition-transform duration-200"
          data-calculator
          onClick={(e) => e.stopPropagation()}
        >
          <CalculatorKeypad
            key={`calc-${showCalculator}-${calculatorFor}-${calculatorFor === "total" ? state.totalAmount : state.monthlyAmount}`}
            initialValue={
              state.calculatorExpression ||
              (calculatorFor === "total" && state.totalAmount
                ? state.totalAmount.replace(/[$,]/g, "")
                : calculatorFor === "monthly" && state.monthlyAmount
                ? state.monthlyAmount.replace(/[$,]/g, "")
                : "")
            }
            onConfirm={(result: number) => {
              const roundedResult = Math.round(result * 100) / 100;
              if (calculatorFor === "total") {
                actions.setTotalAmount(roundedResult.toFixed(2));
              } else {
                actions.setMonthlyAmount(roundedResult.toFixed(2));
              }
              setShowCalculator(false);
              actions.setCalculatorExpression("");
            }}
            onExpressionChange={(expr: string) => {
              actions.setCalculatorExpression(expr);
            }}
            clearOnConfirm={true}
          />
        </div>
      )}
    </div>
  );
}

