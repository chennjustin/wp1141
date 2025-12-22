"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWallets } from "@/hooks/useWallet";
import { useUser } from "@/hooks/useUser";
import type { Wallet } from "@/modules/wallet/domain/wallet.types";
import { Loading } from "@/ui/components/common/Loading";

/**
 * Pin icon component - filled (pinned)
 */
function PinIconFilled() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pin head (circle) */}
      <circle cx="10" cy="6" r="4.5" fill="currentColor" />
      {/* Pin body (triangle pointing down) */}
      <path d="M10 10.5 L7 18 L13 18 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Pin icon component - outline (unpinned)
 */
function PinIconOutline() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pin head (circle outline) */}
      <circle cx="10" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Pin body (triangle outline) */}
      <path d="M10 10.5 L7 18 L13 18 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/**
 * Wallet card component
 */
interface WalletCardProps {
  wallet: Wallet;
  isPinned: boolean;
  isMyWallet: boolean;
  currentUserId: string | undefined;
  onPinToggle: (walletId: string, isPinned: boolean) => Promise<void>;
  onCardClick: (walletId: string) => void;
}

function WalletCard({
  wallet,
  isPinned,
  isMyWallet,
  currentUserId,
  onPinToggle,
  onCardClick,
}: WalletCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (isToggling || (isMyWallet && isPinned)) return; // Prevent unpinning My Wallet

    setIsToggling(true);
    try {
      await onPinToggle(wallet.id, isPinned);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="relative z-0 rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
      onClick={() => onCardClick(wallet.id)}
    >
      {/* Pin button - top right */}
      <button
        type="button"
        className={`absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors ${
          isToggling ? "opacity-50 cursor-not-allowed" : ""
        } ${isMyWallet && isPinned ? "cursor-not-allowed" : ""}`}
        onClick={handlePinClick}
        disabled={isToggling || (isMyWallet && isPinned)}
        aria-label={isPinned ? "Unpin wallet" : "Pin wallet"}
      >
        {isPinned ? (
          <PinIconFilled />
        ) : (
          <PinIconOutline />
        )}
      </button>

      {/* Wallet name */}
      <h3 className="text-lg font-semibold text-black pr-8 mb-2">
        {wallet.name}
      </h3>

      {/* Description */}
      {wallet.description && (
        <div className="mt-2">
          <p className="text-sm text-black/80 line-clamp-2">{wallet.description}</p>
        </div>
      )}

      {/* Member count */}
      <div className="mt-2">
        <span className="text-xs text-gray-500">
          成員：{wallet.members.length}
        </span>
      </div>
    </div>
  );
}

/**
 * All wallets page
 * 
 * Displays all wallets in a card grid layout.
 * Users can pin/unpin wallets and navigate to wallet details.
 */
export default function AllWalletsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, update: updateSession } = useSession();
  const { profile } = useUser();
  const { wallets, loading, error, refetch } = useWallets();
  const [pinningWalletId, setPinningWalletId] = useState<string | null>(null);
  const [pinnedWalletIds, setPinnedWalletIds] = useState<Set<string>>(new Set());

  const currentUserId = profile?.id;

  // Fetch pinned wallets on mount and when page becomes visible
  const fetchPinnedWallets = async () => {
    try {
      const response = await fetch("/api/users/default-wallet");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pinnedWalletIds) {
          setPinnedWalletIds(new Set(data.pinnedWalletIds));
        }
      }
    } catch (error) {
      console.error("Error fetching pinned wallets:", error);
    }
  };

  useEffect(() => {
    fetchPinnedWallets();
  }, []);

  // Refetch wallets and pinned wallets when page becomes visible (e.g., user returns from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetch();
        fetchPinnedWallets();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  // Handle pin toggle
  const handlePinToggle = async (walletId: string, isPinned: boolean) => {
    if (pinningWalletId) return; // Prevent concurrent requests

    setPinningWalletId(walletId);
    try {
      if (isPinned) {
        // Unpin wallet
        const response = await fetch("/api/users/default-wallet", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          const errorMessage = errorData.error || "Failed to unpin wallet";
          
          // Map backend error messages to user-friendly messages
          if (errorMessage === "Cannot unpin My Wallet") {
            throw new Error("無法取消釘選「我的錢包」");
          } else if (errorMessage === "Wallet is not pinned") {
            throw new Error("此錢包尚未釘選");
          } else if (errorMessage === "Wallet not found or access denied") {
            throw new Error("錢包不存在或無權限存取");
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.success && data.pinnedWalletIds) {
          setPinnedWalletIds(new Set(data.pinnedWalletIds));
        }
      } else {
        // Pin wallet - check limit before attempting (excluding My Wallet)
        const wallet = wallets.find((w) => w.id === walletId);
        if (!wallet) {
          throw new Error("錢包不存在");
        }
        
        const myWallet = isMyWallet(wallet);
        
        if (!myWallet) {
          // Count pinned wallets (excluding My Wallet)
          const pinnedCount = Array.from(pinnedWalletIds).filter((id) => {
            const w = wallets.find((w) => w.id === id);
            return w && !isMyWallet(w);
          }).length;
          
          if (pinnedCount >= 5) {
            throw new Error("最多只能釘選 5 個錢包（「我的錢包」不計入限制）");
          }
        }

        // Pin wallet
        const response = await fetch("/api/users/default-wallet", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          const errorMessage = errorData.error || "Failed to pin wallet";
          
          // Map backend error messages to user-friendly messages
          if (errorMessage === "Maximum 5 pinned wallets allowed") {
            throw new Error("最多只能釘選 5 個錢包（「我的錢包」不計入限制）");
          } else if (errorMessage === "Wallet not found or access denied") {
            throw new Error("錢包不存在或無權限存取");
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.success && data.pinnedWalletIds) {
          setPinnedWalletIds(new Set(data.pinnedWalletIds));
        }
      }

      // Update session
      if (updateSession) {
        await updateSession();
      }

      // Refetch wallets to get updated data
      await refetch();
    } catch (error) {
      console.error("Error toggling pin:", error);
      // TODO: Show error toast/notification
      alert(error instanceof Error ? error.message : "操作失敗，請稍後再試");
    } finally {
      setPinningWalletId(null);
    }
  };

  // Handle card click - navigate to wallet detail page
  // Handle card click - navigate to wallet detail page
  const handleCardClick = (walletId: string) => {
    router.push(`/wallets/${walletId}`);
  };

  // Check if wallet is My Wallet
  const isMyWallet = (wallet: Wallet) => {
    return wallet.name === "我的錢包";
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">載入失敗：{error}</span>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-black/80">目前還沒有錢包。</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto relative z-0">
      <h1 className="text-xl font-semibold text-black mb-2 flex-shrink-0">所有錢包</h1>
      <div className="grid grid-cols-1 gap-4 pb-4">
        {wallets.map((wallet) => {
          const isPinned = pinnedWalletIds.has(wallet.id);
          const myWallet = isMyWallet(wallet);
          return (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              isPinned={isPinned}
              isMyWallet={myWallet}
              currentUserId={currentUserId}
              onPinToggle={handlePinToggle}
              onCardClick={handleCardClick}
            />
          );
        })}
      </div>
    </div>
  );
}

