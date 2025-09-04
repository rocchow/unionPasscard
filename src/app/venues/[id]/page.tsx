'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  Building,
  CreditCard,


  Loader2,
  ExternalLink,
  Heart
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface VenueDetail {
  id: string
  name: string
  type: 'ktv' | 'restaurant' | 'basketball_court' | 'badminton_court' | 'other'
  address: string | null
  phone: string | null
  description: string
  images: string[]
  company: {
    id: string
    name: string
    description: string
  }
  operating_hours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }
  amenities: string[]
  pricing: {
    hourly_rate?: number
    minimum_spend?: number
    peak_hour_surcharge?: number
  }
  rating: number
  total_reviews: number
  distance?: number
  isOpen: boolean
  popular_times?: { hour: number; busy_level: number }[]
}

const venueTypeLabels = {
  ktv: 'KTV',
  restaurant: 'Restaurant',
  basketball_court: 'Basketball Court',
  badminton_court: 'Badminton Court',
  other: 'Other'
}

export default function VenueDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [, setUser] = useState<AuthUser | null>(null)
  const [venue, setVenue] = useState<VenueDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      // Mock venue detail data
      const mockVenue: VenueDetail = {
        id: params.id as string,
        name: 'KTV Palace Downtown',
        type: 'ktv',
        address: '123 Main St, Downtown, City 12345',
        phone: '+1 (555) 123-4567',
        description: 'Premium KTV experience with state-of-the-art sound systems, luxurious private rooms, and extensive song selection in multiple languages. Perfect for celebrations, business entertainment, or casual nights out with friends.',
        images: [
          '/api/placeholder/400/300',
          '/api/placeholder/400/300',
          '/api/placeholder/400/300'
        ],
        company: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Entertainment Plus',
          description: 'Premium KTV and dining experiences'
        },
        operating_hours: {
          'Monday': { open: '18:00', close: '02:00' },
          'Tuesday': { open: '18:00', close: '02:00' },
          'Wednesday': { open: '18:00', close: '02:00' },
          'Thursday': { open: '18:00', close: '02:00' },
          'Friday': { open: '16:00', close: '03:00' },
          'Saturday': { open: '14:00', close: '03:00' },
          'Sunday': { open: '14:00', close: '02:00' }
        },
        amenities: [
          'Private rooms',
          'Premium sound system',
          'Multilingual song library',
          'Food & beverage service',
          'VIP packages',
          'Party decorations',
          'Free parking',
          'WiFi'
        ],
        pricing: {
          hourly_rate: 25.00,
          minimum_spend: 50.00,
          peak_hour_surcharge: 1.5
        },
        rating: 4.8,
        total_reviews: 1247,
        distance: 0.5,
        isOpen: true,
        popular_times: [
          { hour: 18, busy_level: 30 },
          { hour: 19, busy_level: 60 },
          { hour: 20, busy_level: 85 },
          { hour: 21, busy_level: 95 },
          { hour: 22, busy_level: 90 },
          { hour: 23, busy_level: 70 },
          { hour: 0, busy_level: 40 },
          { hour: 1, busy_level: 20 }
        ]
      }
      
      setVenue(mockVenue)
      setLoading(false)
    }

    loadData()
  }, [router, params.id])

  // const getCurrentDayHours = () => { // For future use
  //   if (!venue) return null
  //   const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  //   return venue.operating_hours[today]
  // }

  // const isCurrentlyOpen = () => { // For future use
  //   const hours = getCurrentDayHours()
  //   if (!hours || hours.closed) return false
  //   
  //   const now = new Date()
  //   const currentTime = now.getHours() * 100 + now.getMinutes()
  //   const openTime = parseInt(hours.open.replace(':', ''))
  //   const closeTime = parseInt(hours.close.replace(':', ''))
  //   
  //   if (closeTime < openTime) {
  //     // Crosses midnight
  //     return currentTime >= openTime || currentTime <= closeTime
  //   } else {
  //     return currentTime >= openTime && currentTime <= closeTime
  //   }
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Venue not found</h2>
          <p className="text-gray-600 mb-4">The venue you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/venues" className="text-blue-600 hover:text-blue-700">
            Back to venues
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/venues"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to venues
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {venue.name}
                  </h1>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    venue.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${venue.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{venue.isOpen ? 'Open' : 'Closed'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">{venue.rating}</span>
                    <span>({venue.total_reviews.toLocaleString()} reviews)</span>
                  </div>
                  
                  <span className="text-gray-300">•</span>
                  <span className="capitalize">{venueTypeLabels[venue.type]}</span>
                  
                  {venue.distance !== undefined && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{venue.distance} miles away</span>
                    </>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-64 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">Venue Photo</span>
                  </div>
                </div>
                {venue.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {venue.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-md"></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Venue</h2>
                <p className="text-gray-700 leading-relaxed">{venue.description}</p>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Times */}
              {venue.popular_times && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Times</h2>
                  <div className="space-y-3">
                    {venue.popular_times.map((time) => (
                      <div key={time.hour} className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700 w-12">
                          {time.hour === 0 ? '12 AM' : time.hour > 12 ? `${time.hour - 12} PM` : `${time.hour} ${time.hour === 12 ? 'PM' : 'AM'}`}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${time.busy_level}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-16">
                          {time.busy_level < 25 ? 'Quiet' : 
                           time.busy_level < 50 ? 'Moderate' :
                           time.busy_level < 75 ? 'Busy' : 'Very Busy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact & Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Hours</h3>
                
                <div className="space-y-4">
                  {venue.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 font-medium">Address</p>
                        <p className="text-gray-600 text-sm">{venue.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {venue.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 font-medium">Phone</p>
                        <a href={`tel:${venue.phone}`} className="text-blue-600 hover:text-blue-700 text-sm">
                          {venue.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">Hours</p>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        {Object.entries(venue.operating_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className={day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'font-medium text-gray-900' : ''}>
                              {day.slice(0, 3)}
                            </span>
                            <span className={day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'font-medium text-gray-900' : ''}>
                              {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Navigation className="w-5 h-5" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                
                <div className="space-y-3">
                  {venue.pricing.hourly_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(venue.pricing.hourly_rate)}/hr
                      </span>
                    </div>
                  )}
                  
                  {venue.pricing.minimum_spend && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum Spend</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(venue.pricing.minimum_spend)}
                      </span>
                    </div>
                  )}
                  
                  {venue.pricing.peak_hour_surcharge && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Hour Surcharge</span>
                      <span className="font-medium text-gray-900">
                        {venue.pricing.peak_hour_surcharge}x
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💳 Pay with your {venue.company.name} membership for seamless checkout
                  </p>
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {venue.company.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{venue.company.name}</h4>
                    <p className="text-sm text-gray-600">{venue.company.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    href={`/companies/${venue.company.id}`}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
                  >
                    View All Venues
                  </Link>
                  
                  <Link
                    href="/memberships/purchase"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Get Membership</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
