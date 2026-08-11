import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdrgqmjdfcepqhyflyjt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default nextConfig;