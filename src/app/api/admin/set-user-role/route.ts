import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { withSecurity, addSecurityHeaders, auditLog } from '@/lib/security'

interface SetUserRoleRequest {
  userId: string
  role: 'customer' | 'staff' | 'company_admin' | 'super_admin'
  phone?: string
  email?: string
}

// Mock users database - in real app this would be actual database
interface MockUser {
  id: string
  email: string
  phone: string
  full_name: string
  role: string
  created_at: string
  updated_at: string
}

const mockUsers: Record<string, MockUser> = {}

export async function POST(request: NextRequest) {
  // Apply security checks
  const securityCheck = await withSecurity(request, {
    requireAuth: true,
    requireRole: 'super_admin',
    rateLimitKey: 'user_creation',
    rateLimitMinutes: process.env.NODE_ENV === 'development' ? 0.5 : 10, // 30 seconds in dev, 10 minutes in prod
    developmentOnly: false, // Allow in all environments for demo
    requireEnvFlag: process.env.NODE_ENV === 'production' ? 'ALLOW_USER_MANAGEMENT' : undefined
  })
  
  if (securityCheck) {
    return addSecurityHeaders(securityCheck)
  }

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return addSecurityHeaders(NextResponse.json({ error: 'Authentication required' }, { status: 401 }))
    }

    const body: SetUserRoleRequest = await request.json()
    const { userId, role, phone, email } = body

    // Validate input
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })
    }

    const validRoles = ['customer', 'staff', 'company_admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // For demo purposes, we'll create/update the user
    // Audit log the user creation
    auditLog('USER_CREATED', currentUser.id, {
      targetUserId: userId,
      assignedRole: role,
      createdBy: currentUser.role
    })

    mockUsers[userId] = {
      id: userId,
      role,
      phone: phone || `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
      email: email || `${userId}@sgv.com`,
      full_name: role === 'staff' ? `SGV Staff ${userId.slice(-3)}` : `User ${userId.slice(-3)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return addSecurityHeaders(NextResponse.json({
      success: true,
      message: `User ${userId} role set to ${role}`,
      user: mockUsers[userId]
    }))

  } catch (error) {
    console.error('Set user role error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET endpoint to check current user roles
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // SECURITY: Only admins can view user lists
    if (!currentUser.role || !['company_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json({ 
        error: 'Admin privileges required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const user = mockUsers[userId]
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ user })
    }

    // Return all users (only for super admins)
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Super admin privileges required to list all users' 
      }, { status: 403 })
    }

    return NextResponse.json({ 
      users: Object.values(mockUsers),
      total: Object.keys(mockUsers).length 
    })

  } catch (error) {
    console.error('Get user roles error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
