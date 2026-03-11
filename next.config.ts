import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: './', // fixes workspace root issue
  },

  // 👇 Fix: bypass TS typing limitation
  // (we use "as any" so it compiles cleanly)
  experimental: {
    ...( {
      allowedDevOrigins: [
        'http://localhost:9002',
        'http://192.168.66.1:9002',
      ],
    } as any ),
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

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
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
