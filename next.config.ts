import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  reactCompiler: true,
};

export default nextConfig;
