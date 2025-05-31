"use client"

import * as React from "react"
import { Command } from "cmdk"
import { Search, Video, Settings, Library } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface CommandMenuProps {
  open: boolean
  search: string
  onOpenChange: (value: string) => void
  onSearchChange: (value: string) => void
}

interface FilteredResultsProps {
  search: string
  onSelect: (item: string) => void
  selectedIndex: number
}

interface Recording {
  id: string
  title: string
  duration: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
}

interface AppCommand {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
}

const recentRecordings: Recording[] = [
  {
    id: '1',
    title: 'Project Demo Recording',
    duration: '5:32',
    timestamp: '2 hours ago',
    icon: Video,
  },
  {
    id: '2',
    title: 'Team Meeting Recording',
    duration: '45:12',
    timestamp: '3 hours ago',
    icon: Video,
  },
  {
    id: '3',
    title: 'Bug Report Video',
    duration: '2:45',
    timestamp: 'Yesterday',
    icon: Video,
  },
]

const commands: AppCommand[] = [
  { id: 'settings', title: 'Open Settings', icon: Settings, shortcut: "⌘S" },
  { id: 'library', title: 'Go to Library', icon: Library, shortcut: "⌘L" },
]

function FilteredResults({ search, onSelect, selectedIndex }: FilteredResultsProps) {
  const filteredRecordings = recentRecordings.filter(recording =>
    recording.title.toLowerCase().includes(search.toLowerCase())
  )
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {filteredRecordings.length > 0 && (
        <Command.Group heading="Recordings">
          {filteredRecordings.map((recording, index) => (
            <Command.Item
              key={recording.id}
              value={recording.title}
              onSelect={onSelect}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg 
                text-gray-900 text-sm cursor-pointer 
                ${selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-100'} 
                group
              `}
              data-cmdk-item
            >
              <recording.icon className="w-4 h-4 text-[#6938EF]" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{recording.title}</p>
                <p className="text-xs text-gray-500">{recording.timestamp}</p>
              </div>
              <Badge className="bg-[#6938EF]/5 text-[#6938EF]">{recording.duration}</Badge>
            </Command.Item>
          ))}
        </Command.Group>
      )}
      {filteredCommands.length > 0 && (
        <Command.Group heading="Commands">
          {filteredCommands.map((command, index) => (
            <Command.Item
              key={command.id}
              value={command.title}
              onSelect={onSelect}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg 
                text-gray-900 text-sm cursor-pointer 
                ${
                  selectedIndex === index + filteredRecordings.length
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-100'
                } 
                group
              `}
              data-cmdk-item
            >
              <command.icon className="w-4 h-4 text-gray-500" />
              <span className="flex-1">{command.title}</span>
              {command.shortcut && (
                <span className="text-xs text-gray-400 select-none">
                  {command.shortcut}
                </span>
              )}
            </Command.Item>
          ))}
        </Command.Group>
      )}
    </>
  )
}

export function CommandMenu({ open, search, onOpenChange, onSearchChange }: CommandMenuProps) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const commandRef = React.useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Reset selected index when search changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Handle click outside to close command menu
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        onOpenChange('false')
        onSearchChange('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onOpenChange, onSearchChange])

  // Handle keyboard navigation and shortcuts
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command menu with Command/Ctrl+K when closed
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange('true')
        return
      }

      // Close menu with Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange('false')
        onSearchChange('')
        return
      }

      // Navigation: Arrow Down/Up
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => {
          const items = document.querySelectorAll('[data-cmdk-item]')
          return i < items.length - 1 ? i + 1 : 0
        })
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => {
          const items = document.querySelectorAll('[data-cmdk-item]')
          return i > 0 ? i - 1 : items.length - 1
        })
        return
      }

      // Enter to select current item
      if (e.key === 'Enter') {
        e.preventDefault()
        const items = document.querySelectorAll('[data-cmdk-item]')
        const selectedItem = items[selectedIndex] as HTMLElement
        if (selectedItem) {
          selectedItem.click()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange, onSearchChange, selectedIndex])

  const handleSelect = React.useCallback((item: string) => {
    if (item.toLowerCase().includes('settings')) {
      router.push('/settings')
    } else if (item.toLowerCase().includes('library')) {
      router.push('/zaps')
    }
    onOpenChange('false')
    onSearchChange('')
  }, [router, onOpenChange, onSearchChange])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-50"
        >
          <div className="fixed inset-0" onClick={() => {
            onOpenChange('false')
            onSearchChange('')
          }} />
          
          <Command
            ref={commandRef}
            className="
              fixed left-1/2 top-[15%]
              w-full max-w-2xl 
              -translate-x-[calc(50%+40px)]
              bg-white rounded-xl 
              shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.06)]
              overflow-hidden
              ring-1 ring-gray-200
            "
          >
            <div className="border-b border-gray-100 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <Command.Input
                ref={inputRef}
                value={search}
                onValueChange={onSearchChange}
                className="w-full pl-9 pr-4 h-12 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none"
                placeholder="Search recordings and commands..."
                autoFocus
              />
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="p-4 text-sm text-gray-500 text-center">
                No results found for &ldquo;{search}&rdquo;
              </Command.Empty>

              {search ? (
                <FilteredResults search={search} onSelect={handleSelect} selectedIndex={selectedIndex} />
              ) : (
                <>
                  <Command.Group heading="Recent Recordings" className="pb-2">
                    {recentRecordings.map((recording, index) => (
                      <Command.Item
                        key={recording.id}
                        value={recording.title}
                        onSelect={handleSelect}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg 
                          text-gray-700 text-sm cursor-pointer 
                          ${selectedIndex === index ? 'bg-gray-100/80' : 'hover:bg-gray-100/80'} 
                          group
                        `}
                        data-cmdk-item
                      >
                        <recording.icon className="w-4 h-4 text-[#6938EF]" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{recording.title}</p>
                          <Badge variant="secondary" className="mt-0.5 bg-gray-100/80 text-gray-500 font-normal">
                            {recording.duration}
                          </Badge>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group heading="Commands" className="pt-2 border-t border-gray-100">
                    {commands.map((command, index) => (
                      <Command.Item
                        key={command.id}
                        value={command.title}
                        onSelect={handleSelect}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg 
                          text-gray-700 text-sm cursor-pointer 
                          ${
                            selectedIndex === index + recentRecordings.length
                              ? 'bg-gray-100/80'
                              : 'hover:bg-gray-100/80'
                          } 
                          group
                        `}
                        data-cmdk-item
                      >
                        <command.icon className="w-4 h-4 text-gray-500 group-hover:text-[#6938EF] transition-colors" />
                        <span className="font-medium group-hover:text-gray-900 transition-colors flex-1">
                          {command.title}
                        </span>
                        {command.shortcut && (
                          <span className="text-xs text-gray-400 select-none">
                            {command.shortcut}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </>
              )}
            </Command.List>

            <div className="border-t border-gray-100 px-3 py-2.5 text-xs text-gray-500 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-gray-600 font-medium shadow-sm border border-gray-200">⌘K</kbd>
                <span>open command menu</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-gray-600 font-medium shadow-sm border border-gray-200">ESC</kbd>
                <span>close menu</span>
              </div>
            </div>
          </Command>
        </motion.div>
      )}
    </AnimatePresence>
  )
}