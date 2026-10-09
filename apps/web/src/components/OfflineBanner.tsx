"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, WifiOff } from "lucide-react";
import { PROGRESS_SYNCED_EVENT } from "@/lib/progress";
import { useOnline } from "@/lib/useOnline";

const SYNCED_MESSAGE_MS = 4500;

export function OfflineBanner() {
  const online = useOnline();
  const [synced, setSynced] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-offline", !online);
  }, [online]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function showSynced(event: Event) {
      const count = (event as CustomEvent<{ count: number }>).detail?.count ?? 0;
      if (!count) return;
      setSynced(count);
      clearTimeout(timer);
      timer = setTimeout(() => setSynced(null), SYNCED_MESSAGE_MS);
    }
    window.addEventListener(PROGRESS_SYNCED_EVENT, showSynced);
    return () => {
      window.removeEventListener(PROGRESS_SYNCED_EVENT, showSynced);
      clearTimeout(timer);
    };
  }, []);

  if (online && synced === null) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
    >
      <div className="flex max-w-md items-start gap-2.5 rounded-2xl border border-white/70 bg-ink/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md">
        {online ? (
          <>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <span>
              Back online. Synced {synced} {synced === 1 ? "activity" : "activities"}.
            </span>
          </>
        ) : (
          <>
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
            <span>
              <span className="font-semibold">Offline.</span> Your progress is saved and will sync when you
              reconnect.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
