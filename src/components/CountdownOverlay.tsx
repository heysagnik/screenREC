'use client';

interface CountdownOverlayProps {
  count: number;
}

export default function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="text-white text-8xl font-bold animate-pulse">
          {count}
        </div>
        <p className="text-white text-xl font-medium">
          Recording starts in...
        </p>
      </div>
    </div>
  );
}