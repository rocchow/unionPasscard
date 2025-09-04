'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Search,
  Filter,

  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { getCurrentUser, type AuthUser, hasRole } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface StaffTransaction {
  id: string
  customer: {
    name: string
    email?: string
    phone?: string
    membership_company: string
  }
  amount: number
  description: string
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  created_at: string
  processed_by: {
    id: string
    name: string
  }
  venue: {
    name: string
    type: string
  }
  payment_method: 'membership' | 'cash' | 'card'
  transaction_type: 'sale' | 'refund' | 'adjustment'
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-700', bgColor: 'bg-green-100', label: 'Completed' },
  pending: { icon: Clock, color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-red-700', bgColor: 'bg-red-100', label: 'Cancelled' },
  refunded: { icon: RefreshCw, color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Refunded' }
}

export default function StaffTransactionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [transactions, setTransactions] = useState<StaffTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<StaffTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('today')
  const [showFilters, setShowFilters] = useState(false)

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
      
      // Mock staff transaction data
      const mockTransactions: StaffTransaction[] = [
        {
          id: 'txn_001',
          customer: {
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            membership_company: 'Entertainment Plus'
          },
          amount: 45.50,
          description: 'KTV Room 5 - 3 hours + snacks',
          status: 'completed',
          created_at: '2024-01-20T15:30:00Z',
          processed_by: {
            id: currentUser.id,
            name: currentUser.full_name || 'Staff Member'
          },
          venue: {
            name: 'KTV Palace Downtown',
            type: 'KTV'
          },
          payment_method: 'membership',
          transaction_type: 'sale'
        },
        {
          id: 'txn_002',
          customer: {
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            membership_company: 'Sports Arena'
          },
          amount: 20.00,
          description: 'Basketball court rental - 2 hours',
          status: 'completed',
          created_at: '2024-01-20T14:15:00Z',
          processed_by: {
            id: 'staff_002',
            name: 'Mike Chen'
          },
          venue: {
            name: 'Court A Basketball',
            type: 'Basketball Court'
          },
          payment_method: 'membership',
          transaction_type: 'sale'
        },
        {
          id: 'txn_003',
          customer: {
            name: 'David Kim',
            phone: '+1 (555) 987-6543',
            membership_company: 'Entertainment Plus'
          },
          amount: -15.00,
          description: 'Refund - Cancelled reservation',
          status: 'refunded',
          created_at: '2024-01-20T13:45:00Z',
          processed_by: {
            id: currentUser.id,
            name: currentUser.full_name || 'Staff Member'
          },
          venue: {
            name: 'KTV Palace Downtown',
            type: 'KTV'
          },
          payment_method: 'membership',
          transaction_type: 'refund'
        },
        {
          id: 'txn_004',
          customer: {
            name: 'Lisa Wang',
            email: 'lisa.wang@example.com',
            membership_company: 'Sports Arena'
          },
          amount: 35.75,
          description: 'Badminton court + equipment rental',
          status: 'pending',
          created_at: '2024-01-20T12:20:00Z',
          processed_by: {
            id: 'staff_003',
            name: 'Anna Lee'
          },
          venue: {
            name: 'Badminton Central',
            type: 'Badminton Court'
          },
          payment_method: 'membership',
          transaction_type: 'sale'
        },
        {
          id: 'txn_005',
          customer: {
            name: 'Robert Chen',
            email: 'robert.c@example.com',
            membership_company: 'Entertainment Plus'
          },
          amount: 28.25,
          description: 'Private dining room - 2 hours',
          status: 'completed',
          created_at: '2024-01-20T11:30:00Z',
          processed_by: {
            id: currentUser.id,
            name: currentUser.full_name || 'Staff Member'
          },
          venue: {
            name: 'Golden Dragon Restaurant',
            type: 'Restaurant'
          },
          payment_method: 'membership',
          transaction_type: 'sale'
        }
      ]
      
      setTransactions(mockTransactions)
      setFilteredTransactions(mockTransactions)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    let filtered = transactions

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customer.phone?.includes(searchQuery)
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus)
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.transaction_type === selectedType)
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(transaction => 
          new Date(transaction.created_at) >= filterDate
        )
      }
    }

    setFilteredTransactions(filtered)
  }, [searchQuery, selectedStatus, selectedType, dateRange, transactions])

  // Calculate summary stats
  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at)
    const today = new Date()
    return transactionDate.toDateString() === today.toDateString()
  })

  const todayRevenue = todayTransactions
    .filter(t => t.status === 'completed' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const myTransactions = transactions.filter(t => t.processed_by.id === user?.id)
  const myRevenue = myTransactions
    .filter(t => t.status === 'completed' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/staff"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff Portal
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Transaction History
              </h1>
              <p className="mt-2 text-gray-600">
                View and manage venue transactions
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <Link
                href="/staff/scan"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>New Transaction</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(todayRevenue)}</p>
                <p className="text-sm text-gray-500">{todayTransactions.length} transactions</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">My Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{myTransactions.length}</p>
                <p className="text-sm text-gray-500">{formatCurrency(myRevenue)} total</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredTransactions.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-500">of {filteredTransactions.length} total</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    filteredTransactions.filter(t => t.amount > 0).length > 0 
                      ? filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.filter(t => t.amount > 0).length
                      : 0
                  )}
                </p>
                <p className="text-sm text-gray-500">per customer</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, transaction ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border border-gray-300 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="sale">Sale</option>
                    <option value="refund">Refund</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">Last month</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedStatus('all')
                      setSelectedType('all')
                      setDateRange('today')
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => {
                  const StatusIcon = statusConfig[transaction.status].icon
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">#{transaction.id}</p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.venue.name}</p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.customer.name}</p>
                          {transaction.customer.email && (
                            <p className="text-sm text-gray-600">{transaction.customer.email}</p>
                          )}
                          {transaction.customer.phone && (
                            <p className="text-sm text-gray-600">{transaction.customer.phone}</p>
                          )}
                          <p className="text-xs text-gray-500">{transaction.customer.membership_company}</p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`text-lg font-semibold ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[transaction.status].bgColor} ${statusConfig[transaction.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[transaction.status].label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{transaction.processed_by.name}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-700 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== 'all' || selectedType !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Transactions will appear here as they are processed'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredTransactions.length}</span> transactions
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
