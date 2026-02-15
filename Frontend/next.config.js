import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ✅ Disable static caching for live changes
  output: "standalone",
};

export default nextConfig;
