/**
 * Hook for managing pinned wallets
 * 
 * Fetches and manages the list of pinned wallet IDs from the API.
 * Automatically refetches when page becomes visible to keep data in sync.
 * Maintains the order of pinned wallets as returned by the backend.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export function usePinnedWallets(isAuthenticated: boolean) {
  // Store as array to maintain order, and also provide Set for quick lookup
  const [pinnedWalletIdsArray, setPinnedWalletIdsArray] = useState<string[]>([]);
  const [pinnedWalletIds, setPinnedWalletIds] = useState<Set<string>>(new Set());

  const fetchPinnedWallets = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await fetch("/api/users/default-wallet");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pinnedWalletIds) {
          // Maintain order from backend (already sorted by order field)
          const orderedIds = Array.isArray(data.pinnedWalletIds) ? data.pinnedWalletIds : [];
          setPinnedWalletIdsArray(orderedIds);
          setPinnedWalletIds(new Set(orderedIds));
        }
      }
    } catch (error) {
      console.error("Error fetching pinned wallets:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPinnedWallets();
  }, [fetchPinnedWallets]);

  // Refetch when page becomes visible (e.g., user returns from another page)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPinnedWallets();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, fetchPinnedWallets]);

  return {
    pinnedWalletIds, // Set for quick lookup
    pinnedWalletIdsArray, // Array for ordered display
    refetch: fetchPinnedWallets,
  };
}

