"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";

export default function InlineF1Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className="font-medium text-black bg-red-100 px-1 rounded hover:bg-red-200 transition-colors cursor-pointer"
      >
        F1
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-2 z-50 w-max"
          >
            {/* Outer White wrapper with padding exactly like the other inline components */}
            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-1.5 shadow-xl font-sans">
              
              {/* Inner container with the off-white shade matching your page layout */}
              <div className="bg-[#fafafa] rounded-xl border border-black/5 flex flex-col">
                
                {/* Row 1: Content Columns */}
                <div className="flex px-5 py-4 items-center">
                  
                  {/* Col 1: Latest Meeting */}
                  <div className="flex flex-col gap-3 min-w-[130px] justify-center">
                    <img 
                      src="https://cdn.simpleicons.org/f1/E10600" 
                      alt="F1 Logo" 
                      className="h-6 object-contain self-start" 
                    />
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="text-sm font-semibold text-black tracking-tight">Saudi Arabia</span>
                      <span className="text-[11px] text-black/50 font-medium">Jeddah Corniche</span>
                    </div>
                  </div>

                  {/* Vertical Divider (doesn't touch edges) */}
                  <div className="w-[1px] h-[60px] bg-black/10 mx-5" />

                  {/* Col 2: Drivers Championship */}
                  <div className="flex flex-col gap-2.5 min-w-[130px]">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Drivers</span>
                    <div className="flex flex-col gap-1.5">
                      {/* Standing 1 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black text-right">1</span>
                        <div className="w-0.5 h-3.5 bg-[#3671C6] rounded-full mx-2"></div>
                        <span className="font-bold text-black w-8">VER</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium">+0.000</span>
                      </div>
                      {/* Standing 2 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">2</span>
                        <div className="w-0.5 h-3.5 bg-[#E8002D] rounded-full mx-2"></div>
                        <span className="font-bold text-black w-8">LEC</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium">+12.4</span>
                      </div>
                      {/* Standing 3 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">3</span>
                        <div className="w-0.5 h-3.5 bg-[#FF8000] rounded-full mx-2"></div>
                        <span className="font-bold text-black w-8">NOR</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium">+14.2</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider (doesn't touch edges) */}
                  <div className="w-[1px] h-[60px] bg-black/10 mx-5" />

                  {/* Col 3: Teams Championship */}
                  <div className="flex flex-col gap-2.5 min-w-[130px]">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Teams</span>
                    <div className="flex flex-col gap-1.5">
                      {/* Standing 1 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black text-right">1</span>
                        <div className="w-0.5 h-3.5 bg-[#3671C6] rounded-full mx-2"></div>
                        <span className="font-bold text-black">RBR</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium">113 PTS</span>
                      </div>
                      {/* Standing 2 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">2</span>
                        <div className="w-0.5 h-3.5 bg-[#E8002D] rounded-full mx-2"></div>
                        <span className="font-bold text-black">FER</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium">98 PTS</span>
                      </div>
                      {/* Standing 3 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">3</span>
                        <div className="w-0.5 h-3.5 bg-[#FF8000] rounded-full mx-2"></div>
                        <span className="font-bold text-black">MCL</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium">84 PTS</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Horizontal Divider (doesn't touch edges) */}
                <div className="h-[1px] bg-black/10 mx-8" />

                {/* Row 2: Disclaimer */}
                <div className="py-2.5 px-4 flex justify-center items-center text-[10px] text-black/50 font-medium">
                  Data sourced from 
                  <a 
                    href="https://openf1.org/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black underline decoration-black/30 hover:decoration-black inline-flex items-center gap-0.5 transition-colors ml-1"
                  >
                    openF1 API <ArrowUpRight className="w-2.5 h-2.5" weight="bold" />
                  </a>
                  <span className="mx-1.5">&amp;</span>
                  <a 
                    href="https://formula1.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black underline decoration-black/30 hover:decoration-black inline-flex items-center gap-0.5 transition-colors"
                  >
                    Formula1.com <ArrowUpRight className="w-2.5 h-2.5" weight="bold" />
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
