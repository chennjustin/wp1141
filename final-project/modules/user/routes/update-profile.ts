/**
 * Server Action: Update user profile
 * 
 * This action handles updating user profile information including
 * name, userID, bio, bannerUrl, and image.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService } from "../services/user.service";
import { revalidatePath } from "next/cache";
import type { UpdateUserProfileData } from "../domain/user.types";

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateUserProfileData) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await userService.updateProfile(session.user.id, data);

    if (result.success && result.data) {
      // Revalidate profile page
      const userWithID = result.data as { userID?: string | null };
      if (userWithID.userID) {
        revalidatePath(`/profile/${userWithID.userID}`);
      }

      // If userID changed, also revalidate old profile path and home
      if (data.userID !== undefined) {
        revalidatePath("/home");
      }
    }

    return result;
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

