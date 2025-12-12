import Link from 'next/link';
import Image from 'next/image';

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
    <article className="group relative rounded-3xl overflow-hidden min-h-[360px] md:min-h-[440px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.02]">
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      <NoiseOverlay />
      {children}
    </article>
  );
}

/** Badge component for privacy card */
function Badge({
  children,
  position,
  hoverDirection = 'left',
}: {
  children: React.ReactNode;
  position: string;
  hoverDirection?: 'left' | 'right';
}) {
  const hoverClass = hoverDirection === 'left' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1';
  return (
    <div
      className={`absolute ${position} bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-xs font-medium text-gray-700 border border-white/50 flex items-center gap-2 ${hoverClass} transition-transform duration-300`}
    >
      {children}
    </div>
  );
}


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="fixed left-0 right-0 z-50 flex justify-center px-4"
        style={{ top: 20 }}
      >
        <nav
          className="flex h-[52px] w-full max-w-3xl items-center justify-between rounded-[26px] px-4 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.8)]"
          style={{ background: 'linear-gradient(180deg, #fff6 10%, #fffc)' }}
          aria-label="Main navigation"
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ScreenREC Logo" width={28} height={28} className="h-7 w-auto" />
            <span className="text-[15px] font-bold tracking-tight text-gray-900">
              ScreenREC
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/heysagnik/screenREC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[15px] text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="View on GitHub"
            >
              <GitHubIcon />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link
              href="/record"
              className="inline-flex items-center justify-center rounded-full bg-black h-9 px-5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              Start Recording
            </Link>
          </div>
        </nav>
      </header>

      {/* ====== Hero Section ====== */}
      <section
        className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden rounded-3xl mx-4 md:mx-6 mt-4"
        style={{ backgroundColor: COLORS.hero }}
        aria-labelledby="hero-heading"
      >
        <NoiseOverlay opacity={0.35} />

        {/* Gradient overlay for depth */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
        />

        {/* Decorative brush strokes */}
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-15 pointer-events-none"
          width="1200"
          height="400"
          viewBox="0 0 1200 400"
          fill="none"
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

        {/* Hero Content */}
        <div className="z-20 flex flex-col items-center gap-6 text-center px-6">
          <h1
            id="hero-heading"
            className="font-display text-[56px] md:text-[80px] lg:text-[100px] leading-[0.95] text-gray-900 max-w-4xl uppercase"
          >
            Record Crazy Videos
            <br /> in secs
          </h1>
          <p className="text-gray-700/80 text-lg md:text-xl max-w-md mt-2">
            No installs. No accounts. Just record.
          </p>

          <Link
            href="/record"
            className="mt-6 inline-flex items-center justify-center rounded-full h-14 px-10 text-lg font-medium text-gray-900 transition-all hover:scale-[1.02] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
          >
            <PlayIcon className="w-6 h-6 mr-2" />
            Start Recording
          </Link>
        </div>
      </section>

      {/* ====== Features Section ====== */}
      <section id="features" className="px-4 md:px-6 py-20 md:py-32" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <header className="text-center mb-14">
            <span className="text-sm font-medium tracking-[0.2em] text-gray-500 uppercase">
              Features
            </span>
            <h2
              id="features-heading"
              className="font-display mt-4 text-[36px] md:text-[48px] lg:text-[56px] leading-[1.05] tracking-tight text-gray-900 uppercase"
            >
              Everything You Need
              <br className="hidden sm:block" /> to Create Amazing Videos
            </h2>
            <p className="mt-5 text-gray-600 max-w-xl mx-auto text-base md:text-lg">
              Record your screen, add your camera, and share with the world — all from your browser
            </p>
          </header>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Recording Modes */}
            <FeatureCard bgColor={COLORS.cardBlue}>
              <div className="relative z-10 p-6 pt-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Recording Modes</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Screen, camera, or both —
                  <br />picture-in-picture made easy
                </p>
              </div>

              <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-6">
                <div className="relative w-full max-w-[260px] aspect-[4/3] bg-white/60 backdrop-blur-md rounded-xl border border-white/60 shadow-2xl overflow-hidden group-hover:scale-[1.03] transition-transform duration-500">
                  {/* Mock screen content */}
                  <div className="p-4 space-y-3 opacity-80">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-2 w-2/3 bg-blue-900/10 rounded-full" />
                        <div className="h-2 w-full bg-blue-900/5 rounded-full" />
                      </div>
                    </div>
                    <div className="h-20 rounded-lg bg-blue-600/5 border border-blue-600/10" />
                  </div>

                  {/* PiP camera overlay */}
                  <div className="absolute bottom-3 right-3 w-20 h-14 bg-gray-900 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)] border-2 border-white flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-end justify-center overflow-hidden">
                      <div className="w-6 h-3 bg-gray-500 rounded-t-full" />
                    </div>
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Card 2: Resolution & Export */}
            <FeatureCard bgColor={COLORS.cardPurple}>
              <div className="relative z-10 p-6 pt-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Resolution & Export</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Up to 4K quality with
                  <br />multiple export formats
                </p>
              </div>

              <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-6">
                <div className="relative w-full max-w-[240px] h-[160px]">
                  {/* Resolution options */}
                  <div className="absolute left-0 top-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 w-[140px] -rotate-3 border border-white/50 group-hover:-rotate-1 group-hover:-translate-y-1 transition-all duration-300">
                    <p className="text-xs font-semibold text-gray-900 mb-3">Resolution</p>
                    <div className="space-y-2">
                      {['720p HD', '1080p Full HD', '4K Ultra HD'].map((item, i) => (
                        <div key={item} className="flex items-center gap-2 text-xs">
                          <span className={`h-2.5 w-2.5 rounded-full ${i === 2 ? 'bg-violet-500' : 'bg-gray-200'}`} />
                          <span className={i === 2 ? 'text-gray-900 font-medium' : 'text-gray-500'}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export formats */}
                  <div className="absolute right-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 w-[140px] rotate-3 border border-white/50 group-hover:rotate-1 group-hover:-translate-y-1 transition-all duration-300">
                    <p className="text-xs font-semibold text-gray-900 mb-3">Export Format</p>
                    <div className="space-y-2">
                      {['MP4 (H.264)', 'WebM (VP9)', 'GIF'].map((item, i) => (
                        <div key={item} className="flex items-center gap-2 text-xs">
                          <span className={`h-2.5 w-2.5 rounded ${i === 0 ? 'bg-violet-500' : 'bg-gray-200'}`} />
                          <span className={i === 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Card 3: Privacy & Open Source */}
            <FeatureCard bgColor={COLORS.cardGreen}>
              <div className="relative z-10 p-6 pt-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Privacy & Open Source</h3>
                <p className="mt-2 text-sm text-gray-700">
                  100% client-side processing —
                  <br />your data never leaves your browser
                </p>
              </div>

              <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-6">
                <div className="relative flex items-center justify-center">
                  {/* Left badge */}
                  <Badge position="-left-28 top-[30%] -translate-y-1/2">
                    <GitHubIcon className="w-4 h-4" />
                    Open source
                  </Badge>

                  {/* Shield icon */}
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 flex items-center justify-center group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                    <ShieldIcon className="w-8 h-8 text-emerald-600" />
                  </div>

                  {/* Right badge */}
                  <Badge position="-right-24 bottom-[10%]" hoverDirection="right">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Local only
                  </Badge>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>
    </div>
  );
}
