"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "@/hooks/useWallet";

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

  // Placeholder monthly totals and transactions. These should be replaced
  // with real data once transaction APIs are available.
  const mockIncomeTotal = 10000;
  const mockExpenseTotal = 20000;

  const mockTransactions = [
    { id: "1", title: "早餐", amount: -80, time: "08:30" },
    { id: "2", title: "午餐", amount: -120, time: "12:15" },
    { id: "3", title: "薪水", amount: 30000, time: "09:00" },
  ];

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
              {showAmounts
                ? mockIncomeTotal.toLocaleString()
                : "*".repeat(mockIncomeTotal.toLocaleString().length)}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 items-end text-right">
            <span className="text-xs text-black/70">支出</span>
            <span className="text-xl font-semibold text-black">
              {showAmounts
                ? mockExpenseTotal.toLocaleString()
                : "*".repeat(mockExpenseTotal.toLocaleString().length)}
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
          {/* Barcode - centered, same length, different thickness, wider */}
          <div className="flex h-16 items-center justify-center">
            <div className="flex items-center justify-center gap-0.5">
              {Array.from({ length: 12 }).map((_, index) => {
                // Different widths for different thickness - made wider
                const widths = [2, 3, 2.5, 4, 2, 3, 2.5, 3, 2.5, 4, 2, 3];
                return (
                  <span
                    key={index}
                    className={`block h-12 ${
                      brightCarrier ? "bg-black" : "bg-white"
                    }`}
                    style={{ width: `${widths[index]}px` }}
                  />
                );
              })}
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
                const code = "/ABCDEF";
                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(code).catch(() => {
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
            }`}>/ABCDEF</span>
          </div>
        </div>
      </section>

      {/* Daily transactions section */}
      <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-white p-4 text-sm">
        <h2 className="mb-2 text-sm font-medium text-black">當天款項</h2>
        <div className="mt-1 flex-1 overflow-y-auto">
          <ul>
            {mockTransactions.map((tx, index) => (
              <li key={tx.id}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-black">{tx.title}</span>
                  <span
                    className={`text-sm font-semibold text-black ${
                      tx.amount >= 0 ? "" : ""
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : "-"}
                    {Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
                {index < mockTransactions.length - 1 && (
                  <div className="border-b border-[#D2D2D2]" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Floating add button */}
      <button
        type="button"
        className="fixed bottom-8 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#D2D2D2] text-2xl text-black shadow-lg"
        onClick={handleAddTransaction}
        aria-label="Add new transaction"
        disabled={!activeWallet}
      >
        +
      </button>
    </div>
  );
}




