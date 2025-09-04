'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  History, 
  ArrowUpCircle, 
  ArrowDownCircle,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Loader2,
  Building,
  CreditCard,
  Download,
  ChevronDown
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'purchase' | 'usage' | 'refund' | 'adjustment'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  created_at: string
  venue?: {
    id: string
    name: string
    type: string
  }
  membership: {
    id: string
    company: {
      name: string
      description: string
    }
  }
  processed_by?: {
    name: string
    role: string
  }
}

const transactionTypeConfig = {
  purchase: {
    icon: ArrowUpCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Purchase',
    prefix: '+'
  },
  usage: {
    icon: ArrowDownCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Usage',
    prefix: '-'
  },
  refund: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Refund',
    prefix: '+'
  },
  adjustment: {
    icon: RefreshCw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Adjustment',
    prefix: '±'
  }
}

const statusConfig = {
  completed: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Completed' },
  pending: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Pending' },
  cancelled: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Cancelled' },
  refunded: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Refunded' }
}

export default function TransactionsPage() {
  const router = useRouter()
  const [, setUser] = useState<AuthUser | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      // Load transaction data from API
      try {
        const response = await fetch('/api/transactions/history')
        const data = await response.json()
        
        if (response.ok) {
          // Transform API data to match component interface
          const apiTransactions: Transaction[] = data.transactions.map((t: {
            id: string
            type: 'usage' | 'topup'
            amount: number
            description: string
            status: string
            created_at: string
            venue_name?: string
            venue_id?: string
            staff_name?: string
          }) => ({
            id: t.id,
            type: t.type,
            amount: t.type === 'usage' ? -t.amount : t.amount, // Negative for usage
            description: t.description,
            status: t.status,
            created_at: t.created_at,
            venue: t.venue_name ? {
              id: t.venue_id || '',
              name: t.venue_name,
              type: 'ktv' // Default type, in real app this would come from venue data
            } : undefined,
            membership: {
              id: 'sgv-membership',
              company: {
                name: 'SGV',
                description: 'SGV Entertainment Group'
              }
            },
            processed_by: t.staff_name ? {
              name: t.staff_name,
              role: 'Staff'
            } : undefined
          }))
          
          setTransactions(apiTransactions)
          setFilteredTransactions(apiTransactions)
        } else {
          // Fallback to mock data if API fails
          const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'usage',
          amount: -25.50,
          description: 'KTV Room rental - 2 hours',
          status: 'completed',
          created_at: '2024-01-20T15:30:00Z',
          venue: {
            id: '1',
            name: 'KTV Palace Downtown',
            type: 'ktv'
          },
          membership: {
            id: '1',
            company: {
              name: 'Entertainment Plus',
              description: 'Premium KTV and dining experiences'
            }
          },
          processed_by: {
            name: 'Sarah Johnson',
            role: 'Staff'
          }
        },
        {
          id: '2',
          type: 'purchase',
          amount: 100.00,
          description: 'Membership credit purchase',
          status: 'completed',
          created_at: '2024-01-18T12:15:00Z',
          membership: {
            id: '1',
            company: {
              name: 'Entertainment Plus',
              description: 'Premium KTV and dining experiences'
            }
          }
        },
        {
          id: '3',
          type: 'usage',
          amount: -15.00,
          description: 'Basketball court rental - 1 hour',
          status: 'completed',
          created_at: '2024-01-17T18:45:00Z',
          venue: {
            id: '5',
            name: 'Court A Basketball',
            type: 'basketball_court'
          },
          membership: {
            id: '2',
            company: {
              name: 'Sports Arena',
              description: 'Basketball and badminton courts'
            }
          },
          processed_by: {
            name: 'Mike Chen',
            role: 'Staff'
          }
        },
        {
          id: '4',
          type: 'purchase',
          amount: 50.00,
          description: 'Membership credit purchase',
          status: 'completed',
          created_at: '2024-01-15T10:20:00Z',
          membership: {
            id: '2',
            company: {
              name: 'Sports Arena',
              description: 'Basketball and badminton courts'
            }
          }
        },
        {
          id: '5',
          type: 'usage',
          amount: -32.75,
          description: 'Dinner for 2 people',
          status: 'completed',
          created_at: '2024-01-14T19:30:00Z',
          venue: {
            id: '3',
            name: 'Golden Dragon Restaurant',
            type: 'restaurant'
          },
          membership: {
            id: '1',
            company: {
              name: 'Entertainment Plus',
              description: 'Premium KTV and dining experiences'
            }
          },
          processed_by: {
            name: 'Lisa Wang',
            role: 'Staff'
          }
        },
        {
          id: '6',
          type: 'refund',
          amount: 15.00,
          description: 'Cancelled reservation refund',
          status: 'completed',
          created_at: '2024-01-12T14:00:00Z',
          venue: {
            id: '1',
            name: 'KTV Palace Downtown',
            type: 'ktv'
          },
          membership: {
            id: '1',
            company: {
              name: 'Entertainment Plus',
              description: 'Premium KTV and dining experiences'
            }
          },
          processed_by: {
            name: 'Sarah Johnson',
            role: 'Manager'
          }
        },
        {
          id: '7',
          type: 'purchase',
          amount: 200.00,
          description: 'Initial membership purchase',
          status: 'completed',
          created_at: '2024-01-10T09:15:00Z',
          membership: {
            id: '1',
            company: {
              name: 'Entertainment Plus',
              description: 'Premium KTV and dining experiences'
            }
          }
        }
          ]
          
          setTransactions(mockTransactions)
          setFilteredTransactions(mockTransactions)
        }
      } catch (error) {
        console.error('Failed to load transactions:', error)
        // Set empty array on error
        setTransactions([])
        setFilteredTransactions([])
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  useEffect(() => {
    let filtered = transactions

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.membership.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.venue?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType)
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus)
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
        case '3months':
          filterDate.setMonth(now.getMonth() - 3)
          break
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(transaction => 
          new Date(transaction.created_at) >= filterDate
        )
      }
    }

    setFilteredTransactions(filtered)
  }, [searchQuery, selectedType, selectedStatus, dateRange, transactions])

  // Calculate summary stats
  const totalSpent = transactions
    .filter(t => t.type === 'usage' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  const totalAdded = transactions
    .filter(t => (t.type === 'purchase' || t.type === 'refund') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at)
    const now = new Date()
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear()
  }).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Transaction History
              </h1>
              <p className="mt-2 text-gray-600">
                Track your spending and purchases across all memberships
              </p>
            </div>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpent)}</p>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Added</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAdded)}</p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{thisMonthTransactions}</p>
                <p className="text-xs text-gray-500">transactions</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
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
                placeholder="Search transactions..."
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="usage">Usage</option>
                    <option value="refund">Refund</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

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
                    <option value="3months">Last 3 months</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const TypeIcon = transactionTypeConfig[transaction.type].icon
            
            return (
              <div
                key={transaction.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transactionTypeConfig[transaction.type].bgColor}`}>
                        <TypeIcon className={`w-6 h-6 ${transactionTypeConfig[transaction.type].color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {transaction.description}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[transaction.status].bgColor} ${statusConfig[transaction.status].color}`}>
                            {statusConfig[transaction.status].label}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 mr-2" />
                            <span>{transaction.membership.company.name}</span>
                          </div>
                          
                          {transaction.venue && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="w-4 h-4 mr-2" />
                              <span>{transaction.venue.name}</span>
                            </div>
                          )}
                          
                          {transaction.processed_by && (
                            <div className="text-sm text-gray-500">
                              Processed by {transaction.processed_by.name} ({transaction.processed_by.role})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transactionTypeConfig[transaction.type].prefix}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Your transaction history will appear here once you start using your memberships'
              }
            </p>
          </div>
        )}

        {/* Load More Button (for pagination in real app) */}
        {filteredTransactions.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Load More Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
