/**
 * Server Action: Check if userID is available
 * 
 * This action checks if a given userID is available for registration,
 * validating the format and checking for conflicts.
 */

"use server";

import { userService } from "../services/user.service";

/**
 * Check if userID is available
 */
export async function checkUserIdAvailability(userId: string) {
  try {
    return await userService.checkUserIdAvailability(userId);
  } catch (error) {
    console.error("Error checking user ID availability:", error);
    return { available: false, error: "Failed to check availability" };
  }
}

