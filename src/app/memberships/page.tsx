'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building, 
  MapPin,
  Star,
  Loader2,
  Plus
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  description: string
  logo_url?: string
  category: string
  location: string
  rating: number
  membership_types: MembershipType[]
}

interface MembershipType {
  id: string
  name: string
  description: string
  price: number
  benefits: string[]
  duration_months?: number
}

const mockCompanies: Company[] = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'SGV',
    description: 'SGV Entertainment Group - Premium hospitality and entertainment venues',
    category: 'Entertainment',
    location: 'Toronto, ON',
    rating: 4.9,
    membership_types: [
      {
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
        duration_months: 12
      },
      {
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
        duration_months: 12
      }
    ]
  }
]

export default function MembershipsPage() {
  const router = useRouter()
  const [, setUser] = useState<AuthUser | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      setCompanies(mockCompanies)
      setLoading(false)
    }

    loadData()
  }, [router])

  const categories = ['all', ...Array.from(new Set(companies.map(c => c.category)))]
  const filteredCompanies = selectedCategory === 'all' 
    ? companies 
    : companies.filter(c => c.category === selectedCategory)

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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Available Memberships
          </h1>
          <p className="mt-2 text-gray-600">
            Discover and join memberships across various venues and services
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Company Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {company.location}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{company.description}</p>
                
                {/* SGV Venues */}
                {company.id === '33333333-3333-3333-3333-333333333333' && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center text-sm">
                      <Building className="w-4 h-4 mr-2" />
                      Available Venues (9 locations)
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="space-y-1">
                        <span className="text-purple-600 font-medium">KTV:</span>
                        <div className="text-gray-600 space-y-0.5">
                          <div>• ET</div>
                          <div>• Gfunk</div>
                          <div>• Party K</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-orange-600 font-medium">Dining:</span>
                        <div className="text-gray-600 space-y-0.5">
                          <div>• Long Feng Hotpot</div>
                          <div>• Zui Beer (K town)</div>
                          <div>• Zui Beer (North York)</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-blue-600 font-medium">Entertainment:</span>
                        <div className="text-gray-600 space-y-0.5">
                          <div>• Playbase</div>
                          <div>• SOS</div>
                          <div>• Wave</div>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href="/venues" 
                      className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      View all venues & locations →
                    </Link>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {company.category}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-gray-700">{company.rating}</span>
                  </div>
                </div>
              </div>

              {/* Membership Types */}
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {company.membership_types.map((membership) => (
                    <div
                      key={membership.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{membership.name}</h4>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(membership.price)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{membership.description}</p>
                      
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Benefits:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {membership.benefits.slice(0, 2).map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                              {benefit}
                            </li>
                          ))}
                          {membership.benefits.length > 2 && (
                            <li className="text-blue-600">
                              +{membership.benefits.length - 2} more benefits
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {membership.duration_months ? `${membership.duration_months} months` : 'Flexible duration'}
                        </span>
                        <Link
                          href={`/memberships/purchase?company=${company.id}&membership=${membership.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Join
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No memberships found in this category</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all memberships →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}