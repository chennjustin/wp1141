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
 * This function performs the following operations:
 * 1. Checks if user has a defaultWalletId (in session or database)
 * 2. If no defaultWalletId exists, automatically sets the user's first wallet as default
 * 3. Validates the defaultWalletId and redirects to that wallet if it exists and user has access
 * 4. If the wallet is invalid or user doesn't have access, clears the defaultWalletId
 * 
 * If redirect occurs, this function will never return (Next.js redirect behavior).
 * 
 * @param session - Session object containing user information and defaultWalletId
 * @param userId - User ID (should match session.user.id)
 * @returns false if no redirect occurred (user has no wallets or all validation failed)
 * @throws Never throws - redirects instead if wallet is valid
 * 
 * @example
 * ```ts
 * const { session } = await validateAuthForRoute();
 * // Try to redirect to default wallet (or first wallet if no default exists)
 * const redirected = await handleDefaultWalletRedirect(session, session.user.id);
 * if (!redirected) {
 *   // User has no wallets - redirect to create wallet page
 *   redirect("/wallets/new");
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
  
  // If still no defaultWalletId after checking database, try to set first wallet as default
  if (!defaultWalletId) {
    try {
      // Get user's wallets
      const userWallets = await walletService.getUserWallets(userId);
      
      // If user has at least one wallet, set the first one as default
      if (userWallets.length > 0) {
        const firstWalletId = userWallets[0].id;
        
        // Set the first wallet as default
        await prisma.user.update({
          where: { id: userId },
          data: { defaultWalletId: firstWalletId },
        });
        
        // Redirect to the first wallet
        // Note: redirect() throws a NEXT_REDIRECT error which should propagate
        redirect(`/wallets/${firstWalletId}`);
      } else {
        // User has no wallets at all, cannot set default
        return false;
      }
    } catch (error: any) {
      // Check if this is a Next.js redirect error
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        // Re-throw redirect errors - they are expected and should propagate to Next.js
        throw error;
      }
      
      // Only log and handle actual errors, not redirects
      console.error("Error setting first wallet as default:", error);
      return false;
    }
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

