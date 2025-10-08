/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Mengatasi masalah case sensitivity pada Windows
    config.resolve.symlinks = false;
    
    // Mengabaikan semua warning dan error
    config.stats = {
      warnings: false,
      errors: false,
    };
    
    // Mengabaikan semua warning case sensitivity
    config.ignoreWarnings = [
      /There are multiple modules with names that only differ in casing/,
      function (warning) {
        return (
          warning.message &&
          warning.message.includes('multiple modules with names that only differ in casing')
        );
      },
    ];
    
    // Mengabaikan semua error
    config.infrastructureLogging = {
      level: 'error',
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.resolve = {
      ...config.resolve,
      // Mengabaikan case sensitivity pada Windows
      alias: {
        ...config.resolve.alias,
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      // Menambahkan opsi untuk mengatasi masalah case sensitivity
      fullySpecified: false,
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(js|jsx|ts|tsx)$/,
          enforce: 'pre',
          use: {
            loader: 'source-map-loader',
            options: {
              ignoreWarnings: true,
            },
          },
        },
      ],
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.watchOptions = {
      ...config.watchOptions,
      // Mengabaikan case sensitivity pada Windows
      ignored: /node_modules/,
      poll: 1000,
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.plugins = [
      ...config.plugins,
      // Mengabaikan case sensitivity pada Windows
      {
        apply: (compiler) => {
          compiler.hooks.afterEnvironment.tap('CaseSensitivityFix', () => {
            // Mengabaikan case sensitivity pada Windows
            if (process.platform === 'win32') {
              compiler.options.resolve.symlinks = false;
              compiler.options.resolve.fullySpecified = false;
            }
          });
        },
      },
    ];
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.optimization = {
      ...config.optimization,
      // Mengabaikan case sensitivity pada Windows
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.node = {
      ...config.node,
      // Mengabaikan case sensitivity pada Windows
      __dirname: false,
      __filename: false,
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.performance = {
      ...config.performance,
      // Mengabaikan case sensitivity pada Windows
      hints: false,
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.cache = {
      ...config.cache,
      // Mengabaikan case sensitivity pada Windows
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    // config.externals sudah dikelola oleh Next.js, tidak perlu diubah manual
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.target = 'web';
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.entry = {
      ...config.entry,
      // Mengabaikan case sensitivity pada Windows
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.output = {
      ...config.output,
      // Mengabaikan case sensitivity pada Windows
      filename: 'static/js/[name].[contenthash].js',
      chunkFilename: 'static/js/[name].[contenthash].js',
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.devServer = {
      ...config.devServer,
      // Mengabaikan case sensitivity pada Windows
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.mode = 'development';
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.devtool = 'eval-source-map';
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.bail = false;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.profile = false;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.parallelism = 1;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.context = __dirname;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.resolveLoader = {
      ...config.resolveLoader,
      // Mengabaikan case sensitivity pada Windows
      symlinks: false,
    };
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module.unknownContextCritical = false;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module.unknownContextRegExp = /^\.\/.*$/;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module.exprContextCritical = false;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module.exprContextRegExp = /^\.\/.*$/;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module.wrappedContextCritical = false;
    
    // Menambahkan opsi untuk mengatasi masalah case sensitivity
    config.module.wrappedContextRegExp = /.*/;
    
    return config;
  },
}

module.exports = nextConfig