import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { walletService } from "@/modules/wallet/services/wallet.service";
import { prisma } from "@/lib/prisma";

interface HomeProps {
  searchParams: { callbackUrl?: string };
}

export default async function Home({ searchParams }: HomeProps) {
  // Check authentication status
  const session = await getServerSession(authOptions);
  
  // If not authenticated, middleware will handle redirect to /login
  // If authenticated, redirect to appropriate page based on userID status
  if (session?.user) {
    // If user doesn't have userID, redirect to register with callbackUrl preserved
    if (!session.user.userID) {
      const callbackUrl = searchParams.callbackUrl || "/";
      redirect(`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    
    // If user has userID and callbackUrl is provided, redirect to callbackUrl
    if (searchParams.callbackUrl) {
      const callbackUrl = decodeURIComponent(searchParams.callbackUrl);
      redirect(callbackUrl);
    }
    
    // If user has defaultWalletId, verify and redirect to that wallet
    if (session.user.defaultWalletId) {
      try {
        // Verify wallet exists and user has access
        const walletResult = await walletService.getWalletById(
          session.user.defaultWalletId,
          session.user.id
        );
        
        if (walletResult.success && walletResult.data) {
          // Wallet exists and user has access, redirect to it
          redirect(`/wallets/${session.user.defaultWalletId}`);
        } else {
          // Wallet doesn't exist or user lost access, clear defaultWalletId
          await prisma.user.update({
            where: { id: session.user.id },
            data: { defaultWalletId: null },
          });
        }
      } catch (error) {
        // Error checking wallet, fallback to /wallets
        console.error("Error checking default wallet:", error);
      }
    }
    
    // If user has userID and no explicit callbackUrl, redirect to wallets home
    redirect("/wallets");
  }
  return null;
}
