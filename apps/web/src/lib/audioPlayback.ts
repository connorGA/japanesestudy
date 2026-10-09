import { isAudioAssetUrl, OFFLINE_AUDIO_CACHE } from "@/lib/offlineCaches";

export function isPlayInterruptedError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function pauseAudio(audio: HTMLAudioElement | null | undefined): void {
  if (!audio || audio.ended) return;
  audio.pause();
}

export function detachAudio(audio: HTMLAudioElement | null | undefined): void {
  if (!audio) return;

  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

const MAX_BLOB_URLS = 60;
const blobUrls = new Map<string, string>();

function rememberBlobUrl(url: string, blobUrl: string) {
  blobUrls.set(url, blobUrl);
  if (blobUrls.size <= MAX_BLOB_URLS) return;
  const [oldestUrl, oldestBlobUrl] = blobUrls.entries().next().value!;
  blobUrls.delete(oldestUrl);
  URL.revokeObjectURL(oldestBlobUrl);
}

// iOS won't reliably play range responses from a service worker, so downloaded clips
// play from blob URLs instead.
export async function resolveOfflineAudio(url: string): Promise<string | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  const known = blobUrls.get(url);
  if (known) return known;
  try {
    if (!isAudioAssetUrl(new URL(url))) return null;
    const cache = await caches.open(OFFLINE_AUDIO_CACHE);
    const response = await cache.match(url, { ignoreVary: true });
    if (!response) return null;
    const blobUrl = URL.createObjectURL(await response.blob());
    rememberBlobUrl(url, blobUrl);
    return blobUrl;
  } catch {
    return null;
  }
}

async function swapToOfflineSource(audio: HTMLAudioElement) {
  const src = audio.src;
  if (!src || src.startsWith("blob:")) return;
  const blobUrl = await resolveOfflineAudio(src);
  if (!blobUrl || audio.src !== src) return;
  const rate = audio.playbackRate;
  audio.src = blobUrl;
  audio.defaultPlaybackRate = rate;
  audio.playbackRate = rate;
}

export async function playAudioElement(audio: HTMLAudioElement): Promise<boolean> {
  await swapToOfflineSource(audio);
  try {
    await audio.play();
    return true;
  } catch (error) {
    if (isPlayInterruptedError(error)) {
      return false;
    }
    throw error;
  }
}

export function replaceAudio(
  current: HTMLAudioElement | null | undefined,
  url: string,
  options?: { playbackRate?: number },
): HTMLAudioElement {
  detachAudio(current);
  const audio = new Audio(url);
  if (options?.playbackRate !== undefined) {
    audio.playbackRate = options.playbackRate;
  }
  return audio;
}
