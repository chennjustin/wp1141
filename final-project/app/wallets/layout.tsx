"use client";

import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useWallets } from "@/hooks/useWallet";
import type { Wallet, WalletMember } from "@/modules/wallet/domain/wallet.types";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";
import { WalletHeader } from "@/ui/components/wallet/WalletHeader";
import { WalletSelectorDropdown } from "@/ui/components/wallet/WalletSelectorDropdown";
import { SideMenuOverlay } from "@/ui/components/wallet/SideMenuOverlay";
import { SideMenu } from "@/ui/components/wallet/SideMenu";

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
  const { wallets, loading: walletsLoading, refetch: refetchWallets } = useWallets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  const [pinnedWalletIds, setPinnedWalletIds] = useState<Set<string>>(new Set());
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Track last updated wallet ID to avoid duplicate updates
  const lastUpdatedWalletIdRef = useRef<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const walletButtonRef = useRef<HTMLButtonElement | null>(null);

  // Fetch pinned wallets
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
    if (isAuthenticated) {
      fetchPinnedWallets();
    }
  }, [isAuthenticated]);

  // Close wallet selector dropdown when route changes
  useEffect(() => {
    setIsWalletSelectorOpen(false);
  }, [pathname]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isWalletSelectorOpen && walletButtonRef.current) {
      const buttonRect = walletButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 8, // 8px margin (mt-2)
        left: buttonRect.left + buttonRect.width / 2, // Center of button
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isWalletSelectorOpen]);

  // Extract walletId from URL pathname for header display
  // Simplified logic since page.tsx handles the redirect logic
  useEffect(() => {
    // Special paths that are not wallet IDs
    const specialPaths = ["new", "all", "history", "notifications", "settings", "subscriptions"];
    
    // Extract walletId from pathname (e.g., /wallets/abc123 -> abc123)
    const pathParts = pathname.split("/").filter(Boolean);
    const secondPart = pathParts.length >= 2 && pathParts[0] === "wallets" 
      ? pathParts[1] 
      : null;

    // If it's a wallet ID path (not a special path), set currentWalletId
    if (secondPart && !specialPaths.includes(secondPart)) {
      // Always update to ensure it reflects the current pathname
      setCurrentWalletId(secondPart);
      return;
    }

    // For special paths or /wallets root, clear currentWalletId
    // The page.tsx will handle redirect to appropriate wallet
    if (!secondPart) {
      setCurrentWalletId(null);
    }
  }, [pathname]);

  const currentWallet: Wallet | null = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return null;
    }

    if (!currentWalletId) {
      return wallets[0];
    }

    const byId = wallets.find((w) => w.id === currentWalletId);
    if (byId) return byId;

    // If walletId is set but not found, try to wait a bit for wallets to load
    // Otherwise return first wallet as fallback
    return wallets[0];
  }, [wallets, currentWalletId]);

  // Update defaultWalletId when currentWalletId changes
  useEffect(() => {
    // Get the actual wallet ID from currentWallet
    const walletId = currentWallet?.id ?? null;
    
    // Skip if no wallet, no session, or wallet hasn't changed
    if (!walletId || !session?.user?.id || walletId === lastUpdatedWalletIdRef.current) {
      return;
    }

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the update to avoid excessive API calls
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/users/default-wallet", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletId }),
        });

        if (response.ok) {
          lastUpdatedWalletIdRef.current = walletId;
        } else {
          console.error("Failed to update default wallet:", await response.text());
        }
      } catch (error) {
        console.error("Error updating default wallet:", error);
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [currentWallet?.id, session?.user?.id]);

  // Backup mechanism: update defaultWalletId on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const walletId = currentWallet?.id;
      if (!walletId || !session?.user?.id || walletId === lastUpdatedWalletIdRef.current) {
        return;
      }

      // Use sendBeacon for reliable delivery during page unload
      // Note: sendBeacon only supports POST, so we use POST method
      const data = JSON.stringify({ walletId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/users/default-wallet",
          new Blob([data], { type: "application/json" })
        );
      } else {
        // Fallback to fetch if sendBeacon is not available
        fetch("/api/users/default-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        }).catch(() => {
          // Ignore errors during page unload
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handleBeforeUnload();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentWallet?.id, session?.user?.id]);

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
      currentWallet.name === "錢包" ||
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

  // Default wallet name display
  // Must be defined before any conditional returns to follow React Hooks rules
  const walletDisplayName = useMemo(() => {
    // First try to find wallet by currentWalletId directly from wallets array
    // This ensures we get the latest wallet name even if currentWallet hasn't updated yet
    if (currentWalletId && wallets && wallets.length > 0) {
      const walletById = wallets.find((w) => w.id === currentWalletId);
      if (walletById) {
        return walletById.name;
      }
    }
    
    // Fallback to currentWallet if available
    if (currentWallet) {
      return currentWallet.name;
    }
    
    // If currentWalletId is set but wallet not found, wallet might be loading
    if (currentWalletId) {
      return walletsLoading ? "載入中..." : "No wallet";
    }
    
    return "No wallet";
  }, [currentWalletId, wallets, currentWallet, walletsLoading]);

  // Show loading state while checking authentication
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--wallet-loading-bg)' }}>
        <div className="text-sm text-black/80">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || sessionStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleWalletChange = (walletId: string) => {
    // Immediately update currentWalletId to ensure UI updates instantly
    setCurrentWalletId(walletId);
    
    // Navigate to the wallet's detail page
    router.push(`/wallets/${walletId}`);
    
    // Close the dropdown immediately
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

  return (
    <div className="h-screen overflow-hidden flex justify-center px-4 py-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Mobile-sized container with thick black border and rounded corners */}
      <div className="relative flex h-[calc(100vh-2rem)] w-full max-w-sm flex-col border-[3px] border-black rounded-[3rem] overflow-hidden" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        {/* Header */}
        {!isNewTransactionPage && (
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

        {/* Side menu */}
        <SideMenu
          isOpen={isMenuOpen}
          userName={userName}
          userImage={session?.user?.image}
          currentWalletId={currentWalletId}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Main content area */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-16 px-4">
          {/* Don't show loading for /wallets page - it handles its own loading */}
          {walletsLoading && pathname !== "/wallets/new" && pathname !== "/wallets" && (
            <div className="flex h-full items-center justify-center text-sm text-black/80">
              Loading wallets...
            </div>
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




