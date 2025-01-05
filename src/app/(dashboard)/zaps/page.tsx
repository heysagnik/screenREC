"use client"

import React from 'react'
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
    { id: 'videos', label: 'Videos', icon: Video, count: 12 },
    { id: 'archive', label: 'Archive', icon: Archive, count: 5 },
    { id: 'screenshots', label: 'Screenshots', icon: ImageIcon, count: 8 },
  ]

  const handleTabChange = (tab: Tab) => {
    setIsLoading(true)
    setActiveTab(tab)
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
    <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">My Library</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
      </div>
      
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-10">
        <nav className="
          relative flex gap-1 p-1
          bg-gray-50/80 
          rounded-full
          backdrop-blur-sm shadow-sm 
          border border-gray-100/50
          flex-1 sm:flex-none
        ">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="absolute inset-1 rounded-full bg-white shadow-sm ring-1 ring-gray-200/50"
              layoutId="tab-indicator"
              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              style={{
                width: `calc(${100/3}% - 4px)`,
                left: `calc(${tabs.findIndex(t => t.id === activeTab) * (100/3)}% + 2px)`
              }}
            />
          </AnimatePresence>

          {tabs.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => handleTabChange(id as Tab)}
              className={`
                relative z-10
                px-3 sm:px-6 py-2
                text-xs sm:text-sm font-medium
                rounded-full
                flex items-center gap-2
                justify-center flex-1
                min-h-[36px] sm:min-h-[40px]
                transition-all duration-200
                ${activeTab === id ? 'text-gray-900' : 'text-gray-600 hover:text-gray-800'}
              `}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: activeTab === id ? 1.1 : 1,
                  color: activeTab === id ? '#6938EF' : '#6B7280'
                }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.div>
              <span className="hidden sm:inline">{label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
          {tabs.find(tab => tab.id === activeTab)?.count} {activeTab.slice(0, -1)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? <LoadingSkeleton /> : <EmptyState/>}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}