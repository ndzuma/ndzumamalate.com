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
        className="font-medium text-black bg-purple-100 px-1 rounded hover:bg-purple-200 transition-colors cursor-default"
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
            <div className="bg-white/90 backdrop-blur-md border border-black/10 rounded-xl p-1.5 shadow-lg grid grid-cols-2 gap-1">
              {topics.map((topic, i) => (
                <div 
                  key={i}
                  className="bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-black transition-colors px-3 py-1.5 rounded-lg text-xs font-medium text-center cursor-default"
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
