'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { 
  User, 
  LogOut,
  Menu,
  X,
  Building,
  Users,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser, signOut, type AuthUser } from '@/lib/auth'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser()
    console.log('🔧 Navigation: Current user:', currentUser ? { id: currentUser.id, role: currentUser.role } : 'null')
    setUser(currentUser)
  }, [])

  useEffect(() => {
    refreshUser()
  }, [])

  // Listen for pathname changes to refresh user state
  useEffect(() => {
    // Only refresh user on non-auth pages
    if (!pathname.startsWith('/auth')) {
      refreshUser()
    }
  }, [pathname])

  // Listen for storage events (for role overrides) and auth state changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('role_override_') || e.key === 'demo_user_id') {
        console.log('🔧 Navigation: Storage change detected, refreshing user')
        refreshUser()
      }
    }

    const handleAuthStateChange = () => {
      console.log('🔧 Navigation: Auth state change detected, refreshing user')
      refreshUser()
    }

    // Also listen to Supabase auth state changes
    const supabase = createSupabaseBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      console.log('🔧 Navigation: Supabase auth state changed:', event)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(refreshUser, 100)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthStateChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthStateChange)
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    window.location.href = '/auth/login'
  }



  const staffLinks = [
    { href: '/reports', label: 'Reports', icon: Users }
  ]

  const adminLinks = [
    { href: '/admin', label: 'Admin Panel', icon: Building },
    { href: '/admin/venues', label: 'Venues', icon: Building },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/transactions', label: 'Transactions', icon: BarChart3 },
  ]

  const getNavLinks = () => {
    if (!user) return []
    
    switch (user.role) {
      case 'customer':
        // Customers see My Passes in top nav, other links are in footer
        return [{ href: '/myPasses', label: 'My Passes', icon: User }]
      case 'staff':
        return [...staffLinks]
      case 'company_admin':
        return [...adminLinks]
      case 'super_admin':
        // Super admins get clean top nav - admin features moved to footer
        return [
          { href: '/reports', label: 'Reports', icon: User }
        ]
      default:
        return [{ href: '/myPasses', label: 'My Passes', icon: User }]
    }
  }

  const navLinks = getNavLinks()

  if (pathname.startsWith('/auth')) {
    return null
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              {/* UP Logo */}
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">UP</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900">UnionPasscard</span>
            </Link>
          </div>

          {user ? (
            <>
              {/* Desktop Navigation - Authenticated */}
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    {user.full_name || user.email || user.phone}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Mobile menu button - Authenticated */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          ) : (
            /* Desktop & Mobile Login Button - Not Authenticated */
            <div className="flex items-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Profile Menu - Only show if authenticated */}
      {user && isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <div className="px-3 py-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-base font-medium text-gray-900">
                    {user.full_name || user.email || user.phone}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.role?.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
