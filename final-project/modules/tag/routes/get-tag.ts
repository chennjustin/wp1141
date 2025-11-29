/**
 * Server Action: Get tag by ID
 * 
 * This action retrieves detailed information about a single tag.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "../services/tag.service";
import { UnauthorizedError, InternalServerError } from "../domain/tag.errors";

/**
 * Get tag by ID
 */
export async function getTagAction(tagId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await tagService.getTagById(tagId);
  } catch (error) {
    console.error("[getTagAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

