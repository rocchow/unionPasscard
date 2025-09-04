'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new consolidated Reports page
    router.replace('/reports')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to Reports...</p>
      </div>
    </div>
  )
}