/**
 * Server Action: Search users by userID or name
 * 
 * This action performs a search for users matching the query string,
 * searching both userID and name fields.
 */

"use server";

import { userService } from "../services/user.service";

/**
 * Search users by userID or name
 */
export async function searchUsers(query: string, limit: number = 10) {
  try {
    return await userService.searchUsers(query, limit);
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

