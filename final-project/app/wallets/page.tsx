import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { walletService } from "@/modules/wallet/services/wallet.service";
import { prisma } from "@/lib/prisma";

/**
 * Wallets home page redirect
 * 
 * This page automatically redirects to the appropriate wallet detail page
 * based on the user's default wallet or "我的錢包" (My Wallet).
 * 
 * Priority order:
 * 1. Session's defaultWalletId (if exists and user has access)
 * 2. "我的錢包" (My Wallet) - wallet named "我的錢包"
 * 3. First available wallet
 * 4. /wallets/new if no wallets exist
 */
export default async function WalletsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user's wallets
  const wallets = await walletService.getUserWallets(session.user.id);

  // If no wallets exist, redirect to create wallet page
  if (wallets.length === 0) {
    redirect("/wallets/new");
  }

  // Priority 1: Check if user has defaultWalletId in session
  if (session.user.defaultWalletId) {
    // Verify wallet exists and user has access
    const walletResult = await walletService.getWalletById(
      session.user.defaultWalletId,
      session.user.id
    );
    
    if (walletResult.success && walletResult.data) {
      redirect(`/wallets/${session.user.defaultWalletId}`);
    } else {
      // Wallet doesn't exist or user lost access, clear defaultWalletId
      await prisma.user.update({
        where: { id: session.user.id },
        data: { defaultWalletId: null },
      });
    }
  }

  // Priority 2: Find "我的錢包" (My Wallet)
  const myWallet = wallets.find((w) => w.name === "我的錢包");

  if (myWallet) {
    redirect(`/wallets/${myWallet.id}`);
  }

  // Priority 3: Use first available wallet
  if (wallets.length > 0) {
    redirect(`/wallets/${wallets[0].id}`);
  }

  // Fallback: redirect to create wallet page
  redirect("/wallets/new");
}
