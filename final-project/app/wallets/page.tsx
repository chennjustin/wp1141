"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "@/hooks/useWallet";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useDailyTransactions } from "@/hooks/useDailyTransactions";

/**
 * Wallet home page.
 *
 * This page renders the main wallet overview according to the mobile-first
 * wireframe: monthly summary, carrier section, and daily transactions list
 * with a floating action button to add a new transaction.
 */
export default function WalletHomePage() {
  const router = useRouter();
  const { wallets } = useWallets();

  // For now we treat the first wallet as the active wallet on this page.
  const activeWallet = wallets[0] ?? null;

  const [showAmounts, setShowAmounts] = useState(true);
  const [brightCarrier, setBrightCarrier] = useState(true);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Fetch monthly summary from API
  const {
    data: monthlySummary,
    loading: summaryLoading,
    error: summaryError,
  } = useMonthlySummary({
    walletId: activeWallet?.id ?? null,
    year,
    month,
    enabled: !!activeWallet,
  });

  // Use API data if available, otherwise fallback to 0
  const incomeTotal = monthlySummary?.totalIncome ?? 0;
  const expenseTotal = monthlySummary?.totalExpense ?? 0;

  // Fetch daily transactions for today
  const {
    data: dailyTransactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useDailyTransactions({
    walletId: activeWallet?.id ?? null,
    date: today,
    enabled: !!activeWallet,
  });

  // Transform transactions for display
  // Convert Transaction to UI format: { id, title, amount, time }
  const displayTransactions = useMemo(() => {
    return dailyTransactions.map((tx) => {
      // Use transaction name or tag name as title
      const title = tx.name || tx.tag.name || "未命名交易";
      
      // Calculate display amount based on transaction type
      // INCOME transactions are positive, EXPENSE transactions are negative
      const displayAmount = tx.type === "INCOME" ? tx.amount : -tx.amount;
      
      // Format time from transaction date (HH:mm format)
      const transactionDate = new Date(tx.date);
      const hours = transactionDate.getHours().toString().padStart(2, "0");
      const minutes = transactionDate.getMinutes().toString().padStart(2, "0");
      const time = `${hours}:${minutes}`;

      return {
        id: tx.id,
        title,
        amount: displayAmount,
        time,
      };
    });
  }, [dailyTransactions]);

  // Carrier code - placeholder, should be fetched from user's device carriers
  const carrierCode = "/ABCDEF";

  // Generate barcode pattern from carrier code
  // Barcode width:height ratio is 1:3.5, height is 64px (h-16), so width should be 224px
  const generateBarcodePattern = (code: string) => {
    const pattern: number[] = [];
    const minWidth = 2;
    const maxWidth = 5;
    const gapWidth = 0.5; // gap between bars
    const targetTotalWidth = 224; // 1:3.5 ratio with 64px height (64 * 3.5 = 224)
    const numBars = Math.floor(code.length * 3.5); // Generate enough bars to fill width
    
    let currentWidth = 0;
    
    // Generate pattern based on code characters
    for (let i = 0; i < numBars && currentWidth < targetTotalWidth; i++) {
      const charIndex = i % code.length;
      const char = code[charIndex];
      const charCode = char.charCodeAt(0);
      // Generate width between min and max based on character code
      const width = minWidth + ((charCode + i) % (maxWidth - minWidth + 1));
      const roundedWidth = Math.round(width * 10) / 10;
      
      // Calculate total width including gap (except for last bar)
      const widthWithGap = currentWidth + roundedWidth + (i < numBars - 1 ? gapWidth : 0);
      
      // Ensure we don't exceed target width
      if (widthWithGap <= targetTotalWidth) {
        pattern.push(roundedWidth);
        currentWidth += roundedWidth + (i < numBars - 1 ? gapWidth : 0);
      } else {
        // Add remaining width if there's space
        const remaining = targetTotalWidth - currentWidth;
        if (remaining > minWidth) {
          pattern.push(remaining);
        }
        break;
      }
    }
    
    return pattern;
  };

  const barcodePattern = generateBarcodePattern(carrierCode);
  const barcodeHeight = 64; // h-16 = 64px
  const barcodeWidth = barcodeHeight * 3.5; // 224px for 1:3.5 ratio

  const handleAddTransaction = () => {
    if (!activeWallet) return;
    router.push(`/wallets/${activeWallet.id}/transactions/new`);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Monthly summary section */}
      <section className="rounded-xl bg-white p-4 text-black">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-black">
            {year} 年 {month.toString().padStart(2, "0")} 月
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
            onClick={() => setShowAmounts((prev) => !prev)}
            aria-label="Toggle amounts visibility"
          >
            <span className="text-lg text-black relative inline-block">
              {showAmounts ? (
                "👁"
              ) : (
                <span className="relative inline-block">
                  <span>👁</span>
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-black text-xl leading-none" style={{ transform: 'rotate(-45deg)' }}>/</span>
                  </span>
                </span>
              )}
            </span>
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-black/70">收入</span>
            <span className="text-xl font-semibold text-black">
              {summaryLoading ? (
                <span className="text-sm text-black/50">載入中...</span>
              ) : summaryError ? (
                <span className="text-sm text-red-500" title={summaryError}>
                  載入失敗
                </span>
              ) : showAmounts ? (
                incomeTotal.toLocaleString()
              ) : (
                "*".repeat(incomeTotal.toString().length || 1)
              )}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 items-end text-right">
            <span className="text-xs text-black/70">支出</span>
            <span className="text-xl font-semibold text-black">
              {summaryLoading ? (
                <span className="text-sm text-black/50">載入中...</span>
              ) : summaryError ? (
                <span className="text-sm text-red-500" title={summaryError}>
                  載入失敗
                </span>
              ) : showAmounts ? (
                expenseTotal.toLocaleString()
              ) : (
                "*".repeat(expenseTotal.toString().length || 1)
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Carrier section */}
      <section
        className={`rounded-xl p-4 text-sm transition-colors ${
          brightCarrier ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">載具</span>
          <button
            type="button"
            className="flex items-center gap-2 text-xs"
            onClick={() => setBrightCarrier((prev) => !prev)}
          >
            <span>亮度調整</span>
            <span
              className={`flex h-4 w-8 items-center rounded-full p-0.5 transition-colors ${
                brightCarrier ? "bg-gray-300" : "bg-gray-600"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full bg-white transition-transform ${
                  brightCarrier ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Barcode area */}
        <div className="mb-3 flex flex-col items-center gap-3">
          {/* Barcode - generated from carrier code, 5:2 aspect ratio */}
          <div className="flex h-16 items-center justify-center" style={{ width: `${barcodeWidth}px` }}>
            <div className="flex items-center justify-center gap-0.5">
              {barcodePattern.map((width, index) => (
                <span
                  key={index}
                  className={`block h-16 ${
                    brightCarrier ? "bg-black" : "bg-white"
                  }`}
                  style={{ width: `${width}px` }}
                />
              ))}
            </div>
          </div>

          {/* Carrier code and copy icon */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`inline-flex h-4 w-4 items-center justify-center rounded border hover:opacity-70 ${
                brightCarrier ? "border-black" : "border-white"
              }`}
              onClick={() => {
                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(carrierCode).catch(() => {
                    // Swallow clipboard errors silently for now.
                  });
                }
              }}
              aria-label="Copy carrier code"
            >
              <span
                className={`h-2 w-2 border ${
                  brightCarrier ? "border-black" : "border-white"
                }`}
              />
            </button>
            <span className={`text-sm font-mono ${
              brightCarrier ? "text-black" : "text-white"
            }`}>{carrierCode}</span>
          </div>
        </div>
      </section>

      {/* Daily transactions section */}
      <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-4 text-sm">
        <h2 className="mb-2 text-sm font-medium text-black">當天款項</h2>
        <div className="mt-1 flex-1 overflow-y-auto">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-black/50">載入中...</span>
            </div>
          ) : transactionsError ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-red-500" title={transactionsError}>
                載入失敗
              </span>
            </div>
          ) : displayTransactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-black/50">今天還沒有交易記錄</span>
            </div>
          ) : (
            <ul>
              {displayTransactions.map((tx, index) => (
                <li key={tx.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-black">{tx.title}</span>
                      <span className="text-xs text-black/50">{tx.time}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold text-black ${
                        tx.amount >= 0 ? "" : ""
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                  {index < displayTransactions.length - 1 && (
                    <div className="border-b border-[#E8E8E8]" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Floating add button */}
      <button
        type="button"
        className="fixed bottom-8 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#E8E8E8] text-2xl text-black shadow-lg"
        onClick={handleAddTransaction}
        aria-label="Add new transaction"
        disabled={!activeWallet}
      >
        +
      </button>
    </div>
  );
}




