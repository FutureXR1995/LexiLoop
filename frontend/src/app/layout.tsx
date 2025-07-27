import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import MobileNavigation from '@/components/MobileNavigation';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5'
};

export const metadata: Metadata = {
  title: {
    default: 'LexiLoop - AI-Powered Vocabulary Learning',
    template: '%s | LexiLoop'
  },
  description: 'Master new vocabulary through AI-generated stories and interactive learning. Personalized learning experience with spaced repetition and progress tracking.',
  keywords: [
    'vocabulary learning',
    'AI stories',
    'language learning',
    'English vocabulary',
    'spaced repetition',
    'educational app',
    'learning platform',
    'vocabulary builder'
  ],
  authors: [{ name: 'LexiLoop Team' }],
  creator: 'LexiLoop',
  publisher: 'LexiLoop',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lexiloop.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'LexiLoop - AI-Powered Vocabulary Learning',
    description: 'Master new vocabulary through AI-generated stories and interactive learning.',
    siteName: 'LexiLoop',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LexiLoop - AI-Powered Vocabulary Learning'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexiLoop - AI-Powered Vocabulary Learning',
    description: 'Master new vocabulary through AI-generated stories and interactive learning.',
    images: ['/twitter-image.png'],
    creator: '@lexiloop'
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code'
  },
  category: 'education',
  classification: 'Education, Learning, Vocabulary',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#4f46e5' }
    ]
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'LexiLoop',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#4f46e5',
    'msapplication-TileImage': '/mstile-144x144.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.lexiloop.com" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Additional meta tags for performance */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        
        {/* Performance hints */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
        
        {/* Security headers via meta (backup for server headers) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LexiLoop",
              "description": "AI-powered vocabulary learning platform with interactive stories",
              "url": "https://lexiloop.com",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "LexiLoop Team"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <noscript>
          <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca'
          }}>
            This application requires JavaScript to function properly. Please enable JavaScript in your browser.
          </div>
        </noscript>
        
        {children}
        
        <Suspense fallback={null}>
          <PWAInstallPrompt />
        </Suspense>
        
        <MobileNavigation />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}