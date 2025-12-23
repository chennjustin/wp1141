"use client";

import React, { useState } from "react";
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
  initialValue?: string; // 初始值，用於繼續編輯已有金額
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
  initialValue = "",
}: CalculatorKeypadProps) {
  const [expression, setExpression] = useState<string>(initialValue);
  
  // 當 initialValue 改變時，更新 expression（用於繼續編輯）
  // 只在 expression 為空且 initialValue 有值時設置，避免覆蓋用戶正在輸入的內容
  React.useEffect(() => {
    if (initialValue && !expression && initialValue !== expression) {
      setExpression(initialValue);
      onExpressionChange?.(initialValue);
    }
  }, [initialValue]); // 只在 initialValue 改變時執行

  // 更新 expression 並通知父元件
  const updateExpression = (newExpr: string) => {
    setExpression(newExpr);
    onExpressionChange?.(newExpr);
  };

  const handleAppend = (ch: string): void => {
    if (!canAppendChar(expression, ch)) return;
    updateExpression(expression + ch);
  };

  const handleBackspace = () => {
    updateExpression(backspaceExpr(expression));
  };

  const handleClear = () => {
    // When AC is pressed, temporarily set expression to "0" so the display shows "0"
    updateExpression("0");
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
    <div className="shrink-0 pb-4 pt-6 bg-white border-t border-gray-200">
      {/* Keypad: 5 columns */}
      <div className="grid grid-cols-5 gap-2 px-4">
        {/* Row 1: 7, 8, 9, ÷, AC */}
        <button
          type="button"
          onClick={() => handleAppend("7")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleAppend("8")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleAppend("9")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleAppend("÷")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          ÷
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          AC
        </button>

        {/* Row 2: 4, 5, 6, ×, ← */}
        <button
          type="button"
          onClick={() => handleAppend("4")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleAppend("5")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleAppend("6")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleAppend("×")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          ×
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          ←
        </button>

        {/* Row 3: 1, 2, 3, ＋, OK (2 rows) */}
        <button
          type="button"
          onClick={() => handleAppend("1")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleAppend("2")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleAppend("3")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleAppend("+")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={handleOk}
          className="row-span-2 flex h-full items-center justify-center bg-black text-lg font-medium text-white active:scale-95 active:bg-gray-800 transition-all"
        >
          完成
        </button>

        {/* Row 4: 00, 0, ., − */}
        <button
          type="button"
          onClick={() => handleAppend("00")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleAppend("0")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleAppend(".")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleAppend("-")}
          className="flex h-12 items-center justify-center bg-gray-50 text-lg font-medium text-black active:scale-95 active:bg-gray-200 transition-all"
        >
          −
        </button>
      </div>
    </div>
  );
}

