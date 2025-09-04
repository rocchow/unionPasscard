'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building, 
  Star, 
  MapPin, 
  ArrowRight,
  Loader2,
  Search
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  description: string
  category: string
  location: string
  rating: number
  venue_count: number
  membership_types: {
    id: string
    name: string
    price: number
    benefits: string[]
  }[]
  logo?: string
  featured?: boolean
}

// Mock companies data - in real app this would come from database
const mockCompanies: Company[] = [
  {
    id: 'sgv',
    name: 'SGV Entertainment Group',
    description: 'Premium hospitality and entertainment venues across Toronto',
    category: 'Entertainment',
    location: 'Toronto, ON',
    rating: 4.9,
    venue_count: 9,
    membership_types: [
      {
        id: 'sgv-basic',
        name: 'SGV Basic',
        price: 150.00,
        benefits: ['Access to all SGV venues', 'Member pricing', 'Priority booking']
      },
      {
        id: 'sgv-premium',
        name: 'SGV VIP',
        price: 275.50,
        benefits: ['All Basic benefits', 'VIP areas', 'Complimentary drinks', 'Concierge service']
      }
    ],
    featured: true
  },
  {
    id: 'goplace',
    name: 'GoPlace Network',
    description: 'Diverse entertainment and dining experiences',
    category: 'Mixed',
    location: 'GTA',
    rating: 4.7,
    venue_count: 15,
    membership_types: [
      {
        id: 'goplace-starter',
        name: 'GoPlace Starter',
        price: 99.00,
        benefits: ['Access to partner venues', '10% discount', 'Mobile app access']
      },
      {
        id: 'goplace-premium',
        name: 'GoPlace Premium',
        price: 199.00,
        benefits: ['All Starter benefits', 'Premium venues', '20% discount', 'Event invitations']
      }
    ]
  },
  {
    id: 'citypass',
    name: 'CityPass Toronto',
    description: 'Your gateway to Toronto\'s best attractions and dining',
    category: 'Tourism',
    location: 'Toronto',
    rating: 4.5,
    venue_count: 25,
    membership_types: [
      {
        id: 'citypass-explorer',
        name: 'City Explorer',
        price: 129.00,
        benefits: ['Tourist attractions', 'Restaurant discounts', 'Public transit perks']
      }
    ]
  }
]

export default function DiscoverPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'companies' | 'venues'>('companies')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      // In real app, fetch from API
      setCompanies(mockCompanies)
      setFilteredCompanies(mockCompanies)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    let filtered = companies

    if (searchQuery) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(company => 
        company.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    setFilteredCompanies(filtered)
  }, [searchQuery, selectedCategory, companies])

  const categories = ['all', ...Array.from(new Set(companies.map(c => c.category)))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover Passes</h1>
          <p className="text-gray-600">Find the perfect membership for your lifestyle</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setViewMode('companies')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'companies'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Companies & Passes
          </button>
          <button
            onClick={() => setViewMode('venues')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'venues'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Venues
          </button>
        </div>

        {/* Category Filter */}
        {viewMode === 'companies' && (
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
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        )}

        {/* Companies Content */}
        {viewMode === 'companies' && (
          <>
            {/* Featured Section */}
            {selectedCategory === 'all' && (
              <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Featured</h2>
            {filteredCompanies.filter(c => c.featured).map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{company.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{company.venue_count} venues</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{company.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {company.membership_types.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{membership.name}</div>
                        <div className="text-sm text-gray-600">{membership.benefits.slice(0, 2).join(' • ')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(membership.price)}</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link 
                  href={`/memberships?company=${company.id}`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>View Memberships</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
              </div>
            )}

            {/* All Companies */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {selectedCategory === 'all' ? 'All Companies' : `${selectedCategory} Companies`}
              </h2>
              
              <div className="space-y-4">
                {filteredCompanies.filter(c => !c.featured || selectedCategory !== 'all').map((company) => (
                  <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{company.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{company.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{company.venue_count} venues</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{company.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {company.membership_types.length} membership option{company.membership_types.length !== 1 ? 's' : ''}
                        {' • '}
                        From {formatCurrency(Math.min(...company.membership_types.map(m => m.price)))}
                      </div>
                      
                      <Link 
                        href={`/memberships?company=${company.id}`}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <span>View</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No companies found matching your criteria.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Venues Content */}
        {viewMode === 'venues' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">All Venues</h2>
            <p className="text-gray-600 mb-4">Browse venues where you can use your memberships</p>
            
            <div className="space-y-4">
              {/* SGV Venues */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SGV</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">SGV Entertainment Group</h3>
                    <p className="text-sm text-gray-600">9 venues • Toronto</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">KTV & Entertainment</h4>
                    <p className="text-gray-600">ET, Gfunk, Party K, Playbase, SOS, Wave</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Dining</h4>
                    <p className="text-gray-600">Long Feng Hotpot, Zui Beer K town, Zui Beer North York</p>
                  </div>
                </div>
                
                <Link 
                  href="/venues"
                  className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  View all SGV locations
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Other Companies */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GP</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">GoPlace Network</h3>
                    <p className="text-sm text-gray-600">15 venues • GTA</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Mixed entertainment and dining experiences across the Greater Toronto Area.</p>
                <p className="text-xs text-gray-500 mt-2">Venues available with GoPlace membership</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CP</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">CityPass Toronto</h3>
                    <p className="text-sm text-gray-600">25 venues • Toronto</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Tourist attractions, restaurants, and entertainment venues throughout Toronto.</p>
                <p className="text-xs text-gray-500 mt-2">Venues available with CityPass membership</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
