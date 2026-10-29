import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable gzip compression for faster response delivery
  compress: true,
  // Remove unnecessary X-Powered-By header
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Suppress the known-harmless Firestore "ca9" HMR assertion from the error overlay
  devIndicators: false,
  
  // Fix for ESM/CommonJS compatibility issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these packages as external to prevent bundling issues
      config.externals = config.externals || [];
      
      // Handle problematic packages
      const externals = [
        'handlebars',
        'jwks-rsa',
        'jose',
        '@genkit-ai/core',
        'genkit',
        'dotprompt',
      ];
      
      // Add them as external if not already present
      externals.forEach(pkg => {
        if (!config.externals.includes(pkg)) {
          config.externals.push(pkg);
        }
      });
    }
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/handlebars\/lib\/index\.js/ },
      { module: /node_modules\/jwks-rsa/ },
    ];
    
    return config;
  },
  
  // Transpile problematic packages
  transpilePackages: ['genkit', '@genkit-ai/core', '@genkit-ai/next', 'genkitx-groq'],
  
  // Experimental features for better ESM support
  experimental: {
    esmExternals: 'loose',
  },
  
  // Output configuration
  output: 'standalone',
};

export default nextConfig;
