"use client";

import React from "react";

interface RecordingTimerProps {
  time: number;
}

export default function RecordingTimer({ time }: RecordingTimerProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <span className="text-white font-medium">
      {formatTime(time)}
    </span>
  );
}