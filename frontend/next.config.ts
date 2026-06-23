import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.111.1"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
