import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  reactCompiler: true,
  // Force Turbopack to use the correct project root
  // @ts-ignore
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      'tailwindcss': path.resolve(projectRoot, 'node_modules/tailwindcss'),
      '@tailwindcss/postcss': path.resolve(projectRoot, 'node_modules/@tailwindcss/postcss'),
    },
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
