"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listSubscriptionHistoryAction } from "@/modules/subscription/routes/list-subscription-history";
import { TagIcon } from "@/ui/utils/tag-icon";
import { useCurrentWallet } from "@/hooks/useCurrentWallet";
import { useWallets } from "@/hooks/useWallet";

/**
 * Subscription with tag
 */
interface SubscriptionWithTag {
  id: string;
  walletId: string;
  amount: number;
  currency: string;
  nextBilling: Date | string;
  intervalMonths: number;
  startDate: Date | string;
  endDate: Date | string | null;
  type: "INCOME" | "EXPENSE";
  tagId: string;
  name: string | null;
  isDeleted: boolean;
  tag: {
    id: string;
    name: string;
    iconKey: string;
  };
}

/**
 * Get tag background color based on iconKey
 */
function getTagColor(iconKey: string): string {
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
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * Format amount for display
 */
function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${currency} ${rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Subscription history page
 * 
 * Displays all subscriptions (including deleted) for the current wallet.
 */
export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallets } = useWallets();
  
  // Get walletId from search params or use current wallet
  const walletIdParam = searchParams.get("walletId");
  const currentWallet = useCurrentWallet({ 
    wallets, 
    currentWalletId: walletIdParam || null 
  });
  const walletId = walletIdParam || currentWallet?.id;

  const [subscriptions, setSubscriptions] = useState<SubscriptionWithTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription history
  useEffect(() => {
    async function fetchSubscriptionHistory() {
      if (!walletId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await listSubscriptionHistoryAction(walletId);

        if (result.success && result.data) {
          setSubscriptions(result.data as unknown as SubscriptionWithTag[]);
          setError(null);
        } else {
          setError(result.error?.toString() || "載入訂閱歷史失敗");
        }
      } catch (err) {
        console.error("Failed to fetch subscription history", err);
        setError(err instanceof Error ? err.message : "載入訂閱歷史失敗");
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptionHistory();
  }, [walletId]);

  const handleSubscriptionClick = (subscriptionId: string, isDeleted: boolean) => {
    if (isDeleted) return; // Don't allow editing deleted subscriptions
    router.push(`/wallets/subscriptions/${subscriptionId}/edit${walletId ? `?walletId=${walletId}` : ""}`);
  };

  if (!walletId) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">無法取得錢包資訊</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col -mx-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center hover:bg-black/10 transition-colors"
          aria-label="返回"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-base font-medium text-black">訂閱歷史</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Subscriptions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">載入中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-red-500" title={error}>
              載入失敗
            </span>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-black/50">還沒有訂閱記錄</span>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const bgColor = getTagColor(subscription.tag.iconKey);
              const isDeleted = subscription.isDeleted;
              return (
                <button
                  key={subscription.id}
                  type="button"
                  onClick={() => handleSubscriptionClick(subscription.id, isDeleted)}
                  disabled={isDeleted}
                  className={`w-full flex items-center gap-3 p-3 bg-white rounded-lg transition-colors ${
                    isDeleted 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Tag Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgColor} flex-shrink-0`}>
                    <TagIcon
                      iconKey={subscription.tag.iconKey}
                      size={24}
                      color="currentColor"
                      className="text-gray-700"
                    />
                  </div>

                  {/* Subscription Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-black">
                        {subscription.name || subscription.tag.name}
                      </span>
                      {isDeleted && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          已刪除
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-black/50">
                      <div className="flex items-start gap-2">
                        <span className="w-8 text-left">開始:</span>
                        <span>{formatDate(subscription.startDate)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-8 text-left">結束:</span>
                        <span>{subscription.endDate ? formatDate(subscription.endDate) : "永久"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-sm flex-shrink-0 text-right">
                    {subscription.endDate ? (
                      (() => {
                        // Calculate total amount from monthly amount
                        const start = new Date(subscription.startDate);
                        const end = new Date(subscription.endDate);
                        const diffTime = end.getTime() - start.getTime();
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        const totalMonths = diffDays / (30 * subscription.intervalMonths);
                        const totalAmount = subscription.amount * totalMonths;
                        const roundedTotal = Math.round(totalAmount * 100) / 100;
                        return (
                          <>
                            <div className="font-semibold text-black">
                              {formatAmount(roundedTotal, subscription.currency)}
                            </div>
                            <div className="text-xs text-black/50 mt-0.5">
                              總共 {formatAmount(roundedTotal, subscription.currency)}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <div className="font-semibold text-black">
                          {formatAmount(Math.round(subscription.amount * 100) / 100, subscription.currency)}
                        </div>
                        <div className="text-xs text-black/50 mt-0.5">
                          每月 {formatAmount(Math.round(subscription.amount * 100) / 100, subscription.currency)}
                        </div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

