import { Metadata } from 'next'
import Image from 'next/image'
import { headers } from 'next/headers'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  const isSignUp = pathname.includes('signup')
  const title = isSignUp ? 'Sign Up' : 'Sign In'
  
  return {
    title: `${title} | Zappd`,
    description: `${title} to Zappd to record, manage and share your screen recordings`,
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: `${title} | Zappd`,
      description: `${title} to Zappd to record, manage and share your screen recordings`,
      type: 'website',
      siteName: 'Zappd',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Zappd`,
      description: `${title} to Zappd to record, manage and share your screen recordings`,
    },
    robots: {
      index: true,
      follow: true,
    }
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
              className=" flex items-center justify-center"
            />
          
        </div>
        {children}
      </div>
    </div>
  )
}