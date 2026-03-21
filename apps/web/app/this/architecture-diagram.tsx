import { Database, HardDrives, CodeBlock, AppWindow, UserCircle } from "@phosphor-icons/react/dist/ssr";

export function ArchitectureDiagram() {
  return (
    <div className="mt-8 p-6 sm:p-8 rounded-3xl border border-black/10 bg-black/[0.02] overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative">

        {/* Frontend Side */}
        <div className="flex flex-col gap-4 w-full md:w-auto z-10">
          <div className="flex items-center gap-4 p-4 bg-white border border-black/10 rounded-2xl shadow-sm w-full md:w-56">
            <AppWindow className="w-6 h-6 text-black/50" />
            <div>
              <div className="text-sm font-medium">Next.js Client</div>
              <div className="text-xs text-black/50 font-mono">React 19 • App Router</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white border border-black/10 rounded-2xl shadow-sm w-full md:w-56">
            <UserCircle className="w-6 h-6 text-black/50" />
            <div>
              <div className="text-sm font-medium">Svelte Admin</div>
              <div className="text-xs text-black/50 font-mono">Embedded SPA</div>
            </div>
          </div>
        </div>

        {/* Connector Lines */}
        <div className="flex md:flex-col items-center justify-center gap-2 text-black/30 font-mono text-[10px] uppercase tracking-widest md:w-24 rotate-90 md:rotate-0 z-0">
          <span className="bg-black/5 px-2 py-1 rounded -rotate-90 md:rotate-0">REST API</span>
          <div className="w-full h-px bg-black/10 border-t border-dashed border-black/20" />
        </div>

        {/* Backend Side */}
        <div className="flex flex-col gap-4 w-full md:w-auto z-10">
          <div className="flex items-center gap-4 p-4 bg-black text-white border border-black rounded-2xl shadow-md w-full md:w-56 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:8px_8px]" />
            <CodeBlock className="w-6 h-6 text-white/70 relative z-10" />
            <div className="relative z-10">
              <div className="text-sm font-medium">Go Binary</div>
              <div className="text-xs text-white/50 font-mono">Echo v4 • API Core</div>
            </div>
          </div>
          <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-56">
            <div className="flex items-center gap-2 text-xs font-mono text-black/60 bg-white border border-black/10 px-3 py-2 rounded-xl flex-1 justify-center">
              <Database className="w-4 h-4" /> PostgreSQL
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-black/60 bg-white border border-black/10 px-3 py-2 rounded-xl flex-1 justify-center">
              <HardDrives className="w-4 h-4" /> Redis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
