/**
 * Global type definitions
 * 
 * This module contains global type definitions used across the application.
 */

/**
 * User profile data structure
 */
export interface User {
  userId: string;
  name: string;
  imageUrl?: string;
  bannerUrl?: string;
}

/**
 * Common API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

