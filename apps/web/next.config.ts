import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable SharedArrayBuffer for FFmpeg.wasm
  // Required headers for cross-origin isolation
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
      },
    ],
  },
};

export default nextConfig;
