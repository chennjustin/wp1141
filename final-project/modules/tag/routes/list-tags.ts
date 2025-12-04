/**
 * Server Action: List tags
 * 
 * This action retrieves tags with optional filters.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "../services/tag.service";
import { UnauthorizedError, InternalServerError } from "../domain/tag.errors";
import type { TagFilters } from "../domain/tag.types";

/**
 * List tags with filters
 */
export async function listTagsAction(filters: TagFilters = {}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await tagService.getTags(filters, session.user.id);
  } catch (error) {
    console.error("[listTagsAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

