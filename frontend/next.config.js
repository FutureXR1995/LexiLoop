/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server-side features for Azure Static Web Apps with database
  // output: 'export', // Disabled to allow database connections
  trailingSlash: true,
  
  // Image optimization disabled for static export
  images: { 
    unoptimized: true
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
