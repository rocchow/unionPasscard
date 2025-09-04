'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QrCode, 
  Plus, 
  History, 
  Wallet,
  Loader2
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Membership {
  id: string
  company: {
    id: string
    name: string
    description: string
  }
  balance: number
  status: 'active' | 'inactive' | 'suspended'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Check if user has admin privileges
      if (currentUser.role === 'customer') {
        router.push('/app')
        return
      }
      
      setUser(currentUser)
      setLoading(false)
    }

    loadUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Mock admin stats
  const adminStats = {
    totalUsers: 1247,
    activeVenues: 9,
    todayTransactions: 156,
    monthlyRevenue: 45670.50
  }


  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.full_name || 'Admin'} • Role: {user?.role?.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Venues</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.activeVenues}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.todayTransactions}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(adminStats.monthlyRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No recent transactions</p>
            <Link
              href="/staff/transactions"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all transactions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
