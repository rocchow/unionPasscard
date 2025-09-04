'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { 
  QrCode, 
  Wallet, 
  RefreshCw, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency, generateQRData } from '@/lib/utils'

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

export default function QRCodePage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [selectedMembership, setSelectedMembership] = useState<string>('')
  const [qrData, setQrData] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      // Mock membership data for demo - SGV only
      const mockMemberships = [
        {
          id: 'sgv-basic-1',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'Entertainment Group'
          },
          balance: 150.00,
          status: 'active' as const
        },
        {
          id: 'sgv-premium-1',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'VIP Membership'
          },
          balance: 275.50,
          status: 'active' as const
        }
      ]
      
      setMemberships(mockMemberships)
      
      // Select first active membership by default
      const activeMembership = mockMemberships.find(m => m.status === 'active')
      if (activeMembership) {
        setSelectedMembership(activeMembership.id)
        generateQR(currentUser.id, activeMembership.id)
      }
      
      setLoading(false)
    }

    loadUserData()
  }, [router])

  const generateQR = (userId: string, membershipId: string) => {
    const data = generateQRData(userId, membershipId)
    setQrData(data)
  }

  const handleMembershipChange = (membershipId: string) => {
    setSelectedMembership(membershipId)
    if (user) {
      generateQR(user.id, membershipId)
    }
  }

  const handleRefresh = async () => {
    if (!user || !selectedMembership) return
    
    setRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    generateQR(user.id, selectedMembership)
    setRefreshing(false)
  }

  const selectedMembershipData = memberships.find(m => m.id === selectedMembership)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (memberships.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Memberships</h1>
          <p className="text-gray-600 mb-8">
            You need to purchase a membership before you can generate a QR code for payments.
          </p>
          <button
            onClick={() => router.push('/memberships/purchase')}
            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Purchase Membership
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment QR Code</h1>
          <p className="text-gray-600 mt-2">
            Show this QR code to staff for payment
          </p>
        </div>

        {/* Membership Selection */}
        {memberships.length > 1 && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Membership
            </label>
            <div className="space-y-3">
              {memberships.map((membership) => (
                <button
                  key={membership.id}
                  onClick={() => handleMembershipChange(membership.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedMembership === membership.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {membership.company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {membership.company.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(membership.balance)}
                      </p>
                      {selectedMembership === membership.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Display */}
        {selectedMembershipData && qrData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-xl inline-block mb-6">
                <QRCodeSVG
                  value={qrData}
                  size={240}
                  level="M"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>
              
              <div className="space-y-2 mb-6">
                <h3 className="font-bold text-gray-900">
                  {selectedMembershipData.company.name}
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedMembershipData.balance)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Available Balance</p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh QR Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to Use</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <span>Show this QR code to venue staff</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <span>Staff will scan and enter the amount</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <span>Confirm the transaction on their device</span>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center">
            🔒 This QR code is secure and refreshes automatically. 
            Only show it to authorized venue staff.
          </p>
        </div>
      </div>
    </div>
  )
}
