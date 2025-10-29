"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Star, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

function formatStars(n: number) {
  try {
    // Compact format like 1.2k
    // Fallback to plain number if Intl not available
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return String(n);
  }
}

export default function Header({ showBack = false, backHref = "/" }: HeaderProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const loadStars = async () => {
      try {
        setLoading(true);
        // Client components don't support Next.js revalidate options on fetch
        const res = await fetch("https://api.github.com/repos/heysagnik/screenREC");
        if (!res.ok) throw new Error("Failed to fetch stars");
        const data = await res.json();
        if (mounted) setStars(typeof data.stargazers_count === "number" ? data.stargazers_count : null);
      } catch {
        // ignore - show without count
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadStars();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Brand - Enhanced with better visual hierarchy */}
            <Link href="/" className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 shadow-sm ring-1 ring-black/5 transition-all group-hover:shadow-md group-hover:from-zinc-800 group-hover:to-zinc-600">
                <Video className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </span>
              {!showBack && (
                <span className="text-base font-bold tracking-tight text-gray-900 hidden sm:inline">
                  SCREENREC
                </span>
              )}
            </Link>

            {showBack && <span className="h-5 w-px bg-gray-300/70" aria-hidden="true" />}

            {showBack && (
              <button
                onClick={() => (backHref ? router.push(backHref) : router.back())}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
                aria-label="Go back"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* GitHub Star Button - More refined */}
          <a
            href="https://github.com/heysagnik/screenREC"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={stars ? `Star on GitHub (${stars} stars)` : "Star on GitHub"}
            className="group inline-flex items-center overflow-hidden rounded-full border border-black/10 bg-black text-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            <span className="flex h-9 w-9 items-center justify-center transition-colors group-hover:bg-black/80">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="h-9 w-px bg-white/10" aria-hidden="true" />
            <span className="flex items-center gap-2 px-3 pr-4">
              <span className="text-sm font-semibold tabular-nums">
                {loading ? "..." : stars !== null ? formatStars(stars) : "Star"}
              </span>
              <Star className="h-3.5 w-3.5 text-yellow-400 transition-transform group-hover:scale-110" fill="currentColor" strokeWidth={0} />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
