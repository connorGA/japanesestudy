"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getKatakanaAudioAssets } from "@/lib/api";
import { detachAudio, isPlayInterruptedError, playAudioElement, replaceAudio } from "@/lib/audioPlayback";
import type { AudioAsset } from "@/types/study";

type KatakanaCell = {
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
const rows: { vowel: string; cells: (KatakanaCell | null)[] }[] = [
  {
    vowel: "a",
    cells: [
      { character: "ン", reading: "n/m", underline: true },
      { character: "ワ", reading: "wa" },
      { character: "ラ", reading: "ra" },
      { character: "ヤ", reading: "ya" },
      { character: "マ", reading: "ma" },
      { character: "ハ", reading: "ha" },
      { character: "ナ", reading: "na" },
      { character: "タ", reading: "ta" },
      { character: "サ", reading: "sa" },
      { character: "カ", reading: "ka" },
      { character: "ア", reading: "a" },
    ],
  },
  {
    vowel: "i",
    cells: [
      null,
      null,
      { character: "リ", reading: "ri" },
      null,
      { character: "ミ", reading: "mi" },
      { character: "ヒ", reading: "hi" },
      { character: "ニ", reading: "ni" },
      { character: "チ", reading: "chi", underline: true },
      { character: "シ", reading: "shi", underline: true },
      { character: "キ", reading: "ki" },
      { character: "イ", reading: "i" },
    ],
  },
  {
    vowel: "u",
    cells: [
      null,
      null,
      { character: "ル", reading: "ru" },
      { character: "ユ", reading: "yu" },
      { character: "ム", reading: "mu" },
      { character: "フ", reading: "fu" },
      { character: "ヌ", reading: "nu" },
      { character: "ツ", reading: "tsu", underline: true },
      { character: "ス", reading: "su" },
      { character: "ク", reading: "ku" },
      { character: "ウ", reading: "u" },
    ],
  },
  {
    vowel: "e",
    cells: [
      null,
      null,
      { character: "レ", reading: "re" },
      null,
      { character: "メ", reading: "me" },
      { character: "ヘ", reading: "he" },
      { character: "ネ", reading: "ne" },
      { character: "テ", reading: "te" },
      { character: "セ", reading: "se" },
      { character: "ケ", reading: "ke" },
      { character: "エ", reading: "e" },
    ],
  },
  {
    vowel: "o",
    cells: [
      null,
      { character: "ヲ", reading: "o" },
      { character: "ロ", reading: "ro" },
      { character: "ヨ", reading: "yo" },
      { character: "モ", reading: "mo" },
      { character: "ホ", reading: "ho" },
      { character: "ノ", reading: "no" },
      { character: "ト", reading: "to" },
      { character: "ソ", reading: "so" },
      { character: "コ", reading: "ko" },
      { character: "オ", reading: "o" },
    ],
  },
];

export function KatakanaPronunciationChart() {
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [isFetchingAudio, setIsFetchingAudio] = useState(true);
  const [playback, setPlayback] = useState<PlaybackState>({ status: "idle" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioByCharacter = useMemo(
    () => new Map(assets.map((asset) => [asset.text, asset])),
    [assets],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadManifest() {
      setIsFetchingAudio(true);
      try {
        const manifest = await getKatakanaAudioAssets();
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
                : "Could not load Katakana pronunciation audio.",
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
      detachAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  async function playPronunciation(cell: KatakanaCell) {
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
          "Audio is not stored yet. Run the Katakana audio generator after setting ElevenLabs.",
      });
      return;
    }

    try {
      const audio = replaceAudio(audioRef.current, asset.public_url);
      audioRef.current = audio;
      audio.onended = () => setPlayback({ activeCharacter: cell.character, status: "idle" });
      const started = await playAudioElement(audio);
      if (started) {
        setPlayback({ activeCharacter: cell.character, status: "playing" });
      }
    } catch (err) {
      if (isPlayInterruptedError(err)) return;
      setPlayback({
        activeCharacter: cell.character,
        status: "failed",
        message: err instanceof Error ? err.message : "Could not play pronunciation.",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <h1 className="text-3xl font-medium tracking-tight text-black sm:text-5xl md:text-6xl">
          Katakana Chart
        </h1>
        <div className="flex items-center gap-2 rounded-full bg-washi px-3 py-2 text-xs font-semibold text-slate-600 sm:px-4 sm:text-sm">
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

      <div className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:mt-8 sm:px-0">
        <div className="min-w-[44rem] sm:min-w-[58rem]">
          <div className="grid grid-cols-[repeat(11,minmax(0,1fr))_2rem] gap-x-4 sm:gap-x-8">
            {columns.map((column, index) => (
              <div
                className="pb-3 text-center text-xl font-semibold text-teal-400 sm:text-3xl"
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
                    className="flex h-20 flex-col items-center justify-start sm:h-24"
                    key={`${row.vowel}-${index}`}
                  >
                    {cell ? (
                      <button
                        aria-label={`Play ${cell.reading}`}
                        className="group -m-2 rounded-2xl p-2 text-center transition hover:bg-washi focus:outline-none focus:ring-2 focus:ring-matcha"
                        onClick={() => void playPronunciation(cell)}
                        type="button"
                      >
                        <p className="text-4xl font-semibold leading-none text-black transition group-hover:text-matcha sm:text-5xl">
                          {cell.character}
                        </p>
                        <p
                          className={
                            cell.underline
                              ? "mt-1 text-lg leading-none text-slate-500 underline sm:text-2xl"
                              : "mt-1 text-lg leading-none text-slate-500 sm:text-2xl"
                          }
                        >
                          {cell.reading}
                        </p>
                      </button>
                    ) : null}
                  </div>
                ))}
                <div className="flex h-20 items-start justify-center text-xl font-semibold text-yellow-400 sm:h-24 sm:text-3xl">
                  {row.vowel}
                </div>
              </div>
            ))}
          </div>
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
