/**
 * Server Action: Register user with userID
 * 
 * This action handles user registration by updating the existing
 * user record created by NextAuth with a custom userID.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService } from "../services/user.service";
import { revalidatePath } from "next/cache";

/**
 * Register a new user with a userID
 */
export async function registerWithUserId(userId: string) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await userService.registerWithUserId(
      userId,
      session.user.id
    );

    if (result.success) {
      // Revalidate relevant paths
      revalidatePath("/register");
      revalidatePath("/home");
    }

    return result;
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

