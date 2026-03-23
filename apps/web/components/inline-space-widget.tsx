"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";

// Dummy data for initial UI build
// Set a launch date 2 days, 14 hours, 45 mins in the future for dummy countdown
const dummyLaunchDate = new Date(Date.now() + 1000 * (2 * 86400 + 14 * 3600 + 45 * 60));

const dummyData = {
  missionName: "Starlink Group 7-16",
  provider: "SpaceX",
  targetDate: dummyLaunchDate,
  rocketImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=200&auto=format&fit=crop",
  companyLogo: "https://cdn.simpleicons.org/spacex/black",
};

export default function InlineSpaceWidget({ align = "auto" }: { align?: "left" | "center" | "right" | "auto" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = dummyData.targetDate.getTime() - now.getTime();
      
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
              <div className="bg-[#F6F5F3] rounded-xl flex flex-col overflow-hidden relative w-[320px] sm:w-[400px]">
                
                {/* Main Content Row */}
                <div className="flex flex-row p-3 gap-4 relative">
                  
                  {/* Col 1: Padded Image */}
                  <img 
                    src={dummyData.rocketImage} 
                    alt="Rocket" 
                    className="w-24 h-24 object-cover rounded-xl shrink-0" 
                  />
                  
                  {/* Col 2: Details */}
                  <div className="flex flex-col flex-1 justify-center min-w-0 pr-12">
                    <span className="text-sm font-semibold text-black tracking-tight truncate leading-tight">
                      {dummyData.missionName}
                    </span>
                    <span className="text-[11px] text-black/70 font-medium mt-1 truncate">
                      {dummyData.provider}
                    </span>
                    <span className="text-[11px] font-mono text-black/60 font-medium mt-1 truncate tracking-wide">
                      {timeLeft || "Calculating..."}
                    </span>
                  </div>

                  {/* Company Logo Top Right (Absolutely positioned to top right of parent) */}
                  <img 
                    src={dummyData.companyLogo} 
                    alt="Company Logo" 
                    className="absolute right-3 top-3 w-8 h-8 object-contain opacity-20 mix-blend-multiply" 
                  />

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
