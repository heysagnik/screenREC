"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function AccountSettings() {
  const router = useRouter()
  const [name, setName] = useState('Alex Smith')
  const [email] = useState('alex@company.com')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <motion.div 
      className="flex-1 bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Profile Section */}
        <div className="pb-4 sm:pb-6 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Profile Settings</h3>
          <p className="text-sm text-gray-500">View your account information</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-10 sm:h-11 hover:border-[#6938EF]/20 focus:border-[#6938EF]/20" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input value={email} readOnly className="h-10 sm:h-11 bg-gray-50" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/forgot-password')}
              className="w-full sm:w-auto h-10 sm:h-11"
            >
              Reset Password
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto h-10 sm:h-11"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Connected Accounts</h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-100 gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">Google Account</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full sm:w-auto h-9 sm:h-10"
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-sm font-medium text-red-600">Danger Zone</h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-red-100 bg-red-50 gap-3 sm:gap-4">
            <div>
              <p className="text-sm font-medium text-red-600">Delete Account</p>
              <p className="text-xs text-red-500">Permanently delete your account and all data</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full sm:w-auto h-9 sm:h-10"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}