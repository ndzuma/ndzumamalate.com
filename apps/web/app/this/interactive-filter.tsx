"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

export function InteractiveFilter() {
  const [activeDesktopFilter, setActiveDesktopFilter] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeMobileFilter, setActiveMobileFilter] = useState("All");

  return (
    <div>
      <div className="text-xs font-mono text-black/40 mb-3">Filter Dropdown (Interactive)</div>
      <div className="flex flex-col gap-6">
        {/* Desktop mock */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/40">Desktop:</span>
          <div className="flex gap-2">
            {["All", "Go", "NextJS"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveDesktopFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  activeDesktopFilter === filter 
                    ? "bg-black text-white" 
                    : "bg-black/5 text-black/70 hover:bg-black/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile mock */}
        <div className="flex items-center gap-3 max-w-[200px] relative">
          <span className="text-xs text-black/40">Mobile:</span>
          <div className="relative w-full">
            <button 
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors text-black/80 text-xs font-medium border border-black/5"
            >
              {activeMobileFilter} <CaretDown weight="bold" className={`transition-transform ${isMobileFilterOpen ? "rotate-180" : ""}`} />
            </button>
            {isMobileFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-black/10 rounded-xl shadow-lg z-20 flex flex-col py-1 overflow-hidden">
                {["All", "Go", "NextJS"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveMobileFilter(filter);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`text-left px-4 py-2 text-xs hover:bg-black/5 transition-colors ${
                      activeMobileFilter === filter ? "bg-black/5 font-medium text-black" : "text-black/70"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
