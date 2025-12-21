/**
 * Hook for syncing default wallet to the server
 * 
 * Automatically updates the user's default wallet when the current wallet changes.
 * Includes debouncing and backup mechanism for page unload.
 */

"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { Wallet } from "@/modules/wallet/domain/wallet.types";

export function useDefaultWalletSync(currentWallet: Wallet | null) {
  const { data: session } = useSession();
  const lastUpdatedWalletIdRef = useRef<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update defaultWalletId when currentWalletId changes
  useEffect(() => {
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
}

