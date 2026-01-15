import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['discord.js', 'zlib-sync', 'utf-8-validate', 'bufferutil', '@discordjs/ws'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
      }
    ]
  },
  experimental: {
    // instrumentationHook: true,
  },
};

export default nextConfig;
