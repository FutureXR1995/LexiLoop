/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization enabled for dynamic apps
  images: { 
    unoptimized: false
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Headers and redirects disabled for static export

  // Webpack optimizations
  webpack(config, { dev, isServer }) {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/
          }
        }
      }
    }

    return config
  },

  // Experimental features
  experimental: {
    scrollRestoration: true
  },

  // Bundle analyzer (enable when needed)
  // ...(process.env.ANALYZE === 'true' && { bundleAnalyzer: { enabled: true } })
}

module.exports = nextConfig
