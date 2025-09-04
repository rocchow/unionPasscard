'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  TrendingUp,
  CreditCard,
  ArrowRight,
  Loader2,
  DollarSign,
  Activity
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface ComprehensiveStats {
  // Daily stats
  today_transactions: number
  today_revenue: number
  
  // Weekly stats  
  this_week_transactions: number
  this_week_revenue: number
  
  // Overall stats
  total_users: number
  active_venues: number
  active_customers: number
  monthly_revenue: number
  
  // Calculated metrics
  avg_transaction: number
  growth_rate: number
}

interface RecentTransaction {
  id: string
  customer_name: string
  amount: number
  description: string
  created_at: string
  membership_company: string
  venue_name?: string
  status: 'completed' | 'pending' | 'refunded'
}

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [stats, setStats] = useState<ComprehensiveStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Check if user has staff+ privileges
      if (currentUser.role === 'customer') {
        router.push('/myPasses')
        return
      }
      
      setUser(currentUser)
      
      // Comprehensive mock data combining staff and admin stats
      setStats({
        // Daily
        today_transactions: 42,
        today_revenue: 1247.50,
        
        // Weekly
        this_week_transactions: 287,
        this_week_revenue: 8934.25,
        
        // Overall
        total_users: 1247,
        active_venues: 9,
        active_customers: 892,
        monthly_revenue: 45670.50,
        
        // Metrics
        avg_transaction: 31.25,
        growth_rate: 12.5
      })
      
      // Enhanced transaction data
      setRecentTransactions([
        {
          id: 'TXN-001',
          customer_name: 'John Smith',
          amount: 25.50,
          description: 'Drinks at Blue Moon Bar',
          created_at: '2024-01-15T14:30:00Z',
          membership_company: 'SGV Entertainment',
          venue_name: 'Blue Moon Bar',
          status: 'completed'
        },
        {
          id: 'TXN-002',
          customer_name: 'Sarah Johnson',
          amount: 45.00,
          description: 'Dinner at Sunset Lounge',
          created_at: '2024-01-15T13:15:00Z',
          membership_company: 'SGV Entertainment',
          venue_name: 'Sunset Lounge',
          status: 'completed'
        },
        {
          id: 'TXN-003',
          customer_name: 'Mike Davis',
          amount: 18.75,
          description: 'Coffee and pastries',
          created_at: '2024-01-15T12:45:00Z',
          membership_company: 'SGV Entertainment',
          venue_name: 'Morning Brew',
          status: 'pending'
        },
        {
          id: 'TXN-004',
          customer_name: 'Emily Wilson',
          amount: -12.50,
          description: 'Refund for cancelled order',
          created_at: '2024-01-15T11:30:00Z',
          membership_company: 'SGV Entertainment',
          venue_name: 'Blue Moon Bar',
          status: 'refunded'
        }
      ])
      
      setLoading(false)
    }

    loadData()
  }, [router])

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.full_name || 'Admin'} • Role: {user?.role?.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.today_revenue || 0)}</p>
                <p className="text-xs text-green-600 mt-1">↗ +{stats?.growth_rate}% vs yesterday</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Today's Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.today_transactions || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Avg: {formatCurrency(stats?.avg_transaction || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_users?.toLocaleString() || 0}</p>
                <p className="text-xs text-purple-600 mt-1">{stats?.active_customers} active</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.monthly_revenue || 0)}</p>
                <p className="text-xs text-orange-600 mt-1">{stats?.active_venues} venues</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats?.this_week_transactions || 0}
              </div>
              <div className="text-sm text-gray-600">Transactions This Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(stats?.this_week_revenue || 0)}
              </div>
              <div className="text-sm text-gray-600">Revenue This Week</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link
              href="/admin/transactions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.customer_name}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.venue_name} • {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {recentTransactions.length === 0 && (
            <div className="px-6 py-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}