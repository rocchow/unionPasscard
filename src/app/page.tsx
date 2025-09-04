import Link from 'next/link'
import { ArrowRight, CreditCard, QrCode, Building, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section - Mobile First */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">UP</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
            Welcome to{' '}
            <span className="text-blue-600 block sm:inline">UnionPasscard</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl leading-relaxed px-2">
            Universal membership system for multiple venues. 
            <span className="block mt-2">Manage credits, scan QR codes, pay seamlessly.</span>
          </p>
          <div className="mt-8">
            <Link
              href="/auth/login"
              className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Section - Mobile First */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-3 text-gray-600 sm:text-lg">
              Simple, secure, and convenient
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 text-white mx-auto mb-4">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Buy Credits</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Purchase prepaid credits for companies and venues
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-green-600 text-white mx-auto mb-4">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan & Pay</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Show QR code to pay instantly at venues
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-purple-600 text-white mx-auto mb-4">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Venue</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Use across KTVs, restaurants, sports courts
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-orange-600 text-white mx-auto mb-4">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Universal</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Future: One card for all companies
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - Mobile Optimized */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl">
          <div className="text-center py-12 px-6">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to Start?
            </h2>
            <p className="mt-4 text-blue-100 sm:text-lg leading-relaxed">
              Join UnionPasscard and enjoy seamless experiences across all venues
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              Sign Up Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
