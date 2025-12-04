/**
 * Base error classes
 * 
 * This module defines base error classes that can be used across
 * all domains in the application. Domain-specific errors should
 * extend these base classes.
 */

/**
 * Base error class for application errors
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON-serializable format
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation error (400)
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";
}

/**
 * Bad request error (400)
 * Used for general bad request errors
 */
export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code = "BAD_REQUEST";
}

/**
 * Unauthorized error (401)
 * Used when user is not authenticated or lacks permission
 */
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

/**
 * Forbidden error (403)
 * Used when user is authenticated but lacks permission to access the resource
 */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
}

/**
 * Not found error (404)
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

/**
 * Internal server error (500)
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper function to convert string error to AppError
 * For backward compatibility with existing string-based errors
 */
export function normalizeError(error: string | AppError): AppError {
  if (isAppError(error)) {
    return error;
  }

  // Try to infer error type from error message
  if (error === "Unauthorized") {
    return new UnauthorizedError(error);
  }
  if (error.includes("not found") || error.includes("Not found")) {
    return new NotFoundError(error);
  }
  if (
    error.includes("required") ||
    error.includes("must equal") ||
    error.includes("must be") ||
    error.includes("Invalid")
  ) {
    return new ValidationError(error);
  }

  // Default to bad request for unknown errors
  return new BadRequestError(error);
}

