import type { Metadata, Viewport } from "next";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DebugPanel from "@/components/DebugPanel";
import "./globals.css";

export const metadata: Metadata = {
  title: "FichaChef - Sistema de Gestão Gastronômica",
  description: "Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais",
  keywords: ["ficha técnica", "gestão gastronômica", "controle estoque", "cozinha profissional", "receitas", "PWA"],
  authors: [{ name: "FichaChef Team" }],
  creator: "FichaChef",
  publisher: "FichaChef",
  applicationName: "FichaChef",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
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
    title: "FichaChef",
    startupImage: [
      {
        url: "/icons/icon.png",
        media: "(device-width: 768px) and (device-height: 1024px)"
      }
    ]
  },
  openGraph: {
    title: "FichaChef - Sistema de Gestão Gastronômica",
    description: "Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais",
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: "FichaChef",
    images: [
      {
        url: "/icons/icon.png",
        width: 512,
        height: 512,
        alt: "FichaChef Logo",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FichaChef - Sistema de Gestão Gastronômica",
    description: "Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais",
    images: ["/icons/icon.png"]
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_VERIFICATION || ""
    }
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#5AC8FA' },
    { media: '(prefers-color-scheme: dark)', color: '#1B2E4B' }
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* ✅ Favicon tradicional */}
        <link rel="icon" href="/icons/favicon.ico" />
        
        {/* ✅ Favicons PNG para diferentes tamanhos */}
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon.png" />
        
        {/* ✅ Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon.png" />
        
        {/* ✅ Android Chrome Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon.png" />
        
        {/* ✅ PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* ✅ Theme Colors UXPilot */}
        <meta name="theme-color" content="#5AC8FA" />
        <meta name="msapplication-TileColor" content="#1B2E4B" />
        <meta name="msapplication-TileImage" content="/icons/icon.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* ✅ PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FichaChef" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* ✅ Metadados adicionais PWA */}
        <meta name="application-name" content="FichaChef" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        
        {/* ✅ Preload crítico */}
        <link rel="preload" href="/icons/icon.png" as="image" type="image/png" />
        
        {/* ✅ DNS Prefetch para performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* ✅ Service Worker Otimizado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ✅ Service Worker com funcionalidades PWA avançadas
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                      scope: '/',
                      updateViaCache: 'none'
                    });
                    
                    console.log('✅ SW registered:', registration.scope);
                    
                    // ✅ Verificar atualizações
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 Nova versão disponível');
                            // Opcional: mostrar notificação de atualização
                          }
                        });
                      }
                    });
                    
                    // ✅ Comunicação com SW
                    if (registration.active) {
                      const messageChannel = new MessageChannel();
                      messageChannel.port1.onmessage = (event) => {
                        console.log('📨 Mensagem do SW:', event.data);
                      };
                      registration.active.postMessage({type: 'GET_VERSION'}, [messageChannel.port2]);
                    }
                    
                  } catch (error) {
                    console.error('❌ SW registration failed:', error);
                  }
                });
                
                // ✅ Detectar quando SW está controlando a página
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  console.log('🎮 SW controller changed');
                  window.location.reload();
                });
              }
              
              // ✅ Detectar instalação PWA
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('📱 PWA install prompt available');
                e.preventDefault();
                deferredPrompt = e;
                
                // Opcional: mostrar botão de instalação customizado
                const installButton = document.getElementById('install-button');
                if (installButton) {
                  installButton.style.display = 'block';
                  installButton.addEventListener('click', async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      console.log('📱 PWA install outcome:', outcome);
                      deferredPrompt = null;
                      installButton.style.display = 'none';
                    }
                  });
                }
              });
              
              // ✅ Detectar quando PWA foi instalado
              window.addEventListener('appinstalled', () => {
                console.log('✅ PWA installed successfully');
                deferredPrompt = null;
              });
              
              // ✅ Detectar modo standalone (PWA instalado)
              if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('🚀 Running as PWA');
                document.documentElement.classList.add('pwa-mode');
              }
              
              // ✅ Background Sync (se suportado)
              if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                console.log('🔄 Background Sync supported');
              }
              
              // ✅ Push Notifications (se suportado)
              if ('serviceWorker' in navigator && 'PushManager' in window) {
                console.log('🔔 Push Notifications supported');
              }
            `
          }}
        />
        
        {/* ✅ Fallback para navegadores sem JS */}
        <noscript>
          <style>
            .js-only { display: none !important; }
          </style>
        </noscript>
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <SupabaseProvider>
            {children}
            <DebugPanel />
            
            {/* ✅ Botão de instalação PWA (oculto por padrão) */}
            <button
              id="install-button"
              style={{ display: 'none' }}
              className="fixed bottom-4 right-4 bg-gradient-to-r from-[#1B2E4B] to-[#5AC8FA] text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            >
              📱 Instalar App
            </button>
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
