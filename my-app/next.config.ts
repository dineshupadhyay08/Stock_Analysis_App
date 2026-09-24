import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static2.finnhub.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.cnbcfm.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'data.bloomberglp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.finnhub.io',
        pathname: '/logo/**',
      },
    ],
  },
};

export default nextConfig;
