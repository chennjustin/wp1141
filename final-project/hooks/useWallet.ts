/**
 * Wallet-related React hooks
 * 
 * This module provides React hooks for wallet-related operations,
 * encapsulating common data fetching and state management logic.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { listWalletsAction } from "@/modules/wallet/routes/list-wallets";
import { getWalletAction } from "@/modules/wallet/routes/get-wallet";
import type { Wallet } from "@/modules/wallet/domain/wallet.types";

/**
 * Hook to get user's wallets
 */
export function useWallets() {
  const { data: session, status } = useSession();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await listWalletsAction();

      if (result.success && result.data) {
        setWallets(result.data);
      } else {
        setError(result.error || "Failed to fetch wallets");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wallets");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    loading,
    error,
    refetch: fetchWallets,
  };
}

/**
 * Hook to get a single wallet by ID
 */
export function useWallet(walletId: string | null) {
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      if (!walletId || status !== "authenticated" || !session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getWalletAction(walletId);

        if (result.success && result.data) {
          setWallet(result.data);
        } else {
          setError(result.error || "Failed to fetch wallet");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch wallet");
      } finally {
        setLoading(false);
      }
    }

    fetchWallet();
  }, [walletId, session, status]);

  return {
    wallet,
    loading,
    error,
  };
}

