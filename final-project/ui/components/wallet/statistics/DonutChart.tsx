/**
 * Donut chart component for category statistics
 * 
 * Displays category statistics as a donut (ring) chart using recharts.
 * Shows total amount in the center and segments for each category.
 */

"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryStatistics } from "@/ui/utils/statistics";

interface DonutChartProps {
  data: CategoryStatistics[];
  totalAmount: number;
  currency?: string;
}

/**
 * Custom tooltip for donut chart
 * 
 * Displays category name, amount, and percentage when hovering over segments
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length || !payload[0]) {
    return null;
  }

  const item = payload[0];
  // Recharts passes data directly in payload[0], not in payload[0].payload
  const name = item.name || item.payload?.name || "";
  const value = item.value ?? item.payload?.value ?? 0;
  const percentage = item.percentage ?? item.payload?.percentage ?? 0;

  if (!name || value === 0) {
    return null;
  }

  return (
    <div className="rounded border border-black/20 bg-white p-2 shadow-lg">
      <p className="text-sm font-medium text-black">{name}</p>
      <p className="text-xs text-black/70">
        {typeof value === "number" ? value.toLocaleString() : String(value)} (
        {typeof percentage === "number" ? percentage.toFixed(1) : "0.0"}%)
      </p>
    </div>
  );
};

/**
 * Donut chart component
 * 
 * Renders a donut chart with category segments. The center displays
 * the total amount. Each segment represents a category with its
 * assigned color.
 * 
 * @param data - Array of category statistics
 * @param totalAmount - Total amount to display in center
 * @param currency - Currency code for formatting (default: "TWD")
 */
export function DonutChart({
  data,
  totalAmount,
  currency = "TWD",
}: DonutChartProps) {
  // Prepare data for recharts
  // Include all original data in the payload for tooltip access
  const chartData = data.map((item) => ({
    name: item.tagName,
    value: item.totalAmount,
    percentage: item.percentage,
    color: item.color,
    // Store original data for tooltip
    tagName: item.tagName,
    totalAmount: item.totalAmount,
  }));

  // Format total amount for display
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalAmount);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-black/70 mb-1">Total</p>
          <p className="text-2xl font-bold text-black">{formattedTotal}</p>
        </div>
      </div>
    </div>
  );
}

