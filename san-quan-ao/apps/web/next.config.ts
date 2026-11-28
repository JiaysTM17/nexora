import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@mac/contracts'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 2,
  },
  outputFileTracingRoot: undefined,
  productionBrowserSourceMaps: false,
  async rewrites() {
    const backendUrl = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();
    if (!backendUrl || !backendUrl.startsWith('http')) return [];
    const baseTarget = backendUrl.replace(/\/api\/v1\/?$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${baseTarget}/api/v1/:path*`,
      },
    ];
  },
};
export default config;
