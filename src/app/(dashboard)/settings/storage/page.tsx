"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Cloud } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Progress } from "@/components/ui/progress"

export default function StorageSettings() {
  const [storageUsed] = useState(75) // GB used
  const [totalStorage] = useState(100) // Total GB

  const cloudServices = [
    {
      name: 'Google Drive',
      icon: '/google-drive.svg',
      connected: true,
      storage: '15 GB',
    },
    {
      name: 'OneDrive',
      icon: '/onedrive.svg',
      connected: false,
      storage: '5 GB',
    },
    {
      name: 'Dropbox',
      icon: '/dropbox.svg',
      connected: false,
      storage: '2 GB',
    },
  ]

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
          <h3 className="text-lg font-medium text-gray-900 mb-1">Storage Settings</h3>
          <p className="text-sm text-gray-500">Manage your storage and cloud integrations</p>
        </div>

        {/* Storage Usage */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Storage Usage</h4>
            <span className="text-sm text-gray-500">{storageUsed}GB of {totalStorage}GB used</span>
          </div>
          <Progress value={75} className="h-2" />
          {storageUsed > 80 && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">You&apos;re running low on storage space</p>
            </div>
          )}
        </div>

        {/* Cloud Storage */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Cloud Storage</h4>
          <div className="space-y-3">
            {cloudServices.map((service) => (
              <div key={service.name} 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-[#6938EF]/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 p-2">
                    <Image src={service.icon} alt={service.name} className="h-6 w-6" width={20} height={20}/>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      {service.connected ? 'Connected' : `Up to ${service.storage} free storage`}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={service.connected ? "outline" : "default"}
                  size="sm"
                >
                  {service.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Cleanup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#6938EF]/5 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Auto Cleanup</p>
                <p className="text-xs text-gray-500">Automatically remove recordings older than 30 days</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}