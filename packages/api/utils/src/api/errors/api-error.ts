export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'PAYMENT_REQUIRED'
  | 'UNPROCESSABLE_ENTITY';

export interface ApiErrorDetails {
  field?: string;
  message: string;
  code?: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ApiErrorDetails[];
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: ApiErrorDetails[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: ApiErrorDetails[]): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(resource: string): ApiError {
    return new ApiError(404, 'NOT_FOUND', `${resource} not found`);
  }

  static methodNotAllowed(method: string): ApiError {
    return new ApiError(
      405,
      'METHOD_NOT_ALLOWED',
      `Method ${method} not allowed`
    );
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, 'CONFLICT', message);
  }

  static validationError(details: ApiErrorDetails[]): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  static rateLimitExceeded(message = 'Rate limit exceeded'): ApiError {
    return new ApiError(429, 'RATE_LIMIT_EXCEEDED', message);
  }

  static internalServerError(message = 'Internal server error'): ApiError {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }

  static serviceUnavailable(message = 'Service unavailable'): ApiError {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message);
  }

  static paymentRequired(message = 'Payment required'): ApiError {
    return new ApiError(402, 'PAYMENT_REQUIRED', message);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp,
        path: this.path,
      },
    };
  }
}
