import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static image imports work out of the box for local assets
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
