import React from 'react';
import Link from 'next/link';
import Zapd from './logo';

interface ZapdButtonProps {
  text?: string;
}

const ZapdButton = ({ text = 'Record Zap' }: ZapdButtonProps) => {
  return (
    <Link href="/new">
      <button
        className="
          group
          inline-flex items-center gap-2
          px-5 py-2
          bg-gradient-to-r from-[#6938EF] to-[#6938EF]/90
          hover:from-[#6938EF]/90 hover:to-[#6938EF]/80
          text-white font-medium text-sm
          rounded-full
          shadow-sm hover:shadow-md
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50 focus:ring-offset-2
          active:scale-[0.98]
          border border-[#6938EF]/10
          relative
          overflow-hidden
          before:absolute before:inset-0
          before:bg-gradient-to-b before:from-white/[0.00] before:to-white/[0.12]
        "
      >
        <Zapd className="w-4 h-4 transition-transform group-hover:scale-110" />
        {text}
      </button>
    </Link>
  );
};

export default ZapdButton;