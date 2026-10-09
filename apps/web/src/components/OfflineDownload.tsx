"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CloudDownload, Loader2, RefreshCw } from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  downloadJapaneseOfflinePack,
  formatBytes,
  offlineSupported,
  useOfflinePack,
  type OfflineDownloadState,
  type OfflinePackStatus,
} from "@/lib/offline";

const phaseLabel = {
  data: "Saving lessons",
  audio: "Saving audio",
  pages: "Saving pages",
} as const;

function progressOf(download: OfflineDownloadState) {
  if (download.phase !== "data" && download.phase !== "audio" && download.phase !== "pages") return null;
  return { ...download, label: phaseLabel[download.phase], percent: download.total ? (download.done / download.total) * 100 : 0 };
}

function formatUpdated(timestamp: number) {
  const date = new Date(timestamp);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? `today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function summary(status: OfflinePackStatus) {
  return `${status.clips} clips · ${formatBytes(status.bytes)} · updated ${formatUpdated(status.downloadedAt)}`;
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

function startDownload() {
  downloadJapaneseOfflinePack().catch(() => undefined);
}

export function OfflineDownload() {
  const { status, download } = useOfflinePack();
  const hydrated = useHydrated();
  const progress = progressOf(download);
  const supported = hydrated && offlineSupported();

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-sm sm:p-6" id="offline">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha">Offline mode</p>
          <p className="mt-1 text-sm text-slate-600">
            Save every Japanese lesson, game, and audio clip to this device so you can study without a connection.
            Progress made offline syncs when you reconnect.
          </p>
        </div>
        <button
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!supported || Boolean(progress)}
          onClick={startDownload}
          type="button"
        >
          {progress ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <CloudDownload className="h-4 w-4" />
          )}
          {progress ? "Downloading…" : status ? "Update" : "Make available offline"}
        </button>
      </div>

      {progress ? (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>{progress.label}</span>
            <span>
              {progress.done} / {progress.total}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-matcha transition-[width]" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Keep this page open until it finishes.</p>
        </div>
      ) : null}

      {!progress && hydrated && status ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-matcha/10 px-4 py-3 text-sm text-ink">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-matcha" />
          <div className="min-w-0">
            <p className="font-semibold">Ready offline</p>
            <p className="text-slate-600">{summary(status)}</p>
            {status.failed ? (
              <p className="mt-1 text-xs font-semibold text-amber-700">
                {status.failed} {status.failed === 1 ? "clip" : "clips"} didn&apos;t finish downloading. Tap Update to retry.
              </p>
            ) : null}
            {!status.serviceWorker ? (
              <p className="mt-1 text-xs text-slate-500">
                Audio is saved, but pages only work offline in the installed app (open the live site, then Add to Home Screen).
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!progress && hydrated && status && status.missing.length ? (
        <details className="mt-3 text-sm text-slate-600">
          <summary className="cursor-pointer font-semibold">
            {status.missing.length} {status.missing.length === 1 ? "clip hasn't" : "clips haven't"} been generated yet
          </summary>
          <p className="mt-2 text-xs text-slate-500">
            These haven&apos;t been generated on the server. Text still shows offline; tap Update after they&apos;re ready.
          </p>
          <p className="mt-2 max-h-32 overflow-y-auto break-words rounded-2xl bg-white/70 p-3 text-xs">
            {status.missing.join(" · ")}
          </p>
        </details>
      ) : null}

      {download.phase === "error" ? <p className="mt-3 text-sm font-semibold text-red-600">{download.message}</p> : null}
      {hydrated && !supported ? (
        <p className="mt-3 text-sm text-slate-500">This browser doesn&apos;t support offline storage.</p>
      ) : null}
    </section>
  );
}

export function OfflineMenuRow({ className }: { className?: string }) {
  const { status, download } = useOfflinePack();
  const hydrated = useHydrated();
  const progress = progressOf(download);
  const supported = hydrated && offlineSupported();

  return (
    <button
      className={twMerge(
        "flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition active:bg-white disabled:opacity-70",
        className,
      )}
      disabled={!supported || Boolean(progress)}
      onClick={startDownload}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2">
        {progress ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : status ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-matcha" />
        ) : (
          <CloudDownload className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate">
          {progress
            ? `${progress.label} ${Math.round(progress.percent)}%`
            : status
              ? "Ready offline"
              : "Make available offline"}
        </span>
      </span>
      {!progress && status ? <span className="shrink-0 text-xs font-medium text-slate-500">Update</span> : null}
    </button>
  );
}
