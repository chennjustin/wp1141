/**
 * Permission utilities
 * 
 * This module provides utilities for checking user permissions
 * and authorization for various operations.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Check if user is authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return {
      authenticated: false,
      userId: null,
      error: "Unauthorized",
    };
  }

  return {
    authenticated: true,
    userId: session.user.id,
    error: null,
  };
}

/**
 * Check if user has userID registered
 */
export async function requireUserID() {
  const authResult = await requireAuth();

  if (!authResult.authenticated) {
    return {
      ...authResult,
      hasUserID: false,
    };
  }

  const session = await getServerSession(authOptions);
  const hasUserID = !!session?.user?.userID;

  return {
    authenticated: true,
    userId: authResult.userId!,
    hasUserID,
    error: hasUserID ? null : "User ID not registered",
  };
}

