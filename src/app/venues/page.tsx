'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building, 
  MapPin, 
  Phone, 
 
  Star,
  Navigation,
  Loader2,
  Search
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import Link from 'next/link'

interface Venue {
  id: string
  name: string
  type: 'ktv' | 'restaurant' | 'basketball_court' | 'badminton_court' | 'other'
  address: string | null
  phone: string | null
  company: {
    id: string
    name: string
    description: string
  }
  distance?: number
  rating?: number
  isOpen?: boolean
}

const venueTypeLabels = {
  ktv: 'KTV',
  restaurant: 'Restaurant',
  basketball_court: 'Basketball Court',
  badminton_court: 'Badminton Court',
  other: 'Other'
}

const venueTypeColors = {
  ktv: 'bg-purple-100 text-purple-800',
  restaurant: 'bg-orange-100 text-orange-800',
  basketball_court: 'bg-blue-100 text-blue-800',
  badminton_court: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800'
}

export default function VenuesPage() {
  const router = useRouter()
  const [, setUser] = useState<AuthUser | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      // SGV venues data - matches the database
      const mockVenues: Venue[] = [
        {
          id: 'sgv-et',
          name: 'ET',
          type: 'ktv',
          address: '123 ET St, Toronto',
          phone: '+1 (416) 555-0101',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 0.8,
          rating: 4.9,
          isOpen: true
        },
        {
          id: 'sgv-gfunk',
          name: 'Gfunk',
          type: 'ktv',
          address: '456 Gfunk Ave, Toronto',
          phone: '+1 (416) 555-0102',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 1.2,
          rating: 4.8,
          isOpen: true
        },
        {
          id: 'sgv-party-k',
          name: 'Party K',
          type: 'ktv',
          address: '789 Party St, Toronto',
          phone: '+1 (416) 555-0103',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 2.1,
          rating: 4.7,
          isOpen: true
        },
        {
          id: 'sgv-long-feng',
          name: 'Long Feng Hotpot',
          type: 'restaurant',
          address: '654 Hotpot Blvd, Toronto',
          phone: '+1 (416) 555-0104',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 1.5,
          rating: 4.8,
          isOpen: true
        },
        {
          id: 'sgv-playbase',
          name: 'Playbase',
          type: 'other',
          address: '987 Gaming St, Toronto',
          phone: '+1 (416) 555-0105',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 2.3,
          rating: 4.6,
          isOpen: true
        },
        {
          id: 'sgv-sos',
          name: 'SOS',
          type: 'other',
          address: '147 SOS Ave, Toronto',
          phone: '+1 (416) 555-0106',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 1.9,
          rating: 4.7,
          isOpen: true
        },
        {
          id: 'sgv-wave',
          name: 'Wave',
          type: 'other',
          address: '258 Wave Dr, Toronto',
          phone: '+1 (416) 555-0107',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 3.2,
          rating: 4.5,
          isOpen: true
        },
        {
          id: 'sgv-zui-ktown',
          name: 'Zui Beer (K town)',
          type: 'restaurant',
          address: '369 Koreatown St, Toronto',
          phone: '+1 (416) 555-0108',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 2.8,
          rating: 4.6,
          isOpen: true
        },
        {
          id: 'sgv-zui-north-york',
          name: 'Zui Beer (North York)',
          type: 'restaurant',
          address: '741 North York Blvd, Toronto',
          phone: '+1 (416) 555-0109',
          company: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'SGV',
            description: 'SGV Entertainment Group - Premium hospitality and entertainment venues'
          },
          distance: 4.1,
          rating: 4.4,
          isOpen: true
        }
      ]
      
      setVenues(mockVenues)
      setFilteredVenues(mockVenues)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    let filtered = venues

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(venue => venue.type === selectedType)
    }

    setFilteredVenues(filtered)
  }, [searchQuery, selectedType, venues])

  const venueTypes = Array.from(new Set(venues.map(v => v.type)))

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
            Venues
          </h1>
          <p className="mt-2 text-gray-600">
            Discover venues where you can use your UnionPasscard
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search venues, companies, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            {venueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {venueTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {venue.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {venue.company.name}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${venueTypeColors[venue.type]}`}>
                      {venueTypeLabels[venue.type]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${venue.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-xs font-medium ${venue.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                      {venue.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {venue.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{venue.address}</span>
                    </div>
                  )}
                  
                  {venue.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{venue.phone}</span>
                    </div>
                  )}

                  {venue.distance !== undefined && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Navigation className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{venue.distance} miles away</span>
                    </div>
                  )}
                </div>

                {venue.rating && (
                  <div className="flex items-center mb-4">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {venue.rating}
                    </span>
                    <span className="ml-1 text-sm text-gray-600">
                      (4.2k reviews)
                    </span>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    href={`/venues/${venue.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                  {venue.address && (
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Navigation className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No venues available at the moment'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
