"use client";

import { useSyncExternalStore } from "react";
import { API_URL } from "@/lib/api";
import {
  FRESH_PARAM,
  OFFLINE_AUDIO_CACHE,
  OFFLINE_DATA_CACHE,
  OFFLINE_PAGE_ROUTES,
} from "@/lib/offlineCaches";
import type {
  AudioAsset,
  Flashcard,
  ListeningScenario,
  PassiveListeningCategory,
} from "@/types/study";

const STATUS_KEY = "japanese-study.offline-pack.v1";
const OFFLINE_PACK_EVENT = "japanese-offline-pack";
const AUDIO_CONCURRENCY = 4;
const MAX_CLIP_RETRIES = 5;

const DATA_REQUESTS = [
  "/api/flashcards?section=vocabulary",
  "/api/flashcards?section=hiragana",
  "/api/flashcards?section=katakana",
  "/api/flashcards?section=kanji",
  "/api/listening/scenarios",
  "/api/passive-listening/categories",
  "/api/audio/hiragana",
  "/api/audio/katakana",
] as const;

export type OfflinePackStatus = {
  downloadedAt: number;
  clips: number;
  bytes: number;
  pages: number;
  missing: string[];
  failed?: number;
  serviceWorker: boolean;
};

export type OfflineDownloadState =
  | { phase: "idle" }
  | { phase: "data" | "audio" | "pages"; done: number; total: number }
  | { phase: "error"; message: string };

let downloadState: OfflineDownloadState = { phase: "idle" };
let cachedStatus: OfflinePackStatus | null | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STATUS_KEY) return;
    cachedStatus = undefined;
    listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(OFFLINE_PACK_EVENT, listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OFFLINE_PACK_EVENT, listener);
  };
}

export function readOfflinePackStatus(): OfflinePackStatus | null {
  if (typeof window === "undefined") return null;
  if (cachedStatus !== undefined) return cachedStatus;
  try {
    const raw = window.localStorage.getItem(STATUS_KEY);
    cachedStatus = raw ? (JSON.parse(raw) as OfflinePackStatus) : null;
  } catch {
    cachedStatus = null;
  }
  return cachedStatus;
}

function writeStatus(status: OfflinePackStatus) {
  cachedStatus = status;
  window.localStorage.setItem(STATUS_KEY, JSON.stringify(status));
  window.dispatchEvent(new Event(OFFLINE_PACK_EVENT));
}

function setDownloadState(next: OfflineDownloadState) {
  downloadState = next;
  emit();
}

export function useOfflinePack() {
  const status = useSyncExternalStore(subscribe, readOfflinePackStatus, () => null);
  const download = useSyncExternalStore(
    subscribe,
    () => downloadState,
    () => downloadState,
  );
  return { status, download };
}

export function offlineSupported() {
  return typeof window !== "undefined" && "caches" in window;
}

let running: Promise<OfflinePackStatus> | null = null;

export function downloadJapaneseOfflinePack(): Promise<OfflinePackStatus> {
  running ??= runDownload().finally(() => {
    running = null;
  });
  return running;
}

async function runDownload(): Promise<OfflinePackStatus> {
  try {
    if (!offlineSupported()) throw new Error("This browser can't store the app for offline use.");

    setDownloadState({ phase: "data", done: 0, total: DATA_REQUESTS.length });
    const dataCache = await caches.open(OFFLINE_DATA_CACHE);
    const payloads: unknown[] = [];
    for (const [index, path] of DATA_REQUESTS.entries()) {
      payloads.push(await refreshData(dataCache, path));
      setDownloadState({ phase: "data", done: index + 1, total: DATA_REQUESTS.length });
    }

    const { urls, missing } = collectAudio(payloads);
    const audio = await downloadAudio(urls);

    const serviceWorker = await waitForServiceWorker();
    const pages = await checkPages();

    if (navigator.storage?.persist) await navigator.storage.persist().catch(() => false);

    const status: OfflinePackStatus = {
      downloadedAt: Date.now(),
      clips: audio.clips,
      bytes: audio.bytes,
      pages,
      missing: [...new Set(missing)],
      failed: audio.failed,
      serviceWorker,
    };
    writeStatus(status);
    setDownloadState({ phase: "idle" });
    return status;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed.";
    setDownloadState({ phase: "error", message: navigator.onLine ? message : "Connect to the internet to download." });
    throw error;
  }
}

