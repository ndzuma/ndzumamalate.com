"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EnvelopeSimple, ArrowUpRight } from "@phosphor-icons/react";

export default function InlineEmailLink() {
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
        className="font-medium text-black bg-blue-100 px-1 rounded hover:bg-blue-200 transition-colors cursor-pointer"
      >
        email
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full pt-2 z-10 w-max"
          >
            <div className="bg-white/90 backdrop-blur-md border border-black/10 rounded-xl p-1.5 shadow-lg flex items-center gap-1.5">
              <a 
                href="mailto:ndzumaxx@gmail.com" 
                className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <EnvelopeSimple weight="bold" className="w-4 h-4" />
                ndzumaxx@gmail.com
                <ArrowUpRight weight="bold" className="w-3 h-3 opacity-50 ml-0.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}