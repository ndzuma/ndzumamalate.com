"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowsOutSimple, X } from "@phosphor-icons/react";

type CmsPreviewCardProps = {
  route: string;
  src: string;
  alt: string;
};

export function CmsPreviewCard({ route, src, alt }: CmsPreviewCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Prevent scrolling when zoomed
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isZoomed]);

  return (
    <>
      <div className="w-full aspect-[3568/2096] rounded-2xl bg-black/5 border border-black/10 overflow-hidden relative shadow-sm flex flex-col group">
        <div className="h-8 border-b border-black/10 bg-white/50 flex items-center px-4 gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[10px] font-mono text-black/40 ml-2">{route}</span>
        </div>
        <div className="flex-1 relative bg-white">
          <Image 
            src={src} 
            alt={alt} 
            fill 
            className="object-cover object-top"
            unoptimized
          />
          <button 
            onClick={() => setIsZoomed(true)}
            className="absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10"
            title="Zoom image"
          >
            <ArrowsOutSimple weight="bold" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
              onClick={() => setIsZoomed(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-7xl aspect-[3568/2096] flex flex-col items-center justify-center"
            >
              <button 
                onClick={() => setIsZoomed(false)}
                className="absolute -top-14 sm:-top-16 right-0 p-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all backdrop-blur-md z-20"
              >
                <X weight="bold" className="w-6 h-6" />
              </button>
              <div className="w-full h-full relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <Image 
                  src={src} 
                  alt={alt} 
                  fill 
                  className="object-contain"
                  unoptimized
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
