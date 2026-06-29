"use client";

import { useState } from "react";
import { getAudioAsset } from "@/lib/api";
import type { AudioAsset } from "@/types/study";

type AudioPlayerProps = {
  text: string;
  initialAsset?: AudioAsset | null;
};

export function AudioPlayer({ text, initialAsset }: AudioPlayerProps) {
  const [asset, setAsset] = useState<AudioAsset | null>(initialAsset ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAudio() {
    setIsLoading(true);
    setError(null);
    try {
      setAsset(await getAudioAsset(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load audio");
    } finally {
      setIsLoading(false);
    }
  }

  if (asset?.status === "ready" && asset.public_url) {
    return (
      <audio className="mt-3 w-full" controls src={asset.public_url}>
        <track kind="captions" />
      </audio>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        disabled={isLoading}
        onClick={loadAudio}
        type="button"
      >
        {isLoading ? "Preparing audio..." : "Generate pronunciation"}
      </button>
      {asset?.status === "pending" ? (
        <span className="text-sm text-slate-600">Audio is queued.</span>
      ) : null}
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </div>
  );
}
