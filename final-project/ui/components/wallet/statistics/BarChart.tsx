/**
 * Bar chart component for category statistics
 * 
 * Displays category statistics as a horizontal bar chart using recharts.
 * Shows percentage values for each category.
 */

"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategoryStatistics } from "@/ui/utils/statistics";

interface BarChartProps {
  data: CategoryStatistics[];
}

/**
 * Custom tooltip for bar chart
 * 
 * Displays category name, amount, and percentage when hovering over bars
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length || !payload[0]) {
    return null;
  }

  const item = payload[0];
  // Recharts passes data directly in payload[0].payload for BarChart
  const payloadData = item.payload || item;
  const name = payloadData.name || "";
  const totalAmount = payloadData.totalAmount ?? 0;
  const percentage = payloadData.percentage ?? 0;

  if (!name || totalAmount === 0) {
    return null;
  }

  return (
    <div className="rounded border border-black/20 bg-white p-2 shadow-lg">
      <p className="text-sm font-medium text-black">{name}</p>
      <p className="text-xs text-black/70">
        {typeof totalAmount === "number"
          ? totalAmount.toLocaleString()
          : String(totalAmount)}{" "}
        ({typeof percentage === "number" ? percentage.toFixed(1) : "0.0"}%)
      </p>
    </div>
  );
};


/**
 * Custom label for X-axis
 * 
 * Formats category names for display on the X-axis
 */
const CustomXAxisTick = ({ x, y, payload }: any) => {
  return (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
      fill="#000"
      fontSize={12}
      className="truncate"
    >
      {payload.value && payload.value.length > 10
        ? `${payload.value.substring(0, 10)}...`
        : payload.value}
    </text>
  );
};

/**
 * Bar chart component
 * 
 * Renders a vertical bar chart with category percentages.
 * Each bar represents a category with its assigned color.
 * 
 * @param data - Array of category statistics
 */
export function BarChart({ data }: BarChartProps) {
  // Prepare data for recharts
  const chartData = data.map((item) => ({
    name: item.tagName,
    percentage: Number(item.percentage.toFixed(1)),
    totalAmount: item.totalAmount,
    color: item.color,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="category"
            dataKey="name"
            tick={CustomXAxisTick}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#000", fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

