import Image from 'next/image'

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
              alt="Loom" 
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

