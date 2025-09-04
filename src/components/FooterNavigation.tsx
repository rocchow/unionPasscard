'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { 
  CreditCard, 
  QrCode, 
  History,
  Compass,
  ShieldCheck,
  User,
  ScanLine,
  Users,
  BarChart3,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function FooterNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser()
    console.log('🔧 FooterNav: Current user:', currentUser ? { id: currentUser.id, role: currentUser.role } : 'null')
    console.log('🔧 FooterNav: Pathname:', pathname)
    setUser(currentUser)
  }, [pathname])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

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
        console.log('🔧 FooterNav: Storage change detected, refreshing user')
        refreshUser()
      }
    }

    const handleAuthStateChange = () => {
      console.log('🔧 FooterNav: Auth state change detected, refreshing user')
      refreshUser()
    }

    // Also listen to Supabase auth state changes
    const supabase = createSupabaseBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      console.log('🔧 FooterNav: Supabase auth state changed:', event)
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

  // Show for all authenticated users
  if (!user) {
    return null
  }

  // Don't show on auth pages
  if (pathname.startsWith('/auth')) {
    return null
  }

  // Determine current mode based on pathname
  const isAdminMode = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/staff')
  
  // Navigation based on user role and current mode
  const getFooterLinks = () => {
    // Customer mode navigation (4 icons)
    const customerLinks = [
      { 
        href: '/discover', 
        label: 'Discover', 
        icon: Compass,
        color: 'text-emerald-600'
      },
      { 
        href: '/memberships', 
        label: 'My Passes', 
        icon: CreditCard,
        color: 'text-blue-600'
      },
      { 
        href: '/qr-code', 
        label: 'QR Code', 
        icon: QrCode,
        color: 'text-green-600'
      },
      { 
        href: '/transactions', 
        label: 'Transactions', 
        icon: History,
        color: 'text-purple-600'
      }
    ]

    // Admin mode navigation (4 icons + role switcher)
    const adminLinks = [
      { 
        href: '/staff/scan', 
        label: 'Scan QR', 
        icon: ScanLine,
        color: 'text-green-600'
      },
      { 
        href: '/admin/transactions', 
        label: 'All Transactions', 
        icon: History,
        color: 'text-purple-600'
      },
      { 
        href: '/admin/users', 
        label: 'User Manage', 
        icon: Users,
        color: 'text-blue-600'
      },
      { 
        href: '/dashboard', 
        label: 'Reports', 
        icon: BarChart3,
        color: 'text-orange-600'
      }
    ]

    // For customers, return customer links only
    if (user.role === 'customer') {
      return customerLinks
    }

    // For admin/staff users, return appropriate links based on current mode
    if (isAdminMode) {
      // In admin mode, show admin links + switcher to user mode
      return [
        ...adminLinks,
        {
          href: '#',
          label: 'Switch to User',
          icon: User,
          color: 'text-blue-600',
          isRoleSwitch: true
        }
      ]
    } else {
      // In user mode, show customer links + switcher to admin mode
      return [
        ...customerLinks,
        {
          href: '#',
          label: 'Switch to Admin',
          icon: ShieldCheck,
          color: 'text-purple-600',
          isRoleSwitch: true
        }
      ]
    }
  }

  // Handle role switching
  const handleRoleSwitch = () => {
    if (isAdminMode) {
      // Switch to user mode
      router.push('/app')
    } else {
      // Switch to admin mode
      router.push('/dashboard')
    }
  }

  const footerLinks = getFooterLinks()

  console.log('🔧 FooterNav: Rendering with:', { 
    user: user ? { id: user.id, role: user.role } : 'null',
    footerLinks: footerLinks.length,
    isAdminMode,
    pathname 
  })

  const getGridClass = (linkCount: number) => {
    switch (linkCount) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      case 5: return 'grid-cols-5'
      default: return 'grid-cols-5'
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* Main Footer Navigation */}
      <div className={`grid ${getGridClass(footerLinks.length)} max-w-full mx-auto`}>
        {footerLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          const isRoleSwitch = 'isRoleSwitch' in link && link.isRoleSwitch
          
          if (isRoleSwitch) {
            return (
              <button
                key="role-switch"
                onClick={handleRoleSwitch}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 transition-colors",
                  "hover:bg-gray-50 text-gray-500"
                )}
              >
                <Icon 
                  className={cn(
                    "w-6 h-6 mb-1",
                    link.color
                  )}
                />
                <span 
                  className={cn(
                    "text-xs font-medium",
                    "text-gray-500"
                  )}
                >
                  {link.label}
                </span>
              </button>
            )
          }
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 transition-colors",
                isActive
                  ? "bg-gray-50"
                  : "hover:bg-gray-50"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 mb-1",
                  isActive 
                    ? link.color 
                    : "text-gray-400"
                )}
              />
              <span 
                className={cn(
                  "text-xs font-medium",
                  isActive 
                    ? "text-gray-900" 
                    : "text-gray-500"
                )}
              >
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
