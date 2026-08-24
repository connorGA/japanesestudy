"use client";

import { useEffect } from "react";
import { syncProgress } from "@/lib/progress";

export function ProgressTracker() {
  useEffect(() => {
    const sync = () => void syncProgress();
    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    sync();
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", syncWhenVisible);
    return () => {
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", syncWhenVisible);
    };
  }, []);

  return null;
}
