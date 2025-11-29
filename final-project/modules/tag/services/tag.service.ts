/**
 * Tag service
 * 
 * This module contains business logic for Tag operations.
 * It orchestrates repository calls and implements domain rules
 * such as authorization, validation, and data transformation.
 */

import { tagRepository } from "../repositories/tag.repository";
import { SYSTEM_USER_ID } from "@/config/constants";
import type {
  Tag,
  CreateTagData,
  UpdateTagData,
  TagFilters,
  TagServiceResult,
} from "../domain/tag.types";
import {
  NotFoundError,
  ValidationError,
  TagNotFoundError,
  TagNameConflictError,
  TagUnauthorizedError,
} from "../domain/tag.errors";

/**
 * Validate tag name
 */
function validateTagName(name: string): ValidationError | null {
  if (!name || typeof name !== "string") {
    return new ValidationError("Tag name is required");
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return new ValidationError("Tag name cannot be empty");
  }

  if (trimmedName.length > 50) {
    return new ValidationError("Tag name must be 50 characters or less");
  }

  return null;
}

/**
 * Tag service interface
 */
export const tagService = {
  /**
   * Get tag by ID
   */
  async getTagById(tagId: string): Promise<TagServiceResult<Tag>> {
    const tag = await tagRepository.findById(tagId);

    if (!tag) {
      return {
        success: false,
        error: new TagNotFoundError("Tag not found"),
      };
    }

    return {
      success: true,
      data: tag as Tag,
    };
  },

  /**
   * Get tags with filters
   * Automatically ensures system tags exist before querying
   */
  async getTags(
    filters: TagFilters = {},
    userId?: string
  ): Promise<TagServiceResult<Tag[]>> {
    try {
      // Ensure system tags exist
      await tagRepository.ensureSystemTagsExist();

      // If filter is 'user', set userId from parameter
      const queryFilters: TagFilters = { ...filters };
      if (queryFilters.filter === "user" && userId) {
        queryFilters.userId = userId;
      }

      const tags = await tagRepository.findAll(queryFilters);

      return {
        success: true,
        data: tags as Tag[],
      };
    } catch (error: any) {
      return {
        success: false,
        error: new ValidationError(
          error.message || "Failed to retrieve tags"
        ),
      };
    }
  },

  /**
   * Create tag
   * Validates name uniqueness and creates tag
   */
  async createTag(
    userId: string,
    data: CreateTagData
  ): Promise<TagServiceResult<Tag>> {
    // Validate tag name
    const nameError = validateTagName(data.name);
    if (nameError) {
      return { success: false, error: nameError };
    }

    const trimmedName = data.name.trim();

    // Check if tag name already exists
    const existingTag = await tagRepository.findByName(trimmedName);
    if (existingTag) {
      return {
        success: false,
        error: new TagNameConflictError(
          `Tag with name "${trimmedName}" already exists`,
          trimmedName
        ),
      };
    }

    try {
      const tag = await tagRepository.create(
        { name: trimmedName },
        userId
      );

      return {
        success: true,
        data: tag as Tag,
      };
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return {
          success: false,
          error: new TagNameConflictError(
            `Tag with name "${trimmedName}" already exists`,
            trimmedName
          ),
        };
      }

      return {
        success: false,
        error: new ValidationError("Failed to create tag"),
      };
    }
  },

  /**
   * Update tag
   * Only allows updating user's own tags, not system tags
   */
  async updateTag(
    tagId: string,
    userId: string,
    data: UpdateTagData
  ): Promise<TagServiceResult<Tag>> {
    // Check if tag exists
    const existingTag = await tagRepository.findById(tagId);
    if (!existingTag) {
      return {
        success: false,
        error: new TagNotFoundError("Tag not found"),
      };
    }

    // Check if tag is a system tag
    const isSystemTag = existingTag.createdBy === SYSTEM_USER_ID;
    if (isSystemTag) {
      return {
        success: false,
        error: new TagUnauthorizedError("Cannot update system tags"),
      };
    }

    // Check if user owns the tag
    if (existingTag.createdBy !== userId) {
      return {
        success: false,
        error: new TagUnauthorizedError(
          "You can only update tags you created"
        ),
      };
    }

    // Validate name if provided
    if (data.name !== undefined) {
      const nameError = validateTagName(data.name);
      if (nameError) {
        return { success: false, error: nameError };
      }

      const trimmedName = data.name.trim();

      // Check if new name conflicts with existing tag
      const conflictingTag = await tagRepository.findByName(trimmedName);
      if (conflictingTag && conflictingTag.id !== tagId) {
        return {
          success: false,
          error: new TagNameConflictError(
            `Tag with name "${trimmedName}" already exists`,
            trimmedName
          ),
        };
      }

      data.name = trimmedName;
    }

    try {
      const updatedTag = await tagRepository.update(tagId, data);

      return {
        success: true,
        data: updatedTag as Tag,
      };
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        return {
          success: false,
          error: new TagNameConflictError(
            `Tag with name "${data.name}" already exists`,
            data.name || ""
          ),
        };
      }

      return {
        success: false,
        error: new ValidationError("Failed to update tag"),
      };
    }
  },

  /**
   * Delete tag
   * Only allows deleting user's own tags, not system tags
   */
  async deleteTag(
    tagId: string,
    userId: string
  ): Promise<TagServiceResult<void>> {
    // Check if tag exists
    const existingTag = await tagRepository.findById(tagId);
    if (!existingTag) {
      return {
        success: false,
        error: new TagNotFoundError("Tag not found"),
      };
    }

    // Check if tag is a system tag
    const isSystemTag = existingTag.createdBy === SYSTEM_USER_ID;
    if (isSystemTag) {
      return {
        success: false,
        error: new TagUnauthorizedError("Cannot delete system tags"),
      };
    }

    // Check if user owns the tag
    if (existingTag.createdBy !== userId) {
      return {
        success: false,
        error: new TagUnauthorizedError(
          "You can only delete tags you created"
        ),
      };
    }

    try {
      await tagRepository.softDelete(tagId);

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: new ValidationError("Failed to delete tag"),
      };
    }
  },
};

