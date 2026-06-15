import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Pin workspace root so Turbopack doesn't latch onto a stray
  // C:\Users\USER\package-lock.json and try to resolve modules from there.
  turbopack: {
    root: path.resolve(__dirname),
  },
  output: 'export',
  trailingSlash: true,
  reactCompiler: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
