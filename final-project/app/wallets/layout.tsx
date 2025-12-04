"use client";

import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
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

  // Initialize currentWalletId from URL pathname or session defaultWalletId
  useEffect(() => {
    if (wallets.length === 0 || walletsLoading) return;

    // Extract walletId from pathname (e.g., /wallets/abc123 -> abc123)
    const pathParts = pathname.split("/").filter(Boolean);
    const walletIdFromPath = pathParts.length >= 2 && pathParts[0] === "wallets" 
      ? pathParts[1] 
      : null;

    // Use walletId from URL if available and valid
    if (walletIdFromPath && wallets.some(w => w.id === walletIdFromPath)) {
      if (currentWalletId !== walletIdFromPath) {
        setCurrentWalletId(walletIdFromPath);
      }
      return;
    }

    // Otherwise, use defaultWalletId from session if available
    if (session?.user?.defaultWalletId && wallets.some(w => w.id === session.user.defaultWalletId)) {
      if (currentWalletId !== session.user.defaultWalletId) {
        setCurrentWalletId(session.user.defaultWalletId);
      }
      return;
    }

    // Fallback to first wallet
    if (wallets.length > 0 && wallets[0].id !== currentWalletId) {
      setCurrentWalletId(wallets[0].id);
    }
  }, [pathname, wallets, walletsLoading, session?.user?.defaultWalletId, currentWalletId]);

  const currentWallet: Wallet | null = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return null;
    }

    const byId = wallets.find((w) => w.id === currentWalletId);
    if (byId) return byId;

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
    // Navigate to the wallet's default page
    router.push(`/wallets/${walletId}`);
    // Note: setIsWalletSelectorOpen(false) will be called automatically
    // by the pathname change effect, but we can also close it immediately
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
    <div className="min-h-screen bg-[#E8E8E8] flex justify-center px-4 py-4">
      {/* Mobile-sized container with thick black border and rounded corners */}
      <div className="relative flex min-h-[calc(100vh-2rem)] w-full max-w-sm flex-col border-[3px] border-black bg-[#E8E8E8] rounded-[3rem] overflow-clip">
        {/* Header */}
        <header className="relative mb-4 flex items-center justify-between bg-[#E8E8E8] px-4 py-3">
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
              ref={walletButtonRef}
              type="button"
              className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-medium text-black hover:bg-gray-100 active:bg-white focus:bg-white focus:outline-none focus:ring-0"
              onClick={() => setIsWalletSelectorOpen(true)}
              aria-label="Select wallet"
            >
              <span className="max-w-[140px] truncate">{walletDisplayName}</span>
            </button>
          </div>

          {/* Right: user name or role text */}
          <div className="flex flex-col items-end text-right text-xs leading-snug text-black">
            <span className="font-semibold">{displayName}</span>
          </div>
        </header>

        {/* Wallet selector dropdown - rendered outside header to avoid stacking context issues */}
        {isWalletSelectorOpen && dropdownPosition && (
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/20"
              onClick={() => setIsWalletSelectorOpen(false)}
            />
            <div
              className="fixed z-[9999] rounded-lg bg-white shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto border-0"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="py-2">
                {/* Show all pinned wallets (max 5) */}
                {wallets
                  .filter((wallet) => pinnedWalletIds.has(wallet.id))
                  .map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
                      onClick={() => handleWalletChange(wallet.id)}
                    >
                      {wallet.name}
                    </button>
                  ))}
                <div className="border-t border-gray-200 my-1" />
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
                  onClick={() => {
                    setIsWalletSelectorOpen(false);
                    router.push("/wallets/all");
                  }}
                >
                  所有錢包
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
                  onClick={() => {
                    setIsWalletSelectorOpen(false);
                    router.push("/wallets/new");
                  }}
                >
                  + 新增錢包
                </button>
              </div>
            </div>
          </>
        )}

        {/* Side menu overlay */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:absolute md:rounded-[3rem]"
              onClick={() => setIsMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-[#E8E8E8] p-4 shadow-xl md:absolute md:inset-y-0 md:left-0 md:rounded-l-[3rem] md:rounded-r-none">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-black">
                  主選單
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/wallets");
                  }}
                  aria-label="Go to wallet home"
                >
                  {/* House icon */}
                  <svg
                    className="h-5 w-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
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




