/**
 * Tag domain types and interfaces
 * 
 * This module defines the core domain types for the Tag entity,
 * separate from the database schema. These types represent the
 * business logic layer of the Tag domain.
 */

import type { AppError } from "@/lib/errors";

/**
 * Tag entity
 */
export interface Tag {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  isDeleted: boolean;
  creator?: {
    id: string;
    name: string;
  };
}

/**
 * Create tag data
 */
export interface CreateTagData {
  name: string;
}

/**
 * Update tag data
 */
export interface UpdateTagData {
  name?: string;
}

/**
 * Tag query filters
 * Supports filtering by tag type: 'system', 'user', or 'all'
 */
export interface TagFilters {
  filter?: "system" | "user" | "all";
  userId?: string; // Required when filter is 'user'
}

/**
 * Service result wrapper
 * Supports both string errors (for backward compatibility) and AppError instances
 */
export interface TagServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | AppError;
}

