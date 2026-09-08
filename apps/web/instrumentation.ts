export async function register() {
  // Only the Node server process should hold the API event subscription —
  // never the edge runtime and never the build step.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { startLiveSync } = await import("./lib/live-sync-server");
  startLiveSync();
}
