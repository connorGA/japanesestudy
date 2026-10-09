import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Reloading mid-session when a flight's wifi reconnects would throw away the current card.
  reloadOnOnline: false,
  // Only the art the Japanese side and the dashboard use; the rest loads on demand.
  globPublicPatterns: [
    "brand/pwa/**/*",
    "brand/favicon-{32,48}.png",
    "brand/language-studio-logo.png",
    "dashboard/**/*",
    "flashcards/sakura-branch-transparent.png",
    "flashcards/themes/**/*",
    "game/**/*",
    "garden/**/*",
    "home/**/*",
  ],
  maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel Services does not currently expose the Next.js image optimizer
  // route from a nested frontend service. Serve the bundled public assets
  // directly so images do not resolve to the app's 404 page.
  images: {
    unoptimized: true,
  },
};

export default withSerwist(nextConfig);
