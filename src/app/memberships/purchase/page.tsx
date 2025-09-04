'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CreditCard, 
  Check,
  ArrowLeft,
  Loader2,
  Star,
  MapPin,
  Clock,
  Shield
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface MembershipDetails {
  id: string
  name: string
  description: string
  price: number
  benefits: string[]
  duration_months?: number
  company: {
    id: string
    name: string
    description: string
    category: string
    location: string
    rating: number
  }
}

// Mock data - in real app this would come from API
const mockMemberships: Record<string, MembershipDetails> = {
  'sgv-basic': {
    id: 'sgv-basic',
    name: 'SGV Basic',
    description: 'Access to all SGV venues with basic perks',
    price: 99.00,
    benefits: [
      '10% discount at all SGV venues',
      'Priority reservations at ET, Gfunk, Party K',
      'Special rates at Long Feng Hotpot',
      'Member-only events and promotions',
      'Birthday month special offers',
      'Access to Playbase gaming lounge',
      'Discounts at both Zui Beer locations'
    ],
    duration_months: 12,
    company: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'SGV',
      description: 'SGV Entertainment Group - Premium hospitality and entertainment venues',
      category: 'Entertainment',
      location: 'Toronto, ON',
      rating: 4.9
    }
  },
  'sgv-premium': {
    id: 'sgv-premium',
    name: 'SGV VIP',
    description: 'Premium access with exclusive benefits across all SGV venues',
    price: 199.00,
    benefits: [
      '20% discount at all SGV venues',
      'VIP room access at ET, Gfunk, and Party K',
      'Complimentary drinks at Zui Beer locations',
      'Personal concierge service',
      'Priority booking during peak hours',
      'Exclusive access to SOS and Wave events',
      'Free appetizers at Long Feng Hotpot',
      'Guest pass privileges (2 per month)',
      'Birthday celebration packages',
      'Access to private member events'
    ],
    duration_months: 12,
    company: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'SGV',
      description: 'SGV Entertainment Group - Premium hospitality and entertainment venues',
      category: 'Entertainment',
      location: 'Toronto, ON',
      rating: 4.9
    }
  }
}

function PurchaseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [membership, setMembership] = useState<MembershipDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'wallet'>('credit')

  const membershipId = searchParams.get('membership')
      // const companyId = searchParams.get('company') // For future use

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)

      if (membershipId && mockMemberships[membershipId]) {
        setMembership(mockMemberships[membershipId])
      }
      
      setLoading(false)
    }

    loadData()
  }, [router, membershipId])

  const handlePurchase = async () => {
    if (!membership || !user) return

    setPurchasing(true)
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real app, this would make API call to process payment
    alert(`Successfully purchased ${membership.name} for ${formatCurrency(membership.price)}!`)
    
    setPurchasing(false)
    router.push('/app')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Membership not found</p>
          <Link
            href="/memberships"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to memberships
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/memberships"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to memberships
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {membership.company.name.charAt(0)}
                </span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{membership.company.name}</h1>
                <div className="flex items-center text-blue-100 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {membership.company.location}
                  <Star className="w-4 h-4 ml-3 mr-1 fill-current text-yellow-400" />
                  {membership.company.rating}
                </div>
              </div>
            </div>
            <p className="text-blue-100">{membership.company.description}</p>
          </div>

          {/* Membership Details */}
          <div className="p-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{membership.name}</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(membership.price)}
                  </div>
                  {membership.duration_months && (
                    <div className="text-sm text-gray-600 flex items-center justify-end mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {membership.duration_months} months
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-600">{membership.description}</p>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s included:</h3>
              <ul className="space-y-3">
                {membership.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="credit"
                    checked={paymentMethod === 'credit'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'credit')}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Pay with your card</div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'wallet')}
                    className="mr-3"
                  />
                  <div className="w-5 h-5 bg-blue-600 rounded mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">UnionPasscard Wallet</div>
                    <div className="text-sm text-gray-600">Pay from your wallet balance</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Secure Payment</p>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure. You can cancel your membership at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Purchase - {formatCurrency(membership.price)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PurchasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <PurchaseContent />
    </Suspense>
  )
}