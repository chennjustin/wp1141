/**
 * User ID validation utilities
 * 
 * This module provides validation and sanitization utilities
 * specific to the User domain. These are domain-specific rules
 * and should be kept within the user module.
 */

import {
  USER_ID_PATTERN,
  RESERVED_WORDS,
  MIN_USER_ID_LENGTH,
  MAX_USER_ID_LENGTH,
} from "@/config/constants";

/**
 * Validation result interface
 * 
 * This type represents the result of user ID validation.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Re-export for backward compatibility
export type UserIdValidationResult = ValidationResult;

/**
 * Validates a user ID according to platform rules
 * 
 * Rules:
 * - Length must be between MIN_USER_ID_LENGTH and MAX_USER_ID_LENGTH
 * - Must match USER_ID_PATTERN (lowercase alphanumeric with underscores)
 * - Cannot be a reserved word
 */
export function validateUserId(userId: string): ValidationResult {
  // Length check
  if (userId.length < MIN_USER_ID_LENGTH || userId.length > MAX_USER_ID_LENGTH) {
    return {
      valid: false,
      error: `User ID must be ${MIN_USER_ID_LENGTH}-${MAX_USER_ID_LENGTH} characters`,
    };
  }

  // Pattern check (lowercase alphanumeric with underscores)
  if (!USER_ID_PATTERN.test(userId)) {
    return {
      valid: false,
      error:
        "Invalid characters. Use lowercase letters, numbers, and underscores only",
    };
  }

  // Reserved words check
  if (RESERVED_WORDS.includes(userId as any)) {
    return { valid: false, error: "This User ID is reserved" };
  }

  return { valid: true };
}

/**
 * Sanitizes a user ID input (trims and lowercases)
 * 
 * This function normalizes user input before validation.
 */
export function sanitizeUserId(input: string): string {
  return input.trim().toLowerCase();
}

