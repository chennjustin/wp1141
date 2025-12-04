"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWallets } from "@/hooks/useWallet";
import { useUser } from "@/hooks/useUser";
import type { Wallet } from "@/modules/wallet/domain/wallet.types";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";

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
 * Check if wallet is a personal wallet
 */
function isPersonalWallet(wallet: Wallet, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false;
  return (
    wallet.name === "我的錢包" ||
    (wallet.members.length === 1 &&
     wallet.members[0].userId === currentUserId &&
     wallet.members[0].role === WalletRole.OWNER)
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
  const isPersonal = isPersonalWallet(wallet, currentUserId);

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
      className="relative z-0 rounded-xl bg-white p-4 text-black border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
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

      {/* Wallet type */}
      <div className="mb-2">
        <span className="text-xs text-black/70">
          {isPersonal ? "個人錢包" : "團體錢包"}
        </span>
      </div>

      {/* Description */}
      {wallet.description && (
        <div className="mt-2">
          <p className="text-sm text-black/80 line-clamp-2">{wallet.description}</p>
        </div>
      )}
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
  const { data: session, update: updateSession } = useSession();
  const { profile } = useUser();
  const { wallets, loading, error, refetch } = useWallets();
  const [pinningWalletId, setPinningWalletId] = useState<string | null>(null);
  const [pinnedWalletIds, setPinnedWalletIds] = useState<Set<string>>(new Set());

  const currentUserId = profile?.id;

  // Fetch pinned wallets on mount
  useEffect(() => {
    async function fetchPinnedWallets() {
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
    }
    fetchPinnedWallets();
  }, []);

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
          throw new Error(errorData.error || "Failed to unpin wallet");
        }

        const data = await response.json();
        if (data.success && data.pinnedWalletIds) {
          setPinnedWalletIds(new Set(data.pinnedWalletIds));
        }
      } else {
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
          throw new Error(errorData.error || "Failed to pin wallet");
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

  // Handle card click - navigate to wallet history page
  const handleCardClick = (walletId: string) => {
    router.push(`/wallets/${walletId}/history`);
  };

  // Check if wallet is My Wallet
  const isMyWallet = (wallet: Wallet) => {
    return wallet.name === "我的錢包";
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-black/50">載入中...</span>
      </div>
    );
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
    <div className="flex flex-col gap-4 relative z-0">
      <h1 className="text-xl font-semibold text-black mb-2">所有錢包</h1>
      <div className="grid grid-cols-1 gap-4">
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

