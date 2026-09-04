import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost', '127.0.0.1:3000', 'localhost:3000'],
  turbopack: {},
};

export default withPWA(nextConfig);
