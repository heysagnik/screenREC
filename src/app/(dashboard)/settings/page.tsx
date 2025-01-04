"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Video, Camera, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RecordingSettings() {
  const [videoQuality, setVideoQuality] = useState('1080p')
  const [autoSave, setAutoSave] = useState(true)
  const [micPermission, setMicPermission] = useState<boolean>(false)
  const [cameraPermission, setCameraPermission] = useState<boolean>(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    checkPermissions()
  }, [])

  async function checkPermissions() {
    try {
      const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicPermission(micResult.state === 'granted')
      
      const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(cameraResult.state === 'granted')
    } catch (error) {
      console.error('Error checking permissions:', error)
    }
  }

  return (
    <motion.div 
      className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-8">
        <div className="pb-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Recording Settings</h3>
          <p className="text-sm text-gray-500">Configure your recording preferences</p>
        </div>

        {/* Video Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Video Settings</h4>
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <Label className="text-sm font-medium text-gray-700">Video Quality</Label>
                <p className="text-sm text-gray-500">Select output resolution</p>
              </div>
            </div>
            <Select value={videoQuality} onValueChange={setVideoQuality}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p HD</SelectItem>
                <SelectItem value="1080p">1080p Full HD</SelectItem>
                <SelectItem value="2k">2K QHD</SelectItem>
                <SelectItem value="4k">4K Ultra HD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Device Permissions</h4>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-3">
                <Mic className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <Label className="text-sm font-medium text-gray-700">Microphone Access</Label>
                  <p className="text-sm text-gray-500">{micPermission ? 'Permission granted' : 'Permission required'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsTesting(!isTesting)}>
                Test Mic
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <Label className="text-sm font-medium text-gray-700">Camera Access</Label>
                  <p className="text-sm text-gray-500">{cameraPermission ? 'Permission granted' : 'Permission required'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Check Camera</Button>
            </div>
          </div>
        </div>

        {/* Auto Save */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <Label className="text-sm font-medium text-gray-700">Auto-Save Recordings</Label>
              <p className="text-sm text-gray-500">Automatically save recordings when finished</p>
            </div>
          </div>
          <Switch checked={autoSave} onCheckedChange={setAutoSave} />
        </div>

        {/* Privacy Notice */}
        <Alert className="bg-gray-50 border-gray-200">
          <Shield className="h-4 w-4 text-gray-500" />
          <AlertDescription className="text-sm text-gray-600">
            We prioritize your privacy and security. All recordings are encrypted and stored securely.
          </AlertDescription>
        </Alert>
      </div>
    </motion.div>
  )
}