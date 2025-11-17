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
      <section className="rounded-xl bg-white/80 p-4 text-[#3f2a20] shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium">
            {year} 年 {month.toString().padStart(2, "0")} 月
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
            onClick={() => setShowAmounts((prev) => !prev)}
            aria-label="Toggle amounts visibility"
          >
            <span
              className={`relative h-4 w-6 rounded-full border border-[#3f2a20] ${
                showAmounts ? "" : "opacity-50"
              }`}
            >
              <span className="absolute inset-1 flex items-center justify-center text-[10px]">
                {showAmounts ? "👁" : "✕"}
              </span>
            </span>
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-[#3f2a20]/70">收入</span>
            <span className="text-xl font-semibold">
              {showAmounts ? mockIncomeTotal.toLocaleString() : "••••"}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 items-end text-right">
            <span className="text-xs text-[#3f2a20]/70">支出</span>
            <span className="text-xl font-semibold">
              {showAmounts ? mockExpenseTotal.toLocaleString() : "••••"}
            </span>
          </div>
        </div>
      </section>

      {/* Carrier section */}
      <section
        className={`rounded-xl border p-4 text-sm shadow-sm transition-colors ${
          brightCarrier
            ? "border-[#bd9e84] bg-white/90 text-[#3f2a20]"
            : "border-[#3f2a20] bg-[#3f2a20] text-white"
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
                brightCarrier ? "bg-[#bd9e84]" : "bg-gray-400"
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
        <div className="mb-3 flex flex-col gap-3">
          <div
            className={`flex h-16 items-center justify-center rounded-lg border ${
              brightCarrier ? "border-[#bd9e84]/70" : "border-white/60"
            }`}
          >
            <div className="flex w-4/5 justify-between">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className={`block rounded-sm ${
                    index % 3 === 0 ? "h-12" : index % 3 === 1 ? "h-9" : "h-6"
                  } ${brightCarrier ? "bg-[#3f2a20]" : "bg-white"}`}
                  style={{ width: "2px" }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/5"
              onClick={() => {
                const code = "/ABCDEF";
                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(code).catch(() => {
                    // Swallow clipboard errors silently for now.
                  });
                }
              }}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border">
                <span className="h-2 w-2 border border-[#3f2a20]" />
              </span>
              <span>複製</span>
            </button>
            <span className="text-sm font-mono">/ABCDEF</span>
          </div>
        </div>
      </section>

      {/* Daily transactions section */}
      <section className="flex min-h-0 flex-1 flex-col rounded-xl bg-white/80 p-4 text-sm shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-[#3f2a20]">當天款項</h2>
        <div className="mt-1 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {mockTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-[#e6d4cb] bg-white px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-[#3f2a20]">{tx.title}</span>
                  <span className="text-[11px] text-[#3f2a20]/70">
                    {tx.time}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : "-"}
                  {Math.abs(tx.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Floating add button */}
      <button
        type="button"
        className="fixed bottom-8 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#bd9e84] text-2xl text-white shadow-lg shadow-[#bd9e84]/40"
        onClick={handleAddTransaction}
        aria-label="Add new transaction"
        disabled={!activeWallet}
      >
        +
      </button>
    </div>
  );
}




