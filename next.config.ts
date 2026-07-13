import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, Next.js infers the
  // root from the nearest lockfile and warns because a parent folder also
  // contains one.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
