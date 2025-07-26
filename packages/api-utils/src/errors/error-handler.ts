import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError } from './api-error'

export interface ErrorLogContext {
  userId?: string
  requestId?: string
  path?: string
  method?: string
  ip?: string
  userAgent?: string
}

export class ErrorHandler {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  static handle(
    error: unknown,
    context?: ErrorLogContext
  ): NextResponse {
    if (error instanceof ApiError) {
      return this.handleApiError(error, context)
    }

    if (error instanceof ZodError) {
      return this.handleZodError(error, context)
    }

    if (error instanceof Error) {
      return this.handleGenericError(error, context)
    }

    return this.handleUnknownError(error, context)
  }

  private static handleApiError(
    error: ApiError,
    context?: ErrorLogContext
  ): NextResponse {
    this.logError(error, context)

    return NextResponse.json(
      error.toJSON(),
      { status: error.statusCode }
    )
  }

  private static handleZodError(
    error: ZodError,
    context?: ErrorLogContext
  ): NextResponse {
    const apiError = ApiError.validationError(
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    )

    this.logError(apiError, context)

    return NextResponse.json(
      apiError.toJSON(),
      { status: apiError.statusCode }
    )
  }

  private static handleGenericError(
    error: Error,
    context?: ErrorLogContext
  ): NextResponse {
    const apiError = ApiError.internalServerError(
      this.isDevelopment ? error.message : 'An unexpected error occurred'
    )

    this.logError(error, context, 'error')

    return NextResponse.json(
      apiError.toJSON(),
      { status: apiError.statusCode }
    )
  }

  private static handleUnknownError(
    error: unknown,
    context?: ErrorLogContext
  ): NextResponse {
    const apiError = ApiError.internalServerError('An unexpected error occurred')

    this.logError(new Error(String(error)), context, 'error')

    return NextResponse.json(
      apiError.toJSON(),
      { status: apiError.statusCode }
    )
  }

  private static logError(
    error: Error | ApiError,
    context?: ErrorLogContext,
    level: 'warn' | 'error' = 'warn'
  ): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
      ...context,
      timestamp: new Date().toISOString(),
    }

    if (level === 'error' || (error instanceof ApiError && error.statusCode >= 500)) {
      console.error('API Error:', errorInfo)
    } else {
      console.warn('API Warning:', errorInfo)
    }
  }

  static async catchAsync<T>(
    fn: () => Promise<T>,
    context?: ErrorLogContext
  ): Promise<T | NextResponse> {
    try {
      return await fn()
    } catch (error) {
      return this.handle(error, context)
    }
  }
}

export const withErrorHandler = (
  handler: (req: NextRequest, params: any) => Promise<NextResponse>
) => {
  return async (req: NextRequest, params: any): Promise<NextResponse> => {
    const context: ErrorLogContext = {
      path: req.url,
      method: req.method,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    }

    try {
      return await handler(req, params)
    } catch (error) {
      return ErrorHandler.handle(error, context)
    }
  }
}