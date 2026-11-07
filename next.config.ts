import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_ISOLATED_BUILD === "1" ? ".next-isolated" : ".next",
  images: { remotePatterns: [] },
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
