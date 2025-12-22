/**
 * Subscription-specific error classes
 * 
 * This module defines error classes specific to subscription operations,
 * focusing on subscription-specific validation and business logic errors.
 * These errors extend the base AppError classes from lib/errors.
 */

import { AppError } from "@/lib/errors";

/**
 * Base error class for subscription operations
 */
export abstract class SubscriptionError extends AppError {}

/**
 * Subscription validation error
 * Used for subscription-specific validation failures
 */
export class SubscriptionValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "SUBSCRIPTION_VALIDATION_ERROR";
}

/**
 * Subscription not found error
 * Used when subscription doesn't exist
 */
export class SubscriptionNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "SUBSCRIPTION_NOT_FOUND";
}

/**
 * Unauthorized subscription access error
 * Used when user doesn't have permission to access the subscription
 */
export class UnauthorizedSubscriptionAccessError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED_SUBSCRIPTION_ACCESS";
}

/**
 * Invalid subscription data error
 * Used when subscription data is invalid
 */
export class InvalidSubscriptionDataError extends AppError {
  readonly statusCode = 400;
  readonly code = "INVALID_SUBSCRIPTION_DATA";
}

/**
 * Re-export base errors for convenience
 */
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from "@/lib/errors";

