"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "@/hooks/useWallet";
import { useUser } from "@/hooks/useUser";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";

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
  const [invitedUsers, setInvitedUsers] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string; role: WalletRole }>>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string }>>([]);
  const [showUserSearchResults, setShowUserSearchResults] = useState(false);
  const [defaultInviteRole, setDefaultInviteRole] = useState<WalletRole>(WalletRole.MEMBER);
  
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
          // Filter out users who are already invited
          const filtered = (data.users || []).filter(
            (user: { id: string }) => !invitedUserIds.includes(user.id)
          );
          setUserSearchResults(filtered);
          setShowUserSearchResults(true);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, invitedUserIds]);

  const handleAddInvitedUser = (user: { id: string; userId: string; name: string; imageUrl?: string }) => {
    if (!invitedUserIds.includes(user.id)) {
      setInvitedUserIds([...invitedUserIds, user.id]);
      setInvitedUsers([...invitedUsers, { ...user, role: defaultInviteRole }]);
      setUserSearchQuery("");
      setShowUserSearchResults(false);
    }
  };

  const handleRemoveInvitedUser = (userId: string) => {
    setInvitedUserIds(invitedUserIds.filter(id => id !== userId));
    setInvitedUsers(invitedUsers.filter(user => user.id !== userId));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
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

      // Include invited users with their roles
      if (invitedUsers.length > 0) {
        walletData.invitedUserIds = invitedUsers.map(u => u.id);
        // Note: The backend will use default role (MEMBER) for invited users
        // If we need to support roles during creation, we'd need to modify the API
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
    <div className="flex h-full flex-col relative -mx-4">
      {/* Custom header: Back button, Page title, Checkmark button */}
      <header className="relative mb-1 flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        {/* Left: Back button */}
        <button
          type="button"
          onClick={() => {
            // Check for unsaved changes
            const hasName = name.trim().length > 0;
            const hasDescription = description.trim().length > 0;
            const hasPendingInvitations = invitedUsers.length > 0;
            
            if (hasName || hasDescription || hasPendingInvitations) {
              if (confirm("您有未儲存的變更，確定要離開嗎？")) {
                router.back();
              }
            } else {
              router.back();
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          aria-label="取消"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Center: Page title - absolutely centered (same style as WalletHeader) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            className="relative inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium hover:opacity-80 active:opacity-90 focus:outline-none focus:ring-0 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
            aria-label="新增錢包"
          >
            <span className="max-w-[140px] truncate">新增錢包</span>
          </button>
        </div>

        {/* Right: Checkmark/Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="確認"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </header>

      {/* Wallet Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4 overflow-y-auto">
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

        {/* Member management section with gray background */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
          {/* Add members */}
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="userSearch" className="text-sm font-medium text-black">
              新增人員
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
                    {userSearchResults.map((user) => (
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
              <>
                <div className="mt-2 flex flex-wrap gap-2">
                  {invitedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
                    >
                      {user.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveInvitedUser(user.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-gray-600">權限：</label>
                  <select
                    value={defaultInviteRole}
                    onChange={(e) => {
                      const newRole = e.target.value as WalletRole;
                      setDefaultInviteRole(newRole);
                      // Update all pending users' roles
                      setInvitedUsers(invitedUsers.map(u => ({ ...u, role: newRole })));
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-black focus:border-blue-500 focus:outline-none"
                  >
                    <option value={WalletRole.MEMBER}>MEMBER</option>
                    <option value={WalletRole.VIEWER}>VIEWER</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="currency" className="text-sm font-medium text-black">
            預設幣別 <span className="text-xs font-normal text-gray-500">（預設幣別不得修改）</span>
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
            備註
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
      </form>
    </div>
  );
}
