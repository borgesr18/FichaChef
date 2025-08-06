/**
 * Configuração dinâmica de Content Security Policy (CSP)
 * para o sistema FichaChef
 */

export interface CSPDirectives {
  'default-src': string[]
  'script-src': string[]
  'style-src': string[]
  'img-src': string[]
  'font-src': string[]
  'connect-src': string[]
  'frame-src': string[]
  'worker-src': string[]
  'manifest-src': string[]
  'object-src': string[]
  'media-src': string[]
}

export const getCSPDirectives = (): CSPDirectives => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const baseDirectives: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      'https://vercel.live',
      'https://*.vercel.live',
      'https://*.vercel-insights.com',
      'https://*.vercel-analytics.com',
      'https://*.pusher.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com'
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://vercel.live',
      'https://*.vercel.live',
      'https://*.vercel-insights.com',
      'https://*.vercel-analytics.com',
      'https://*.pusher.com',
      'wss://vercel.live',
      'wss://*.vercel.live',
      'wss://*.pusher.com'
    ],
    'frame-src': [
      "'self'",
      'https://vercel.live',
      'https://*.vercel.live'
    ],
    'worker-src': [
      "'self'",
      'blob:'
    ],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'media-src': [
      "'self'",
      'data:',
      'blob:'
    ]
  }

  // Adicionar permissões específicas para desenvolvimento
  if (isDevelopment) {
    baseDirectives['connect-src'].push(
      'http://localhost:*',
      'ws://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*'
    )
    baseDirectives['default-src'].push("'unsafe-eval'", "'unsafe-inline'")
  }

  return baseDirectives
}

export const buildCSPString = (directives: CSPDirectives): string => {
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

export const getCSPHeader = (): string => {
  const directives = getCSPDirectives()
  return buildCSPString(directives)
}

