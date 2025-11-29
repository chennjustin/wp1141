/**
 * User service
 * 
 * This module contains business logic for User operations.
 * It orchestrates repository calls and implements domain rules
 * such as validation, authorization, and data transformation.
 */

import { userRepository } from "../repositories/user.repository";
import type {
  UserProfile,
  UserSearchResult,
  UpdateUserProfileData,
  ServiceResult,
} from "../domain/user.types";
import { validateUserId, sanitizeUserId } from "../utils/userId";
import { MAX_NAME_LENGTH } from "@/config/constants";

/**
 * User service interface
 */
export const userService = {
  /**
   * Get user profile by userID
   */
  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    const user = await userRepository.findByUserIdWithCounts(userId);

    if (!user) {
      return null;
    }

    const userWithID = user as { userID: string | null } & typeof user;

    return {
      id: user.id,
      userId: userWithID.userID ?? "",
      name: user.name,
      email: user.email ?? undefined,
      imageUrl: (user as { image?: string | null }).image ?? undefined,
      bannerUrl: (user as { bannerUrl?: string | null }).bannerUrl ?? undefined,
      bio: (user as { bio?: string | null }).bio ?? undefined,
      postsCount: user._count?.posts ?? 0,
      followersCount: user._count?.followers ?? 0,
      followingCount: user._count?.following ?? 0,
    };
  },

  /**
   * Register user with userID
   */
  async registerWithUserId(
    userId: string,
    currentUserId: string
  ): Promise<ServiceResult<unknown>> {
    // Validate and sanitize userID
    const sanitized = sanitizeUserId(userId);
    const validation = validateUserId(sanitized);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check if userID is already taken
    const exists = await userRepository.checkUserIdExists(sanitized);
    if (exists) {
      return { success: false, error: "User ID already taken" };
    }

    // Check if current user already has a userID
    const currentUser = await userRepository.findById(currentUserId);
    if ((currentUser as { userID?: string | null })?.userID) {
      return { success: false, error: "User ID already registered" };
    }

    try {
      // Update user with userID
      const user = await userRepository.updateById(currentUserId, {
        userID: sanitized,
      });

      return { success: true, data: user };
    } catch (error) {
      console.error("Error registering user:", error);
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        return { success: false, error: "User ID already taken" };
      }
      return { success: false, error: "Failed to register user" };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<ServiceResult<unknown>> {
    const updateData: Record<string, unknown> = {};

    // Update name if provided
    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (trimmedName.length === 0) {
        return { success: false, error: "Name cannot be empty" };
      }
      if (trimmedName.length > MAX_NAME_LENGTH) {
        return {
          success: false,
          error: `Name must be ${MAX_NAME_LENGTH} characters or less`,
        };
      }
      updateData.name = trimmedName;
    }

    // Update userID if provided
    if (data.userID !== undefined) {
      const sanitized = sanitizeUserId(data.userID);
      const validation = validateUserId(sanitized);

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if userID is already taken by another user
      const existingUser = await userRepository.findByUserId(sanitized);
      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: "User ID already taken" };
      }

      updateData.userID = sanitized;
    }

    // Update other fields
    if (data.bio !== undefined) {
      updateData.bio = data.bio || null;
    }
    if (data.bannerUrl !== undefined) {
      updateData.bannerUrl = data.bannerUrl || null;
    }
    if (data.image !== undefined) {
      updateData.image = data.image || null;
    }

    try {
      const user = await userRepository.updateById(userId, updateData);
      return { success: true, data: user };
    } catch (error) {
      console.error("Error updating profile:", error);
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        return { success: false, error: "User ID already taken" };
      }
      return { success: false, error: "Failed to update profile" };
    }
  },

  /**
   * Search users by query
   */
  async searchUsers(
    query: string,
    limit: number = 10
  ): Promise<UserSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const users = await userRepository.searchUsers(query, limit);

      return users.map((user: any) => ({
        id: user.id,
        userId: user.userID,
        name: user.name,
        imageUrl: user.image ?? undefined,
      }));
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  },

  /**
   * Check if userID is available
   */
  async checkUserIdAvailability(userId: string): Promise<{
    available: boolean;
    error?: string;
  }> {
    const sanitized = sanitizeUserId(userId);
    const validation = validateUserId(sanitized);

    if (!validation.valid) {
      return { available: false, error: validation.error };
    }

    try {
      const exists = await userRepository.checkUserIdExists(sanitized);
      return {
        available: !exists,
        error: exists ? "User ID already taken" : undefined,
      };
    } catch (error) {
      console.error("Error checking user ID availability:", error);
      return { available: false, error: "Failed to check availability" };
    }
  },
};

