/**
 * Authentication validation utilities
 * 
 * This module provides utilities for validating user authentication
 * and redirecting to appropriate pages based on authentication state.
 * 
 * These functions should be used in Server Components to ensure
 * users are properly authenticated before accessing protected routes.
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Options for validateAuthForRoute
 */
export interface ValidateAuthOptions {
  /**
   * Callback URL to redirect to after authentication
   */
  callbackUrl?: string;
  /**
   * Current pathname (for constructing callback URL)
   */
  pathname?: string;
}

/**
 * Result of authentication validation
 */
export interface ValidateAuthResult {
  /**
   * Validated session object
   */
  session: Session & {
    user: {
      id: string;
      userID: string | null;
      defaultWalletId: string | null;
      [key: string]: any;
    };
  };
  /**
   * User ID from session
   */
  userId: string;
  /**
   * User ID from database (may be null if not registered)
   */
  userID: string | null;
}

/**
 * Validate authentication and user registration status
 * 
 * This function performs the following checks:
 * 1. Verifies session exists and is valid
 * 2. Verifies user exists in session
 * 3. If user exists but has no userID, redirects to /register
 * 4. If callbackUrl is provided and validation passes, redirects to callbackUrl
 * 5. Returns validated session and user information
 * 
 * If any validation fails or callbackUrl redirect occurs, this function will redirect and never return.
 * 
 * @param options - Optional callback URL and pathname
 * @returns Validated session and user information (only if no redirect occurs)
 * @throws Never throws - redirects instead
 * 
 * @example
 * ```ts
 * // If callbackUrl exists in searchParams, user will be redirected to it after validation
 * const { session, userId, userID } = await validateAuthForRoute({
 *   callbackUrl: searchParams.callbackUrl,
 *   pathname: "/wallets"
 * });
 * // This code will only execute if no callbackUrl was provided
 * ```
 */
export async function validateAuthForRoute(
  options: ValidateAuthOptions = {}
): Promise<ValidateAuthResult> {
  const { callbackUrl, pathname } = options;

  // Get session from server
  const session = await getServerSession(authOptions);

  // If no session or user, redirect to login
  if (!session?.user?.id) {
    if (callbackUrl || pathname) {
      const targetUrl = callbackUrl || pathname || "/";
      redirect(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
    }
    redirect("/login");
  }

  // Check if user has userID (required for accessing protected routes)
  if (!session.user.userID) {
    // User is authenticated but hasn't completed registration
    // Redirect to register page with callback URL preserved
    const targetCallbackUrl = callbackUrl || pathname || "/";
    redirect(`/register?callbackUrl=${encodeURIComponent(targetCallbackUrl)}`);
  }

  // All validations passed
  // If callbackUrl is provided, redirect to it (this is common for all routes)
  if (callbackUrl) {
    redirect(decodeURIComponent(callbackUrl));
  }

  // Return session information
  return {
    session: session as ValidateAuthResult["session"],
    userId: session.user.id,
    userID: session.user.userID,
  };
}

/**
 * Require authentication with redirect
 * 
 * Simplified version that only checks basic authentication.
 * Redirects to /login if not authenticated.
 * 
 * Does NOT check for userID - use validateAuthForRoute if you need that check.
 * 
 * @returns Session object if authenticated
 * @throws Never throws - redirects instead
 * 
 * @example
 * ```ts
 * const session = await requireAuthWithRedirect();
 * // session is guaranteed to exist at this point
 * ```
 */
export async function requireAuthWithRedirect(): Promise<Session & {
  user: {
    id: string;
    [key: string]: any;
  };
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session as Session & {
    user: {
      id: string;
      [key: string]: any;
    };
  };
}
