/**
 * Session utilities
 * 
 * This module provides utilities for working with user sessions,
 * including fetching user data and managing session state.
 */

import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

/**
 * Get user ID from database by session user ID
 */
export async function getUserIDFromSession(userId: string): Promise<string | null> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userID: true,
      },
    });

    return (dbUser as { userID?: string | null })?.userID ?? null;
  } catch (error) {
    console.error("Error fetching userID in session:", error);
    return null;
  }
}

/**
 * Enhance session with userID
 */
export async function enhanceSessionWithUserID(
  session: Session
): Promise<Session> {
  try {
    // Ensure session.user exists
    if (!session.user) {
      return session;
    }

    // Fetch userID from database
    const userID = await getUserIDFromSession(session.user.id);

    // Add userID to session
    return {
      ...session,
      user: {
        ...session.user,
        userID,
      },
    };
  } catch (error) {
    console.error("Error enhancing session with userID:", error);
    return session;
  }
}

