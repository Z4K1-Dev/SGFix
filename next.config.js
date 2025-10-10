/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { isServer }) => {
    // Mengatasi masalah case sensitivity pada Windows
    config.resolve.symlinks = false;
    
    // Mengabaikan warning case sensitivity
    config.ignoreWarnings = [
      /There are multiple modules with names that only differ in casing/,
      function (warning) {
        return (
          warning.message &&
          warning.message.includes('multiple modules with names that only differ in casing')
        );
      },
    ];
    
    return config;
  },
}

module.exports = nextConfig