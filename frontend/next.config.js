/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: "export" for development server
  // output: "export", // Only use for static builds
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  }
}

module.exports = nextConfig
