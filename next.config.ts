import type { NextConfig } from "next";
import path from 'path';
import { getCSPHeader } from './src/lib/csp-config';

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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Content-Security-Policy',
            value: getCSPHeader(),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // ✅ CRÍTICO: Headers específicos para arquivos PWA
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 horas
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate', // Sempre verificar atualizações
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/(icon\\.png|favicon\\.ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 ano
          },
        ],
      },
    ]
  },
  
  images: {
    domains: ['localhost', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ✅ Configurações PWA
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  // ✅ Configurações de build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ Configurações de performance
  compress: true,
  
  poweredByHeader: false,

  // ✅ Configurações de rewrite para PWA
  async rewrites() {
    return [
      // ✅ Garantir que manifest.json seja servido corretamente
      {
        source: '/manifest.json',
        destination: '/manifest.json',
      },
      // ✅ Garantir que service worker seja servido corretamente
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ]
  },

  // ✅ Configurações de redirect
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },

  // ✅ Webpack config para PWA
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // ✅ Configurações específicas para PWA
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
