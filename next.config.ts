import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the deployed bundle minimal — critical for Vercel
  output: 'standalone',

  // Exclude heavy server-only packages from the client bundle
  serverExternalPackages: ['@modelcontextprotocol/sdk'],

  // Compress responses to reduce bandwidth usage (helps stay in free tier limits)
  compress: true,

  // Aggressive static asset caching — serve images/fonts/js from CDN
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
