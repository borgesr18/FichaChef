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

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuração específica para @jridgewell modules apenas em produção
    if (!dev) {
      config.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules\/@jridgewell/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      })
    }

    return config
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de performance
  poweredByHeader: false,
  compress: true,
  
  // Configurações de build (apenas para produção)
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  
  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
