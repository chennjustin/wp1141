"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listSubscriptionsAction } from "@/modules/subscription/routes/list-subscriptions";
import { TagIcon } from "@/ui/utils/tag-icon";
import { FloatingAddButton } from "@/ui/components/wallet/FloatingAddButton";
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
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Subscriptions list page
 * 
 * Displays all active subscriptions for the current wallet.
 */
export default function SubscriptionsPage() {
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

  // Fetch subscriptions
  useEffect(() => {
    async function fetchSubscriptions() {
      if (!walletId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await listSubscriptionsAction({
          walletId,
          includeDeleted: false,
        });

        if (result.success && result.data) {
          setSubscriptions(result.data as unknown as SubscriptionWithTag[]);
          setError(null);
        } else {
          setError(result.error?.toString() || "載入訂閱失敗");
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
        setError(err instanceof Error ? err.message : "載入訂閱失敗");
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [walletId]);

  const handleAddSubscription = () => {
    if (!walletId) return;
    router.push(`/wallets/subscriptions/new/tag?walletId=${walletId}`);
  };

  const handleViewHistory = () => {
    router.push(`/wallets/subscriptions/history${walletId ? `?walletId=${walletId}` : ""}`);
  };

  const handleSubscriptionClick = (subscriptionId: string) => {
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
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-medium text-black">訂閱清單</h1>
        <button
          type="button"
          onClick={handleViewHistory}
          className="text-xs text-black/70 hover:text-black transition-colors"
        >
          查看歷史所有訂閱
        </button>
      </header>

      {/* Subscriptions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
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
            <span className="text-sm text-black/50">還沒有訂閱項目</span>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const bgColor = getTagColor(subscription.tag.iconKey);
              return (
                <button
                  key={subscription.id}
                  type="button"
                  onClick={() => handleSubscriptionClick(subscription.id)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
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
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-black text-left">
                        {subscription.name || subscription.tag.name}
                      </div>
                      {/* Amount Mode Label */}
                      {subscription.endDate ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          總金額
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          每月金額
                        </span>
                      )}
                    </div>
                    {/* Display amount based on mode */}
                    <div className="text-xs font-medium text-black mb-1">
                      {subscription.endDate ? (
                        (() => {
                          // Calculate total amount from monthly amount
                          const start = new Date(subscription.startDate);
                          const end = new Date(subscription.endDate);
                          const diffTime = end.getTime() - start.getTime();
                          const diffDays = diffTime / (1000 * 60 * 60 * 24);
                          const totalMonths = diffDays / (30 * subscription.intervalMonths);
                          const totalAmount = subscription.amount * totalMonths;
                          return formatAmount(Math.round(totalAmount * 100) / 100, subscription.currency);
                        })()
                      ) : (
                        formatAmount(subscription.amount, subscription.currency)
                      )}
                    </div>
                    <div className="text-xs text-black/50 text-left space-y-0.5">
                      <div>下次付款: {formatDate(subscription.nextBilling)}</div>
                      {subscription.endDate && (
                        <div>每月要繳: {formatAmount(subscription.amount, subscription.currency)}</div>
                      )}
                      {!subscription.endDate && (
                        <div>下次要繳: {formatAmount(subscription.amount, subscription.currency)}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={handleAddSubscription} />
    </div>
  );
}
