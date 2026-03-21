"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FilePdf, ArrowUpRight } from "@phosphor-icons/react";
import posthog from "posthog-js";
import type { CV } from "../types/api";

type InlineCvLinkProps = {
  cv: CV | null;
};

export default function InlineCvLink({ cv }: InlineCvLinkProps) {
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

  // If we don't have an active CV loaded, just show text without hover interaction
  if (!cv?.file_url) {
    return <span className="font-medium">CV</span>;
  }

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className="font-medium text-black bg-pink-100 px-1 rounded hover:bg-pink-200 transition-colors cursor-pointer"
      >
        CV
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-2 z-10 w-max"
          >
            <div className="bg-white/90 backdrop-blur-md border border-black/10 rounded-xl p-1.5 shadow-lg flex items-center gap-1.5">
              <a 
                href={cv.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => posthog.capture('cv_viewed')}
                className="flex items-center gap-1.5 bg-[#E23636]/10 hover:bg-[#E23636]/20 text-[#E23636] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <FilePdf weight="fill" className="w-4 h-4" />
                {cv.label || "View Resume"}
                <ArrowUpRight weight="bold" className="w-3 h-3 opacity-50 ml-0.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
