/**
 * Hook for managing pinned wallets
 * 
 * Fetches and manages the list of pinned wallet IDs from the API.
 */

"use client";

import { useState, useEffect } from "react";

export function usePinnedWallets(isAuthenticated: boolean) {
  const [pinnedWalletIds, setPinnedWalletIds] = useState<Set<string>>(new Set());

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

  return pinnedWalletIds;
}

