import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from '../errors/api-error'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

export interface RateLimitStore {
  increment(key: string): Promise<{ count: number; resetAt: Date }>
  decrement(key: string): Promise<void>
  reset(key: string): Promise<void>
  get(key: string): Promise<{ count: number; resetAt: Date } | null>
}

class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: Date }>()
  private timers = new Map<string, NodeJS.Timeout>()

  async increment(key: string): Promise<{ count: number; resetAt: Date }> {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || record.resetAt.getTime() <= now) {
      const resetAt = new Date(now + this.windowMs)
      const newRecord = { count: 1, resetAt }
      this.store.set(key, newRecord)
      this.setResetTimer(key, this.windowMs)
      return newRecord
    }

    record.count++
    return record
  }

  async decrement(key: string): Promise<void> {
    const record = this.store.get(key)
    if (record && record.count > 0) {
      record.count--
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  async get(key: string): Promise<{ count: number; resetAt: Date } | null> {
    const record = this.store.get(key)
    if (!record || record.resetAt.getTime() <= Date.now()) {
      return null
    }
    return record
  }

  private setResetTimer(key: string, windowMs: number): void {
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.store.delete(key)
      this.timers.delete(key)
    }, windowMs)

    this.timers.set(key, timer)
  }

  constructor(private windowMs: number) {}
}

export class RateLimiter {
  private store: RateLimitStore
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = {
      keyGenerator: this.defaultKeyGenerator,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later',
      ...config,
    }
    this.store = store || new MemoryStore(config.windowMs)
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return `rate-limit:${ip}`
  }

  async middleware(
    req: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = this.config.keyGenerator(req)
    const { count, resetAt } = await this.store.increment(key)

    if (count > this.config.maxRequests) {
      const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
      
      const headers = new Headers({
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetAt.toISOString(),
        'Retry-After': retryAfter.toString(),
      })

      throw ApiError.rateLimitExceeded(this.config.message)
    }

    const response = await next()

    response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - count).toString())
    response.headers.set('X-RateLimit-Reset', resetAt.toISOString())

    if (
      (this.config.skipSuccessfulRequests && response.status < 400) ||
      (this.config.skipFailedRequests && response.status >= 400)
    ) {
      await this.store.decrement(key)
    }

    return response
  }

  createMiddleware() {
    return async (req: NextRequest, next: () => Promise<NextResponse>) => {
      return this.middleware(req, next)
    }
  }
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const limiter = new RateLimiter(config)
  return limiter.createMiddleware()
}

export const rateLimitPresets = {
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
  relaxed: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many authentication attempts',
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
}

export const withRateLimit = (
  handler: (req: NextRequest, params: any) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitPresets.standard
) => {
  const limiter = new RateLimiter(config)
  
  return async (req: NextRequest, params: any): Promise<NextResponse> => {
    return limiter.middleware(req, () => handler(req, params))
  }
}