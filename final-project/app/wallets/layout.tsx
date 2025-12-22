"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useWallets } from "@/hooks/useWallet";
import { usePinnedWallets } from "@/hooks/usePinnedWallets";
import { useWalletSelector } from "@/hooks/useWalletSelector";
import { useWalletFromPath } from "@/hooks/useWalletFromPath";
import { useCurrentWallet } from "@/hooks/useCurrentWallet";
import { useWalletDisplay } from "@/hooks/useWalletDisplay";
import { useDefaultWalletSync } from "@/hooks/useDefaultWalletSync";
import { WalletHeader } from "@/ui/components/wallet/WalletHeader";
import { WalletSelectorDropdown } from "@/ui/components/wallet/WalletSelectorDropdown";
import { SideMenuOverlay } from "@/ui/components/wallet/SideMenuOverlay";
import { SideMenu } from "@/ui/components/wallet/SideMenu";
import { Loading } from "@/ui/components/common/Loading";

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
  const { data: session, status: sessionStatus } = useSession();
  const { profile, isAuthenticated } = useUser();
  const { wallets, loading: walletsLoading } = useWallets();

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use hooks for wallet state management
  const { pinnedWalletIds, pinnedWalletIdsArray } = usePinnedWallets(isAuthenticated);
  const { currentWalletId, setCurrentWalletId } = useWalletFromPath();
  const currentWallet = useCurrentWallet({ wallets, currentWalletId });
  const {
    isOpen: isWalletSelectorOpen,
    setIsOpen: setIsWalletSelectorOpen,
    dropdownPosition,
    walletButtonRef,
  } = useWalletSelector();

  // Sync default wallet when current wallet changes
  useDefaultWalletSync(currentWallet);

  // Calculate display information
  const { walletDisplayName, displayName, userName } = useWalletDisplay({
    currentWallet,
    currentWalletId,
    wallets,
    walletsLoading,
    profile,
  });

  // Redirect to login if not authenticated (use useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!isAuthenticated || sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [isAuthenticated, sessionStatus, router]);

  // Don't render content if not authenticated
  if (!isAuthenticated || sessionStatus === "unauthenticated") {
    return null;
  }

  const handleWalletChange = (walletId: string) => {
    setCurrentWalletId(walletId);
    router.push(`/wallets/${walletId}`);
    setIsWalletSelectorOpen(false);
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    if (pathname === path) return;
    router.push(path);
  };

  // 是否為「新增交易」頁面：/wallets/[walletId]/transactions/new
  const isNewTransactionPage =
    pathname?.startsWith("/wallets/") &&
    pathname.includes("/transactions/new");
  
  // 是否為「新增/編輯訂閱」頁面：/wallets/subscriptions/new 或 /wallets/subscriptions/[id]/edit
  // 或訂閱歷史頁面：/wallets/subscriptions/history
  const isSubscriptionPage =
    pathname?.startsWith("/wallets/subscriptions/new") ||
    (pathname?.includes("/subscriptions/") && pathname.includes("/edit")) ||
    pathname?.startsWith("/wallets/subscriptions/history");

  return (
    <div className="h-screen overflow-hidden flex justify-center px-4 py-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Mobile-sized container with thick black border and rounded corners */}
      <div className="relative flex h-[calc(100vh-2rem)] w-full max-w-sm flex-col border-[3px] border-black rounded-[3rem] overflow-hidden" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        {/* Header */}
        {!isNewTransactionPage && !isSubscriptionPage && (
          <>
            <WalletHeader
              walletDisplayName={walletDisplayName}
              displayName={displayName}
              onMenuToggle={() => setIsMenuOpen(true)}
              onWalletSelectorOpen={() => setIsWalletSelectorOpen(true)}
              walletButtonRef={walletButtonRef}
            />

            <WalletSelectorDropdown
              isOpen={isWalletSelectorOpen}
              dropdownPosition={dropdownPosition}
              wallets={wallets}
              pinnedWalletIds={pinnedWalletIds}
              pinnedWalletIdsArray={pinnedWalletIdsArray}
              onClose={() => setIsWalletSelectorOpen(false)}
              onWalletChange={handleWalletChange}
            />
          </>
        )}

        {/* Side menu overlay */}
        <SideMenuOverlay
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
        <SideMenu
          isOpen={isMenuOpen}
          userName={userName}
          userImage={session?.user?.image}
          currentWalletId={currentWalletId}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Main content area */}
        <main className={`flex min-h-0 flex-1 flex-col pb-16 px-4 ${
          pathname === "/wallets/all" ? "overflow-y-auto" : "overflow-hidden"
        }`}>
          {/* Don't show loading for /wallets page - it handles its own loading */}
          {walletsLoading && pathname !== "/wallets/new" && pathname !== "/wallets" && (
            <Loading message="Loading wallets..." />
          )}
          {!walletsLoading && wallets.length === 0 && pathname !== "/wallets/new" && pathname !== "/wallets" && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-black/80">
              <p>目前還沒有錢包。</p>
              <p>請點選上方「新增錢包」來建立第一個錢包。</p>
            </div>
          )}
          {(pathname === "/wallets/new" || pathname === "/wallets" || (!walletsLoading && wallets.length > 0)) && children}
        </main>
      </div>
    </div>
  );
}
