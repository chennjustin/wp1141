/**
 * Server Action: Create tag
 * 
 * This action creates a new tag.
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tagService } from "../services/tag.service";
import { UnauthorizedError, InternalServerError } from "../domain/tag.errors";
import type { CreateTagData } from "../domain/tag.types";

/**
 * Create a new tag
 */
export async function createTagAction(data: CreateTagData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: new UnauthorizedError("Unauthorized"),
        data: null,
      };
    }

    return await tagService.createTag(session.user.id, data);
  } catch (error) {
    console.error("[createTagAction] Unexpected error", error);
    return {
      success: false,
      error: new InternalServerError("Internal server error"),
      data: null,
    };
  }
}

