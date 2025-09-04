'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QrCode, 
  Users, 
  TrendingUp,
  Clock,
  Building,
  CreditCard,
  ArrowRight,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react'
import { getCurrentUser, type AuthUser, hasRole } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface StaffStats {
  today_transactions: number
  today_revenue: number
  this_week_transactions: number
  this_week_revenue: number
  active_customers: number
  avg_transaction: number
}

interface RecentTransaction {
  id: string
  customer_name: string
  amount: number
  description: string
  created_at: string
  membership_company: string
}

export default function StaffPortalPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [stats, setStats] = useState<StaffStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Check if user has staff privileges
      if (!hasRole(currentUser.role, 'staff')) {
        router.push('/reports')
        return
      }
      
      setUser(currentUser)
      
      // Mock staff statistics
      const mockStats: StaffStats = {
        today_transactions: 12,
        today_revenue: 340.50,
        this_week_transactions: 89,
        this_week_revenue: 2150.75,
        active_customers: 45,
        avg_transaction: 28.50
      }
      
      // Mock recent transactions
      const mockTransactions: RecentTransaction[] = [
        {
          id: '1',
          customer_name: 'John Smith',
          amount: 25.50,
          description: 'KTV Room rental - 2 hours',
          created_at: '2024-01-20T15:30:00Z',
          membership_company: 'Entertainment Plus'
        },
        {
          id: '2',
          customer_name: 'Sarah Johnson',
          amount: 15.00,
          description: 'Basketball court rental',
          created_at: '2024-01-20T14:15:00Z',
          membership_company: 'Sports Arena'
        },
        {
          id: '3',
          customer_name: 'Mike Chen',
          amount: 32.75,
          description: 'Dinner for 2',
          created_at: '2024-01-20T13:45:00Z',
          membership_company: 'Entertainment Plus'
        },
        {
          id: '4',
          customer_name: 'Lisa Wang',
          amount: 18.00,
          description: 'Badminton court rental',
          created_at: '2024-01-20T12:20:00Z',
          membership_company: 'Sports Arena'
        },
        {
          id: '5',
          customer_name: 'David Kim',
          amount: 45.25,
          description: 'Private KTV room + snacks',
          created_at: '2024-01-20T11:00:00Z',
          membership_company: 'Entertainment Plus'
        }
      ]
      
      setStats(mockStats)
      setRecentTransactions(mockTransactions)
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Staff Portal
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user.full_name || user.email || user.phone}! Here&apos;s your venue overview.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          <Link
            href="/staff/scan"
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
          >
            <QrCode className="w-8 h-8 mx-auto mb-3" />
            <span className="text-lg font-semibold block">Scan QR</span>
            <span className="text-blue-100 text-sm">Process Payment</span>
          </Link>
          
          <Link
            href="/staff/customers"
            className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <span className="text-lg font-semibold text-gray-900 block">Customers</span>
            <span className="text-gray-600 text-sm">Manage Members</span>
          </Link>
          
          <Link
            href="/staff/transactions"
            className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-md transition-shadow"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <span className="text-lg font-semibold text-gray-900 block">Transactions</span>
            <span className="text-gray-600 text-sm">View History</span>
          </Link>
          
          <Link
            href="/staff/reports"
            className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <span className="text-lg font-semibold text-gray-900 block">Reports</span>
            <span className="text-gray-600 text-sm">Analytics</span>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.today_revenue)}
                </p>
                <p className="text-sm text-gray-500">{stats.today_transactions} transactions</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.this_week_revenue)}
                </p>
                <p className="text-sm text-gray-500">{stats.this_week_transactions} transactions</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active_customers}</p>
                <p className="text-sm text-gray-500">this month</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.avg_transaction)}
                </p>
                <p className="text-sm text-gray-500">per customer</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                  <Link
                    href="/staff/transactions"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {transaction.customer_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customer_name}</p>
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.membership_company}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.created_at).split(',')[1]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Today&apos;s Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-800">Transactions:</span>
                  <span className="font-semibold text-blue-900">{stats.today_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Revenue:</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(stats.today_revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Avg per transaction:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(stats.today_revenue / stats.today_transactions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/staff/scan"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Scan Customer QR</span>
                </Link>
                
                <Link
                  href="/staff/manual-entry"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Manual Entry
                </Link>
                
                <Link
                  href="/staff/refund"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Process Refund
                </Link>
              </div>
            </div>

            {/* Shift Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Started: 9:00 AM</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  <span>KTV Palace Downtown</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Staff ID: ST001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
