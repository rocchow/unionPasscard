'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Mail, ArrowRight, Loader2, ChevronDown } from 'lucide-react'
import { signInWithPhone, signInWithEmail } from '@/lib/auth'

const countryCodes = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+852', country: 'HK', flag: '🇭🇰' },
]

export default function LoginPage() {
  const router = useRouter()
  const [method, setMethod] = useState<'phone' | 'email'>('phone')
  const [countryCode, setCountryCode] = useState('+1')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fullPhone = `${countryCode}${phone}`
    const { error } = await signInWithPhone(fullPhone)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/auth/verify?phone=${encodeURIComponent(fullPhone)}`)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signInWithEmail(email)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to UnionPasscard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your memberships
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-l-md border ${
                method === 'phone'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </button>
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                method === 'email'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {method === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 flex">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="relative bg-white border border-gray-300 rounded-l-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex items-center space-x-2 min-w-[80px]"
                    >
                      <span>{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                      <span className="text-sm font-medium">{countryCode}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showCountryDropdown && (
                      <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="max-h-48 overflow-y-auto">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.code)
                                setShowCountryDropdown(false)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                            >
                              <span>{country.flag}</span>
                              <span className="font-medium">{country.code}</span>
                              <span className="text-gray-500">{country.country}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="5551234567"
                    className="appearance-none rounded-r-md relative block w-full px-3 py-2 border border-gray-300 border-l-0 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We&apos;ll send you a verification code via SMS
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We&apos;ll send you a verification link via email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Link
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
