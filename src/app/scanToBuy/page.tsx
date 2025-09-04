'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QrCode, 
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
  Building,
  DollarSign,
  ShoppingBag
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function ScanToBuyPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    venue?: {
      name: string;
      company: string;
      location: string;
    };
    pass?: {
      name: string;
      description: string;
      price: number;
      validity: string;
      benefits: string[];
    };
    purchased?: boolean;
    error?: string;
  } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleScan = () => {
    setScanning(true)
    
    // Simulate QR scan - in real app this would use camera
    setTimeout(() => {
      // Mock successful scan result for a venue pass
      setScanResult({
        success: true,
        venue: {
          name: 'Blue Moon Café',
          company: 'SGV Entertainment',
          location: '123 Main Street, Downtown'
        },
        pass: {
          name: 'Premium Dining Pass',
          description: 'Unlimited coffee and 20% off all food items',
          price: 49.99,
          validity: '30 days',
          benefits: [
            'Unlimited coffee and tea',
            '20% off all food items',
            'Priority seating',
            'Free WiFi access'
          ]
        }
      })
      setScanning(false)
    }, 2000)
  }

  const handlePurchase = () => {
    // Process the purchase
    setScanResult({
      ...scanResult,
      purchased: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/myPasses"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Passes
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Scan to Buy Pass
          </h1>
          <p className="mt-2 text-gray-600">
            Scan a venue&apos;s QR code to purchase their membership pass
          </p>
        </div>

        {!scanResult ? (
          /* Scan Interface */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-blue-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Scan
            </h2>
            <p className="text-gray-600 mb-8">
              Look for the venue&apos;s QR code and tap the button below to scan and see available passes
            </p>
            
            <button
              onClick={handleScan}
              disabled={scanning}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              {scanning ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 mr-2" />
              )}
              {scanning ? 'Scanning...' : 'Scan QR Code'}
            </button>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-blue-900">How it works</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Each venue has a unique QR code that shows their available membership passes. 
                    Scan it to see pricing, benefits, and purchase instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Scan Results */
          <div className="space-y-6">
            {/* Scan Status */}
            <div className={`p-4 rounded-lg ${
              scanResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {scanResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  scanResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {scanResult.success ? 'Venue Found!' : 'Scan Failed'}
                </span>
              </div>
            </div>

            {scanResult.success && (
              <>
                {/* Venue Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{scanResult.venue.name}</div>
                      <div className="text-sm text-gray-600">{scanResult.venue.company}</div>
                      <div className="text-sm text-gray-500">{scanResult.venue.location}</div>
                    </div>
                  </div>
                </div>

                {/* Pass Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{scanResult.pass.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(scanResult.pass.price)}
                      </div>
                      <div className="text-sm text-gray-500">Valid for {scanResult.pass.validity}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{scanResult.pass.description}</p>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Benefits included:</h4>
                    <ul className="space-y-1">
                      {scanResult.pass.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {!scanResult.purchased ? (
                    <>
                      <button
                        onClick={handlePurchase}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Purchase Pass
                      </button>
                      <button
                        onClick={() => setScanResult(null)}
                        className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 bg-green-100 text-green-800 py-3 px-4 rounded-lg text-center font-medium">
                      ✅ Pass Purchased Successfully!
                    </div>
                  )}
                </div>

                {scanResult.purchased && (
                  <div className="flex space-x-4">
                    <Link
                      href="/myPasses"
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium text-center"
                    >
                      View My Passes
                    </Link>
                    <button
                      onClick={() => setScanResult(null)}
                      className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium"
                    >
                      Scan Another
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
