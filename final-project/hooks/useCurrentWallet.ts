/**
 * Hook for getting the current active wallet
 * 
 * Determines the current wallet based on currentWalletId or falls back to the first wallet.
 */

"use client";

import { useMemo } from "react";
import type { Wallet } from "@/modules/wallet/domain/wallet.types";

interface UseCurrentWalletParams {
  wallets: Wallet[];
  currentWalletId: string | null;
}

export function useCurrentWallet({ wallets, currentWalletId }: UseCurrentWalletParams) {
  const currentWallet: Wallet | null = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return null;
    }

    if (!currentWalletId) {
      return wallets[0];
    }

    const byId = wallets.find((w) => w.id === currentWalletId);
    if (byId) return byId;

    // If walletId is set but not found, return first wallet as fallback
    return wallets[0];
  }, [wallets, currentWalletId]);

  return currentWallet;
}

