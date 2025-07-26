import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LexiLoop - AI Vocabulary Learning Platform',
  description: 'Learn vocabulary through AI-generated stories. Master new words naturally with contextual learning.',
  keywords: ['vocabulary', 'learning', 'AI', 'education', 'English', 'stories'],
  authors: [{ name: 'LexiLoop Team' }],
  openGraph: {
    title: 'LexiLoop - AI Vocabulary Learning Platform',
    description: 'Learn vocabulary through AI-generated stories',
    type: 'website',
    locale: 'en_US',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}