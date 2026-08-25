import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { StoreProvider } from '@/components/providers/store-provider'
import { MotionProvider } from '@/components/providers/motion-provider'
import { CartAnimationProvider } from '@/components/providers/cart-animation-provider'
import { PwaProvider } from '@/components/providers/pwa-provider'
import { AppLoaderProvider } from '@/components/providers/app-loader-provider'
const geistSans = Inter({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' })
const geistMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
const instrumentSerif = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EllipMart — Elevated everyday commerce',
  description:
    'EllipMart is an ultra-premium storefront for modern living. Discover curated collections, luxury essentials, and the season\'s best across every category.',
  generator: 'v0.app',
  keywords: ['EllipMart', 'ecommerce', 'shopping', 'premium', 'fashion', 'lifestyle'],
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
    title: 'EllipMart — Elevated everyday commerce',
    description: 'Curated collections, luxury essentials, and the season\'s best.',
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

/**
 * Root layout — only html/body structure and universal providers.
 * SiteChrome (header/nav/cart) lives in app/(storefront)/layout.tsx.
 * Auth pages in app/(auth)/ get NO storefront chrome.
 */
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
        <AppLoaderProvider />
        <ThemeProvider>
          <StoreProvider>
            <MotionProvider>
              <CartAnimationProvider>
                <PwaProvider>
                  {children}
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
