"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function InlineTechLink() {
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

  const topics = [
    "Programming",
    "PC building",
    "Home labbing",
    "Consumer tech"
  ];

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className="inline-trigger cursor-default"
      >
        tech
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
            <div className="popup-surface p-1.5 grid grid-cols-2 gap-1">
              {topics.map((topic, i) => (
                <div 
                  key={i}
                  className="popup-chip px-3 py-1.5 text-xs font-medium text-center cursor-default"
                >
                  {topic}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
