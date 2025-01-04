"use client"

import { EmptyState } from "@/components/empty-state"
import { Video, Archive, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from "@/components/ui/skeleton"

type Tab = 'videos' | 'archive' | 'screenshots'

export default function Zaps() {
  const [activeTab, setActiveTab] = useState<Tab>('videos')
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video, count: 0  },
    { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
    { id: 'screenshots', label: 'Screenshots', icon: ImageIcon, count: 0 },
  ]

  const handleTabChange = (tab: Tab) => {
    setIsLoading(true)
    setActiveTab(tab)
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300)
  }

  const LoadingSkeleton = () => (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-xl border border-gray-100 p-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-sm text-gray-500 mb-1">My Library</h1>
        <h2 className="text-2xl font-semibold text-gray-900">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <nav className="flex gap-1 p-1 bg-gray-100/50 rounded-full relative">
          {/* Animated Background Indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="absolute inset-y-1 rounded-full bg-white shadow-sm"
              layoutId="tab-indicator"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </AnimatePresence>

          {tabs.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => handleTabChange(id as Tab)}
              className={`
                px-4 py-2 text-sm font-medium rounded-full
                flex items-center gap-2
                transition-colors duration-200
                relative
                ${activeTab === id ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}
              `}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: activeTab === id ? 1.1 : 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <span>{label}</span>
            </motion.button>
          ))}
        </nav>
        
        <motion.div 
          layout
          className="text-sm text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full"
        >
          {tabs.find(t => t.id === activeTab)?.count} {activeTab.slice(0, -1)}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? <LoadingSkeleton /> : <EmptyState />}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}