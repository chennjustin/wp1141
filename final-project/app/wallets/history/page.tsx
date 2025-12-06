"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWallets } from "@/hooks/useWallet";

/**
 * History page redirect handler
 *
 * This page redirects to the current wallet's history page.
 * It uses the user's default wallet from session, or falls back to the first wallet.
 * If no wallet is available, it redirects to the wallets home page.
 * 
 * Route: /wallets/history
 */
export default function HistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { wallets, loading } = useWallets();

  useEffect(() => {
    // Wait for wallets to load
    if (loading) {
      return;
    }

    // If no wallets, redirect to wallets home
    if (wallets.length === 0) {
      router.push("/wallets");
      return;
    }

    // Try to use defaultWalletId from session if available and valid
    const defaultWalletId = session?.user?.defaultWalletId;
    if (defaultWalletId && wallets.some((w) => w.id === defaultWalletId)) {
      router.push(`/wallets/${defaultWalletId}/history`);
      return;
    }

    // Fallback to first wallet
    const firstWallet = wallets[0];
    if (firstWallet) {
      router.push(`/wallets/${firstWallet.id}/history`);
    }
  }, [wallets, loading, session?.user?.defaultWalletId, router]);

  // Show loading state while redirecting
  return (
    <div className="flex h-full items-center justify-center text-sm text-black/80">
      載入中...
    </div>
  );
}
