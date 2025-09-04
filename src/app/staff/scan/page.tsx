'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QrCode, 
  ArrowLeft, 
  Camera,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import { getCurrentUser, type AuthUser, hasRole } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface CustomerInfo {
  id: string
  name: string
  email?: string
  phone?: string
  membership: {
    id: string
    company_name: string
    balance: number
    status: 'active' | 'inactive' | 'suspended'
  }
}

interface TransactionResult {
  success: boolean
  transaction_id?: string
  new_balance?: number
  error?: string
}

export default function StaffScanPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [scanning, setScanning] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [error, setError] = useState('')
  const [manualEntry, setManualEntry] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Check if user has staff privileges
      if (!hasRole(currentUser.role, 'staff')) {
        router.push('/reports')
        return
      }
      
      setUser(currentUser)
      
      // Auto-start camera after user is authenticated
      setTimeout(() => {
        startCamera()
      }, 500) // Small delay to ensure DOM is ready
    }

    loadData()

    // Cleanup: stop camera when component unmounts
    return () => {
      stopCamera()
    }
  }, [router])

  const startCamera = async () => {
    try {
      setScanning(true)
      setError('')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      setError('Unable to access camera. Please check permissions.')
      setScanning(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
  }

  const simulateQRScan = () => {
    // Simulate QR code detection
    setTimeout(() => {
      const mockQRData = JSON.stringify({
        userId: 'user123',
        membershipId: 'membership456',
        timestamp: Date.now()
      })
      handleQRDetected(mockQRData)
    }, 2000)
  }

  const handleQRDetected = async (qrData: string) => {
    stopCamera()
    setProcessing(true)
    setError('')

    try {
      // Call API to get customer info
      const response = await fetch(`/api/transactions/process?qrData=${encodeURIComponent(qrData)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process QR code')
      }

      setCustomerInfo(data.customer_info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process QR code')
    } finally {
      setProcessing(false)
    }
  }

  const handleManualEntry = async () => {
    if (!qrInput.trim()) {
      setError('Please enter QR code data')
      return
    }
    
    await handleQRDetected(qrInput)
  }

  const processTransaction = async () => {
    if (!customerInfo || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!user) {
      setError('Staff user not found')
      return
    }

    const transactionAmount = parseFloat(amount)
    if (transactionAmount > customerInfo.membership.balance) {
      setError('Insufficient balance')
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Create QR data from customer info
      const qrData = JSON.stringify({
        userId: customerInfo.id,
        membershipId: customerInfo.membership.id,
        timestamp: Date.now()
      })

      // Call API to process transaction
      const response = await fetch('/api/transactions/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData,
          amount: transactionAmount,
          description: description || 'Purchase',
          staffId: user.id,
          venueId: 'sgv-venue-1' // In real app, this would be determined by staff's venue
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Transaction failed')
      }

      setResult({
        success: true,
        transaction_id: data.transaction_id,
        new_balance: data.new_balance
      })
      
      // Reset form after successful transaction
      setTimeout(() => {
        setCustomerInfo(null)
        setAmount('')
        setDescription('')
        setResult(null)
      }, 3000)
      
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Transaction failed'
      })
    } finally {
      setProcessing(false)
    }
  }

  const resetScanner = () => {
    setCustomerInfo(null)
    setAmount('')
    setDescription('')
    setResult(null)
    setError('')
    setQrInput('')
    setManualEntry(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Show transaction result
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {result.success ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Successful!</h2>
                <p className="text-gray-600 mb-6">Payment processed successfully</p>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800">Transaction ID:</span>
                      <span className="font-medium text-green-900">{result.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Amount:</span>
                      <span className="font-medium text-green-900">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">New Balance:</span>
                      <span className="font-medium text-green-900">{formatCurrency(result.new_balance || 0)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Failed</h2>
                <p className="text-red-600 mb-6">{result.error}</p>
              </>
            )}
            
            <button
              onClick={resetScanner}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Scan Another QR Code
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/staff"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Staff Portal
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              QR Code Scanner
            </h1>
            <p className="mt-2 text-gray-600">
              Scan customer QR codes to process payments
            </p>
          </div>

          {!customerInfo ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Scanner Options */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setManualEntry(false)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      !manualEntry
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Camera className="w-5 h-5 mx-auto mb-1" />
                    Camera Scan
                  </button>
                  <button
                    onClick={() => setManualEntry(true)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      manualEntry
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1" />
                    Manual Entry
                  </button>
                </div>
              </div>

              {!manualEntry ? (
                <div className="p-6">
                  {!scanning ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Starting Camera...</h3>
                      <p className="text-gray-600 mb-6">
                        Please allow camera access when prompted
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                        <video
                          ref={videoRef}
                          className="w-full h-64 object-cover"
                          playsInline
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={stopCamera}
                          className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={simulateQRScan}
                          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Simulate Scan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center py-8">
                    <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Manual QR Entry</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          QR Code Data
                        </label>
                        <textarea
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          placeholder="Paste QR code data here..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <button
                        onClick={handleManualEntry}
                        disabled={!qrInput.trim() || processing}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Process QR Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-6 border-t border-gray-100">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-700">{error}</p>
                    </div>
                    <button
                      onClick={() => {
                        setError('')
                        startCamera()
                      }}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                  </div>
                </div>
              )}

              {processing && (
                <div className="p-6 border-t border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <p className="text-blue-700">Processing QR code...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Transaction Form */
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{customerInfo.name}</h3>
                    {customerInfo.email && (
                      <p className="text-sm text-gray-600">{customerInfo.email}</p>
                    )}
                    {customerInfo.phone && (
                      <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                    )}
                    
                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{customerInfo.membership.company_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {formatCurrency(customerInfo.membership.balance)} available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {customerInfo.membership.status !== 'active' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800">
                        Membership status: <span className="font-medium capitalize">{customerInfo.membership.status}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Transaction</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., KTV room rental, food & beverage"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={resetScanner}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processTransaction}
                      disabled={!amount || parseFloat(amount) <= 0 || processing}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5" />
                          <span>Process Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
