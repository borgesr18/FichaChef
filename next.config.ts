import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://vercel.live https://*.vercel.live https://*.vercel-insights.com https://*.vercel-analytics.com https://*.pusher.com wss://vercel.live wss://*.vercel.live wss://*.pusher.com http://localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.live https://*.vercel-insights.com https://*.vercel-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src 'self' https://vercel.live https://*.vercel.live; worker-src 'self' blob:; manifest-src 'self';"
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.live https://*.vercel-insights.com https://*.vercel-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://vercel.live https://*.vercel.live https://*.vercel-insights.com https://*.vercel-analytics.com https://*.pusher.com wss://vercel.live wss://*.vercel.live wss://*.pusher.com; frame-src 'self' https://vercel.live https://*.vercel.live; worker-src 'self' blob:; manifest-src 'self';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
