"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUser } from "@/hooks/useUser";
import { useWallets } from "@/hooks/useWallet";
import { useSession } from "next-auth/react";
import { WalletUserStatus, WalletRole } from "@/modules/wallet/domain/wallet.types";

/**
 * Edit wallet page
 * 
 * This page allows users to edit wallet information, manage members, and delete wallet.
 */
export default function EditWalletPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const walletId = (params?.walletId as string) ?? "";
  const { wallet, loading: walletLoading } = useWallet(walletId);
  const { profile } = useUser();
  const { refetch: refreshWallets } = useWallets();
  const [userDefaultWalletId, setUserDefaultWalletId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("TWD");
  const [description, setDescription] = useState("");
  
  // Member management
  const [existingMembers, setExistingMembers] = useState<Array<{
    id: string;
    userId: string;
    name: string;
    role: WalletRole;
    status: WalletUserStatus;
    imageUrl?: string;
  }>>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string }>>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string }>>([]);
  const [showUserSearchResults, setShowUserSearchResults] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Permission checks
  const currentUserId = session?.user?.id;
  const isCreator = useMemo(() => {
    if (!wallet || !currentUserId) return false;
    return wallet.members.some(
      member => 
        member.userId === currentUserId && 
        member.status === WalletUserStatus.OWNER && 
        member.role === WalletRole.OWNER
    );
  }, [wallet, currentUserId]);

  // Fetch user's default wallet ID
  useEffect(() => {
    async function fetchUserDefaultWallet() {
      if (!currentUserId) return;
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserDefaultWalletId(data.defaultWalletId || null);
        }
      } catch (err) {
        console.error("Error fetching user default wallet:", err);
      }
    }
    fetchUserDefaultWallet();
  }, [currentUserId]);

  const isDefaultWallet = useMemo(() => {
    return userDefaultWalletId === walletId;
  }, [userDefaultWalletId, walletId]);

  // Load wallet data
  useEffect(() => {
    if (wallet) {
      setName(wallet.name || "");
      setDefaultCurrency(wallet.defaultCurrency || "TWD");
      setDescription(wallet.description || "");
      
      // Load existing members
      const members = wallet.members.map(m => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          role: m.role,
          status: m.status,
          imageUrl: m.user.image || undefined,
        }));
      setExistingMembers(members);
    }
  }, [wallet]);

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
          // Filter out users who are already members
          const existingMemberIds = existingMembers.map(m => m.userId);
          const filtered = (data.users || []).filter(
            (user: { id: string }) => !existingMemberIds.includes(user.id) && !invitedUserIds.includes(user.id)
          );
          setUserSearchResults(filtered);
          setShowUserSearchResults(true);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, existingMembers, invitedUserIds]);

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

  const handleRemoveMember = async (memberUserId: string) => {
    if (!confirm("確定要移除這位成員嗎？")) {
      return;
    }

    try {
      const response = await fetch(`/api/wallets/${walletId}/members/${memberUserId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Remove from existing members
        setExistingMembers(existingMembers.filter(m => m.userId !== memberUserId));
      } else {
        const data = await response.json();
        alert(data.error || "移除成員失敗");
      }
    } catch (err) {
      alert("網路錯誤，請稍後再試");
    }
  };

  const handleLeaveWallet = async () => {
    if (!confirm("確定要退出這個錢包嗎？")) {
      return;
    }

    try {
      const response = await fetch(`/api/wallets/${walletId}/leave`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        refreshWallets();
        router.push("/wallets");
      } else {
        const data = await response.json();
        alert(data.error || "退出錢包失敗");
      }
    } catch (err) {
      alert("網路錯誤，請稍後再試");
    }
  };

  const handleDeleteWallet = async () => {
    if (!confirm("確定要刪除這個錢包嗎？此操作無法復原。")) {
      return;
    }

    try {
      const response = await fetch(`/api/wallets/${walletId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        refreshWallets();
        router.push("/wallets");
      } else {
        const data = await response.json();
        alert(data.error || "刪除錢包失敗");
      }
    } catch (err) {
      alert("網路錯誤，請稍後再試");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Update wallet info
      const updateData: any = {
        defaultCurrency,
      };

      if (!isDefaultWallet && name.trim()) {
        updateData.name = name.trim();
      }

      if (description.trim()) {
        updateData.description = description.trim();
      }

      const response = await fetch(`/api/wallets/${walletId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "更新失敗，請稍後再試");
        setLoading(false);
        return;
      }

      // Add new members if any
      if (invitedUserIds.length > 0) {
        const inviteResponse = await fetch(`/api/wallets/${walletId}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userIds: invitedUserIds }),
        });

        if (!inviteResponse.ok) {
          const inviteData = await inviteResponse.json();
          setError(inviteData.error || "新增成員失敗");
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      refreshWallets();
      
      // Navigate back to wallet page
      setTimeout(() => {
        router.push(`/wallets/${walletId}`);
      }, 1500);
    } catch (err) {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  if (walletLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-black/60">載入中...</span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-black hover:text-black/70"
        >
          ← 返回
        </button>
        {isCreator && !isDefaultWallet ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            刪除
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-black hover:text-black/70"
          >
            取消
          </button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">確認刪除</h3>
            <p className="text-sm text-black/70 mb-4">
              確定要刪除這個錢包嗎？此操作無法復原。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-black hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteWallet();
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        {/* Wallet name */}
        {!isDefaultWallet && (
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
        )}

        {isDefaultWallet && (
          <div className="flex flex-col gap-2">
            <label htmlFor="walletName" className="text-sm font-medium text-black">
              錢包名稱
            </label>
            <input
              id="walletName"
              type="text"
              value={name}
              disabled
              className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-black/50 cursor-not-allowed"
            />
            <p className="text-xs text-black/50">預設錢包無法修改名稱</p>
          </div>
        )}

        {/* Default currency */}
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

        {/* Add members */}
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

        {/* Existing members */}
        {existingMembers.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              現有成員
            </label>
            <div className="flex flex-col gap-2">
              {existingMembers.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const isMemberCreator = member.status === WalletUserStatus.OWNER && member.role === WalletRole.OWNER;
                
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-black">{member.name}</div>
                        <div className="text-xs text-black/50">
                          {isMemberCreator ? "創建者" : member.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isCreator && !isCurrentUser && !isMemberCreator && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          移除
                        </button>
                      )}
                      {!isCreator && isCurrentUser && (
                        <button
                          type="button"
                          onClick={handleLeaveWallet}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          退出
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
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
            錢包更新成功！
          </div>
        )}

        <div className="mt-auto flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-black hover:bg-gray-50"
          >
            返回
          </button>
          <button
            type="submit"
            disabled={loading || (!isDefaultWallet && !name.trim())}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "處理中..." : "確認"}
          </button>
        </div>
      </form>
    </div>
  );
}

