
import { SettingsNav } from "@/components/settings-nav"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Zappd settings and preferences',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Settings',
    description: 'Manage your Zappd settings and preferences',
    type: 'website',
    siteName: 'Zappd',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Settings',
    description: 'Manage your Zappd settings and preferences',
  }
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 animate-in fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-sm text-gray-500 mb-1">Settings</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Customize your experience</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        <SettingsNav />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </main>
  )
}