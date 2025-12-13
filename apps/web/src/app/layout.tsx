import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import InfoButton from "@/components/InfoButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://screen-rec.vercel.app"),
  title: {
    default: "ScreenREC - Free Online Screen Recorder | No Download Required",
    template: "%s | ScreenREC",
  },
  description: "ScreenREC is a free, privacy-first online screen recorder that works directly in your browser. Record your screen, webcam, and audio without installing any software. Perfect for tutorials, presentations, demos, and meetings. No account required, instant recording, and full HD quality.",
  keywords: [
    "screen recorder",
    "free screen recorder",
    "online screen recorder",
    "web screen recorder",
    "record screen online",
    "screen capture",
    "video recorder",
    "webcam recorder",
    "no download screen recorder",
    "browser screen recorder",
    "screen recording tool",
    "record screen and audio",
    "screen recorder with webcam",
    "privacy-first screen recorder",
    "open source screen recorder",
    "tutorial recording",
    "presentation recorder",
    "demo recording software",
    "meeting recorder",
    "loom alternative",
    "free loom alternative",
  ],
  authors: [{ name: "Sagnik Sahoo", url: "https://twitter.com/heysagnik" }],
  creator: "Sagnik Sahoo",
  publisher: "ScreenREC",
  applicationName: "ScreenREC",
  category: "Productivity",
  classification: "Screen Recording Software",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://screen-rec.vercel.app",
  },
  appleWebApp: {
    title: "ScreenREC",
    capable: true,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicons/site.webmanifest",
  openGraph: {
    type: "website",
    url: "https://screen-rec.vercel.app/",
    siteName: "ScreenREC",
    title: "ScreenREC - Free Online Screen Recorder | No Download Required",
    description: "Free, privacy-first online screen recorder. Record your screen, webcam, and audio directly in your browser. No downloads, no accounts, instant recording in full HD quality.",
    locale: "en_US",
    images: [
      {
        url: "/ogimage.png",
        width: 1200,
        height: 630,
        alt: "ScreenREC - Free Online Screen Recorder",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@heysagnik",
    creator: "@heysagnik",
    title: "ScreenREC - Free Online Screen Recorder | No Download Required",
    description: "Free, privacy-first online screen recorder. Record your screen, webcam, and audio directly in your browser. No downloads, no accounts, instant recording.",
    images: ["/ogimage.png"],
  },
  other: {
    "msapplication-TileColor": "#2e2e2e",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ScreenREC",
    "applicationCategory": "MultimediaApplication",
    "applicationSubCategory": "Screen Recording Software",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free, privacy-first online screen recorder that works directly in your browser. Record your screen, webcam, and audio without installing any software.",
    "featureList": [
      "Screen recording",
      "Webcam recording",
      "Audio recording (microphone and system audio)",
      "No installation required",
      "No account required",
      "Privacy-first approach",
      "HD quality recording",
      "Browser-based recording",
      "Instant playback",
      "Easy download"
    ],
    "softwareVersion": "2.0",
    "url": "https://screen-rec.vercel.app",
    "author": {
      "@type": "Person",
      "name": "Sagnik Sahoo",
      "url": "https://twitter.com/heysagnik"
    },
    "creator": {
      "@type": "Person",
      "name": "Sagnik Sahoo",
      "url": "https://twitter.com/heysagnik"
    },
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "permissions": "Requires permission to access screen, camera, and microphone"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="5acfb068-682d-4564-8b72-5f732f8271fa"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <InfoButton />
      </body>
    </html>
  );
}
