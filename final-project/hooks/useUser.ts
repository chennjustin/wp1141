/**
 * User-related React hooks
 * 
 * This module provides React hooks for user-related operations,
 * encapsulating common data fetching and state management logic.
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserProfile } from "@/modules/user/routes/get-profile";
import type { UserProfile } from "@/modules/user/domain/user.types";

/**
 * Hook to get current user profile
 */
export function useUser() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (status === "loading") {
        return;
      }

      if (!session?.user?.userID) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userProfile = await getUserProfile(session.user.userID);
        setProfile(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session, status]);

  return {
    profile,
    loading,
    error,
    isAuthenticated: status === "authenticated",
    hasUserID: !!session?.user?.userID,
  };
}

/**
 * Hook to get user profile by userID
 */
export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
  };
}

