import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sign In | Zapd',
  description: 'Sign in to Zapd to record, manage and share your Zaps(screen recordings)',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Sign In | Zapd',
    description: 'Sign in to Zapd to record, manage and share your Zaps(screen recordings)',
    type: 'website',
    siteName: 'ScreenREC',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In | Zapd',
    description: 'Sign in to Zapd to record, manage and share your Zaps(screen recordings)',
  },
  robots: {
    index: true,
    follow: true,
  }
}

// ...existing layout component...