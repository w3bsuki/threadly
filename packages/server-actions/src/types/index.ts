import { z } from 'zod'

export type ActionState<TData = unknown> = 
  | { status: 'idle'; data?: never; error?: never }
  | { status: 'loading'; data?: never; error?: never }
  | { status: 'success'; data: TData; error?: never }
  | { status: 'error'; data?: never; error: ActionError }

export interface ActionError {
  message: string
  code?: string
  field?: string
  details?: Record<string, any>
}

export type ServerActionResult<TData = unknown> = 
  | { success: true; data: TData; error?: never }
  | { success: false; data?: never; error: ActionError }

export type ServerAction<TInput, TOutput> = (
  input: TInput
) => Promise<ServerActionResult<TOutput>>

export type ValidatedServerAction<TInput, TOutput> = (
  input: unknown
) => Promise<ServerActionResult<TOutput>>

export interface ActionOptions {
  revalidatePaths?: string[]
  revalidateTags?: string[]
  cookies?: Array<{
    name: string
    value: string
    options?: {
      httpOnly?: boolean
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
      maxAge?: number
      path?: string
    }
  }>
  headers?: Record<string, string>
  cache?: {
    tags?: string[]
    revalidate?: number | false
  }
}

export interface ActionContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
}

export type ActionMiddleware<TContext = ActionContext> = (
  context: TContext,
  next: () => Promise<any>
) => Promise<any>

export interface CreateActionOptions<TContext = ActionContext> {
  middleware?: ActionMiddleware<TContext>[]
  rateLimit?: {
    limit: number
    window: number
  }
  auth?: {
    required: boolean
    roles?: string[]
    permissions?: string[]
  }
  cache?: {
    enabled: boolean
    ttl?: number
    key?: (input: any) => string
  }
}