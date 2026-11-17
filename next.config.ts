import type { NextConfig } from "next";

// Set only when running against the local Cloudinary stand-in (end-to-end testing). Never on Vercel.
const localImageMock = process.env.LOCAL_IMAGE_MOCK === "1";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Security-policy upgrades: `next upgrade --agent=security` keeps this app on the
  // latest safe release within its current major.
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    // Uploaded portraits, documents and fabric photos are served from Cloudinary.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      ...(localImageMock ? [{ protocol: "https" as const, hostname: "img.lvh.me", port: "4021" }] : []),
    ],
    dangerouslyAllowLocalIP: localImageMock,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
