"use client";

import { useState } from "react";
import {
  canAppendChar,
  backspace as backspaceExpr,
  clearExpression,
  evaluate,
} from "@/lib/calculator";

interface CalculatorKeypadProps {
  onConfirm: (result: number) => void;
  clearOnConfirm?: boolean;
  onExpressionChange?: (expression: string) => void; // 當 expression 改變時通知父元件
}

/**
 * 計算機元件：
 * - 內部維護一個字串 expression，例如 "12+3×4-5.6"
 * - 按 OK 時 evaluate()，把結果傳給 onConfirm(result)
 * - AC 清空，← 刪除最後一個字元
 */
export function CalculatorKeypad({
  onConfirm,
  clearOnConfirm = true,
  onExpressionChange,
}: CalculatorKeypadProps) {
  const [expression, setExpression] = useState<string>("");

  // 更新 expression 並通知父元件
  const updateExpression = (newExpr: string) => {
    setExpression(newExpr);
    onExpressionChange?.(newExpr);
  };

  const handleAppend = (ch: string) => {
    if (!canAppendChar(expression, ch)) return;
    updateExpression(expression + ch);
  };

  const handleBackspace = () => {
    updateExpression(backspaceExpr(expression));
  };

  const handleClear = () => {
    updateExpression(clearExpression());
  };

  const handleOk = () => {
    try {
      if (!expression.trim()) return;
      const result = evaluate(expression);
      onConfirm(result);
      if (clearOnConfirm) {
        updateExpression(clearExpression());
      }
    } catch {
      // expression 無效時暫時忽略（不更新）
    }
  };

  return (
    <div className="mt-auto shrink-0 bg-[#D2D2D2] pb-0 pt-10">
      {/* Keypad: 5 columns */}
      <div className="grid grid-cols-5 gap-2 pb-1">
        {/* Row 1: 7, 8, 9, ÷, AC */}
        <button
          type="button"
          onClick={() => handleAppend("7")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleAppend("8")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleAppend("9")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleAppend("÷")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          ÷
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          AC
        </button>

        {/* Row 2: 4, 5, 6, ×, ← */}
        <button
          type="button"
          onClick={() => handleAppend("4")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleAppend("5")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleAppend("6")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleAppend("×")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          ×
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          ←
        </button>

        {/* Row 3: 1, 2, 3, ＋, OK (2 rows) */}
        <button
          type="button"
          onClick={() => handleAppend("1")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleAppend("2")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleAppend("3")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleAppend("+")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={handleOk}
          className="row-span-2 flex h-full items-center justify-center rounded-full bg-green-500 text-lg font-medium text-white active:bg-green-600"
        >
          OK
        </button>

        {/* Row 4: 00, 0, ., − */}
        <button
          type="button"
          onClick={() => handleAppend("00")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleAppend("0")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleAppend(".")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleAppend("-")}
          className="flex h-12 items-center justify-center rounded-full bg-white text-lg font-medium text-black active:bg-gray-100"
        >
          −
        </button>
      </div>
    </div>
  );
}


