import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "**.googleusercontent.com", protocol: "https" },
      { hostname: "**.ufs.sh", protocol: "https" },
      { hostname: "**.supabase.co", protocol: "https" },
      { hostname: "utfs.io", protocol: "https" },
      { hostname: "images.unsplash.com", protocol: "https" },
      { hostname: "plus.unsplash.com", protocol: "https" },
    ],
  },
};

export default withNextIntl(nextConfig);
