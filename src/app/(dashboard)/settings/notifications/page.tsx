"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
    MailCheck,
    Timer,
    Users,
    HardDrive
} from 'lucide-react'

export default function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [recordingComplete, setRecordingComplete] = useState(true)
  const [shareNotifications, setShareNotifications] = useState(true)
  const [storageAlerts, setStorageAlerts] = useState(true)

  return (
    <motion.div 
      className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Notification Preferences</h3>
          <p className="text-sm text-gray-500">Manage how you receive notifications</p>
        </div>

        {/* Email Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <MailCheck className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <Label className="text-sm font-medium text-gray-700">Email Updates</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </div>

        {/* App Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">App Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Timer className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <Label className="text-sm font-medium text-gray-700">Recording Complete</Label>
                <p className="text-sm text-gray-500">Get notified when a recording is finished</p>
              </div>
            </div>
            <Switch checked={recordingComplete} onCheckedChange={setRecordingComplete} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <Label className="text-sm font-medium text-gray-700">Share Notifications</Label>
                <p className="text-sm text-gray-500">When someone shares a recording with you</p>
              </div>
            </div>
            <Switch checked={shareNotifications} onCheckedChange={setShareNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <HardDrive className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <Label className="text-sm font-medium text-gray-700">Storage Alerts</Label>
                <p className="text-sm text-gray-500">When you&apos;re running low on storage</p>
              </div>
            </div>
            <Switch checked={storageAlerts} onCheckedChange={setStorageAlerts} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}