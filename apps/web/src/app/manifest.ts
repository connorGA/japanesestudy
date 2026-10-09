import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/japanese",
    name: "Japanese Study",
    short_name: "Japanese",
    description: "Japanese flashcards, listening, kana, kanji, and games. Works offline once downloaded.",
    start_url: "/japanese",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffaf0",
    theme_color: "#fffaf0",
    icons: [
      { src: "/brand/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
