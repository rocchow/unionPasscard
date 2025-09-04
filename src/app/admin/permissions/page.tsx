'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Building, 
  MapPin, 
  Plus, 
  X, 
  Shield,
  Edit,
  Trash2
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { hasRole } from '@/lib/security'
import { 
  getUserPermissions, 
  assignUserToCompany, 
  assignUserToVenue,
  removeUserFromCompany,
  removeUserFromVenue,
  type UserPermissions 
} from '@/lib/access-control'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface User {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  role: string
  company_id: string | null
  venue_id: string | null
}

interface Company {
  id: string
  name: string
}

interface Venue {
  id: string
  name: string
  company_id: string
  companies: { name: string }
}

export default function PermissionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignType, setAssignType] = useState<'company' | 'venue'>('company')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      if (!hasRole(currentUser, ['super_admin'])) {
        router.push('/myPasses')
        return
      }

      setUser(currentUser)
      await Promise.all([
        loadUsers(),
        loadCompanies(),
        loadVenues()
      ])
    }

    loadData()
  }, [router])

  const loadUsers = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name')

    if (error) {
      console.error('Error loading users:', error)
    } else {
      setUsers(data || [])
    }
  }

  const loadCompanies = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('Error loading companies:', error)
    } else {
      setCompanies(data || [])
    }
  }

  const loadVenues = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('venues')
      .select(`
        id,
        name,
        company_id,
        companies!inner(name)
      `)
      .order('name')

    if (error) {
      console.error('Error loading venues:', error)
    } else {
      setVenues(data || [])
    }
  }

  const loadUserPermissions = async (userId: string) => {
    const permissions = await getUserPermissions(userId)
    setUserPermissions(permissions)
  }

  const handleUserSelect = async (selectedUser: User) => {
    setSelectedUser(selectedUser)
    await loadUserPermissions(selectedUser.id)
  }

  const handleAssignToCompany = async (companyId: string, role: 'admin' | 'manager') => {
    if (!selectedUser) return

    const success = await assignUserToCompany(selectedUser.id, companyId, role)
    if (success) {
      await loadUserPermissions(selectedUser.id)
      setShowAssignModal(false)
    }
  }

  const handleAssignToVenue = async (venueId: string, role: 'staff' | 'manager') => {
    if (!selectedUser) return

    const success = await assignUserToVenue(selectedUser.id, venueId, role)
    if (success) {
      await loadUserPermissions(selectedUser.id)
      setShowAssignModal(false)
    }
  }

  const handleRemoveFromCompany = async (companyId: string) => {
    if (!selectedUser) return

    const success = await removeUserFromCompany(selectedUser.id, companyId)
    if (success) {
      await loadUserPermissions(selectedUser.id)
    }
  }

  const handleRemoveFromVenue = async (venueId: string) => {
    if (!selectedUser) return

    const success = await removeUserFromVenue(selectedUser.id, venueId)
    if (success) {
      await loadUserPermissions(selectedUser.id)
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            User Permissions
          </h1>
          <p className="mt-2 text-gray-600">
            Manage user access to companies and venues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-gray-600 mr-2" />
                Users
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {users.map((userItem) => (
                  <button
                    key={userItem.id}
                    onClick={() => handleUserSelect(userItem)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedUser?.id === userItem.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {userItem.full_name || 'Unnamed User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {userItem.email || userItem.phone}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Role: {userItem.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Permissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedUser ? `${selectedUser.full_name || 'User'} Permissions` : 'Select a User'}
                </h2>
                {selectedUser && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Assign
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {selectedUser && userPermissions ? (
                <div className="space-y-6">
                  {/* Primary Role */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Role</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-blue-600 font-medium">{userPermissions.primary_role}</span>
                    </div>
                  </div>

                  {/* Company Associations */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      Company Access
                    </h3>
                    <div className="space-y-2">
                      {userPermissions.company_associations.map((assoc) => (
                        <div key={assoc.company_id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{assoc.company_name}</div>
                            <div className="text-sm text-green-600">Role: {assoc.role}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCompany(assoc.company_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {userPermissions.company_associations.length === 0 && (
                        <div className="text-gray-500 text-sm">No company associations</div>
                      )}
                    </div>
                  </div>

                  {/* Venue Associations */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Venue Access
                    </h3>
                    <div className="space-y-2">
                      {userPermissions.venue_associations.map((assoc) => (
                        <div key={assoc.venue_id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{assoc.venue_name}</div>
                            <div className="text-sm text-gray-600">{assoc.company_name}</div>
                            <div className="text-sm text-blue-600">Role: {assoc.role}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromVenue(assoc.venue_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {userPermissions.venue_associations.length === 0 && (
                        <div className="text-gray-500 text-sm">No venue associations</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select a user to view their permissions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assign {selectedUser.full_name || 'User'}
                  </h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setAssignType('company')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        assignType === 'company'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Company
                    </button>
                    <button
                      onClick={() => setAssignType('venue')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        assignType === 'venue'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Venue
                    </button>
                  </div>
                </div>

                {assignType === 'company' ? (
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{company.name}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAssignToCompany(company.id, 'manager')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Manager
                          </button>
                          <button
                            onClick={() => handleAssignToCompany(company.id, 'admin')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {venues.map((venue) => (
                      <div key={venue.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{venue.name}</div>
                          <div className="text-sm text-gray-600">{venue.companies.name}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAssignToVenue(venue.id, 'staff')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Staff
                          </button>
                          <button
                            onClick={() => handleAssignToVenue(venue.id, 'manager')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Manager
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