async function refreshData(cache: Cache, path: string) {
  const url = new URL(`${API_URL}${path}`, window.location.href);
  const fresh = new URL(url);
  fresh.searchParams.set(FRESH_PARAM, String(Date.now()));
  const response = await fetch(fresh, { cache: "no-store", headers: { "Content-Type": "application/json" } });
  if (!response.ok) throw new Error(`Couldn't download ${url.pathname} (${response.status}).`);
  await cache.put(url.toString(), response.clone());
  return response.json();
}

function collectAudio(payloads: unknown[]) {
  const urls = new Set<string>();
  const missing: string[] = [];
  const add = (asset: AudioAsset | null | undefined) => {
    if (!asset) return;
    if (asset.status === "ready" && asset.public_url) urls.add(asset.public_url);
    else missing.push(asset.text);
  };

  for (const payload of payloads) {
    if (!Array.isArray(payload)) continue;
    for (const item of payload as Array<Record<string, unknown>>) {
      if ("word_audio" in item || "example_audio" in item) {
        const card = item as Flashcard;
        add(card.word_audio);
        add(card.example_audio);
      } else if ("lines" in item) {
        (item as ListeningScenario).lines.forEach((line) => add(line.audio));
      } else if ("items" in item) {
        (item as PassiveListeningCategory).items.forEach((entry) => {
          add(entry.english_audio);
          add(entry.japanese_audio);
        });
      } else if ("status" in item) {
        add(item as AudioAsset);
      }
    }
  }
  return { urls: [...urls], missing };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Storage rate-limits bursts (429), so back off and retry instead of giving up.
async function fetchClip(url: string) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { mode: "cors" }).catch(() => null);
    if (response?.ok) return response;
    const retryable = !response || response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= MAX_CLIP_RETRIES) throw new Error(String(response?.status ?? "network"));
    const retryAfter = Number(response?.headers.get("Retry-After")) * 1000;
    await sleep(retryAfter || 800 * 2 ** attempt + Math.random() * 400);
  }
}

async function downloadAudio(urls: string[]) {
  const cache = await caches.open(OFFLINE_AUDIO_CACHE);
  let done = 0;
  let bytes = 0;
  let clips = 0;
  let failed = 0;
  const queue = [...urls];
  setDownloadState({ phase: "audio", done, total: urls.length });

  async function worker() {
    while (queue.length) {
      const url = queue.shift()!;
      try {
        const existing = await cache.match(url, { ignoreVary: true });
        if (existing) {
          bytes += Number(existing.headers.get("Content-Length")) || (await existing.blob()).size;
          clips++;
        } else {
          const response = await fetchClip(url);
          const blob = await response.clone().blob();
          await cache.put(url, response);
          bytes += blob.size;
          clips++;
        }
      } catch {
        failed++;
      }
      done++;
      setDownloadState({ phase: "audio", done, total: urls.length });
    }
  }

  await Promise.all(Array.from({ length: AUDIO_CONCURRENCY }, worker));
  return { bytes, clips, failed };
}

async function waitForServiceWorker() {
  if (!("serviceWorker" in navigator)) return false;
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 15_000)),
  ]);
  return Boolean(registration?.active);
}

async function checkPages() {
  setDownloadState({ phase: "pages", done: 0, total: OFFLINE_PAGE_ROUTES.length });
  let pages = 0;
  for (const [index, route] of OFFLINE_PAGE_ROUTES.entries()) {
    const response = await fetch(route, { credentials: "same-origin" }).catch(() => null);
    if (response?.ok) pages++;
    setDownloadState({ phase: "pages", done: index + 1, total: OFFLINE_PAGE_ROUTES.length });
  }
  return pages;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
