export class ActionError extends Error {
  constructor(
    message: string,
    public code: string = 'ACTION_ERROR',
    public field?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ActionError'
  }

  static validation(message: string, field?: string, details?: Record<string, any>) {
    return new ActionError(message, 'VALIDATION_ERROR', field, details)
  }

  static unauthorized(message = 'Unauthorized') {
    return new ActionError(message, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Forbidden') {
    return new ActionError(message, 'FORBIDDEN')
  }

  static notFound(resource: string) {
    return new ActionError(`${resource} not found`, 'NOT_FOUND')
  }

  static conflict(message: string) {
    return new ActionError(message, 'CONFLICT')
  }

  static rateLimit(message = 'Too many requests') {
    return new ActionError(message, 'RATE_LIMIT')
  }

  static internal(message = 'Internal server error') {
    return new ActionError(message, 'INTERNAL_ERROR')
  }
}