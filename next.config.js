/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable Next.js Image Optimization untuk menghindari masalah Sharp
  images: {
    unoptimized: true,
  },
  // Allow cross-origin requests for preview environment
 allowedDevOrigins: [
    '*.space.z.ai',
    '*.jaga24.com'
  ],
  // Configure webpack for both dev and production
 webpack: (config, { dev, isServer }) => {
    // Simplified webpack config to avoid HMR conflicts
    return config;
  },
  // Disable experimental features
  experimental: {
    webpackBuildWorker: false,
    optimizeCss: false,
  },
  // Configure headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;