/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks for better caching
            firebase: {
              test: /[\\/]node_modules[\\/](firebase)[\\/]/,
              name: 'firebase',
              priority: 30,
            },
            redux: {
              test: /[\\/]node_modules[\\/](@reduxjs|redux)[\\/]/,
              name: 'redux',
              priority: 25,
            },
            reactVendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              name: 'react-vendor',
              priority: 20,
            },
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'commons',
              priority: 10,
              minChunks: 2,
            },
          },
        },
      };
    }
    return config;
  },
  
  // Enable production optimizations
  swcMinify: true,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['ik.imagekit.io'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  
  // Reduce bundle size
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  
  // Ignore errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(self), usb=()'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
