// Shared between the service worker (src/app/sw.ts) and the page-side offline pack.
export const OFFLINE_DATA_CACHE = "offline-data";
export const OFFLINE_AUDIO_CACHE = "offline-audio";
export const OFFLINE_PAGES_CACHE = "offline-pages";

export const OFFLINE_DATA_PATHS = [
  "/api/flashcards",
  "/api/listening/scenarios",
  "/api/passive-listening/categories",
  "/api/audio/hiragana",
  "/api/audio/katakana",
] as const;

export const AUDIO_STORAGE_PATH = "/storage/v1/object/public/audio-assets/";

// Pages precached by the service worker so the Japanese side opens offline.
export const OFFLINE_PAGE_ROUTES = [
  "/",
  "/offline",
  "/japanese",
  "/japanese/flashcards",
  "/japanese/collection",
  "/japanese/garden",
  "/japanese/listening",
  "/japanese/arcade",
  "/japanese/arcade/hiragana-rush",
  "/japanese/arcade/kana-cube",
  "/japanese/hiragana",
  "/japanese/katakana",
  "/japanese/kanji",
  "/japanese/tutor",
  "/japanese/roleplay",
] as const;

// The offline pack adds this to fetch fresh data past the service worker's cached copy.
export const FRESH_PARAM = "_offline_refresh";

export function isOfflineDataUrl(url: URL) {
  return !url.searchParams.has(FRESH_PARAM) && OFFLINE_DATA_PATHS.some((path) => url.pathname === path);
}

export function isAudioAssetUrl(url: URL) {
  return url.pathname.includes(AUDIO_STORAGE_PATH);
}
