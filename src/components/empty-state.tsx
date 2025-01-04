import Image from "next/image"
import ZapdButton from "./zapd-button"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] max-w-lg mx-auto p-12">
      

      <Image 
        src="/image.png" 
        alt="Start Recording" 
        width={200} 
        height={200} 
        quality={100}
        className="mb-6 drop-shadow-md"
      />
      
      <h3 className="text-2xl font-semibold tracking-tight mb-2 text-gray-900">
        Record your first Zap
      </h3>
      
      <p className="text-gray-500 text-center mb-8 max-w-md text-sm">
        Share your thoughts instantly by recording your screen. Perfect for quick updates, feedback, and tutorials.
      </p>

      
      <ZapdButton text="Record a new Zap"/>
  
    </div>
  )
}