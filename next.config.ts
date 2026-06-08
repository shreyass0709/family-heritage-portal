import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.110.191.191:3000", "192.168.56.1:3000", "localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
