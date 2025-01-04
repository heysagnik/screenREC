"use client"

import * as React from "react"
import { Command } from "cmdk"
import { Search, Video, Loader2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useClickOutside } from "@/hooks/use-click-outside"
import { useRouter } from "next/navigation"

interface Recording {
  id: string
  title: string
  duration: string
  timestamp: string
  thumbnail?: string
}

const recentRecordings: Recording[] = [
  {
    id: '1',
    title: 'Project Demo Recording',
    duration: '5:32',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Team Meeting Recording',
    duration: '45:12',
    timestamp: '3 hours ago',
  },
  {
    id: '3',
    title: 'Bug Report Video',
    duration: '2:45',
    timestamp: 'Yesterday',
  }
]

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  onSearchChange: (value: string) => void
}

export function CommandMenu({ open, onOpenChange, search }: CommandMenuProps) {
  const router = useRouter()
  const ref = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(false)
  
  useClickOutside(ref, () => {
    if (open) onOpenChange(false)
  })

  const filteredRecordings = React.useMemo(() => {
    return recentRecordings.filter(recording => 
      recording.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  if (!open) return null

  async function handleSelect(title: string) {
    try {
      setLoading(true)
      // Find the recording
      const recording = recentRecordings.find(r => r.title === title)
      if (recording) {
        // Navigate to recording detail page
        router.push(`/recordings/${recording.id}`)
        // Close the command menu
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to select recording:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref}>
      <Command
        className={`
          absolute top-[calc(100%+8px)] left-0 right-0 z-50
          bg-white
          border border-gray-200
          rounded-xl
          shadow-[0_20px_80px_-12px_rgba(0,0,0,0.2)]
          overflow-hidden
          transition-all duration-200 ease-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onOpenChange(false)
          }
        }}
      >
        <Command.List className="max-h-[440px] overflow-y-auto p-3">
          <Command.Empty className="flex flex-col items-center justify-center py-12">
            <Search className="h-6 w-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No results found</p>
          </Command.Empty>

          {filteredRecordings.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-2 text-xs font-medium text-gray-500">Recent Files</div>
              <div className="space-y-2">
                {filteredRecordings.map((recording) => (
                  <Command.Item
                    key={recording.id}
                    onSelect={() => handleSelect(recording.title)}
                    className="group px-4 py-3 rounded-lg text-sm transition-all data-[selected]:bg-[#6938EF]/5 hover:bg-[#6938EF]/5"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#6938EF]/5 flex items-center justify-center">
                        {loading ? (
                          <Loader2 className="h-4 w-4 text-[#6938EF] animate-spin" />
                        ) : (
                          <Video className="h-4 w-4 text-[#6938EF]" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{recording.title}</p>
                        <p className="text-xs text-gray-500">{recording.timestamp}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#6938EF]/5 text-[#6938EF] text-xs px-2">
                          {recording.duration}
                        </Badge>
                        <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-50 rounded border border-gray-200">
                          ↵
                        </kbd>
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-gray-100 my-3" />
          
          <div className="px-2 py-2 text-[10px] text-gray-500 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 h-5 inline-flex items-center rounded bg-gray-50 border border-gray-200 text-gray-500">⌘</kbd>
              <kbd className="px-1.5 h-5 inline-flex items-center rounded bg-gray-50 border border-gray-200 text-gray-500">K</kbd>
              <span className="ml-1">Search</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 h-5 inline-flex items-center rounded bg-gray-50 border border-gray-200 text-gray-500">ESC</kbd>
              <span className="ml-1">Close</span>
            </div>
          </div>
        </Command.List>
      </Command>
    </div>
  )
}
