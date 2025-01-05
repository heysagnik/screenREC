import { Metadata } from 'next'
import { Header } from "@/components/header"

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: {
    template: '%s | Zappd',
    default: 'Library | Zappd'
  },
  description: 'Record, manage and share your screen recordings',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: {
      template: '%s | Zappd',
      default: 'Library | Zappd'
    },
    description: 'Record, manage and share your screen recordings',
    type: 'website',
    siteName: 'Zappd',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s | Zappd',
      default: 'Library | Zappd'
    },
    description: 'Record, manage and share your screen recordings',
  }
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 transition-all duration-200 relative">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}