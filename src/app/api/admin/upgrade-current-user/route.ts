import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { addSecurityHeaders, auditLog } from '@/lib/security'

export async function POST(request: NextRequest) {
  console.log('🔧 API: Upgrade request received')
  
  try {
    // First check authentication directly
    const currentUser = await getCurrentUser()
    console.log('🔧 API: Current user:', currentUser ? { id: currentUser.id, role: currentUser.role } : 'null')
    
    if (!currentUser) {
      console.log('🔧 API: No user found, returning 401')
      return addSecurityHeaders(NextResponse.json({ error: 'Not authenticated - please log in first' }, { status: 401 }))
    }

    // For the upgrade endpoint, any authenticated user can upgrade themselves (demo only)
    // In production, you'd want stricter controls
    console.log('🔧 API: User authenticated, proceeding with upgrade')

    const { role } = await request.json()
    
    if (!role || !['staff', 'company_admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Audit log the role change
    auditLog('ROLE_UPGRADE', currentUser.id, {
      oldRole: currentUser.role,
      newRole: role,
      method: 'self_upgrade'
    })

    // In a real app, this would update the database
    // For demo purposes, we'll set a localStorage override
    console.log(`🔧 Upgrading user ${currentUser.id} (${currentUser.phone || currentUser.email}) to ${role}`)

    return addSecurityHeaders(NextResponse.json({
      success: true,
      message: `User upgraded to ${role}`,
      demo_instructions: {
        userId: currentUser.id,
        newRole: role,
        steps: [
          '1. Refresh the page',
          '2. Your account now has the new role!',
          '',
          'Note: This is a demo override using localStorage.',
          'In production, this would update the database.'
        ]
      },
      user: {
        id: currentUser.id,
        phone: currentUser.phone,
        email: currentUser.email,
        old_role: currentUser.role,
        new_role: role
      }
    }))

  } catch (error) {
    console.error('Upgrade user error:', error)
    return addSecurityHeaders(NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 }))
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      current_user: {
        id: currentUser.id,
        phone: currentUser.phone,
        email: currentUser.email,
        full_name: currentUser.full_name,
        role: currentUser.role
      },
      available_upgrades: ['staff', 'company_admin', 'super_admin']
    })

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
