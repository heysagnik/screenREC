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

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-sm text-gray-500 mb-1">Settings</h1>
        <h2 className="text-2xl font-semibold text-gray-900">Customize your experience</h2>
      </div>

      <div className="flex gap-8">
        <nav className="w-56 flex-shrink-0">
          <div className="space-y-1">
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

        <div className="flex-1">
          {children}
        </div>
      </div>
    </main>
  )
}