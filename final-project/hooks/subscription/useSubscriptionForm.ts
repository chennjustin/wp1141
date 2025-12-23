import { useState } from "react";
import type { TransactionType } from "@/modules/transaction/domain/transaction.types";
import type { IntervalType } from "@/ui/utils/subscription-utils";

/**
 * Amount input mode: total amount or monthly amount
 */
export type AmountMode = "total" | "monthly";

/**
 * Tag with iconKey
 */
export interface TagWithIcon {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  iconKey: string;
}

/**
 * Subscription form state
 */
export interface SubscriptionFormState {
  transactionType: TransactionType;
  startDate: string;
  endDate: string;
  tagId: string;
  name: string;
  currency: string;
  rateToDefaultCurrency: string;
  rateMode: "last" | "manual";
  amountMode: AmountMode;
  totalAmount: string;
  monthlyAmount: string;
  originalTotalAmount: string;
  intervalType: IntervalType;
  selectedUnit: "day" | "week" | "month" | "year";
  customIntervalMonths: string;
  customIntervalUnit: "day" | "week" | "month" | "year";
  calculatorExpression: string;
  selectedTag: TagWithIcon | null;
  loading: boolean;
  error: string | null;
}

/**
 * Subscription form actions
 */
export interface SubscriptionFormActions {
  setTransactionType: (value: TransactionType) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setTagId: (value: string) => void;
  setName: (value: string) => void;
  setCurrency: (value: string) => void;
  setRateToDefaultCurrency: (value: string) => void;
  setRateMode: (value: "last" | "manual") => void;
  setAmountMode: (value: AmountMode) => void;
  setTotalAmount: (value: string) => void;
  setMonthlyAmount: (value: string) => void;
  setOriginalTotalAmount: (value: string) => void;
  setIntervalType: (value: IntervalType) => void;
  setSelectedUnit: (value: "day" | "week" | "month" | "year") => void;
  setCustomIntervalMonths: (value: string) => void;
  setCustomIntervalUnit: (value: "day" | "week" | "month" | "year") => void;
  setCalculatorExpression: (value: string) => void;
  setSelectedTag: (value: TagWithIcon | null) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}

/**
 * Hook for managing subscription form state
 */
export function useSubscriptionForm(initialState?: Partial<SubscriptionFormState>) {
  const [transactionType, setTransactionType] = useState<TransactionType>(
    initialState?.transactionType || "EXPENSE"
  );
  const [startDate, setStartDate] = useState<string>(
    initialState?.startDate || (() => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    })
  );
  const [endDate, setEndDate] = useState<string>(initialState?.endDate || "");
  const [tagId, setTagId] = useState<string>(initialState?.tagId || "");
  const [name, setName] = useState<string>(initialState?.name || "");
  const [currency, setCurrency] = useState<string>(initialState?.currency || "TWD");
  const [rateToDefaultCurrency, setRateToDefaultCurrency] = useState<string>(initialState?.rateToDefaultCurrency || "");
  const [rateMode, setRateMode] = useState<"last" | "manual">(initialState?.rateMode || "last");
  const [amountMode, setAmountMode] = useState<AmountMode>(initialState?.amountMode || "monthly");
  const [totalAmount, setTotalAmount] = useState<string>(initialState?.totalAmount || "");
  const [monthlyAmount, setMonthlyAmount] = useState<string>(initialState?.monthlyAmount || "");
  const [originalTotalAmount, setOriginalTotalAmount] = useState<string>(
    initialState?.originalTotalAmount || ""
  );
  const [intervalType, setIntervalType] = useState<IntervalType>(
    initialState?.intervalType || "month"
  );
  const [selectedUnit, setSelectedUnit] = useState<"day" | "week" | "month" | "year">(
    initialState?.selectedUnit || "month"
  );
  const [customIntervalMonths, setCustomIntervalMonths] = useState<string>(
    initialState?.customIntervalMonths || "1"
  );
  const [customIntervalUnit, setCustomIntervalUnit] = useState<"day" | "week" | "month" | "year">(
    initialState?.customIntervalUnit || "month"
  );
  const [calculatorExpression, setCalculatorExpression] = useState<string>(
    initialState?.calculatorExpression || ""
  );
  const [selectedTag, setSelectedTag] = useState<TagWithIcon | null>(
    initialState?.selectedTag || null
  );
  const [loading, setLoading] = useState<boolean>(initialState?.loading || false);
  const [error, setError] = useState<string | null>(initialState?.error || null);

  const state: SubscriptionFormState = {
    transactionType,
    startDate,
    endDate,
    tagId,
    name,
    currency,
    rateToDefaultCurrency,
    rateMode,
    amountMode,
    totalAmount,
    monthlyAmount,
    originalTotalAmount,
    intervalType,
    selectedUnit,
    customIntervalMonths,
    customIntervalUnit,
    calculatorExpression,
    selectedTag,
    loading,
    error,
  };

  const actions: SubscriptionFormActions = {
    setTransactionType,
    setStartDate,
    setEndDate,
    setTagId,
    setName,
    setCurrency,
    setRateToDefaultCurrency,
    setRateMode,
    setAmountMode,
    setTotalAmount,
    setMonthlyAmount,
    setOriginalTotalAmount,
    setIntervalType,
    setSelectedUnit,
    setCustomIntervalMonths,
    setCustomIntervalUnit,
    setCalculatorExpression,
    setSelectedTag,
    setLoading,
    setError,
  };

  return { state, actions };
}

