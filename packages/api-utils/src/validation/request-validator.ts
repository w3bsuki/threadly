import { NextRequest } from 'next/server'
import { z, ZodSchema, ZodError } from 'zod'
import { ApiError } from '../errors/api-error'

export interface ValidationResult<T> {
  data: T
  errors: null
}

export interface ValidationError {
  data: null
  errors: Array<{
    field: string
    message: string
    code: string
  }>
}

export class RequestValidator {
  static async validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<T> {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.validationError(
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        )
      }
      throw ApiError.badRequest('Invalid request body')
    }
  }

  static validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): T {
    try {
      const { searchParams } = new URL(request.url)
      const query = Object.fromEntries(searchParams.entries())
      return schema.parse(query)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.validationError(
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        )
      }
      throw ApiError.badRequest('Invalid query parameters')
    }
  }

  static validateParams<T>(
    params: unknown,
    schema: ZodSchema<T>
  ): T {
    try {
      return schema.parse(params)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.validationError(
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        )
      }
      throw ApiError.badRequest('Invalid route parameters')
    }
  }

  static validateHeaders<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): T {
    try {
      const headers: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        headers[key] = value
      })
      return schema.parse(headers)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.validationError(
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        )
      }
      throw ApiError.badRequest('Invalid headers')
    }
  }

  static async validateFormData<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<T> {
    try {
      const formData = await request.formData()
      const data: Record<string, any> = {}
      
      formData.forEach((value, key) => {
        if (data[key]) {
          if (Array.isArray(data[key])) {
            data[key].push(value)
          } else {
            data[key] = [data[key], value]
          }
        } else {
          data[key] = value
        }
      })

      return schema.parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.validationError(
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        )
      }
      throw ApiError.badRequest('Invalid form data')
    }
  }
}

export const createValidator = <T>(schema: ZodSchema<T>) => {
  return {
    body: (request: NextRequest) => RequestValidator.validateBody(request, schema),
    query: (request: NextRequest) => RequestValidator.validateQuery(request, schema),
    params: (params: unknown) => RequestValidator.validateParams(params, schema),
    headers: (request: NextRequest) => RequestValidator.validateHeaders(request, schema),
    formData: (request: NextRequest) => RequestValidator.validateFormData(request, schema),
  }
}