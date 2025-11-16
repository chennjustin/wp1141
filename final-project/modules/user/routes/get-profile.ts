/**
 * Server Action: Get user profile by userID
 * 
 * This action retrieves a user's profile information including
 * counts for posts, followers, and following.
 */

"use server";

import { userService } from "../services/user.service";

/**
 * Get user profile by userID
 */
export async function getUserProfile(userId: string) {
  try {
    return await userService.getProfileByUserId(userId);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

