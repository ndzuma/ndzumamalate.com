"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";

export default function InlineProjectLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span 
        className="font-medium text-black bg-blue-100 px-1 rounded hover:bg-blue-200 transition-colors cursor-pointer"
      >
        probeTool
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
              href="https://github.com/ndzuma/probeTool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <GithubLogo weight="fill" className="w-4 h-4" />
              See project
              <ArrowUpRight weight="bold" className="w-3 h-3 opacity-50 ml-0.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}