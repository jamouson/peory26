import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force environment variables into edge runtime
  env: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  },
};

export default nextConfig;