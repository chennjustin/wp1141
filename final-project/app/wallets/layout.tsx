"use client";

import { ReactNode, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useWallets } from "@/hooks/useWallet";
import type { Wallet, WalletMember } from "@/modules/wallet/domain/wallet.types";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";

interface WalletLayoutProps {
  children: ReactNode;
}

/**
 * Wallets layout that provides a mobile-sized, centered container
 * and shared UI for the wallet section (header, main menu, etc).
 */
export default function WalletsLayout({ children }: WalletLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { profile, isAuthenticated } = useUser();
  const { wallets, loading: walletsLoading } = useWallets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);

  const currentWallet: Wallet | null = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return null;
    }

    const byId = wallets.find((w) => w.id === currentWalletId);
    if (byId) return byId;

    return wallets[0];
  }, [wallets, currentWalletId]);

  const currentRole: WalletMember["role"] | null = useMemo(() => {
    if (!currentWallet || !profile) return null;

    const member = currentWallet.members.find(
      (m) => m.userId === profile.id
    );

    return member?.role ?? null;
  }, [currentWallet, profile]);

  // Check if current wallet is a personal wallet (我的錢包)
  // A personal wallet typically has only one member who is the owner
  const isPersonalWallet = useMemo(() => {
    if (!currentWallet || !profile) return false;
    return (
      currentWallet.name === "我的錢包" ||
      (currentWallet.members.length === 1 &&
        currentWallet.members[0].userId === profile.id &&
        currentWallet.members[0].role === WalletRole.OWNER)
    );
  }, [currentWallet, profile]);

  // Get user name - must be defined before conditional return
  // Fallback to session name or email if profile name is not available
  const userName = profile?.name ?? session?.user?.name ?? session?.user?.email ?? "";

  // Display name for navbar right side
  // Personal wallet: show user name (fallback to session name/email)
  // Shared wallet: show role
  const displayName = useMemo(() => {
    if (isPersonalWallet) {
      // For personal wallet, show user name, fallback to session name/email
      return userName || session?.user?.name || session?.user?.email || "User";
    }
    if (currentRole) {
      return currentRole.charAt(0) + currentRole.slice(1).toLowerCase();
    }
    // Fallback to session name/email if no role
    return userName || session?.user?.name || session?.user?.email || "User";
  }, [isPersonalWallet, currentRole, userName, session]);

  if (!isAuthenticated) {
    return null;
  }

  const handleWalletChange = (walletId: string) => {
    setCurrentWalletId(walletId);
    setIsWalletSelectorOpen(false);
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    if (pathname === path) return;
    router.push(path);
  };

  // Default wallet name display
  const walletDisplayName = currentWallet
    ? currentWallet.name === "我的錢包" || isPersonalWallet
      ? "我的錢包"
      : currentWallet.name
    : "No wallet";

  return (
    <div className="min-h-screen bg-[#D2D2D2] flex justify-center px-4 py-4">
      {/* Mobile-sized container with thick black border and rounded corners */}
      <div className="relative flex min-h-[calc(100vh-2rem)] w-full max-w-sm flex-col border-[3px] border-black bg-[#D2D2D2] rounded-3xl overflow-visible">
        {/* Header */}
        <header className="relative mb-4 flex items-center justify-between bg-[#D2D2D2] px-4 py-3">
          {/* Left: main menu toggle */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open main menu"
          >
            <span className="flex flex-col gap-0.5">
              <span className="h-0.5 w-4 rounded-full bg-black" />
              <span className="h-0.5 w-4 rounded-full bg-black" />
              <span className="h-0.5 w-4 rounded-full bg-black" />
            </span>
          </button>

          {/* Center: wallet selector - oval button, absolutely centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-100"
              onClick={() => setIsWalletSelectorOpen(true)}
              aria-label="Select wallet"
            >
              <span className="max-w-[140px] truncate">{walletDisplayName}</span>
            </button>

            {/* Wallet selector dropdown */}
            {isWalletSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setIsWalletSelectorOpen(false)}
                />
                <div className="absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-lg bg-white shadow-lg border border-gray-200 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <div className="py-2">
                    {wallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
                        onClick={() => handleWalletChange(wallet.id)}
                      >
                        {wallet.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100 border-t border-gray-200"
                      onClick={() => {
                        setIsWalletSelectorOpen(false);
                        // TODO: Navigate to create wallet page
                      }}
                    >
                      + 新增錢包
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: user name or role text */}
          <div className="flex flex-col items-end text-right text-xs leading-snug text-black">
            <span className="font-semibold">{displayName}</span>
          </div>
        </header>

        {/* Side menu overlay */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:absolute md:rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-[#D2D2D2] p-4 shadow-xl md:absolute md:inset-y-4 md:left-4 md:rounded-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-black">
                  主選單
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close main menu"
                >
                  <span className="h-4 w-4 rotate-45 border-b-2 border-r-2 border-black" />
                </button>
              </div>

              {/* User block */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-black">
                    {userName || "User"}
                  </span>
                </div>
              </div>

              {/* Menu buttons */}
              <nav className="flex flex-col gap-3 text-sm text-black">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
                  onClick={() => handleNavigate("/wallets/notifications")}
                >
                  通知
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
                  onClick={() => handleNavigate("/wallets/history")}
                >
                  收支明細
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
                  onClick={() => handleNavigate("/wallets/subscriptions")}
                >
                  訂閱清單
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
                  onClick={() => handleNavigate("/wallets/settings")}
                >
                  設定
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main content area */}
        <main className="flex-1 pb-16 px-4">
          {walletsLoading && (
            <div className="flex h-full items-center justify-center text-sm text-black/80">
              Loading wallets...
            </div>
          )}
          {!walletsLoading && wallets.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-black/80">
              <p>目前還沒有錢包。</p>
              <p>請先在後端建立或之後新增建立錢包的介面。</p>
            </div>
          )}
          {!walletsLoading && wallets.length > 0 && children}
        </main>
      </div>
    </div>
  );
}




