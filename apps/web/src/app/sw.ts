/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheableResponsePlugin,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  RangeRequestsPlugin,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";
import {
  OFFLINE_AUDIO_CACHE,
  OFFLINE_DATA_CACHE,
  OFFLINE_PAGE_ROUTES,
  OFFLINE_PAGES_CACHE,
  isAudioAssetUrl,
  isOfflineDataUrl,
} from "@/lib/offlineCaches";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const manifest = self.__SW_MANIFEST ?? [];
// Hashed build assets change every deploy, so this re-fetches the page HTML alongside them.
const buildRevision = hash(JSON.stringify(manifest));

const serwist = new Serwist({
  precacheEntries: [...manifest, ...OFFLINE_PAGE_ROUTES.map((url) => ({ url, revision: buildRevision }))],
  precacheOptions: {
    // Pages read ?section=&card= on the client, so any query maps to the same HTML.
    // `_rsc` must still miss: those are React Server Component payloads, not HTML.
    ignoreURLParametersMatching: [/^(?!_rsc$).+/],
    cleanupOutdatedCaches: true,
    concurrency: 8,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  disableDevLogs: true,
  runtimeCaching: [
    {
      // Offline, a failed RSC fetch makes Next.js fall back to a full page load,
      // which the precached HTML then serves.
      matcher: ({ request }) => request.headers.get("RSC") === "1",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => isOfflineDataUrl(url),
      method: "GET",
      handler: new StaleWhileRevalidate({
        cacheName: OFFLINE_DATA_CACHE,
        matchOptions: { ignoreVary: true },
        plugins: [new CacheableResponsePlugin({ statuses: [200] })],
      }),
    },
    {
      matcher: ({ url }) => isAudioAssetUrl(url),
      method: "GET",
      handler: new CacheFirst({
        cacheName: OFFLINE_AUDIO_CACHE,
        matchOptions: { ignoreVary: true },
        plugins: [new CacheableResponsePlugin({ statuses: [200] }), new RangeRequestsPlugin()],
      }),
    },
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: OFFLINE_PAGES_CACHE,
        networkTimeoutSeconds: 5,
        matchOptions: { ignoreSearch: true },
        plugins: [new CacheableResponsePlugin({ statuses: [200] })],
      }),
    },
    {
      matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({ cacheName: "next-static" }),
    },
    {
      matcher: ({ sameOrigin, request }) => sameOrigin && request.destination === "image",
      handler: new StaleWhileRevalidate({
        cacheName: "images",
        plugins: [new CacheableResponsePlugin({ statuses: [200] })],
      }),
    },
  ],
  fallbacks: {
    entries: [{ url: "/offline", matcher: ({ request }) => request.destination === "document" }],
  },
});

serwist.addEventListeners();

function hash(value: string) {
  let result = 5381;
  for (let index = 0; index < value.length; index++) {
    result = (result * 33) ^ value.charCodeAt(index);
  }
  return (result >>> 0).toString(36);
}
