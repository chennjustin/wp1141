/**
 * Hook for wallet and user display information
 * 
 * Calculates wallet display name, user display name, and current role
 * based on the current wallet and user profile.
 */

"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import type { Wallet, WalletMember } from "@/modules/wallet/domain/wallet.types";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";
import type { UserProfile } from "@/modules/user/domain/user.types";

interface UseWalletDisplayParams {
  currentWallet: Wallet | null;
  currentWalletId: string | null;
  wallets: Wallet[];
  walletsLoading: boolean;
  profile: UserProfile | null;
}

export function useWalletDisplay({
  currentWallet,
  currentWalletId,
  wallets,
  walletsLoading,
  profile,
}: UseWalletDisplayParams) {
  const { data: session } = useSession();

  // Get user name - fallback to session name or email if profile name is not available
  const userName = profile?.name ?? session?.user?.name ?? session?.user?.email ?? "";

  // Calculate current role in the wallet
  const currentRole: WalletMember["role"] | null = useMemo(() => {
    if (!currentWallet || !profile) return null;

    const member = currentWallet.members.find(
      (m) => m.userId === profile.id
    );

    return member?.role ?? null;
  }, [currentWallet, profile]);

  // Check if current wallet is a personal wallet
  const isPersonalWallet = useMemo(() => {
    if (!currentWallet || !profile) return false;
    return (
      currentWallet.name === "錢包" ||
      (currentWallet.members.length === 1 &&
        currentWallet.members[0].userId === profile.id &&
        currentWallet.members[0].role === WalletRole.OWNER)
    );
  }, [currentWallet, profile]);

  // Display name for navbar right side
  // Personal wallet: show user name (fallback to session name/email)
  // Shared wallet: show role
  const displayName = useMemo(() => {
    if (isPersonalWallet) {
      return userName || session?.user?.name || session?.user?.email || "User";
    }
    if (currentRole) {
      return currentRole.charAt(0) + currentRole.slice(1).toLowerCase();
    }
    return userName || session?.user?.name || session?.user?.email || "User";
  }, [isPersonalWallet, currentRole, userName, session]);

  // Wallet name display
  const walletDisplayName = useMemo(() => {
    // First try to find wallet by currentWalletId directly from wallets array
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

  return {
    walletDisplayName,
    displayName,
    currentRole,
    isPersonalWallet,
    userName,
  };
}

