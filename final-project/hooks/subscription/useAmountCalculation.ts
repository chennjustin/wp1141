import { useMemo } from "react";
import { calculateIntervalMonths, type IntervalType } from "@/ui/utils/subscription-utils";
import type { AmountMode } from "./useSubscriptionForm";

/**
 * Hook for calculating subscription amounts
 */
export function useAmountCalculation(
  amountMode: AmountMode,
  totalAmount: string,
  monthlyAmount: string,
  startDate: string,
  endDate: string,
  intervalType: IntervalType,
  customIntervalMonths: string,
  customIntervalUnit: "day" | "week" | "month" | "year"
) {
  // Calculate interval months
  const intervalMonths = useMemo(() => {
    return calculateIntervalMonths(intervalType, customIntervalMonths, customIntervalUnit);
  }, [intervalType, customIntervalMonths, customIntervalUnit]);

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

    // Calculate total months
    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const totalMonths = diffDays / (30 * intervalMonths);

    if (totalMonths <= 0) return null;

    const monthly = total / totalMonths;
    return Math.round(monthly * 100) / 100; // Round to 2 decimal places
  }, [amountMode, totalAmount, startDate, endDate, intervalMonths]);

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

    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const totalMonths = diffDays / (30 * intervalMonths);

    if (totalMonths <= 0) return null;

    const total = monthly * totalMonths;
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }, [amountMode, monthlyAmount, startDate, endDate, intervalMonths]);

  return {
    intervalMonths,
    calculatedMonthlyAmount,
    calculatedTotalAmount,
  };
}

