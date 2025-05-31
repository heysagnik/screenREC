"use client";

import React from "react";
import {  StopCircle, Circle } from "lucide-react";

interface ControlBarProps {
  screenActive: boolean;
  isRecording: boolean;
  onRecordClick: () => void;

}

export default function ControlBar({
  screenActive,
 
  isRecording,
  onRecordClick,
}: ControlBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-10 px-4">
        {/* Record button */}
        <div className="flex flex-col items-center">
          <button
            onClick={onRecordClick}
            disabled={!screenActive}
            className={`h-14 w-14 ${!screenActive ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'} rounded-full flex items-center justify-center shadow-lg transition-all`}
          >
            {isRecording ? (
              <StopCircle className="h-6 w-6 text-white" />
            ) : (
              <Circle className="h-6 w-6 text-white" />
            )}
          </button>
          <span className="text-xs text-white/80 mt-1">
            {isRecording ? "Stop" : "Record"}
          </span>
        </div>
      </div>
    </div>
  );
}