'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'

interface UserData {
  id: string
  role: 'customer' | 'staff' | 'company_admin' | 'super_admin'
  phone?: string
  email?: string
  full_name?: string
  created_at?: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Form state
  const [newUserId, setNewUserId] = useState('')
  const [newUserRole, setNewUserRole] = useState<string>('staff')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      await loadUsers()
      setLoading(false)
    }

    loadData()
  }, [router])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/set-user-role')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const createUser = async () => {
    if (!newUserId.trim()) {
      setError('Please enter a user ID')
      return
    }

    setCreating(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/set-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newUserId,
          role: newUserRole,
          phone: newUserPhone || undefined,
          email: newUserEmail || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ User ${newUserId} created with role: ${newUserRole}`)
        setNewUserId('')
        setNewUserPhone('')
        setNewUserEmail('')
        await loadUsers()
      } else {
        setError(data.error || 'Failed to create user')
      }
    } catch {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'company_admin': return 'bg-purple-100 text-purple-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              User Management
            </h1>
            <p className="mt-2 text-gray-600">
              Create and manage user accounts with different roles
            </p>
          </div>

          {/* Create User Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Create New User
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID *
                </label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="e.g., staff001, user123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="company_admin">Company Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@sgv.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {message && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700">{message}</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={createUser}
                disabled={creating || !newUserId.trim()}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Existing Users ({users.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users created yet</p>
                  <p className="text-sm">Create your first user above</p>
                </div>
              ) : (
                users.map((userData) => (
                  <div key={userData.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {userData.full_name || userData.id}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>ID: {userData.id}</span>
                            {userData.phone && (
                              <>
                                <span>•</span>
                                <span>{userData.phone}</span>
                              </>
                            )}
                            {userData.email && (
                              <>
                                <span>•</span>
                                <span>{userData.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                        {userData.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📋 How to Test Staff Account:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create a user with role &quot;staff&quot; (e.g., ID: &quot;staff001&quot;)</li>
              <li>Use the same phone number you used to register your account</li>
              <li>Login with that phone number</li>
              <li>You&apos;ll now see the Staff Portal with QR scanning capabilities</li>
              <li>Go to Staff Portal → Scan QR → Use &quot;Simulate Scan&quot; to test</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
