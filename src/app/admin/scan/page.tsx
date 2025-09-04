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
  User,
  DollarSign
} from 'lucide-react'
import { getCurrentUser, type AuthUser, hasRole } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function AdminScanPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    customer?: {
      name: string;
      email: string;
      phone: string;
      membership: string;
      balance: number;
      passes: Array<{
        name: string;
        company: string;
        status: string;
        expires: string;
      }>;
    };
    transaction?: {
      amount: number;
      description: string;
      venue: string;
    };
    processed?: boolean;
    error?: string;
  } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Check if user has staff+ privileges
      if (!hasRole(currentUser.role, 'staff')) {
        router.push('/myPasses')
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
      // Mock successful scan result
      setScanResult({
        success: true,
        customer: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          membership: 'SGV Premium',
          balance: 125.50,
          passes: [
            { name: 'SGV Premium', company: 'SGV Entertainment', status: 'Active', expires: '2024-12-31' },
            { name: 'Coffee Club', company: 'Blue Moon Café', status: 'Active', expires: '2024-11-15' }
          ]
        },
        transaction: {
          amount: 15.75,
          description: 'Coffee and pastry',
          venue: 'Blue Moon Café'
        }
      })
      setScanning(false)
    }, 2000)
  }

  const handleProcessTransaction = () => {
    // Process the transaction
    setScanResult(prev => prev ? {
      ...prev,
      processed: true
    } : null)
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
            href="/reports"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Staff QR Scanner
          </h1>
          <p className="mt-2 text-gray-600">
            Scan customer QR codes to process transactions
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
              Ask the customer to show their QR code and tap the button below to scan
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
              {scanning ? 'Scanning...' : 'Start Scan'}
            </button>
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
                  {scanResult.success ? 'QR Code Scanned Successfully' : 'Scan Failed'}
                </span>
              </div>
            </div>

            {scanResult.success && (
              <>
                {/* Customer Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{scanResult.customer?.name}</div>
                      <div className="text-sm text-gray-500">{scanResult.customer?.membership}</div>
                      <div className="text-sm text-green-600">
                        Balance: {formatCurrency(scanResult.customer?.balance || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(scanResult.transaction?.amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-gray-900">
                        {scanResult.transaction?.description}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium text-gray-900">
                        {scanResult.transaction?.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {!scanResult.processed ? (
                    <>
                      <button
                        onClick={handleProcessTransaction}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
                      >
                        Process Transaction
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
                      ✅ Transaction Processed Successfully
                    </div>
                  )}
                </div>

                {scanResult.processed && (
                  <button
                    onClick={() => setScanResult(null)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Scan Another QR Code
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
