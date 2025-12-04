/**
 * API response utilities
 * 
 * This module provides utilities for consistent API error handling
 * and response formatting across all API routes.
 */

import { NextResponse } from "next/server";
import { normalizeError, isAppError, AppError } from "./errors";

/**
 * Extract error message from error (string or AppError)
 */
function getErrorMessage(error: string | AppError): string {
  if (isAppError(error)) {
    return error.message;
  }
  return typeof error === "string" ? error : "Unknown error";
}

/**
 * Handle service result error and return appropriate HTTP response
 */
export function handleServiceError<T>(
  result: { success: boolean; error?: string | AppError; data?: T }
): NextResponse | null {
  if (!result.success && result.error) {
    // Normalize error to AppError (handles backward compatibility)
    const error = normalizeError(result.error);
    const errorMessage = getErrorMessage(result.error);

    return NextResponse.json(
      {
        error: errorMessage,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }
  return null;
}

/**
 * Create error response from AppError
 */
export function createErrorResponse(error: AppError): NextResponse {
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
    },
    { status: error.statusCode }
  );
}

