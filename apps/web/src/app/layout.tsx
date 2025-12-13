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
  title: "ScreenREC - A simple web screen recorder",
  description: "With ScreenREC you can easily record your screen. Select video type, press record, review and download it. Easy.",
  applicationName: "ScreenREC",
  appleWebApp: {
    title: "ScreenREC",
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
    title: "ScreenREC - A simple web screen recorder",
    description: "With ScreenREC you can easily record your screen. Select video type, press record, review and download it. Easy.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScreenREC - A simple web screen recorder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScreenREC - A simple web screen recorder",
    description: "With ScreenREC you can easily record your screen. Select video type, press record, review and download it. Easy.",
    images: ["/og-image.png"],
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Umami Analytics */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="5acfb068-682d-4564-8b72-5f732f8271fa"
          strategy="afterInteractive"
        />
        {/* Splitbee Analytics */}
        <Script
          async
          src="https://cdn.splitbee.io/sb.js"
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
