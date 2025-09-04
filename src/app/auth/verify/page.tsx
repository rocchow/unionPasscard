'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { verifyOtp, verifyEmailOtp } from '@/lib/auth'
import Link from 'next/link'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')
  const email = searchParams.get('email')
  
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (phone) {
        result = await verifyOtp(phone, code)
      } else if (email) {
        result = await verifyEmailOtp(email, code)
      } else {
        throw new Error('No phone or email provided')
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        // Add a small delay to ensure session is fully established
        setTimeout(() => {
          router.push('/app')
        }, 500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (!phone && !email) {
    return (
      <div className="text-center">
        <p className="text-red-600">Invalid verification request</p>
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your {phone ? 'phone' : 'email'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification code to{' '}
            <span className="font-medium">{phone || email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
