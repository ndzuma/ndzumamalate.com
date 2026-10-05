"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen } from "@phosphor-icons/react";

export default function InlineBookLink({ title, url }: { title: string; url: string }) {
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
        className="inline-trigger"
      >
        {title}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-2 z-10 w-max max-w-[85vw] sm:max-w-none"
          >
            <div className="popup-surface p-1.5 flex items-center gap-1.5">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 popup-chip px-3 py-1.5 text-xs font-medium cursor-pointer"
              >
                <BookOpen weight="fill" className="w-4 h-4" />
                Book Link
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}