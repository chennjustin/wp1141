"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useDailyTransactions } from "@/hooks/useDailyTransactions";
import { useUser } from "@/hooks/useUser";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";

/**
 * Wallet detail page
 * 
 * This page displays a specific wallet's overview including monthly summary,
 * carrier section (for personal wallets only), and daily transactions list.
 */
export default function WalletDetailPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params?.walletId as string | null;
  const { wallet, loading: walletLoading } = useWallet(walletId);
  const { profile } = useUser();

  const [showAmounts, setShowAmounts] = useState(true);
  const [brightCarrier, setBrightCarrier] = useState(true);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Memoize today's date to prevent creating new Date object on every render
  // This prevents infinite re-render loops in useDailyTransactions
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Check if this is a personal wallet
  const isPersonalWallet = useMemo(() => {
    if (!wallet || !profile) return false;
    return (
      wallet.name === "我的錢包" ||
      (wallet.members.length === 1 &&
        wallet.members[0].userId === profile.id &&
        wallet.members[0].role === WalletRole.OWNER)
    );
  }, [wallet, profile]);

  // Fetch monthly summary from API with refetch capability
  const {
    data: monthlySummary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useMonthlySummary({
    walletId: wallet?.id ?? null,
    year,
    month,
    enabled: !!wallet,
  });

  // Use API data if available, otherwise fallback to 0
  const incomeTotal = monthlySummary?.totalIncome ?? 0;
  const expenseTotal = monthlySummary?.totalExpense ?? 0;

  // Fetch daily transactions for today
  const {
    data: dailyTransactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useDailyTransactions({
    walletId: wallet?.id ?? null,
    date: today,
    enabled: !!wallet,
  });

  // Refetch data when returning from transaction creation page
  const pathname = usePathname();
  useEffect(() => {
    // Refetch transactions and summary when wallet is loaded
    if (wallet && pathname === `/wallets/${wallet.id}`) {
      // Small delay to ensure navigation is complete
      const timer = setTimeout(() => {
        refetchTransactions();
        refetchSummary();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [wallet?.id, pathname, refetchTransactions, refetchSummary]);

  // Also refetch when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && wallet) {
        refetchTransactions();
        refetchSummary();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [wallet, refetchTransactions, refetchSummary]);

  // Transform transactions for display
  const displayTransactions = useMemo(() => {
    return dailyTransactions.map((tx) => {
      const title = tx.name || tx.tag.name || "未命名交易";
      const displayAmount = tx.type === "INCOME" ? tx.amount : -tx.amount;
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
  const generateBarcodePattern = (code: string) => {
    const pattern: number[] = [];
    const minWidth = 2;
    const maxWidth = 5;
    const gapWidth = 0.5;
    const targetTotalWidth = 224;
    const numBars = Math.floor(code.length * 3.5);
    
    let currentWidth = 0;
    
    for (let i = 0; i < numBars && currentWidth < targetTotalWidth; i++) {
      const charIndex = i % code.length;
      const char = code[charIndex];
      const charCode = char.charCodeAt(0);
      const width = minWidth + ((charCode + i) % (maxWidth - minWidth + 1));
      const roundedWidth = Math.round(width * 10) / 10;
      
      const widthWithGap = currentWidth + roundedWidth + (i < numBars - 1 ? gapWidth : 0);
      
      if (widthWithGap <= targetTotalWidth) {
        pattern.push(roundedWidth);
        currentWidth += roundedWidth + (i < numBars - 1 ? gapWidth : 0);
      } else {
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
  const barcodeHeight = 64;
  const barcodeWidth = barcodeHeight * 3.5;

  const handleAddTransaction = () => {
    if (!wallet) return;
    router.push(`/wallets/${wallet.id}/transactions/new`);
  };

  if (walletLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-black/50">載入中...</span>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">錢包不存在或無權限存取</span>
      </div>
    );
  }

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

      {/* Carrier section - only for personal wallets */}
      {isPersonalWallet && (
        <section
          className={`relative rounded-xl p-4 text-sm transition-colors ${
            brightCarrier ? "bg-white text-black" : "bg-black text-white"
          }`}
        >
          {/* Copy toast notification */}
          {showCopyToast && (
            <div 
              className="absolute left-1/2 top-4 z-10 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5 text-xs text-white shadow-2xl border border-gray-600/50 backdrop-blur-sm"
              style={{
                animation: isFadingOut 
                  ? 'fadeOut 0.3s ease-in forwards' 
                  : 'slideDown 0.3s ease-out, scaleIn 0.3s ease-out',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 text-green-400"
                  style={{
                    animation: isFadingOut ? 'none' : 'checkmark 0.4s ease-out 0.1s both',
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">已複製載具代碼</span>
              </div>
            </div>
          )}
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
                onClick={async () => {
                  if (navigator?.clipboard?.writeText) {
                    try {
                      await navigator.clipboard.writeText(carrierCode);
                      setIsFadingOut(false);
                      setShowCopyToast(true);
                      setTimeout(() => {
                        setIsFadingOut(true);
                        setTimeout(() => {
                          setShowCopyToast(false);
                          setIsFadingOut(false);
                        }, 300); // 淡出动画时间
                      }, 1700); // 显示时间
                    } catch (error) {
                      // Swallow clipboard errors silently for now.
                    }
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
      )}

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
        disabled={!wallet}
      >
        +
      </button>
    </div>
  );
}

