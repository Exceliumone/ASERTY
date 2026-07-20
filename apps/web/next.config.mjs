import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    // Anchors the standalone trace to the monorepo root so the pnpm workspace
    // (packages/shared, hoisted node_modules) is included in the Docker build.
    outputFileTracingRoot: join(__dirname, '../../'),
  },
  transpilePackages: ['@pablo/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
