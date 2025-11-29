/**
 * Server Action: Delete tag
 * 
 * This action soft deletes a tag.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "../services/tag.service";
import { UnauthorizedError, InternalServerError } from "../domain/tag.errors";

/**
 * Delete tag
 */
export async function deleteTagAction(tagId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
      };
    }

    return await tagService.deleteTag(tagId, session.user.id);
  } catch (error) {
    console.error("[deleteTagAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
    };
  }
}

