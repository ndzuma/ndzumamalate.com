"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Play, Link as LinkIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { SpaceLaunch } from "../types/api";

let globalSpaceData: SpaceLaunch | null = null;
let globalSpacePromise: Promise<SpaceLaunch> | null = null;

export default function InlineSpaceWidget({ align = "auto" }: { align?: "left" | "center" | "right" | "auto" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [data, setData] = useState<SpaceLaunch | null>(globalSpaceData);
  const [loading, setLoading] = useState(!globalSpaceData);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (globalSpaceData) return;
    
    if (!globalSpacePromise) {
      globalSpacePromise = api.getSpaceData();
    }
    
    globalSpacePromise.then(res => {
      globalSpaceData = res;
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch Space data", err);
      setError(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!data) return;

    const targetDate = new Date(data.net);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("T- 00:00:00:00");
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      const dStr = d > 0 ? `${d}d ` : "";
      const hStr = h.toString().padStart(2, '0');
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');

      setTimeLeft(`T- ${dStr}${hStr}:${mStr}:${sStr}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  let positionClasses = "";
  if (isMobile && align === "center") {
    positionClasses = "left-1/2 -translate-x-1/2 origin-top";
  } else if (align === "left") {
    positionClasses = "left-0 origin-top-left";
  } else if (align === "right") {
    positionClasses = "right-0 origin-top-right";
  } else {
    positionClasses = isMobile ? 'right-0 origin-top-right' : 'left-0 origin-top-left';
  }

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className="font-medium text-blue-900 bg-blue-100 px-1 rounded hover:bg-blue-200 transition-colors cursor-pointer"
      >
        launch
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full pt-2 z-50 w-max ${positionClasses}`}
          >
            {/* Outer wrapper */}
            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-1.5 shadow-xl font-sans w-max max-w-[calc(100vw-2rem)] sm:max-w-none">
              
              {/* Inner container */}
              <div className="bg-[#F6F5F3] rounded-xl flex flex-col overflow-hidden relative w-[340px] sm:w-[460px]">
                
                {/* Main Content Row */}
                <div className="flex flex-row p-3 gap-4 relative min-h-[120px]">
                  
                  {loading || error || !data ? (
                    <>
                      {/* Loading Skeleton */}
                      <div className="w-24 h-24 bg-black/5 rounded-xl shrink-0 animate-pulse" />
                      <div className="flex flex-col flex-1 justify-center min-w-0 pr-[72px] gap-2">
                        <div className="h-4 w-3/4 bg-black/5 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-black/5 rounded animate-pulse" />
                        <div className="h-2.5 w-2/3 bg-black/5 rounded animate-pulse mt-0.5" />
                        <div className="flex items-center gap-3 mt-1">
                          <div className="h-3 w-20 bg-black/5 rounded animate-pulse" />
                          <div className="h-3 w-12 bg-black/5 rounded animate-pulse" />
                          <div className="h-3 w-12 bg-black/5 rounded animate-pulse" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Col 1: Padded Image */}
                      <img 
                        src={data.image || "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=200&auto=format&fit=crop"} 
                        alt="Rocket" 
                        className="w-24 h-24 object-cover rounded-xl shrink-0" 
                      />
                      
                      {/* Col 2: Details */}
                      <div className="flex flex-col flex-1 justify-center min-w-0 pr-[72px]">
                        <span className="text-sm font-semibold text-black tracking-tight leading-tight">
                          {data.name}
                        </span>
                        <span className="text-[11px] text-black/70 font-medium mt-1 truncate">
                          {data.provider}
                        </span>
                        <span className="text-[10px] text-black/50 truncate mt-0.5">
                          {data.pad}, {data.location}
                        </span>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] font-mono text-black/60 font-medium truncate tracking-wide">
                            {timeLeft || "Calculating..."}
                          </span>
                          <div className="flex items-center gap-2.5">
                            {data.stream_url && (
                              <a 
                                href={data.stream_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Play weight="fill" className="w-2.5 h-2.5" /> Watch
                              </a>
                            )}
                            <a 
                              href={data.info_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1 text-[10px] font-semibold text-black/40 hover:text-black/70 transition-colors"
                            >
                              <LinkIcon weight="bold" className="w-2.5 h-2.5" /> Company
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Company Logo Top Right (Absolutely positioned to top right of parent) */}
                      {data.provider_logo && (
                        <div className="absolute right-3 top-3 w-[72px] h-[72px] pl-2 bg-[#F6F5F3] flex items-start justify-end">
                          <img 
                            src={data.provider_logo} 
                            alt="Company Logo" 
                            className="w-full h-full object-contain object-top" 
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="h-[1px] bg-black/10 mx-4 sm:mx-5" />

                {/* Footer Disclaimer */}
                <div className="py-3 px-4 text-center text-[10px] text-black/50 font-medium w-full leading-[1.6]">
                  Data sourced from{' '}
                  <a 
                    href="https://thespacedevs.com/llapi" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black hover:underline decoration-black/30 hover:decoration-black inline-flex items-center gap-0.5 transition-all whitespace-nowrap group"
                  >
                    Launch Library 2 <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                  </a>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline">{' '}&amp;{' '}</span>
                  <a 
                    href="https://www.nasa.gov/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black hover:underline decoration-black/30 hover:decoration-black inline-flex items-center gap-0.5 transition-all whitespace-nowrap group"
                  >
                    NASA <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
