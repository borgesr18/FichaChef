import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DebugPanel from "@/components/DebugPanel";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
    { media: '(prefers-color-scheme: light)', color: '#ea580c' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FichaChef" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon.png" />
        <link rel="icon" type="image/png+xml" href="/icons/icon.png" />
        <link rel="mask-icon" href="/icons/icon.png" color="#ea580c" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </head>
      <body
        className="antialiased"
      >
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

