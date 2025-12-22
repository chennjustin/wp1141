/**
 * Subscription utility functions
 */

/**
 * Get tag background color based on iconKey
 */
export function getTagColor(iconKey: string): string {
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

/**
 * Format date for display
 * @param date - Date string or Date object
 * @returns Formatted date string (YYYY/MM/DD) or "選擇日期" if empty
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "選擇日期";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "選擇日期";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * Format amount for display (for form inputs)
 * @param amountString - Amount as string
 * @returns Formatted amount string with $ prefix
 */
export function formatAmountString(amountString: string): string {
  if (!amountString) return "$0";
  const num = parseFloat(amountString);
  if (isNaN(num)) return "$0";
  const rounded = Math.round(num * 100) / 100;
  return `$${rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Format amount for display (for numbers)
 * @param amount - Amount as number
 * @param currency - Currency code
 * @returns Formatted amount string with currency prefix
 */
export function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${currency} ${rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Interval type for billing cycle
 */
export type IntervalType = "day" | "week" | "month" | "year" | "custom";

/**
 * Calculate interval months from interval type and custom values
 * @param intervalType - Type of interval
 * @param customIntervalMonths - Custom interval value as string
 * @param customIntervalUnit - Unit for custom interval
 * @returns Interval in months
 */
export function calculateIntervalMonths(
  intervalType: IntervalType,
  customIntervalMonths: string,
  customIntervalUnit: "day" | "week" | "month" | "year"
): number {
  if (intervalType === "day") return 0.033;
  if (intervalType === "week") return 0.25;
  if (intervalType === "month") return 1;
  if (intervalType === "year") return 12;
  if (intervalType === "custom") {
    const value = parseFloat(customIntervalMonths) || 1;
    if (customIntervalUnit === "day") return value * 0.033;
    if (customIntervalUnit === "week") return value * 0.25;
    if (customIntervalUnit === "month") return value;
    if (customIntervalUnit === "year") return value * 12;
    return value;
  }
  return 1;
}

/**
 * Supported currencies
 */
export const CURRENCIES = ["TWD", "USD", "EUR", "JPY", "CNY"] as const;

