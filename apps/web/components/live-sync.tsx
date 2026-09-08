"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the open tab in sync with the CMS: whenever the server reports a
 * content change (after its cache is already refreshed), re-render the
 * current route's server components in place. No reload, no flash.
 */
export default function LiveSync() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    const source = new EventSource("/api/live");

    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      // Coalesce bursts of events (e.g. reorder clicks) into one refresh.
      timer.current = setTimeout(() => router.refresh(), 120);
    };

    source.addEventListener("change", refresh);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      source.close();
    };
  }, [router]);

  return null;
}
