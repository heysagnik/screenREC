'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Minimal Hero Section (light mode) */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 md:px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex flex-col text-center gap-y-3 px-4 md:px-0">
            <h1 className="text-[48px] leading-[43.2px] md:text-[64px] md:leading-[57.6px] lg:text-[80px] lg:leading-[72px] font-black tracking-tight text-gray-900">
              <span className="block">
                Record{' '}
                <span className="relative inline-block align-baseline">
                    <span className="relative inline-block px-2 py-1">
                    <span className="relative z-10">SCREENS</span>
                    {/* Corner focus frame (static) */}
                    <span aria-hidden className="pointer-events-none absolute left-0 top-0 z-0">
                      <span className="block h-[2px] w-5 bg-gray-900"></span>
                      <span className="block h-5 w-[2px] bg-gray-900"></span>
                    </span>
                    <span aria-hidden className="pointer-events-none absolute right-0 top-0 z-0">
                      <span className="block h-[2px] w-5 bg-gray-900 ml-auto"></span>
                      <span className="block h-5 w-[2px] bg-gray-900 ml-auto"></span>
                    </span>
                    <span aria-hidden className="pointer-events-none absolute left-0 bottom-0 z-0">
                      <span className="block h-5 w-[2px] bg-gray-900 mt-auto"></span>
                      <span className="block h-[2px] w-5 bg-gray-900"></span>
                    </span>
                    <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 z-0">
                      <span className="block h-5 w-[2px] bg-gray-900 ml-auto mt-auto"></span>
                      <span className="block h-[2px] w-5 bg-gray-900 ml-auto"></span>
                    </span>
                    {/* Recording dot with blink animation */}
                    <span aria-hidden className="absolute top-1 right-1 z-10 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_#fff] animate-pulse"></span>
                    </span>
                </span>
              </span>
                  <span className="block">instantly.</span>
            </h1>
            <br />
            <p className="tracking-[-0.24px] lg:text-[20px] lg:leading-6 lg:tracking-[-0.3px] text-[20px] text-gray-600">
              ScreenREC makes raw captures look like releases.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-y-5 px-4 md:px-0">
            <div className="flex flex-col md:w-max w-full md:flex-row gap-4">
              <Link
                href="/record"
                className="group relative w-full md:w-max h-20 rounded-full bg-gradient-to-r from-indigo-500 to-[#8078FD] text-white text-[16px] lg:text-[20px] font-medium tracking-[-0.24px] lg:tracking-[-0.3px] flex items-center justify-center px-10 transition brightness-100 hover:brightness-110"
              >
                <span className="flex flex-row items-center transition duration-75 ease-in-out group-active:scale-95">
                  Record Now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="ml-2 h-6 w-6"
                  >
                    <g clipPath="url(#clip0)">
                      <path d="M31.7261 15.9148C25.2964 15.9148 20.0781 10.5769 20.0781 3.99988" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" />
                      <path d="M31.7261 15.9149C25.2964 15.9149 20.0781 21.2528 20.0781 27.8298" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" />
                      <path d="M32 15.9147L0 15.9147" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" />
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
              </Link>
            </div>
           
          </div>
        </div>
      </main>
    </div>
  );
}
