import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add the images configuration here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'content.jdmagicbox.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;