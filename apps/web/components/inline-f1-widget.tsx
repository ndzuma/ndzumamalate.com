"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";

export default function InlineF1Widget({ align = "auto" }: { align?: "left" | "center" | "right" | "auto" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if we're on mobile to adjust positioning so it doesn't overflow the screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            className={`absolute top-full pt-2 z-50 w-max ${positionClasses}`}
          >
            {/* Outer White wrapper */}
            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-1.5 shadow-xl font-sans">
              
              {/* Inner container */}
              <div className="bg-[#F6F5F3] rounded-xl flex flex-col">
                
                {/* Row 1: Content Columns */}
                <div className="flex flex-col sm:flex-row px-4 sm:px-5 py-4 sm:py-4 items-start sm:items-center">
                  
                  {/* Col 1: Latest Meeting */}
                  <div className="flex flex-col gap-3 min-w-[180px] sm:min-w-[130px] justify-center py-1 sm:py-0">
                    <img 
                      src="https://cdn.simpleicons.org/f1/E10600" 
                      alt="F1 Logo" 
                      className="h-5 sm:h-6 object-contain self-start" 
                    />
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="text-sm font-semibold text-black tracking-tight">Saudi Arabia</span>
                      <span className="text-[11px] text-black/50 font-medium">Jeddah Corniche</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] sm:w-[1px] sm:h-[60px] bg-black/10 my-4 sm:my-0 sm:mx-5" />

                  {/* Col 2: Drivers Championship */}
                  <div className="flex flex-col gap-2.5 min-w-[180px] sm:min-w-[130px] w-full sm:w-auto py-1 sm:py-0">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Drivers</span>
                    <div className="flex flex-col gap-1.5">
                      {/* Standing 1 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black text-right">1</span>
                        <div className="w-0.5 h-3.5 bg-[#3671C6] rounded-full mx-2"></div>
                        <span className="font-bold text-black w-8">VER</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium pl-3">+0.000</span>
                      </div>
                      {/* Standing 2 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">2</span>
                        <div className="w-0.5 h-3.5 bg-[#E8002D] rounded-full mx-2"></div>
                        <span className="font-bold text-black w-8">LEC</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium pl-3">+12.4</span>
                      </div>
                      {/* Standing 3 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">3</span>
                        <div className="w-0.5 h-3.5 bg-[#FF8000] rounded-full mx-2"></div>
                        <span className="font-bold text-black w-8">NOR</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium pl-3">+14.2</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] sm:w-[1px] sm:h-[60px] bg-black/10 my-4 sm:my-0 sm:mx-5" />

                  {/* Col 3: Teams Championship */}
                  <div className="flex flex-col gap-2.5 min-w-[180px] sm:min-w-[130px] w-full sm:w-auto py-1 sm:py-0">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Teams</span>
                    <div className="flex flex-col gap-1.5">
                      {/* Standing 1 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black text-right">1</span>
                        <div className="w-0.5 h-3.5 bg-[#3671C6] rounded-full mx-2"></div>
                        <span className="font-bold text-black">RBR</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium pl-3">113 PTS</span>
                      </div>
                      {/* Standing 2 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">2</span>
                        <div className="w-0.5 h-3.5 bg-[#E8002D] rounded-full mx-2"></div>
                        <span className="font-bold text-black">FER</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium pl-3">98 PTS</span>
                      </div>
                      {/* Standing 3 */}
                      <div className="flex items-center text-xs">
                        <span className="w-3 font-semibold text-black/60 text-right">3</span>
                        <div className="w-0.5 h-3.5 bg-[#FF8000] rounded-full mx-2"></div>
                        <span className="font-bold text-black">MCL</span>
                        <span className="text-[10px] text-black/50 ml-auto font-medium pl-3">84 PTS</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Horizontal Divider */}
                <div className="h-[1px] bg-black/10 mx-4 sm:mx-8" />

                {/* Row 2: Disclaimer */}
                <div className="py-3 px-4 text-center text-[10px] text-black/50 font-medium w-full max-w-[200px] sm:max-w-none mx-auto leading-[1.6]">
                  Data sourced from{' '}
                  <a 
                    href="https://openf1.org/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black inline-flex items-center gap-0.5 transition-all whitespace-nowrap hover:underline decoration-black/30 hover:decoration-black group"
                  >
                    openF1 API <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                  </a>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline">{' '}&amp;{' '}</span>
                  <a 
                    href="https://formula1.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black inline-flex items-center gap-0.5 transition-all whitespace-nowrap hover:underline decoration-black/30 hover:decoration-black group"
                  >
                    Formula1.com <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
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
