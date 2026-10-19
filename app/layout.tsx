import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Signum — Real-Time Sign Language AI',
  description: 'Free, offline-capable AI that interprets sign language in real-time. No app needed. Works in any browser. Built for the 70M+ deaf and hard-of-hearing people worldwide.',
  keywords: ['sign language', 'ASL', 'AI', 'accessibility', 'deaf', 'real-time', 'offline'],
  authors: [{ name: 'Signum Open Project' }],
  openGraph: {
    title: 'Signum — Real-Time Sign Language AI',
    description: 'Point your camera. See the signs. Instantly. Free forever.',
    type: 'website',
    locale: 'en',
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Signum' },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* MediaPipe Tasks Vision — loaded before page scripts */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      </head>
      <body className="min-h-screen antialiased" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  )
}
