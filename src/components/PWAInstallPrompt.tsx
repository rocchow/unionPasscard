'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor, Tablet } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)) {
      setIsInstalled(true)
      return
    }

    // Check user preferences
    const installPreference = localStorage.getItem('pwa-install-preference')
    if (installPreference === 'never') {
      return
    }

    // Detect device type
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                      (window.innerWidth >= 768 && window.innerWidth <= 1024)
      
      if (isMobile && !isTablet) return 'mobile'
      if (isTablet) return 'tablet'
      return 'desktop'
    }

    setDeviceType(detectDevice())

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt based on preference and timing
      if (installPreference !== 'later') {
        // Show immediately for first-time users
        setTimeout(() => setShowPrompt(true), 3000) // 3 second delay
      } else {
        // Check if it's been 7 days since "remind later"
        const remindLaterDate = localStorage.getItem('pwa-remind-later-date')
        if (remindLaterDate) {
          const daysSince = (Date.now() - parseInt(remindLaterDate)) / (1000 * 60 * 60 * 24)
          if (daysSince >= 7) {
            setTimeout(() => setShowPrompt(true), 3000)
          }
        }
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-preference')
      localStorage.removeItem('pwa-remind-later-date')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      console.log('PWA: User choice:', choiceResult.outcome)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt')
        localStorage.setItem('pwa-install-preference', 'accepted')
      } else {
        console.log('PWA: User dismissed the install prompt')
        localStorage.setItem('pwa-install-preference', 'dismissed')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('PWA: Error during install:', error)
    }
  }

  const handleRemindLater = () => {
    localStorage.setItem('pwa-install-preference', 'later')
    localStorage.setItem('pwa-remind-later-date', Date.now().toString())
    setShowPrompt(false)
  }

  const handleNeverAsk = () => {
    localStorage.setItem('pwa-install-preference', 'never')
    setShowPrompt(false)
  }

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-8 h-8 text-blue-600" />
      case 'tablet': return <Tablet className="w-8 h-8 text-blue-600" />
      default: return <Monitor className="w-8 h-8 text-blue-600" />
    }
  }

  const getDeviceText = () => {
    switch (deviceType) {
      case 'mobile': return 'Install UnionPasscard on your phone for quick access to your passes and faster checkout!'
      case 'tablet': return 'Install UnionPasscard on your tablet for a better full-screen experience!'
      default: return 'Install UnionPasscard as a desktop app for quick access and offline functionality!'
    }
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={handleNeverAsk}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">UP</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Install UnionPasscard</h3>
              <p className="text-blue-100 text-sm">Get the full app experience</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            {getDeviceIcon()}
            <div>
              <p className="text-gray-700 leading-relaxed">
                {getDeviceText()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Works offline</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Faster loading</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Native app experience</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={handleInstall}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Install App</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRemindLater}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Remind Later
            </button>
            <button
              onClick={handleNeverAsk}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Never Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
