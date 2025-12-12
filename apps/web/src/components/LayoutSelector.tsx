'use client';

import { LayoutGrid, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { RecordingLayout, LAYOUT_OPTIONS } from '@/types/layout';

interface LayoutSelectorProps {
  selectedLayout: RecordingLayout;
  onLayoutChange: (layout: RecordingLayout) => void;
  disabled?: boolean;
}

export default function LayoutSelector({ selectedLayout, onLayoutChange, disabled = false }: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
          disabled
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Select layout"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Layout</h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose your recording layout</p>
          </div>
          <div className="p-2">
            {LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => {
                  onLayoutChange(layout.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-gray-50 ${
                  selectedLayout === layout.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{layout.name}</span>
                    {selectedLayout === layout.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{layout.description}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  {layout.id === 'pip' && (
                    <div className="relative w-10 h-8 bg-gray-300 rounded">
                      <div className="absolute bottom-1 right-1 w-3 h-3 bg-gray-600 rounded"></div>
                    </div>
                  )}
                  {layout.id === 'circle' && (
                    <div className="relative w-10 h-8 bg-gray-300 rounded">
                      <div className="absolute bottom-1 right-1 w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}