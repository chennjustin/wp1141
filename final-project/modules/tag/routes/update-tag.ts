/**
 * Server Action: Update tag
 * 
 * This action updates an existing tag.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "../services/tag.service";
import { UnauthorizedError, InternalServerError } from "../domain/tag.errors";
import type { UpdateTagData } from "../domain/tag.types";

/**
 * Update tag
 */
export async function updateTagAction(
  tagId: string,
  data: UpdateTagData
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await tagService.updateTag(tagId, session.user.id, data);
  } catch (error) {
    console.error("[updateTagAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

