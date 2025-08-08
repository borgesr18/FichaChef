#!/bin/bash

# 🔧 Script de Correção de Loops - Sistema FichaChef
# Versão: 1.0
# Data: Janeiro 2025

echo "🔧 Iniciando correção de problemas de looping no FichaChef..."
echo "📅 $(date)"
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script na pasta raiz do projeto FichaChef-main"
    echo "📍 Pasta atual: $(pwd)"
    echo "💡 Use: cd FichaChef-main && bash script_correcao_loops.sh"
    exit 1
fi

echo "✅ Pasta do projeto detectada: $(pwd)"
echo ""

# Fase 1: Backup
echo "📦 FASE 1: Criando backup dos arquivos..."
mkdir -p backup_original
cp middleware.ts backup_original/ 2>/dev/null || echo "⚠️  middleware.ts não encontrado"
cp src/app/layout.tsx backup_original/ 2>/dev/null || echo "⚠️  layout.tsx não encontrado"
cp src/components/LoginPageContent.tsx backup_original/ 2>/dev/null || echo "⚠️  LoginPageContent.tsx não encontrado"
echo "✅ Backup criado em: backup_original/"
echo ""

# Fase 2: Correção do Service Worker (Crítica)
echo "🚫 FASE 2: Desabilitando Service Worker temporariamente..."

if [ -f "src/app/layout.tsx" ]; then
    # Criar versão corrigida do layout
    cat > src/app/layout.tsx << 'EOF'
import type { Metadata, Viewport } from "next";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DebugPanel from "@/components/DebugPanel";
import "./globals.css";

export const metadata: Metadata = {
  title: "FichaChef - Sistema de Gestão Gastronômica",
  description: "Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais",
  keywords: ["ficha técnica", "gestão gastronômica", "controle estoque", "cozinha profissional", "receitas"],
  authors: [{ name: "FichaChef Team" }],
  creator: "FichaChef",
  publisher: "FichaChef",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FichaChef"
  },
  openGraph: {
    title: "FichaChef - Sistema de Gestão Gastronômica",
    description: "Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/icons/icon.png",
        width: 512,
        height: 512,
        alt: "FichaChef Logo"
      }
    ]
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#5AC8FA' },
    { media: '(prefers-color-scheme: dark)', color: '#1B2E4B' }
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover'
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Favicon tradicional */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Favicons PNG para diferentes tamanhos */}
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
        
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FichaChef" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1B2E4B" />
        <meta name="msapplication-TileImage" content="/icon.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#5AC8FA" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 🚫 SERVICE WORKER DESABILITADO TEMPORARIAMENTE */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔧 [CORREÇÃO] Service Worker desabilitado para corrigir loops');
              console.log('📍 [CORREÇÃO] Timestamp:', new Date().toISOString());
            `
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <SupabaseProvider>
            {children}
            <DebugPanel />
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
EOF
    echo "✅ Service Worker desabilitado no layout.tsx"
else
    echo "❌ Arquivo layout.tsx não encontrado"
fi
echo ""

# Fase 3: Correção do Middleware
echo "🔒 FASE 3: Corrigindo middleware para desenvolvimento..."

if [ -f "middleware.ts" ]; then
    cat > middleware.ts << 'EOF'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // ✅ ROTAS QUE NUNCA DEVEM SER INTERCEPTADAS
  const neverIntercept = [
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
    '/icon.png',
    '/icon',
    '/_next/',
    '/api/',
    '/login',
    '/register',
    '/reset-password',
    '/auth/',
    '/public/'
  ]

  // ✅ VERIFICAÇÃO IMEDIATA
  for (const route of neverIntercept) {
    if (pathname.startsWith(route) || pathname === route) {
      console.log('🚫 [MIDDLEWARE] Rota não interceptada:', pathname)
      return response
    }
  }

  // 🔧 VERIFICAÇÃO MELHORADA DE DESENVOLVIMENTO
  const isDevelopment = process.env.NODE_ENV === 'development'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isSupabaseConfigured = !!(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseKey !== 'placeholder-key' &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder') &&
    supabaseUrl.length > 20 &&
    supabaseKey.length > 20
  )

  // 🔓 EM DESENVOLVIMENTO OU SEM SUPABASE, SEMPRE PERMITIR
  if (isDevelopment || !isSupabaseConfigured) {
    console.log('🔓 [MIDDLEWARE] Acesso livre:', { 
      isDevelopment, 
      isSupabaseConfigured, 
      pathname
    })
    return response
  }

  // ✅ APENAS DASHBOARD PRECISA DE AUTENTICAÇÃO
  if (!pathname.startsWith('/dashboard')) {
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('🔒 [MIDDLEWARE] Redirecionando para login:', pathname)
      if (pathname !== '/login') {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.png).*)',
  ],
}
EOF
    echo "✅ Middleware corrigido"
else
    echo "❌ Arquivo middleware.ts não encontrado"
fi
echo ""

# Fase 4: Verificar variáveis de ambiente
echo "🔍 FASE 4: Verificando configuração..."

if [ -f ".env" ]; then
    echo "📄 Arquivo .env encontrado"
    if grep -q "placeholder" .env; then
        echo "✅ Supabase em modo placeholder (desenvolvimento) - OK"
    else
        echo "⚠️  Supabase configurado - verifique se as credenciais estão corretas"
    fi
else
    echo "⚠️  Arquivo .env não encontrado"
fi
echo ""

# Fase 5: Instruções finais
echo "🎯 FASE 5: Correções aplicadas com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:3000"
echo "3. Teste o login e navegação"
echo "4. Verifique se não há mais loops"
echo ""
echo "🔄 PARA REVERTER (se necessário):"
echo "cp backup_original/* . && cp backup_original/layout.tsx src/app/ && cp backup_original/LoginPageContent.tsx src/components/"
echo ""
echo "✅ CORREÇÃO CONCLUÍDA!"
echo "📞 Se o problema persistir, verifique o console do navegador para erros específicos"
EOF

chmod +x /home/ubuntu/script_correcao_loops.sh

