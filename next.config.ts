import type { NextConfig } from "next";
import { candidateImageRemotePattern } from "./src/lib/candidate-image";

const candidateImagePattern = candidateImageRemotePattern();

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_ISOLATED_BUILD === "1" ? ".next-isolated" : ".next",
  images: { remotePatterns: candidateImagePattern ? [candidateImagePattern] : [] },
  experimental: { serverActions: { bodySizeLimit: "100mb" } },
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
