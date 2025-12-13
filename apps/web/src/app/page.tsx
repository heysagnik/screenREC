'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, Monitor } from 'lucide-react';

const COLORS = {
  hero: '#f5c896',
  cardBlue: '#dbeafe',
  cardPurple: '#ede9fe',
  cardGreen: '#d1fae5',
} as const;

const NOISE_TEXTURE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;


/** Noise texture overlay for premium backgrounds */
function NoiseOverlay({ opacity = 0.4 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 mix-blend-overlay pointer-events-none"
      style={{ backgroundImage: NOISE_TEXTURE_SVG, opacity }}
    />
  );
}

/** GitHub icon SVG */
function GitHubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Shield icon for privacy section */
function ShieldIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

/** Play icon for CTA button */
function PlayIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.38 2.792-1.645l11.54 6.348c1.263.733 1.263 2.57 0 3.303l-11.54 6.347c-1.263.733-2.792-.217-2.792-1.646V5.653Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Feature card wrapper with consistent styling */
function FeatureCard({
  bgColor,
  children,
}: {
  bgColor: string;
  children: React.ReactNode;
}) {
  return (
    <article className="group relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[440px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.02] active:scale-[1.01]">
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      <NoiseOverlay />
      {children}
    </article>
  );
}

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isSmallScreen = window.innerWidth < 768;
      const isTouchOnly = navigator.maxTouchPoints > 0 && !window.matchMedia('(hover: hover)').matches;
      
      setIsMobile(isMobileUA || (isSmallScreen && isTouchOnly));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

function MobileWarningModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 mx-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full mx-auto mb-3 sm:mb-4">
          <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
        </div>
        
        <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2 sm:mb-3">
          Desktop Required
        </h2>
        
        <p className="text-sm sm:text-base text-gray-600 text-center mb-5 sm:mb-6 leading-relaxed">
          ScreenREC uses advanced browser APIs that are only available on desktop browsers. Please visit this site on a desktop or laptop computer to start recording.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-blue-900">
              <p className="font-medium mb-0.5 sm:mb-1">Supported browsers:</p>
              <p className="text-blue-700">Chrome, Edge, Firefox, Safari (desktop versions)</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 sm:py-3 bg-gray-900 hover:bg-black active:bg-black text-white rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function RecordingButton({ className, children }: { className: string; children: React.ReactNode }) {
  const isMobile = useMobileDetection();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <>
      <Link
        href="/record"
        onClick={handleClick}
        className={className}
      >
        {children}
      </Link>
      <MobileWarningModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="fixed left-0 right-0 z-50 flex justify-center px-3 sm:px-4 lg:px-6"
        style={{ top: 12 }}
      >
        <nav
          className="flex h-[48px] sm:h-[52px] w-full max-w-3xl items-center justify-between rounded-[24px] sm:rounded-[26px] px-3 sm:px-4 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.8)]"
          style={{ background: 'linear-gradient(180deg, #fff6 10%, #fffc)' }}
          aria-label="Main navigation"
        >
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
            <Image src="/logo.png" alt="ScreenREC Logo" width={28} height={28} className="h-6 sm:h-7 w-auto" />
            <span className="text-sm sm:text-[15px] font-bold tracking-tight text-gray-900">
              ScreenREC
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/heysagnik/screenREC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-[15px] text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="View on GitHub"
            >
              <GitHubIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <RecordingButton className="inline-flex items-center justify-center rounded-full bg-black h-8 sm:h-9 px-3.5 sm:px-5 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 transition-colors whitespace-nowrap">
              Start Recording
            </RecordingButton>
          </div>
        </nav>
      </header>

      <section
        className="relative flex min-h-[85vh] sm:min-h-[88vh] md:min-h-[92vh] flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 py-20 sm:py-24"
        style={{ backgroundColor: COLORS.hero }}
        aria-labelledby="hero-heading"
      >
        <NoiseOverlay opacity={0.35} />

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
        />

        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-15 pointer-events-none w-full max-w-[1200px] h-auto"
          width="1200"
          height="400"
          viewBox="0 0 1200 400"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M50 350 Q200 150 400 280 T750 200 T1000 300 T1150 250"
            stroke="white"
            strokeWidth="100"
            strokeLinecap="round"
          />
          <path
            d="M100 380 Q250 200 450 320 T800 240 T1050 340"
            stroke="white"
            strokeWidth="70"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        <div className="z-20 flex flex-col items-center gap-4 sm:gap-5 md:gap-6 text-center px-4 sm:px-6">
          <h1
            id="hero-heading"
            className="font-display text-[clamp(2.5rem,10vw,6.25rem)] sm:text-[clamp(3.5rem,8vw,5rem)] md:text-[clamp(4rem,7vw,6.25rem)] leading-[0.95] text-gray-900 max-w-5xl uppercase"
          >
            Record Crazy Videos
            <br /> in secs
          </h1>
          <p className="text-gray-700/80 text-base sm:text-lg md:text-xl max-w-md sm:max-w-lg mt-1 sm:mt-2 leading-relaxed">
            No installs. No accounts. Just record.
          </p>

          <RecordingButton className="mt-4 sm:mt-6 inline-flex items-center justify-center rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-medium text-gray-900 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
            <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Start Recording
          </RecordingButton>
        </div>
      </section>

      <section id="features" className="px-3 sm:px-4 md:px-6 py-16 sm:py-20 md:py-28 lg:py-32" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl">
          <header className="text-center mb-10 sm:mb-12 md:mb-14">
            <span className="text-xs sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 uppercase">
              Features
            </span>
            <h2
              id="features-heading"
              className="font-display mt-3 sm:mt-4 text-[clamp(1.75rem,6vw,3.5rem)] sm:text-[clamp(2.25rem,5vw,3rem)] md:text-[clamp(2.5rem,4.5vw,3.5rem)] leading-[1.05] tracking-tight text-gray-900 uppercase px-4"
            >
              Everything You Need
              <br className="hidden sm:block" /> to Create Amazing Videos
            </h2>
            <p className="mt-4 sm:mt-5 text-gray-600 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-4">
              Record your screen, add your camera, and share with the world — all from your browser
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <FeatureCard bgColor={COLORS.cardBlue}>
              <div className="relative z-10 p-4 sm:p-5 md:p-6 pt-6 sm:pt-7 md:pt-8 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recording Modes</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Screen, camera, or both —
                  <br />picture-in-picture made easy
                </p>
              </div>

              <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                <div className="relative w-full max-w-[220px] sm:max-w-[240px] md:max-w-[260px] aspect-[4/3] bg-white/60 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/60 shadow-2xl overflow-hidden group-hover:scale-[1.03] transition-transform duration-500">
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 opacity-80">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600/10" />
                      <div className="flex-1 space-y-1.5 sm:space-y-2 py-0.5 sm:py-1">
                        <div className="h-1.5 sm:h-2 w-2/3 bg-blue-900/10 rounded-full" />
                        <div className="h-1.5 sm:h-2 w-full bg-blue-900/5 rounded-full" />
                      </div>
                    </div>
                    <div className="h-16 sm:h-20 rounded-lg bg-blue-600/5 border border-blue-600/10" />
                  </div>

                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-16 h-12 sm:w-20 sm:h-14 bg-gray-900 rounded-md sm:rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)] border-2 border-white flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-end justify-center overflow-hidden">
                      <div className="w-5 h-2.5 sm:w-6 sm:h-3 bg-gray-500 rounded-t-full" />
                    </div>
                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard bgColor={COLORS.cardPurple}>
              <div className="relative z-10 p-4 sm:p-5 md:p-6 pt-6 sm:pt-7 md:pt-8 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Resolution & Export</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Up to 4K quality with
                  <br />multiple export formats
                </p>
              </div>

              <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                <div className="relative w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] h-[140px] sm:h-[150px] md:h-[160px]">
                  <div className="absolute left-0 top-1 sm:top-2 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 w-[120px] sm:w-[130px] md:w-[140px] -rotate-3 border border-white/50 group-hover:-rotate-1 group-hover:-translate-y-1 transition-all duration-300">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-2 sm:mb-3">Resolution</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {['720p HD', '1080p Full HD', '4K Ultra HD'].map((item, i) => (
                        <div key={item} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                          <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${i === 2 ? 'bg-violet-500' : 'bg-gray-200'}`} />
                          <span className={i === 2 ? 'text-gray-900 font-medium' : 'text-gray-500'}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute right-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 w-[120px] sm:w-[130px] md:w-[140px] rotate-3 border border-white/50 group-hover:rotate-1 group-hover:-translate-y-1 transition-all duration-300">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-2 sm:mb-3">Export Format</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {['MP4 (H.264)', 'WebM (VP9)', 'GIF'].map((item, i) => (
                        <div key={item} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                          <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded ${i === 0 ? 'bg-violet-500' : 'bg-gray-200'}`} />
                          <span className={i === 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard bgColor={COLORS.cardGreen}>
              <div className="relative z-10 p-4 sm:p-5 md:p-6 pt-6 sm:pt-7 md:pt-8 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Privacy & Open Source</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-700/90 leading-relaxed max-w-xs mx-auto">
                  100% client-side processing — your data never leaves your browser
                </p>
              </div>

              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-5 md:px-6 pb-6 sm:pb-7 md:pb-8 gap-5 sm:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-[20px] sm:rounded-[24px] blur-xl group-hover:bg-emerald-400/30 transition-colors duration-500" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm rounded-[18px] sm:rounded-[22px] shadow-[0_8px_32px_rgba(16,185,129,0.15),0_2px_8px_rgba(0,0,0,0.05)] border-2 border-white/80 flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_16px_48px_rgba(16,185,129,0.25),0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <ShieldIcon className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[280px]">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-3 py-2 sm:px-3.5 sm:py-2.5 border border-white/60 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5 transition-all duration-300">
                    <GitHubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                    <span className="text-[11px] sm:text-xs font-medium text-gray-700">Open source</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-50/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-[0_2px_12px_rgba(16,185,129,0.08)] px-3 py-2 sm:px-3.5 sm:py-2.5 border border-emerald-100/60 group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)] group-hover:-translate-y-0.5 transition-all duration-300">
                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-emerald-900">Local only</span>
                  </div>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>
    </div>
  );
}
