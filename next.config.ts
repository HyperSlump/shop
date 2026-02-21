import type { NextConfig } from "next";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'gusukas6vq4zp6uu.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
