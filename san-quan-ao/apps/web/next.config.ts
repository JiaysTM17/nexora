import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@mac/contracts'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 2,
  },
};
export default config;
