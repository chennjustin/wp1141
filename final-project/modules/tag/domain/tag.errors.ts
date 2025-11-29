/**
 * Tag-specific error classes
 * 
 * This module defines error classes specific to tag operations,
 * focusing on tag-specific validation and business logic errors.
 * These errors extend the base AppError classes from lib/errors.
 */

import {
  AppError,
  ValidationError as BaseValidationError,
  NotFoundError as BaseNotFoundError,
  UnauthorizedError as BaseUnauthorizedError,
  InternalServerError as BaseInternalServerError,
  BadRequestError as BaseBadRequestError,
  isAppError,
  normalizeError as normalizeBaseError,
} from "@/lib/errors";

/**
 * Base error class for tag operations
 * Extends AppError to maintain consistency with application-wide error handling
 */
export abstract class TagError extends AppError {}

/**
 * Tag validation error
 * Used for tag-specific validation failures
 */
export class TagValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "TAG_VALIDATION_ERROR";
}

/**
 * Tag not found error
 * Used when tag doesn't exist
 */
export class TagNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "TAG_NOT_FOUND";
}

/**
 * Tag name conflict error
 * Used when tag name already exists (name must be unique)
 */
export class TagNameConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "TAG_NAME_CONFLICT";

  constructor(
    message: string,
    public readonly conflictingName: string
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      conflictingName: this.conflictingName,
    };
  }
}

/**
 * Tag unauthorized error
 * Used when user tries to modify/delete system tag or other user's tag
 */
export class TagUnauthorizedError extends AppError {
  readonly statusCode = 403;
  readonly code = "TAG_UNAUTHORIZED";
}

/**
 * Re-export base errors for convenience
 * Tag module can use base errors for general cases
 */
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from "@/lib/errors";

/**
 * Type guard to check if error is a TagError
 */
export function isTagError(error: unknown): error is TagError {
  return error instanceof TagError;
}

/**
 * Helper function to convert string error to TagError or AppError
 * For backward compatibility with existing string-based errors
 */
export function normalizeError(error: string | AppError): AppError {
  return normalizeBaseError(error);
}

