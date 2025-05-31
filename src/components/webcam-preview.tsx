"use client";

import { useEffect, useRef } from "react";

interface WebcamPreviewProps {
  stream: MediaStream | null;
}

export default function WebcamPreview({ stream }: WebcamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="absolute top-4 right-4 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg w-64 h-48">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 right-2 bg-black/40 rounded-full p-1">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 11V8C18 6.34 16.66 5 15 5H5C3.34 5 2 6.34 2 8V16C2 17.66 3.34 19 5 19H15C16.66 19 18 17.66 18 16V13L22 17V7L18 11Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}