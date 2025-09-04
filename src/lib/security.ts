import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from './auth'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore: Record<string, number> = {}

export interface SecurityConfig {
  requireAuth?: boolean
  requireRole?: 'customer' | 'staff' | 'company_admin' | 'super_admin'
  rateLimitKey?: string
  rateLimitMinutes?: number
  developmentOnly?: boolean
  requireEnvFlag?: string
}

export async function withSecurity(
  request: NextRequest,
  config: SecurityConfig = {}
): Promise<NextResponse | null> {
  try {
    // Check if endpoint should be disabled in production
    if (config.developmentOnly && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'This endpoint is only available in development' 
      }, { status: 403 })
    }

    // Check environment flag requirement
    if (config.requireEnvFlag && process.env[config.requireEnvFlag] !== 'true') {
      return NextResponse.json({ 
        error: 'This feature is disabled' 
      }, { status: 403 })
    }

    // Authentication check
    if (config.requireAuth || config.requireRole) {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      // Role check
      if (config.requireRole) {
        const roleHierarchy = {
          'customer': 0,
          'staff': 1,
          'company_admin': 2,
          'super_admin': 3
        }
        
        if (!currentUser.role) {
          return NextResponse.json({ 
            error: 'User role not assigned' 
          }, { status: 403 })
        }
        
        const userLevel = roleHierarchy[currentUser.role]
        const requiredLevel = roleHierarchy[config.requireRole]
        
        if (userLevel < requiredLevel) {
          return NextResponse.json({ 
            error: `${config.requireRole.replace('_', ' ')} privileges required` 
          }, { status: 403 })
        }
      }

      // Rate limiting
      if (config.rateLimitKey && config.rateLimitMinutes) {
        const rateLimitKey = `${config.rateLimitKey}_${currentUser.id}`
        const lastRequest = rateLimitStore[rateLimitKey] || 0
        const now = Date.now()
        const cooldownMs = config.rateLimitMinutes * 60 * 1000
        
        if (now - lastRequest < cooldownMs) {
          const remainingMs = cooldownMs - (now - lastRequest)
          const remainingMinutes = Math.ceil(remainingMs / 60000)
          
          return NextResponse.json({ 
            error: `Rate limited. Please wait ${remainingMinutes} minute(s) before trying again.` 
          }, { status: 429 })
        }
        
        rateLimitStore[rateLimitKey] = now
      }
    }

    // Security headers
    const headers = new Headers()
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return null // No security violations, proceed with request
    
  } catch (error) {
    console.error('Security middleware error:', error)
    return NextResponse.json({ 
      error: 'Security check failed' 
    }, { status: 500 })
  }
}

// Helper function to add security headers to responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

// Helper function to check if user has required role
export function hasRole(
  user: { role: string | null } | null,
  allowedRoles: string[]
): boolean {
  if (!user || !user.role) return false
  return allowedRoles.includes(user.role)
}

// Audit logging
export function auditLog(action: string, userId: string, details?: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    action,
    userId,
    details,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    ip: 'hidden-for-privacy' // In production, get from request headers
  }
  
  console.log('🔒 AUDIT:', JSON.stringify(logEntry))
  
  // In production, send to secure logging service
  // await sendToAuditService(logEntry)
}
