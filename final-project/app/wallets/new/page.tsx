"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "@/hooks/useWallet";
import { useUser } from "@/hooks/useUser";

/**
 * Create wallet page
 * 
 * This page allows users to create a new wallet.
 * It includes forms for wallet name, default currency, description, and invited users.
 */
export default function CreateWalletPage() {
  const router = useRouter();
  const { refetch: refreshWallets } = useWallets();
  const { profile } = useUser();
  
  // Form state
  const [name, setName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("TWD");
  const [description, setDescription] = useState("");
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string }>>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string }>>([]);
  const [showUserSearchResults, setShowUserSearchResults] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Search users
  useEffect(() => {
    if (userSearchQuery.trim().length < 2) {
      setUserSearchResults([]);
      setShowUserSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(userSearchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setUserSearchResults(data.users || []);
          setShowUserSearchResults(true);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery]);

  const handleAddInvitedUser = (user: { id: string; userId: string; name: string; imageUrl?: string }) => {
    if (!invitedUserIds.includes(user.id)) {
      setInvitedUserIds([...invitedUserIds, user.id]);
      setInvitedUsers([...invitedUsers, user]);
      setUserSearchQuery("");
      setShowUserSearchResults(false);
    }
  };

  const handleRemoveInvitedUser = (userId: string) => {
    setInvitedUserIds(invitedUserIds.filter(id => id !== userId));
    setInvitedUsers(invitedUsers.filter(user => user.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const walletData: any = {
        name: name.trim(),
        defaultCurrency,
        setAsDefault: false,
      };

      if (description.trim()) {
        walletData.description = description.trim();
      }

      if (invitedUserIds.length > 0) {
        walletData.invitedUserIds = invitedUserIds;
      }

      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(walletData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        refreshWallets();
        
        // Navigate to the newly created wallet
        setTimeout(() => {
          router.push(`/wallets/${data.id}`);
        }, 1500);
      } else {
        setError(data.error || "新增失敗，請稍後再試");
      }
    } catch (err) {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-black">新增錢包</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-black hover:text-black/70"
        >
          取消
        </button>
      </div>

      {/* Wallet Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="walletName" className="text-sm font-medium text-black">
            錢包名稱 <span className="text-red-500">*</span>
          </label>
          <input
            id="walletName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入錢包名稱"
            required
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="userSearch" className="text-sm font-medium text-black">
            新增人員（選填）
          </label>
          <div className="relative">
            <input
              id="userSearch"
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              onFocus={() => {
                if (userSearchResults.length > 0) {
                  setShowUserSearchResults(true);
                }
              }}
              placeholder="搜尋使用者 ID 或名稱"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
            />
            {showUserSearchResults && userSearchResults.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserSearchResults(false)}
                />
                <div className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                  {userSearchResults
                    .filter(user => !invitedUserIds.includes(user.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleAddInvitedUser(user)}
                        className="w-full px-3 py-2 text-left text-sm text-black hover:bg-gray-100"
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.userId}</div>
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
          {invitedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {invitedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {user.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveInvitedUser(user.id)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="currency" className="text-sm font-medium text-black">
            預設幣別
          </label>
          <select
            id="currency"
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
          >
            <option value="TWD">TWD - 新台幣</option>
            <option value="USD">USD - 美元</option>
            <option value="EUR">EUR - 歐元</option>
            <option value="JPY">JPY - 日圓</option>
            <option value="CNY">CNY - 人民幣</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-black">
            備註（選填）
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="請輸入備註說明"
            rows={4}
            className="resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
            錢包新增成功！
          </div>
        )}

        <div className="mt-auto flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-black hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "處理中..." : "確認"}
          </button>
        </div>
      </form>
    </div>
  );
}
