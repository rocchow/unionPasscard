'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  ArrowUp, 
  User,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Crown,
  Settings,
  Users
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'

export default function UpgradeUserPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('super_admin')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      setLoading(false)
    }

    loadData()
  }, [router])

  const upgradeUser = async () => {
    setUpgrading(true)
    setError('')
    setMessage('')

    try {
      console.log('🔧 Starting upgrade request...')
      console.log('🔧 User:', user)
      console.log('🔧 Selected role:', selectedRole)

      const response = await fetch('/api/admin/upgrade-current-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          role: selectedRole
        })
      })

      console.log('🔧 Response status:', response.status)
      const data = await response.json()
      console.log('🔧 Response data:', data)

      if (response.ok) {
        // Set localStorage override for demo
        if (data.demo_instructions) {
          localStorage.setItem(`role_override_${data.demo_instructions.userId}`, data.demo_instructions.newRole)
          localStorage.setItem('demo_user_id', data.demo_instructions.userId)
          console.log('🔧 Set localStorage override:', data.demo_instructions)
        }
        setMessage('✅ Account upgraded successfully! Refreshing page...')
        
        // Refresh page after 2 seconds to show new role
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        console.error('🔧 Upgrade failed:', data)
        setError(`${data.error || 'Failed to upgrade account'} (Status: ${response.status})`)
      }
    } catch (err) {
      console.error('🔧 Network error:', err)
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUpgrading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-5 h-5" />
      case 'company_admin': return <Settings className="w-5 h-5" />
      case 'staff': return <Users className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'company_admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'customer': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Full system access, can manage everything'
      case 'company_admin': return 'Manage company venues and staff'
      case 'staff': return 'Access to staff portal and QR scanning'
      case 'customer': return 'Basic customer access'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Upgrade Your Account
            </h1>
            <p className="mt-2 text-gray-600">
              Change your account role to access additional features
            </p>
          </div>

          {/* Current User Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Current Account
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {user?.full_name || user?.email || user?.phone}
                </h3>
                <p className="text-sm text-gray-600">
                  {user?.phone && `Phone: ${user.phone}`}
                  {user?.email && user?.phone && ' • '}
                  {user?.email && `Email: ${user.email}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {user?.id}
                </p>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user?.role || 'customer')}`}>
                {getRoleIcon(user?.role || 'customer')}
                <span className="ml-2">{user?.role?.replace('_', ' ') || 'customer'}</span>
              </div>
            </div>
          </div>

          {/* Upgrade Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Select New Role
            </h2>
            
            <div className="space-y-3">
              {['staff', 'company_admin', 'super_admin'].map((role) => (
                <label key={role} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getRoleIcon(role)}
                        <span className="ml-2 font-medium text-gray-900">
                          {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                        {role}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {message && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700 font-medium">{message}</p>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Next Steps:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Sign out of your account completely</li>
                    <li>Clear your browser cache/cookies</li>
                    <li>Sign back in with the same phone number</li>
                    <li>You&apos;ll now have {selectedRole.replace('_', ' ')} access!</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={upgradeUser}
                disabled={upgrading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Upgrading...</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-5 h-5" />
                    <span>Upgrade to {selectedRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">ℹ️ What happens after upgrade:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li><strong>Staff:</strong> Access to Staff Portal and QR code scanning</li>
              <li><strong>Company Admin:</strong> Manage venues, staff, and view all transactions</li>
              <li><strong>Super Admin:</strong> Full system access including user management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
