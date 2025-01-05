import { Header } from "@/components/header"

interface RootLayoutProps {
  children: React.ReactNode
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