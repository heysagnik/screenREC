import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Library | Zapd',
    description: 'Record, manage and share your Zaps (screen recordings) easily',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: 'Library | Zapd',
      description: 'Record, manage and share your Zaps (screen recordings) easily',
      type: 'website',
      siteName: 'ScreenREC'
    }
  }

export default function ZapsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}