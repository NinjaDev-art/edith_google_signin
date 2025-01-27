import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    FAKE_USER: process.env.FAKE_USER,
    TWITTER_USER_ID: process.env.TWITTER_USER_ID,
    CLERK_STRATEGY: process.env.CLERK_STRATEGY,
  },
  serverExternalPackages: ["twitter-api-v2"],
};

export default nextConfig;
