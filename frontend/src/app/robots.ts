import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexiloop.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/learn',
          '/vocabulary',
          '/auth/login',
          '/auth/register'
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/profile',
          '/progress',
          '/learning-plan',
          '/error-review',
          '/*.json$',
          '/auth/forgot-password'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/learn',
          '/vocabulary',
          '/auth/login',
          '/auth/register'
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/profile',
          '/progress'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}