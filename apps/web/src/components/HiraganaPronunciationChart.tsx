"use client";

import { useEffect, useMemo, useState } from "react";
import { getHiraganaAudioAssets } from "@/lib/api";
import type { AudioAsset } from "@/types/study";

type HiraganaCell = {
  character: string;
  reading: string;
  underline?: boolean;
};

type PlaybackState = {
  activeCharacter?: string;
  status: "idle" | "loading" | "playing" | "failed";
  message?: string;
};

const columns = ["•", "w", "r", "y", "m", "h", "n", "t", "s", "k", ""];
const rows: { vowel: string; cells: (HiraganaCell | null)[] }[] = [
  {
    vowel: "a",
    cells: [
      { character: "ん", reading: "n/m", underline: true },
      { character: "わ", reading: "wa" },
      { character: "ら", reading: "ra" },
      { character: "や", reading: "ya" },
      { character: "ま", reading: "ma" },
      { character: "は", reading: "ha" },
      { character: "な", reading: "na" },
      { character: "た", reading: "ta" },
      { character: "さ", reading: "sa" },
      { character: "か", reading: "ka" },
      { character: "あ", reading: "a" },
    ],
  },
  {
    vowel: "i",
    cells: [
      null,
      null,
      { character: "り", reading: "ri" },
      null,
      { character: "み", reading: "mi" },
      { character: "ひ", reading: "hi" },
      { character: "に", reading: "ni" },
      { character: "ち", reading: "chi", underline: true },
      { character: "し", reading: "shi", underline: true },
      { character: "き", reading: "ki" },
      { character: "い", reading: "i" },
    ],
  },
  {
    vowel: "u",
    cells: [
      null,
      null,
      { character: "る", reading: "ru" },
      { character: "ゆ", reading: "yu" },
      { character: "む", reading: "mu" },
      { character: "ふ", reading: "fu" },
      { character: "ぬ", reading: "nu" },
      { character: "つ", reading: "tsu", underline: true },
      { character: "す", reading: "su" },
      { character: "く", reading: "ku" },
      { character: "う", reading: "u" },
    ],
  },
  {
    vowel: "e",
    cells: [
      null,
      null,
      { character: "れ", reading: "re" },
      null,
      { character: "め", reading: "me" },
      { character: "へ", reading: "he" },
      { character: "ね", reading: "ne" },
      { character: "て", reading: "te" },
      { character: "せ", reading: "se" },
      { character: "け", reading: "ke" },
      { character: "え", reading: "e" },
    ],
  },
  {
    vowel: "o",
    cells: [
      null,
      { character: "を", reading: "o" },
      { character: "ろ", reading: "ro" },
      { character: "よ", reading: "yo" },
      { character: "も", reading: "mo" },
      { character: "ほ", reading: "ho" },
      { character: "の", reading: "no" },
      { character: "と", reading: "to" },
      { character: "そ", reading: "so" },
      { character: "こ", reading: "ko" },
      { character: "お", reading: "o" },
    ],
  },
];

export function HiraganaPronunciationChart() {
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [isFetchingAudio, setIsFetchingAudio] = useState(true);
  const [playback, setPlayback] = useState<PlaybackState>({ status: "idle" });
  const audioByCharacter = useMemo(
    () => new Map(assets.map((asset) => [asset.text, asset])),
    [assets],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadManifest() {
      setIsFetchingAudio(true);
      try {
        const manifest = await getHiraganaAudioAssets();
        if (isMounted) {
          setAssets(manifest);
        }
      } catch (err) {
        if (isMounted) {
          setPlayback({
            status: "failed",
            message:
              err instanceof Error
                ? err.message
                : "Could not load Hiragana pronunciation audio.",
          });
        }
      } finally {
        if (isMounted) {
          setIsFetchingAudio(false);
        }
      }
    }

    void loadManifest();
    return () => {
      isMounted = false;
    };
  }, []);

  async function playPronunciation(cell: HiraganaCell) {
    const asset = audioByCharacter.get(cell.character);

    if (!asset || asset.status === "pending") {
      setPlayback({
        activeCharacter: cell.character,
        status: "loading",
        message: `${cell.character} is still being generated. Refresh in a moment.`,
      });
      return;
    }

    if (asset.status === "failed" || !asset.public_url) {
      setPlayback({
        activeCharacter: cell.character,
        status: "failed",
        message:
          asset.error_message ??
          "Audio is not stored yet. Run the Hiragana audio generator after setting ElevenLabs.",
      });
      return;
    }

    try {
      const audio = new Audio(asset.public_url);
      audio.onended = () => setPlayback({ activeCharacter: cell.character, status: "idle" });
      await audio.play();
      setPlayback({ activeCharacter: cell.character, status: "playing" });
    } catch (err) {
      setPlayback({
        activeCharacter: cell.character,
        status: "failed",
        message: err instanceof Error ? err.message : "Could not play pronunciation.",
      });
    }
  }

  return (
    <section className="overflow-x-auto rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-5xl font-medium tracking-tight text-black md:text-6xl">
          Hiragana Chart
        </h1>
        <div className="flex items-center gap-2 rounded-full bg-washi px-4 py-2 text-sm font-semibold text-slate-600">
          {isFetchingAudio ? (
            <>
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-matcha" />
              Fetching audio...
            </>
          ) : (
            "Click a character to hear stored audio"
          )}
        </div>
      </div>

      <div className="mt-8 min-w-[58rem]">
        <div className="grid grid-cols-[repeat(11,minmax(0,1fr))_2rem] gap-x-8">
          {columns.map((column, index) => (
            <div
              className="pb-3 text-center text-3xl font-semibold text-teal-400"
              key={`${column}-${index}`}
            >
              {column}
            </div>
          ))}
          <div />

          {rows.map((row) => (
            <div className="contents" key={row.vowel}>
              {row.cells.map((cell, index) => (
                <div
                  className="flex h-24 flex-col items-center justify-start"
                  key={`${row.vowel}-${index}`}
                >
                  {cell ? (
                    <button
                      aria-label={`Play ${cell.reading}`}
                      className="group -m-2 rounded-2xl p-2 text-center transition hover:bg-washi focus:outline-none focus:ring-2 focus:ring-matcha"
                      onClick={() => void playPronunciation(cell)}
                      type="button"
                    >
                      <p className="text-5xl font-semibold leading-none text-black transition group-hover:text-matcha">
                        {cell.character}
                      </p>
                      <p
                        className={
                          cell.underline
                            ? "mt-1 text-2xl leading-none text-slate-500 underline"
                            : "mt-1 text-2xl leading-none text-slate-500"
                        }
                      >
                        {cell.reading}
                      </p>
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="flex h-24 items-start justify-center text-3xl font-semibold text-yellow-400">
                {row.vowel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {playback.status === "failed" && playback.message ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {playback.message}
        </p>
      ) : null}
    </section>
  );
}
