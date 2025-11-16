/**
 * User domain types and interfaces
 * 
 * This module defines the core domain types for the User entity,
 * separate from the database schema. These types represent the
 * business logic layer of the User domain.
 */

/**
 * User profile data structure
 */
export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email?: string;
  imageUrl?: string;
  bannerUrl?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

/**
 * User search result
 */
export interface UserSearchResult {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
}

/**
 * User registration data
 */
export interface RegisterUserData {
  userId: string;
}

/**
 * User profile update data
 */
export interface UpdateUserProfileData {
  name?: string;
  userID?: string;
  bio?: string;
  bannerUrl?: string;
  image?: string;
}

/**
 * User ID validation result
 */
export interface UserIdValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * User ID availability check result
 */
export interface UserIdAvailabilityResult {
  available: boolean;
  error?: string;
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

