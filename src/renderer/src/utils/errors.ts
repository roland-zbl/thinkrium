export class AppError extends Error {
  public readonly code: string
  public readonly userMessage: string
  public readonly originalError?: unknown

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    userMessage?: string,
    originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.userMessage = userMessage || message
    this.originalError = originalError

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
