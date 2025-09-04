'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Database,
  Shield,
  Bell,
  Mail,
  Globe,
  CreditCard,
  Users,
  Building,
  Loader2,
  Save,
  RefreshCw
} from 'lucide-react'
import { getCurrentUser, type AuthUser } from '@/lib/auth'

interface SystemSettings {
  // General
  app_name: string
  app_description: string
  maintenance_mode: boolean
  
  // Security
  require_email_verification: boolean
  session_timeout_minutes: number
  max_login_attempts: number
  
  // Notifications
  email_notifications: boolean
  sms_notifications: boolean
  admin_alerts: boolean
  
  // Payment
  stripe_enabled: boolean
  payment_processing_fee: number
  minimum_transaction: number
  
  // Features
  qr_code_expiry_minutes: number
  allow_refunds: boolean
  auto_approve_venues: boolean
}

export default function SystemSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Only super admins can access system settings
      if (currentUser.role !== 'super_admin') {
        router.push('/reports')
        return
      }
      
      setUser(currentUser)
      
      // Mock system settings
      setSettings({
        // General
        app_name: 'UnionPasscard',
        app_description: 'Digital membership and payment platform',
        maintenance_mode: false,
        
        // Security
        require_email_verification: true,
        session_timeout_minutes: 120,
        max_login_attempts: 5,
        
        // Notifications
        email_notifications: true,
        sms_notifications: true,
        admin_alerts: true,
        
        // Payment
        stripe_enabled: true,
        payment_processing_fee: 2.9,
        minimum_transaction: 1.00,
        
        // Features
        qr_code_expiry_minutes: 15,
        allow_refunds: true,
        auto_approve_venues: false
      })
      
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: value
      })
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            System Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  value={settings?.app_name || ''}
                  onChange={(e) => updateSetting('app_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Description
                </label>
                <textarea
                  value={settings?.app_description || ''}
                  onChange={(e) => updateSetting('app_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance_mode"
                  checked={settings?.maintenance_mode || false}
                  onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="maintenance_mode" className="ml-2 text-sm text-gray-700">
                  Enable maintenance mode
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_verification"
                  checked={settings?.require_email_verification || false}
                  onChange={(e) => updateSetting('require_email_verification', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="email_verification" className="ml-2 text-sm text-gray-700">
                  Require email verification for new accounts
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings?.session_timeout_minutes || 0}
                  onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum login attempts
                </label>
                <input
                  type="number"
                  value={settings?.max_login_attempts || 0}
                  onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={settings?.email_notifications || false}
                  onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="email_notifications" className="ml-2 text-sm text-gray-700">
                  Enable email notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms_notifications"
                  checked={settings?.sms_notifications || false}
                  onChange={(e) => updateSetting('sms_notifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="sms_notifications" className="ml-2 text-sm text-gray-700">
                  Enable SMS notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="admin_alerts"
                  checked={settings?.admin_alerts || false}
                  onChange={(e) => updateSetting('admin_alerts', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="admin_alerts" className="ml-2 text-sm text-gray-700">
                  Enable admin alerts
                </label>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="stripe_enabled"
                  checked={settings?.stripe_enabled || false}
                  onChange={(e) => updateSetting('stripe_enabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="stripe_enabled" className="ml-2 text-sm text-gray-700">
                  Enable Stripe payment processing
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment processing fee (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings?.payment_processing_fee || 0}
                  onChange={(e) => updateSetting('payment_processing_fee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum transaction amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings?.minimum_transaction || 0}
                  onChange={(e) => updateSetting('minimum_transaction', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Feature Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR code expiry time (minutes)
                </label>
                <input
                  type="number"
                  value={settings?.qr_code_expiry_minutes || 0}
                  onChange={(e) => updateSetting('qr_code_expiry_minutes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allow_refunds"
                  checked={settings?.allow_refunds || false}
                  onChange={(e) => updateSetting('allow_refunds', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="allow_refunds" className="ml-2 text-sm text-gray-700">
                  Allow transaction refunds
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_approve_venues"
                  checked={settings?.auto_approve_venues || false}
                  onChange={(e) => updateSetting('auto_approve_venues', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="auto_approve_venues" className="ml-2 text-sm text-gray-700">
                  Auto-approve new venue registrations
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
