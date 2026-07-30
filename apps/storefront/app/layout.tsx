import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { StoreProvider } from '@/components/providers/store-provider'
import { SiteChrome } from '@/components/layout/site-chrome'
import { ShoppingAssistant } from '@/components/ai/shopping-assistant'
import { MotionProvider } from '@/components/providers/motion-provider'
import { CartAnimationProvider } from '@/components/providers/cart-animation-provider'
import { PwaProvider } from '@/components/providers/pwa-provider'
import {
  banners,
  categories,
  megaMenu,
  navLinks,
  trendingSearches,
} from '@corecart/shared'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
})

export const metadata: Metadata = {
  title: 'SmartGO — Elevated everyday commerce',
  description:
    'SmartGO is an ultra-premium storefront for modern living. Discover curated collections, luxury essentials, and the season’s best across every category.',
  generator: 'v0.app',
  keywords: ['SmartGO', 'ecommerce', 'shopping', 'premium', 'fashion', 'lifestyle'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'SmartGO — Elevated everyday commerce',
    description: 'Curated collections, luxury essentials, and the season’s best.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbf9' },
    { media: '(prefers-color-scheme: dark)', color: '#232320' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <StoreProvider>
            <MotionProvider>
              <CartAnimationProvider>
                <PwaProvider>
                  <Suspense fallback={null}>
                    <SiteChrome
                      navLinks={navLinks}
                      megaMenu={megaMenu}
                      categories={categories}
                      trendingSearches={trendingSearches}
                      announcements={banners.announcements}
                    >
                      {children}
                    </SiteChrome>
                    <ShoppingAssistant />
                  </Suspense>
                </PwaProvider>
              </CartAnimationProvider>
            </MotionProvider>
          </StoreProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
