"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createSubscriptionAction } from "@/modules/subscription/routes/create-subscription";
import { listTagsAction } from "@/modules/tag/routes/list-tags";
import type { TransactionType } from "@/modules/transaction/domain/transaction.types";
import { CalculatorKeypad } from "@/ui/components/CalculatorKeypad";
import { SubscriptionFormHeader } from "@/ui/components/subscription/SubscriptionFormHeader";
import { SubscriptionFormFields } from "@/ui/components/subscription/SubscriptionFormFields";
import { useSubscriptionForm } from "@/hooks/subscription/useSubscriptionForm";
import { useAmountCalculation } from "@/hooks/subscription/useAmountCalculation";
import { useSubscriptionDropdowns } from "@/hooks/subscription/useSubscriptionDropdowns";
import type { TagWithIcon } from "@/hooks/subscription/useSubscriptionForm";
import { useWallet } from "@/hooks/useWallet";
import { PayerSelector } from "@/ui/components/split/PayerSelector";
import { ShareSelector } from "@/ui/components/split/ShareSelector";

/**
 * New Subscription page
 * 
 * This page is accessed after selecting a tag.
 * User fills in subscription details and enters amount.
 */
export default function NewSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const walletId = params.walletId as string;

  // Get tagId and type from URL parameters
  const tagIdFromUrl = searchParams.get("tagId");
  const typeFromUrl = searchParams.get("type") as TransactionType | null;

  // Form state management
  const { state, actions } = useSubscriptionForm({
    transactionType: typeFromUrl || "EXPENSE",
    tagId: tagIdFromUrl || "",
  });

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

  const [fetchingTag, setFetchingTag] = useState(true);
  const [fetchingLastRate, setFetchingLastRate] = useState(false);
  const [showPayerSelector, setShowPayerSelector] = useState(false);
  const [showShareSelector, setShowShareSelector] = useState(false);

  // Get wallet information
  const { wallet, loading: walletLoading } = useWallet(walletId);

  // Redirect to tag selection if required params are missing
  useEffect(() => {
    if (!tagIdFromUrl || !typeFromUrl || !walletId) {
      router.push(`/wallets/${walletId}/subscriptions/new/tag`);
    }
  }, [tagIdFromUrl, typeFromUrl, walletId, router]);

  // Initialize currency with wallet default currency
  useEffect(() => {
    if (wallet && !state.currency) {
      actions.setCurrency(wallet.defaultCurrency);
    }
  }, [wallet, state.currency]);

  // Show/hide rate input based on currency and wallet default currency
  const showRateInput = wallet && state.currency && state.currency !== wallet.defaultCurrency;

  // Fetch last exchange rate when currency changes or rateMode is "last"
  useEffect(() => {
    async function fetchLastRate() {
      if (!wallet || !state.currency || state.currency === wallet.defaultCurrency || state.rateMode !== "last") {
        return;
      }

      setFetchingLastRate(true);
      try {
        const response = await fetch(`/api/transactions/last-rate?walletId=${walletId}&currency=${state.currency}`);
        if (response.ok) {
          const data = await response.json();
          if (data.rateToDefaultCurrency) {
            actions.setRateToDefaultCurrency(data.rateToDefaultCurrency.toString());
          } else {
            actions.setRateToDefaultCurrency("");
            // If no last rate found, switch to manual mode
            actions.setRateMode("manual");
          }
        } else {
          actions.setRateToDefaultCurrency("");
          actions.setRateMode("manual");
        }
      } catch (err) {
        console.error("Failed to fetch last rate", err);
        actions.setRateToDefaultCurrency("");
        actions.setRateMode("manual");
      } finally {
        setFetchingLastRate(false);
      }
    }

    fetchLastRate();
  }, [wallet, state.currency, state.rateMode, walletId]);

  // Fetch selected tag
  useEffect(() => {
    async function fetchTag() {
      if (!state.tagId) return;
      try {
        const result = await listTagsAction({ filter: "all" });
        if (result.success && result.data) {
          const tags = result.data as unknown as TagWithIcon[];
          const tag = tags.find((t) => t.id === state.tagId);
          if (tag) {
            actions.setSelectedTag(tag);
          }
        }
      } catch (err) {
        console.error("Failed to fetch tag", err);
      } finally {
        setFetchingTag(false);
      }
    }
    fetchTag();
  }, [state.tagId]);

  // Auto-save calculator expression when clicking outside calculator
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // If calculator is open and user clicks outside, save the expression
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
            // If expression is invalid, just clear it
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
    // If there's an existing amount, set it as calculator expression for editing
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
      // When switching to total mode:
      // If we have an original total amount (user previously input total), restore it
      // Otherwise, calculate from monthly amount
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
      // When switching to monthly mode, save current total amount as original
      // and calculate monthly from total
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
    if (!walletId) {
      actions.setError("無法取得錢包資訊");
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

      // Determine rateToDefaultCurrency
      let finalRateToDefaultCurrency: number | null = null;
      if (showRateInput && state.rateToDefaultCurrency) {
        const parsedRate = parseFloat(state.rateToDefaultCurrency);
        if (!isNaN(parsedRate) && parsedRate > 0) {
          finalRateToDefaultCurrency = parsedRate;
        }
      }

      const result = await createSubscriptionAction({
        walletId,
        tagId: state.tagId,
        type: state.transactionType,
        amount: finalAmount,
        currency: state.currency,
        rateToDefaultCurrency: finalRateToDefaultCurrency,
        startDate: new Date(state.startDate),
        endDate: state.endDate ? new Date(state.endDate) : null,
        intervalMonths: intervalMonths,
        name: state.name || null,
        payers: state.selectedPayers.length > 0 ? state.selectedPayers : undefined,
        shares: state.selectedShares.length > 0 ? state.selectedShares : undefined,
      });

      if (result.success) {
        router.push(`/wallets/${walletId}/subscriptions`);
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        const errorMessage = result.error?.toString() || "創建訂閱失敗";
        actions.setError(errorMessage);
        setTimeout(() => {
          const errorElement = document.querySelector('[data-error]');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : "創建訂閱失敗");
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

  if (fetchingTag || !state.selectedTag || !walletId) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-gray-500">載入中...</span>
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
            rateToDefaultCurrency={state.rateToDefaultCurrency}
            rateMode={state.rateMode}
            showRateInput={showRateInput || false}
            walletDefaultCurrency={wallet?.defaultCurrency}
            fetchingLastRate={fetchingLastRate}
            intervalType={state.intervalType}
            selectedUnit={state.selectedUnit}
            customIntervalMonths={state.customIntervalMonths}
            customIntervalUnit={state.customIntervalUnit}
            showStartDatePicker={showStartDatePicker}
            showEndDatePicker={showEndDatePicker}
            showCurrencyDropdown={showCurrencyDropdown}
            onNameChange={actions.setName}
            onStartDateChange={(value) => {
              actions.setStartDate(value);
            }}
            onEndDateChange={(value) => {
              actions.setEndDate(value);
            }}
            onCurrencyChange={actions.setCurrency}
            onRateToDefaultCurrencyChange={actions.setRateToDefaultCurrency}
            onRateModeChange={actions.setRateMode}
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
            selectedPayers={state.selectedPayers}
            selectedShares={state.selectedShares}
            splitMethod={state.splitMethod}
            showPayerSelector={showPayerSelector}
            showShareSelector={showShareSelector}
            onTogglePayerSelector={() => {
              setShowPayerSelector(!showPayerSelector);
              setShowStartDatePicker(false);
              setShowEndDatePicker(false);
              setShowCurrencyDropdown(false);
              setShowCalculator(false);
              setShowShareSelector(false);
            }}
            onToggleShareSelector={() => {
              setShowShareSelector(!showShareSelector);
              setShowStartDatePicker(false);
              setShowEndDatePicker(false);
              setShowCurrencyDropdown(false);
              setShowCalculator(false);
              setShowPayerSelector(false);
            }}
            walletMembers={wallet?.members || []}
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

      {/* Payer Selector */}
      {showPayerSelector && wallet && (
        <PayerSelector
          members={wallet.members}
          totalAmount={state.amountMode === "total" 
            ? (calculatedMonthlyAmount || 0) 
            : parseFloat(state.monthlyAmount) || 0}
          currency={state.currency}
          initialPayers={state.selectedPayers}
          transactionName={state.name}
          tagName={state.selectedTag?.name}
          onConfirm={(payers) => {
            actions.setSelectedPayers(payers);
            setShowPayerSelector(false);
          }}
          onCancel={() => {
            setShowPayerSelector(false);
          }}
        />
      )}

      {/* Share Selector */}
      {showShareSelector && wallet && (
        <ShareSelector
          members={wallet.members}
          totalAmount={state.amountMode === "total" 
            ? (calculatedMonthlyAmount || 0) 
            : parseFloat(state.monthlyAmount) || 0}
          currency={state.currency}
          initialPayers={state.selectedShares}
          transactionName={state.name}
          tagName={state.selectedTag?.name}
          initialMethod={state.splitMethod}
          onConfirm={(shares, method) => {
            actions.setSelectedShares(shares);
            actions.setSplitMethod(method);
            setShowShareSelector(false);
          }}
          onCancel={() => {
            setShowShareSelector(false);
          }}
        />
      )}
    </div>
  );
}
