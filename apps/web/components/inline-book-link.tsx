"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen } from "@phosphor-icons/react";

export default function InlineBookLink({ title, url }: { title: string; url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span 
        className="font-medium text-black bg-orange-100 px-1 rounded hover:bg-orange-200 transition-colors cursor-pointer"
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
            className="absolute left-0 top-full mt-2 bg-white/90 backdrop-blur-md border border-black/10 rounded-xl p-1.5 shadow-lg flex items-center gap-1.5 z-10 w-max"
          >
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#e9e5cd]/60 hover:bg-[#e9e5cd] text-[#382110] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <BookOpen weight="fill" className="w-4 h-4" />
              Book Link
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}