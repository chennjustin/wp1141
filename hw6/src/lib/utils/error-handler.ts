import { Logger } from "./logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleAsyncError<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string = "Operation failed"
): Promise<T> {
  return fn().catch((error) => {
    Logger.error(errorMessage, { error });
    return fallback;
  });
}

export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage: string = "Operation failed"
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      Logger.error(errorMessage, { error, args });
      throw error;
    }
  };
}

