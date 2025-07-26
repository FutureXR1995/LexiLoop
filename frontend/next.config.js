/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production: standalone, Development: export
  output: process.env.NODE_ENV === 'production' ? 'standalone' : 'export',
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
    domains: process.env.NODE_ENV === 'production' ? ['lexiloop.com', 'api.lexiloop.com'] : [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001',
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
  },
  
  experimental: {
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // Security and CORS headers
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];

    // Development: Allow all origins for testing
    if (process.env.NODE_ENV === 'development') {
      headers[0].headers.push(
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        }
      );
    } else {
      // Production: Strict CORS and security headers
      headers[0].headers.push(
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.lexiloop.com https://ai.lexiloop.com;",
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: 'https://lexiloop.com',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        }
      );
    }

    return headers;
  },
  
  // Redirect HTTP to HTTPS in production
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://lexiloop.com/:path*',
          permanent: true,
        },
      ];
    }
    return [];
  },
  
  // Webpack configuration for production optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.minSize = 20000;
      config.optimization.splitChunks.maxSize = 244000;
    }
    return config;
  },
  
  // Compression and performance
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

module.exports = nextConfig;