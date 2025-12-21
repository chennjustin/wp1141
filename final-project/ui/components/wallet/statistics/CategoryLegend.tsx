/**
 * Category legend component
 * 
 * Displays a list of categories with their colors, names, percentages,
 * and amounts. Used below charts to show detailed category information.
 */

"use client";

import { TagIcon } from "@/ui/utils/tag-icon";
import type { CategoryStatistics } from "@/ui/utils/statistics";

interface CategoryLegendProps {
  categories: CategoryStatistics[];
  currency?: string;
  maxItems?: number; // Maximum number of items to display initially
}

/**
 * Category legend component
 * 
 * Renders a scrollable list of categories with their visual indicators
 * (color squares and icons), names, percentages, and amounts.
 * 
 * @param categories - Array of category statistics to display
 * @param currency - Currency code for formatting (default: "TWD")
 * @param maxItems - Maximum items to show before scrolling (default: all)
 */
export function CategoryLegend({
  categories,
  currency = "TWD",
  maxItems,
}: CategoryLegendProps) {
  // Format currency amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine items to display
  const displayCategories = maxItems
    ? categories.slice(0, maxItems)
    : categories;

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-sm text-black/50">No categories to display</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {displayCategories.map((category) => (
        <div
          key={category.tagId}
          className="flex items-center justify-between rounded border border-black/10 bg-white p-3 hover:bg-black/5 transition-colors"
        >
          {/* Left: Color indicator and icon */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="h-4 w-4 rounded flex-shrink-0"
              style={{ backgroundColor: category.color }}
              aria-label={`Color for ${category.tagName}`}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <TagIcon iconKey={category.iconKey} className="text-lg" />
            </div>
            <span className="text-sm font-medium text-black truncate">
              {category.tagName}
            </span>
          </div>

          {/* Right: Percentage and amount */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <span className="text-sm text-black/70">
              {category.percentage.toFixed(1)}%
            </span>
            <span className="text-sm font-semibold text-black">
              {formatAmount(category.totalAmount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

