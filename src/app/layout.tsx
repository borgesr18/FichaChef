import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  openGraph: {
    title: "FichaChef - Sistema de Gestão Gastronômica",
    description: "Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: false,
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
