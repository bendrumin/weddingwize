import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['puppeteer', 'playwright'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer', 'playwright');
    }
    return config;
  }
};

export default nextConfig;
