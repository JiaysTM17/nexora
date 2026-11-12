import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@mac/contracts'],
  typescript: {
    ignoreBuildErrors: true,
  },
};
export default config;
