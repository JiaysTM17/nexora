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
};
export default config;
