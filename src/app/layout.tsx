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
        
        {/* Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
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
