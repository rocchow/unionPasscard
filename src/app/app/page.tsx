'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QrCode, 
  Plus, 
  History, 
  Wallet,
  ArrowRight,
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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      // Mock membership data for demo - SGV only
      setMemberships([
        {
          id: 'sgv-basic-1',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'Entertainment Group'
          },
          balance: 150.00,
          status: 'active'
        },
        {
          id: 'sgv-premium-1',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'VIP Membership'
          },
          balance: 275.50,
          status: 'active'
        }
      ])
      
      setLoading(false)
    }

    loadUserData()
  }, [router])

  const totalBalance = memberships.reduce((sum, membership) => sum + membership.balance, 0)

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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your memberships and track your spending
          </p>
        </div>

        {/* Balance Overview */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Balance</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <Link
              href="/qr-code"
              className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-center font-medium transition-colors active:scale-95"
            >
              <QrCode className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Show QR</span>
            </Link>
            <Link
              href="/memberships/purchase"
              className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-center font-medium transition-colors active:scale-95"
            >
              <Plus className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Add Funds</span>
            </Link>
          </div>
        </div>



        {/* Memberships */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Memberships</h2>
            <Link
              href="/memberships/purchase"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              Add New
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {membership.company.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">
                        {membership.company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {membership.company.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(membership.balance)}
                    </p>
                    <p className="text-xs text-green-600 capitalize">
                      {membership.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No recent transactions</p>
            <Link
              href="/transactions"
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
