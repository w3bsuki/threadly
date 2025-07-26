import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ApiError } from '../errors/api-error'
import { createAuditLog } from '@repo/database'

export interface AuthUser {
  id: string
  email?: string | null
  role?: string
  permissions?: string[]
}

export interface AuthConfig {
  requireAuth?: boolean
  requireRole?: string | string[]
  requirePermission?: string | string[]
  allowAnonymous?: boolean
  auditLog?: boolean
}

export class AuthMiddleware {
  constructor(private config: AuthConfig = {}) {}

  async authenticate(req: NextRequest): Promise<AuthUser | null> {
    try {
      const { userId } = await auth()
      
      if (!userId && !this.config.allowAnonymous) {
        throw ApiError.unauthorized()
      }

      if (!userId) {
        return null
      }

      const user = await this.getUserFromClerk(userId)
      
      if (this.config.requireRole) {
        this.checkRole(user, this.config.requireRole)
      }

      if (this.config.requirePermission) {
        this.checkPermission(user, this.config.requirePermission)
      }

      if (this.config.auditLog) {
        await this.logAccess(user, req)
      }

      return user
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw ApiError.unauthorized('Authentication failed')
    }
  }

  private async getUserFromClerk(userId: string): Promise<AuthUser> {
    const clerkClient = (await import('@clerk/nextjs/server')).clerkClient
    const user = await clerkClient.users.getUser(userId)
    
    const metadata = user.publicMetadata as { role?: string; permissions?: string[] }
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      role: metadata.role || 'USER',
      permissions: metadata.permissions || [],
    }
  }

  private checkRole(user: AuthUser, requiredRole: string | string[]): void {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!user.role || !roles.includes(user.role)) {
      throw ApiError.forbidden('Insufficient role')
    }
  }

  private checkPermission(user: AuthUser, requiredPermission: string | string[]): void {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    
    if (!user.permissions || !permissions.some(p => user.permissions?.includes(p))) {
      throw ApiError.forbidden('Insufficient permissions')
    }
  }

  private async logAccess(user: AuthUser, req: NextRequest): Promise<void> {
    const prisma = (await import('@repo/database')).prisma
    
    await createAuditLog(prisma, {
      userId: user.id,
      eventType: 'api_access',
      resourceType: 'api',
      resourceId: req.url,
      metadata: {
        method: req.method,
        path: new URL(req.url).pathname,
        userAgent: req.headers.get('user-agent'),
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
    })
  }

  middleware(req: NextRequest, next: () => Promise<NextResponse>): Promise<NextResponse> {
    return this.authenticate(req).then(user => {
      return next().then(response => {
        if (user) {
          response.headers.set('X-User-Id', user.id)
          response.headers.set('X-User-Role', user.role || 'USER')
        }
        return response
      })
    })
  }
}

export const withAuth = (
  handler: (req: NextRequest, params: any, user: AuthUser | null) => Promise<NextResponse>,
  config: AuthConfig = { requireAuth: true }
) => {
  const auth = new AuthMiddleware(config)
  
  return async (req: NextRequest, params: any): Promise<NextResponse> => {
    const user = await auth.authenticate(req)
    return handler(req, params, user)
  }
}

export const requireAuth = (
  handler: (req: NextRequest, params: any, user: AuthUser) => Promise<NextResponse>
) => {
  return withAuth(
    async (req, params, user) => {
      if (!user) {
        throw ApiError.unauthorized()
      }
      return handler(req, params, user)
    },
    { requireAuth: true }
  )
}

export const requireRole = (role: string | string[]) => {
  return (handler: (req: NextRequest, params: any, user: AuthUser) => Promise<NextResponse>) => {
    return withAuth(
      async (req, params, user) => {
        if (!user) {
          throw ApiError.unauthorized()
        }
        return handler(req, params, user)
      },
      { requireAuth: true, requireRole: role }
    )
  }
}

export const requirePermission = (permission: string | string[]) => {
  return (handler: (req: NextRequest, params: any, user: AuthUser) => Promise<NextResponse>) => {
    return withAuth(
      async (req, params, user) => {
        if (!user) {
          throw ApiError.unauthorized()
        }
        return handler(req, params, user)
      },
      { requireAuth: true, requirePermission: permission }
    )
  }
}

export const optionalAuth = (
  handler: (req: NextRequest, params: any, user: AuthUser | null) => Promise<NextResponse>
) => {
  return withAuth(handler, { allowAnonymous: true })
}

export const createAuthChecker = (config: AuthConfig) => {
  const auth = new AuthMiddleware(config)
  
  return {
    check: (req: NextRequest) => auth.authenticate(req),
    middleware: auth.middleware.bind(auth),
    withAuth: (handler: any) => withAuth(handler, config),
  }
}