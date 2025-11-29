/**
 * Transaction-specific error classes
 * 
 * This module defines error classes specific to transaction operations,
 * focusing on transaction-specific validation and business logic errors.
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
 * Base error class for transaction operations
 * Extends AppError to maintain consistency with application-wide error handling
 */
export abstract class TransactionError extends AppError {}

/**
 * Transaction validation error
 * Used for transaction-specific validation failures
 */
export class TransactionValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "TRANSACTION_VALIDATION_ERROR";
}

/**
 * Transaction amount mismatch error
 * Used when payer amounts or share amounts don't match transaction amount
 */
export class TransactionAmountMismatchError extends AppError {
  readonly statusCode = 400;
  readonly code = "TRANSACTION_AMOUNT_MISMATCH";

  constructor(
    message: string,
    public readonly expectedAmount: number,
    public readonly actualAmount: number
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      expectedAmount: this.expectedAmount,
      actualAmount: this.actualAmount,
    };
  }
}

/**
 * Invalid payer IDs error
 * Used when provided payer IDs don't exist or are invalid
 */
export class InvalidPayerIdsError extends AppError {
  readonly statusCode = 400;
  readonly code = "INVALID_PAYER_IDS";

  constructor(
    message: string,
    public readonly invalidIds: string[]
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      invalidIds: this.invalidIds,
    };
  }
}

/**
 * Invalid user IDs error (for shares)
 * Used when provided user IDs for shares don't exist or are invalid
 */
export class InvalidShareUserIdsError extends AppError {
  readonly statusCode = 400;
  readonly code = "INVALID_SHARE_USER_IDS";

  constructor(
    message: string,
    public readonly invalidIds: string[]
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      invalidIds: this.invalidIds,
    };
  }
}

/**
 * Transaction tag not found error
 * Used when transaction tag doesn't exist
 */
export class TransactionTagNotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "TRANSACTION_TAG_NOT_FOUND";
}

/**
 * Re-export base errors for convenience
 * Transaction module can use base errors for general cases
 */
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from "@/lib/errors";

/**
 * Type guard to check if error is a TransactionError
 */
export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError;
}

/**
 * Helper function to convert string error to TransactionError or AppError
 * For backward compatibility with existing string-based errors
 */
export function normalizeError(error: string | AppError): AppError {
  return normalizeBaseError(error);
}
