import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow cross-origin requests for preview environment
  allowedDevOrigins: [
    'preview-chat-46449324-1d9b-4b5b-bb3b-00fba80141ba.space.z.ai',
    'preview-chat-63e78080-40b1-453f-b361-0564260db910.space.z.ai',
    '*.space.z.ai'
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

export default nextConfig;
