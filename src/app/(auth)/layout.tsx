import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: {
    template: '%s | Zappd',
    default: 'Get Started | Zappd'
  },
  description: 'Record, manage and share your screen recordings',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Zappd',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-[400px] mx-auto p-6">
        <div className="mb-6 flex justify-center">
          <Image 
            src="/logomark.svg" 
            alt="Zappd" 
            width={40} 
            height={40}
            className="flex items-center justify-center"
          />
        </div>
        {children}
      </div>
    </div>
  )
}