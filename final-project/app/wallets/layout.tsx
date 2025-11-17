"use client";

import { ReactNode, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useWallets } from "@/hooks/useWallet";
import type { Wallet, WalletMember } from "@/modules/wallet/domain/wallet.types";

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
  const { profile, isAuthenticated } = useUser();
  const { wallets, loading: walletsLoading } = useWallets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  if (!isAuthenticated) {
    return null;
  }

  const userName = profile?.name ?? "";

  const handleWalletChange = (walletId: string) => {
    setCurrentWalletId(walletId);
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    if (pathname === path) return;
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#e6d4cb] flex justify-center px-4">
      {/* Mobile-sized container centered on desktop */}
      <div className="relative flex min-h-screen w-full max-w-sm flex-col py-4">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between rounded-xl bg-[#bd9e84] px-4 py-3 text-white shadow">
          {/* Left: main menu toggle */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open main menu"
          >
            <span className="flex flex-col gap-0.5">
              <span className="h-0.5 w-4 rounded-full bg-white" />
              <span className="h-0.5 w-4 rounded-full bg-white" />
              <span className="h-0.5 w-4 rounded-full bg-white" />
            </span>
          </button>

          {/* Center: wallet selector */}
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wide opacity-80">
              Wallet
            </span>
            <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm">
              <span className="max-w-[140px] truncate">
                {currentWallet ? currentWallet.name : "No wallet"}
              </span>
            </div>
            {wallets.length > 1 && (
              <button
                type="button"
                className="mt-1 text-[10px] text-white/80 underline"
                onClick={() => {
                  if (!currentWallet) return;
                  const idx = wallets.findIndex((w) => w.id === currentWallet.id);
                  const next = wallets[(idx + 1) % wallets.length];
                  handleWalletChange(next.id);
                }}
              >
                Switch wallet
              </button>
            )}
          </div>

          {/* Right: user name or role text */}
          <div className="flex flex-col items-end text-right text-xs leading-snug">
            <span className="font-semibold">
              {currentRole
                ? currentRole.charAt(0) +
                  currentRole.slice(1).toLowerCase()
                : userName}
            </span>
            {currentRole && (
              <span className="text-[10px] opacity-80">{userName}</span>
            )}
          </div>
        </header>

        {/* Side menu overlay */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:absolute md:rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-[#e6d4cb] p-4 shadow-xl md:absolute md:inset-y-4 md:left-4 md:rounded-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3f2a20]">
                  主選單
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close main menu"
                >
                  <span className="h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#3f2a20]" />
                </button>
              </div>

              {/* User block */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#bd9e84]/40 text-sm font-semibold text-[#3f2a20]">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#3f2a20]">
                    {userName || "User"}
                  </span>
                </div>
              </div>

              {/* Menu buttons */}
              <nav className="flex flex-col gap-3 text-sm text-[#3f2a20]">
                <button
                  type="button"
                  className="rounded-lg border border-[#bd9e84] bg-white/40 px-3 py-2 text-left hover:bg-white/70"
                  onClick={() => handleNavigate("/wallets/notifications")}
                >
                  通知
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#bd9e84] bg-white/40 px-3 py-2 text-left hover:bg-white/70"
                  onClick={() => handleNavigate("/wallets/history")}
                >
                  收支明細
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#bd9e84] bg-white/40 px-3 py-2 text-left hover:bg-white/70"
                  onClick={() => handleNavigate("/wallets/subscriptions")}
                >
                  訂閱清單
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#bd9e84] bg-white/40 px-3 py-2 text-left hover:bg-white/70"
                  onClick={() => handleNavigate("/wallets/settings")}
                >
                  設定
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main content area */}
        <main className="flex-1 pb-16">
          {walletsLoading && (
            <div className="flex h-full items-center justify-center text-sm text-[#3f2a20]/80">
              Loading wallets...
            </div>
          )}
          {!walletsLoading && wallets.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[#3f2a20]/80">
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




