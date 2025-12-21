/**
 * Hook for extracting wallet ID from URL pathname
 * 
 * Parses the current pathname to determine the active wallet ID,
 * handling special paths that are not wallet IDs.
 */

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const SPECIAL_PATHS = ["new", "all", "history", "notifications", "settings", "subscriptions"];

export function useWalletFromPath() {
  const pathname = usePathname();
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);

  useEffect(() => {
    // Extract walletId from pathname (e.g., /wallets/abc123 -> abc123)
    const pathParts = pathname.split("/").filter(Boolean);
    const secondPart = pathParts.length >= 2 && pathParts[0] === "wallets" 
      ? pathParts[1] 
      : null;

    // If it's a wallet ID path (not a special path), set currentWalletId
    if (secondPart && !SPECIAL_PATHS.includes(secondPart)) {
      setCurrentWalletId(secondPart);
      return;
    }

    // For special paths or /wallets root, clear currentWalletId
    if (!secondPart) {
      setCurrentWalletId(null);
    }
  }, [pathname]);

  return {
    currentWalletId,
    setCurrentWalletId,
  };
}

