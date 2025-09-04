import { createSupabaseBrowserClient } from './supabase'
import { Database } from './database.types'

export type UserRole = Database['public']['Tables']['users']['Row']['role']

export interface AuthUser {
  id: string
  email?: string | null
  phone?: string | null
  full_name?: string | null
  role: UserRole
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createSupabaseBrowserClient()
  
  console.log('🔧 Auth: Checking Supabase user...')
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('🔧 Auth: Supabase user result:', { user: user ? { id: user.id, phone: user.phone, email: user.email } : null, error })
  
  if (error || !user) {
    console.log('🔧 Auth: No authenticated user found')
    return null
  }

  console.log('🔧 Auth: Fetching user profile from database...')
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('🔧 Auth: Profile result:', { profile, profileError })

  if (!profile) {
    console.log('🔧 Auth: No profile found in users table')
    
    // Temporary fallback for testing - create a mock super admin user
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Auth: Using development fallback user')
      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.user_metadata?.full_name || user.email || user.phone,
        role: 'super_admin'
      }
    }
    
    return null
  }

  // Check for demo role override in localStorage
  let finalRole = profile.role
  if (typeof window !== 'undefined') {
    const roleOverride = localStorage.getItem(`role_override_${user.id}`)
    if (roleOverride && ['customer', 'staff', 'company_admin', 'super_admin'].includes(roleOverride)) {
      finalRole = roleOverride as UserRole
      console.log(`🔧 Demo: Using role override ${roleOverride} for user ${user.id}`)
    }
  }

  return {
    id: profile.id,
    email: profile.email,
    phone: profile.phone,
    full_name: profile.full_name,
    role: finalRole
  }
}

// Demo function to set role override
export function setDemoRoleOverride(role: UserRole) {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('demo_user_id')
    if (userId) {
      localStorage.setItem(`role_override_${userId}`, role)
      console.log(`🔧 Demo: Set role override to ${role}`)
    }
  }
}

// Demo function to clear role override
export function clearDemoRoleOverride() {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('demo_user_id')
    if (userId) {
      localStorage.removeItem(`role_override_${userId}`)
      console.log(`🔧 Demo: Cleared role override`)
    }
  }
}

export async function signInWithPhone(phone: string) {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true
    }
  })

  return { data, error }
}

export async function signInWithEmail(email: string) {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  })

  return { data, error }
}

export async function verifyOtp(phone: string, token: string) {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })

  // Emit custom event to notify components of auth state change
  if (!error && typeof window !== 'undefined') {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    }, 100)
  }

  return { data, error }
}

export async function verifyEmailOtp(email: string, token: string) {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })

  // Emit custom event to notify components of auth state change
  if (!error && typeof window !== 'undefined') {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    }, 100)
  }

  return { data, error }
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'customer': 0,
    'staff': 1,
    'company_admin': 2,
    'super_admin': 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
