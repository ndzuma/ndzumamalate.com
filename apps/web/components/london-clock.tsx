"use client";

import { useEffect, useState } from "react";

function formatLondon(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Europe/London",
  })
    .format(date)
    .toLowerCase();
}

export default function LondonClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatLondon(new Date()));
    tick();
    // Align updates to the minute boundary so the display never lags.
    const now = new Date();
    const untilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, untilNextMinute);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      <span className="tabular-nums">{time ?? "--:--"}</span> in London, UK
    </span>
  );
}
