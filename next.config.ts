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
    '*.space.z.ai'
  ],
  // Disable HMR to prevent WebSocket errors in remote access
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Completely disable HMR for remote access
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
      };
      // Disable HMR plugin
      config.plugins = config.plugins.filter(plugin => 
        plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );
    }
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
