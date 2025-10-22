import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portal SmartGov - Sistem Informasi Pemerintahan',
  description: 'Portal pemerintahan digital dengan notifikasi realtime, pengelolaan berita, dan sistem pengaduan masyarakat',
  keywords: 'pemerintahan, smart city, berita, pengaduan masyarakat, notifikasi realtime',
  authors: [{ name: 'SmartGov Team' }],
  creator: 'SmartGov',
  publisher: 'SmartGov',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Portal SmartGov - Sistem Informasi Pemerintahan',
    description: 'Portal pemerintahan digital dengan notifikasi realtime, pengelolaan berita, dan sistem pengaduan masyarakat',
    url: '/',
    siteName: 'Portal SmartGov',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal SmartGov - Sistem Informasi Pemerintahan',
    description: 'Portal pemerintahan digital dengan notifikasi realtime, pengelolaan berita, dan sistem pengaduan masyarakat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portal SmartGov" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerProvider />
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}