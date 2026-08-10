import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel Services does not currently expose the Next.js image optimizer
  // route from a nested frontend service. Serve the bundled public assets
  // directly so images do not resolve to the app's 404 page.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
