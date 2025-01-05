import Image from "next/image"
import ZappdButton from "./zapd-button"

export function EmptyState() {
  return (
    <div className="
      flex flex-col items-center justify-center 
      min-h-[300px] sm:min-h-[400px] 
      max-w-lg mx-auto 
      p-6 sm:p-8 md:p-12
      text-center
    ">
      <Image 
        src="/image.png" 
        alt="Start Recording" 
        width={200} 
        height={200} 
        quality={100}
        className="
          w-32 h-32
          sm:w-40 sm:h-40 
          md:w-48 md:h-48 
          mb-4 sm:mb-6 
          drop-shadow-md
          transition-transform duration-200
          hover:scale-105
        "
      />
      
      <h3 className="
        text-xl sm:text-2xl 
        font-semibold 
        tracking-tight 
        mb-2 
        text-gray-900
      ">
        Record your first Zap
      </h3>
      
      <p className="
        text-gray-500 
        text-center 
        mb-6 sm:mb-8 
        max-w-[280px] sm:max-w-md 
        text-sm
      ">
        Share your thoughts instantly by recording your screen. Perfect for quick updates, feedback, and tutorials.
      </p>

      <ZappdButton text="Record a new Zap"/>
    </div>
  )
}