"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { listSubscriptionsAction } from "@/modules/subscription/routes/list-subscriptions";
import { TagIcon } from "@/ui/utils/tag-icon";
import { FloatingAddButton } from "@/ui/components/wallet/FloatingAddButton";
import { getTagColor, formatDate, formatAmount } from "@/ui/utils/subscription-utils";

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
 * Subscriptions list page
 * 
 * Displays all active subscriptions for the current wallet.
 */
export default function SubscriptionsPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params.walletId as string;

  const [subscriptions, setSubscriptions] = useState<SubscriptionWithTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    router.push(`/wallets/${walletId}/subscriptions/new/tag`);
  };

  const handleViewHistory = () => {
    router.push(`/wallets/${walletId}/subscriptions/history`);
  };

  const handleSubscriptionClick = (subscriptionId: string) => {
    router.push(`/wallets/${walletId}/subscriptions/${subscriptionId}/edit`);
  };

  const handleCancelSubscription = async (e: React.MouseEvent, subscriptionId: string) => {
    e.stopPropagation();
    
    if (!confirm("確定要取消此訂閱嗎？取消後將停止未來的自動扣款。")) {
      return;
    }

    try {
      setDeletingId(subscriptionId);
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "取消失敗");
      }

      // Refresh subscriptions list to show updated endDate
      const result = await listSubscriptionsAction({
        walletId,
        includeDeleted: false,
      });

      if (result.success && result.data) {
        setSubscriptions(result.data as unknown as SubscriptionWithTag[]);
      }
    } catch (err) {
      console.error("Failed to cancel subscription", err);
      alert(err instanceof Error ? err.message : "取消失敗");
    } finally {
      setDeletingId(null);
    }
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
          查看歷史訂閱
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
              const isDeleting = deletingId === subscription.id;
              return (
                <div
                  key={subscription.id}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors relative group"
                >
                  <button
                    type="button"
                    onClick={() => handleSubscriptionClick(subscription.id)}
                    className="flex-1 flex items-center gap-3 min-w-0"
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
                            // Round to integer for total amount display
                            return formatAmount(Math.round(totalAmount), subscription.currency);
                          })()
                        ) : (
                          formatAmount(Math.round(subscription.amount * 100) / 100, subscription.currency)
                        )}
                      </div>
                      <div className="text-xs text-black/50 text-left space-y-0.5">
                        <div>下次付款: {formatDate(subscription.nextBilling)}</div>
                        {subscription.endDate && (
                          <div>每月要繳: {formatAmount(Math.round(subscription.amount * 100) / 100, subscription.currency)}</div>
                        )}
                        {!subscription.endDate && (
                          <div>下次要繳: {formatAmount(Math.round(subscription.amount * 100) / 100, subscription.currency)}</div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCancelSubscription(e, subscription.id)}
                    disabled={isDeleting}
                    className="flex-shrink-0 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="取消訂閱"
                  >
                    {isDeleting ? "取消中..." : "取消"}
                  </button>
                </div>
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

