/**
 * Wallet redirect utilities
 * 
 * This module provides utilities for handling wallet redirects,
 * particularly for default wallet validation and redirection logic.
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { walletService } from "../services/wallet.service";
import type { Session } from "next-auth";

/**
 * Session type with defaultWalletId
 */
type SessionWithDefaultWallet = Session & {
  user: {
    id: string;
    defaultWalletId: string | null;
    [key: string]: any;
  };
};

/**
 * Handle default wallet redirect
 * 
 * This function validates the user's defaultWalletId and redirects to that wallet
 * if it exists and the user has access. If the wallet is invalid or the user
 * doesn't have access, it clears the defaultWalletId from the user record.
 * 
 * If redirect occurs, this function will never return (Next.js redirect behavior).
 * 
 * @param session - Session object containing user information and defaultWalletId
 * @param userId - User ID (should match session.user.id)
 * @returns false if no redirect occurred (defaultWalletId doesn't exist or was invalid)
 * @throws Never throws - redirects instead if wallet is valid
 * 
 * @example
 * ```ts
 * const { session } = await validateAuthForRoute();
 * // Try to redirect to default wallet
 * const redirected = await handleDefaultWalletRedirect(session, session.user.id);
 * if (!redirected) {
 *   // Continue with other logic (e.g., find "我的錢包" or first wallet)
 * }
 * ```
 */
export async function handleDefaultWalletRedirect(
  session: SessionWithDefaultWallet,
  userId: string
): Promise<boolean> {
  // First, check session for defaultWalletId
  // If not found in session, check database directly (session may not be updated yet)
  let defaultWalletId = session.user.defaultWalletId;
  
  if (!defaultWalletId) {
    // Session doesn't have defaultWalletId, check database directly
    // This can happen right after registration when session hasn't refreshed yet
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultWalletId: true },
      });
      defaultWalletId = dbUser?.defaultWalletId ?? null;
    } catch (error) {
      console.error("Error fetching defaultWalletId from database:", error);
      return false;
    }
  }
  
  // If still no defaultWalletId after checking database, user doesn't have one
  if (!defaultWalletId) {
    return false;
  }
  
  try {
    // Verify wallet exists and user has access
    const walletResult = await walletService.getWalletById(
      defaultWalletId,
      userId
    );
    
    if (walletResult.success && walletResult.data) {
      // Wallet exists and user has access, redirect to it
      // Note: redirect() throws a NEXT_REDIRECT error which should not be caught
      redirect(`/wallets/${defaultWalletId}`);
    } else {
      // Wallet doesn't exist or user lost access, clear defaultWalletId
      await prisma.user.update({
        where: { id: userId },
        data: { defaultWalletId: null },
      });
      return false;
    }
  } catch (error: any) {
    // Check if this is a Next.js redirect error
    // redirect() throws a special error with digest "NEXT_REDIRECT" which should be re-thrown
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      // Re-throw redirect errors - they are expected and should propagate to Next.js
      throw error;
    }
    
    // Only log and handle actual errors, not redirects
    console.error("Error checking default wallet:", error);
    await prisma.user.update({
      where: { id: userId },
      data: { defaultWalletId: null },
    });
    return false;
  }
}

