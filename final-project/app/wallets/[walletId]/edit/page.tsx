"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUser } from "@/hooks/useUser";
import { useWallets } from "@/hooks/useWallet";
import { useSession } from "next-auth/react";
import { WalletUserStatus, WalletRole } from "@/modules/wallet/domain/wallet.types";

/**
 * Pending member dropdown component
 * 
 * Dropdown menu for managing pending invitations (cancel invite or change role)
 */
function PendingMemberDropdown({
  member,
  walletId,
  onRoleChange,
  onCancelInvite,
}: {
  member: { id: string; userId: string; name: string; role: WalletRole; status: WalletUserStatus; imageUrl?: string };
  walletId: string;
  onRoleChange: (newRole: WalletRole) => Promise<void>;
  onCancelInvite: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleRoleChange = async (newRole: WalletRole) => {
    if (newRole !== member.role) {
      await onRoleChange(newRole);
    }
    setIsOpen(false);
  };

  const handleCancelInvite = () => {
    if (confirm("確定要取消邀請嗎？")) {
      onCancelInvite();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-lg text-gray-800 hover:text-black px-2 py-1 rounded hover:bg-gray-200 font-bold leading-none"
        style={{ fontSize: '18px', lineHeight: '1' }}
      >
        ⋮
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-gray-300 bg-white shadow-lg z-20">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleRoleChange(WalletRole.MEMBER)}
              className={`w-full px-3 py-2 text-left text-sm ${
                member.role === WalletRole.MEMBER
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {member.role === WalletRole.MEMBER ? "✓ MEMBER" : "設為 MEMBER"}
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange(WalletRole.VIEWER)}
              className={`w-full px-3 py-2 text-left text-sm ${
                member.role === WalletRole.VIEWER
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {member.role === WalletRole.VIEWER ? "✓ VIEWER" : "設為 VIEWER"}
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              type="button"
              onClick={handleCancelInvite}
              className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
            >
              取消邀請
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Member role dropdown component
 * 
 * Dropdown menu for managing member roles (MEMBER/VIEWER) and removing members
 */
function MemberRoleDropdown({
  member,
  walletId,
  onRoleChange,
  onRemove,
}: {
  member: { id: string; userId: string; name: string; role: WalletRole; status: WalletUserStatus; imageUrl?: string };
  walletId: string;
  onRoleChange: (newRole: WalletRole) => Promise<void>;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleRoleChange = async (newRole: WalletRole) => {
    if (newRole !== member.role) {
      await onRoleChange(newRole);
    }
    setIsOpen(false);
  };

  const handleRemove = () => {
    if (confirm("確定要移除這位成員嗎？")) {
      onRemove();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-lg text-gray-800 hover:text-black px-2 py-1 rounded hover:bg-gray-200 font-bold leading-none"
        style={{ fontSize: '18px', lineHeight: '1' }}
      >
        ⋮
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-gray-300 bg-white shadow-lg z-20">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleRoleChange(WalletRole.MEMBER)}
              className={`w-full px-3 py-2 text-left text-sm ${
                member.role === WalletRole.MEMBER
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {member.role === WalletRole.MEMBER ? "✓ MEMBER" : "設為 MEMBER"}
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange(WalletRole.VIEWER)}
              className={`w-full px-3 py-2 text-left text-sm ${
                member.role === WalletRole.VIEWER
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {member.role === WalletRole.VIEWER ? "✓ VIEWER" : "設為 VIEWER"}
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              type="button"
              onClick={handleRemove}
              className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
            >
              移除成員
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  
  // Track initial values to detect unsaved changes
  const [initialName, setInitialName] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  
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
  const [invitedUsers, setInvitedUsers] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string; role: WalletRole }>>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; userId: string; name: string; imageUrl?: string }>>([]);
  const [showUserSearchResults, setShowUserSearchResults] = useState(false);
  const [defaultInviteRole, setDefaultInviteRole] = useState<WalletRole>(WalletRole.MEMBER);
  
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
    async function loadWalletWithAllMembers() {
      if (!wallet || !currentUserId) return;

      const walletName = wallet.name || "";
      const walletDescription = wallet.description || "";
      
      setName(walletName);
      setInitialName(walletName);
      setDefaultCurrency(wallet.defaultCurrency || "TWD");
      setDescription(walletDescription);
      setInitialDescription(walletDescription);
      
      // If user is owner, fetch wallet with all members (including PENDING)
      if (isCreator) {
        try {
          const response = await fetch(`/api/wallets/${walletId}?includePending=true`, {
            credentials: "include",
          });
          if (response.ok) {
            const walletData = await response.json();
            const members = walletData.members.map((m: any) => ({
              id: m.id,
              userId: m.userId,
              name: m.user.name,
              role: m.role,
              status: m.status,
              imageUrl: m.user.image || undefined,
            }));
            setExistingMembers(members);
            return;
          }
        } catch (err) {
          console.error("Error fetching wallet with all members:", err);
        }
      }
      
      // Fallback to regular wallet data
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

    loadWalletWithAllMembers();
  }, [wallet, currentUserId, isCreator, walletId]);

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
      setInvitedUsers([...invitedUsers, { ...user, role: defaultInviteRole }]);
      setUserSearchQuery("");
      setShowUserSearchResults(false);
    }
  };

  const handleInviteUsers = async () => {
    if (invitedUsers.length === 0) return;

    setError(null);
    setLoading(true);

    try {
      const invitations = invitedUsers.map(user => ({
        userId: user.id,
        role: user.role,
      }));
      const inviteResponse = await fetch(`/api/wallets/${walletId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ invitations }),
      });

      if (!inviteResponse.ok) {
        const inviteData = await inviteResponse.json();
        setError(inviteData.error || "新增成員失敗");
        setLoading(false);
        return;
      }

      // Reload wallet data to show PENDING members
      if (isCreator) {
        try {
          const walletResponse = await fetch(`/api/wallets/${walletId}?includePending=true`, {
            credentials: "include",
          });
          if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            const members = walletData.members.map((m: any) => ({
              id: m.id,
              userId: m.userId,
              name: m.user.name,
              role: m.role,
              status: m.status,
              imageUrl: m.user.image || undefined,
            }));
            setExistingMembers(members);
          }
        } catch (err) {
          console.error("Error reloading wallet:", err);
        }
      }

      // Clear invited users after successful invitation
      setInvitedUsers([]);
      setInvitedUserIds([]);
      setSuccess(true);
      
      refreshWallets();
      setLoading(false);
    } catch (err) {
      setError("網路錯誤，請稍後再試");
      setLoading(false);
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
        const errorMessage = data.error || "刪除錢包失敗";
        if (errorMessage === "Cannot delete default wallet") {
          alert("無法刪除預設錢包");
        } else {
          alert(errorMessage);
        }
      }
    } catch (err) {
      alert("網路錯誤，請稍後再試");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError(null);
    setLoading(true);

    try {
      // Update wallet info
      const updateData: any = {};

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

      setSuccess(true);
      refreshWallets();
      
      // Update initial values to reflect saved state
      setInitialName(name.trim());
      setInitialDescription(description.trim());
      
      // Navigate back to previous page after successful update
      setTimeout(() => {
        router.back();
      }, 500);
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
    <div className="flex h-full flex-col relative -mx-4">
      {/* Custom header: Back button, Wallet name, Checkmark button */}
      <header className="relative mb-1 flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        {/* Left: Back button */}
        <button
          type="button"
          onClick={() => {
            // Check for unsaved changes
            const hasNameChange = !isDefaultWallet && name.trim() !== initialName.trim();
            const hasDescriptionChange = description.trim() !== initialDescription.trim();
            const hasPendingInvitations = invitedUsers.length > 0;
            
            if (hasNameChange || hasDescriptionChange || hasPendingInvitations) {
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

        {/* Center: Wallet name - absolutely centered (same style as WalletHeader) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            className="relative inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium hover:opacity-80 active:opacity-90 focus:outline-none focus:ring-0 transition-opacity"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
            aria-label="錢包名稱"
          >
            <span className="max-w-[140px] truncate">{wallet?.name || "載入中..."}</span>
          </button>
        </div>

        {/* Right: Checkmark/Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (!isDefaultWallet && !name.trim())}
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
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  await handleDeleteWallet();
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4 overflow-y-auto">
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
            disabled
            className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-black/50 cursor-not-allowed focus:outline-none"
          >
            <option value="TWD">TWD - 新台幣</option>
            <option value="USD">USD - 美元</option>
            <option value="EUR">EUR - 歐元</option>
            <option value="JPY">JPY - 日圓</option>
            <option value="CNY">CNY - 人民幣</option>
          </select>
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
                <button
                  type="button"
                  onClick={handleInviteUsers}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border-2 border-blue-500 bg-white px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {loading ? "處理中..." : "邀請"}
                </button>
              </>
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
                          <div className="text-sm font-medium text-black">
                            {member.name}
                            {isCurrentUser && <span className="ml-1 text-xs text-gray-500">(You)</span>}
                            {member.status === WalletUserStatus.PENDING && (
                              <span className="ml-1 text-xs text-gray-500">(Pending)</span>
                            )}
                          </div>
                          <div className="text-xs text-black/50">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isCreator && !isCurrentUser && !isMemberCreator && (
                          member.status === WalletUserStatus.PENDING ? (
                            <PendingMemberDropdown
                              member={member}
                              walletId={walletId}
                              onRoleChange={async (newRole) => {
                                try {
                                  const response = await fetch(`/api/wallets/${walletId}/members/${member.userId}`, {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    credentials: "include",
                                    body: JSON.stringify({ role: newRole }),
                                  });
                                  if (response.ok) {
                                    setExistingMembers(existingMembers.map(m => 
                                      m.userId === member.userId ? { ...m, role: newRole } : m
                                    ));
                                  } else {
                                    const data = await response.json();
                                    alert(data.error || "更新權限失敗");
                                  }
                                } catch (err) {
                                  alert("網路錯誤，請稍後再試");
                                }
                              }}
                              onCancelInvite={() => handleRemoveMember(member.userId)}
                            />
                          ) : (
                            <MemberRoleDropdown
                              member={member}
                              walletId={walletId}
                              onRoleChange={async (newRole) => {
                                try {
                                  const response = await fetch(`/api/wallets/${walletId}/members/${member.userId}`, {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    credentials: "include",
                                    body: JSON.stringify({ role: newRole }),
                                  });
                                  if (response.ok) {
                                    setExistingMembers(existingMembers.map(m => 
                                      m.userId === member.userId ? { ...m, role: newRole } : m
                                    ));
                                  } else {
                                    const data = await response.json();
                                    alert(data.error || "更新權限失敗");
                                  }
                                } catch (err) {
                                  alert("網路錯誤，請稍後再試");
                                }
                              }}
                              onRemove={() => handleRemoveMember(member.userId)}
                            />
                          )
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
        </div>

        {/* Description */}
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
            錢包更新成功！
          </div>
        )}

        {/* Delete button at the bottom - only show for owner and non-default wallet */}
        {isCreator && !isDefaultWallet && (
          <div className="mt-auto pt-4 pb-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-lg border-2 border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              刪除
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

