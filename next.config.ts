import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "http://13.210.109.201" // HTTPS 아님
      : "",
};

export default nextConfig;
