import React from "react"
import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { PwaServiceWorker } from '@/components/pwa-service-worker'
import { PwaInstallDrawer } from '@/components/pwa-install-drawer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import './globals.css'

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const lato = Lato({ weight: ['300', '400', '700'], subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'DS Nails | Premium Nail Salon in Quatre Bornes',
  description: 'Experience luxury nail care at DS Nails. Home-based nail salon in Gangamah Avenue, Quatre Bornes, Mauritius. Book your appointment today!',
  keywords: ['nail salon', 'manicure', 'pedicure', 'nail art', 'Quatre Bornes', 'Mauritius'],
  manifest: '/manifest.webmanifest',
  themeColor: '#d58d9c',
  appleWebApp: {
    capable: true,
    title: 'DS Nails',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased`}>
        {children}
        <MobileBottomNav />
        <PwaServiceWorker />
        <PwaInstallDrawer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
