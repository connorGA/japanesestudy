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

export async function playAudioElement(audio: HTMLAudioElement): Promise<boolean> {
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
