"use client"

import { Bell, User, Keyboard, HardDrive, Video, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { id: 'account', label: 'Account', icon: User, path: '/settings/account' },
  { id: 'recording', label: 'Recording', icon: Video, path: '/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard, path: '#' },
  { id: 'storage', label: 'Storage', icon: HardDrive, path: '/settings/storage' },
  { id: 'privacy', label: 'Privacy', icon: Shield, path: '#' },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="sm:hidden -mx-3 px-3 overflow-x-auto">
        <div className="flex gap-2 min-w-full pb-4">
          {sections.map(({ id, label, icon: Icon, path }) => (
            <Link
              key={id}
              href={path}
              className={`
                flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg
                flex items-center gap-2 transition-colors duration-200
                whitespace-nowrap
                ${pathname === path 
                  ? 'bg-[#6938EF]/5 text-[#6938EF]' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
                ${path === '#' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={(e) => path === '#' && e.preventDefault()}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden sm:block w-56 flex-shrink-0">
        <div className="space-y-1 sticky top-20">
          {sections.map(({ id, label, icon: Icon, path }) => (
            <Link
              key={id}
              href={path}
              className={`
                w-full px-4 py-2 text-sm font-medium rounded-lg
                flex items-center gap-3 transition-colors duration-200
                ${pathname === path 
                  ? 'bg-[#6938EF]/5 text-[#6938EF]' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
                ${path === '#' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={(e) => path === '#' && e.preventDefault()}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}