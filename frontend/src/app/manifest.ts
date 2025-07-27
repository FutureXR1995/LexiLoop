import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LexiLoop - AI-Powered Vocabulary Learning',
    short_name: 'LexiLoop',
    description: 'Master new vocabulary through AI-generated stories and interactive learning',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    orientation: 'portrait-primary',
    categories: ['education', 'learning', 'vocabulary'],
    lang: 'en',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-apple-touch.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png'
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '640x1136',
        type: 'image/png'
      }
    ]
  };
}