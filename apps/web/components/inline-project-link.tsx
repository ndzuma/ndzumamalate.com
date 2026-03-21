"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import posthog from "posthog-js";

type InlineProjectLinkProps = {
  title?: string;
  url?: string;
  label?: string;
};

export default function InlineProjectLink({ 
  title = "probeTool", 
  url = "https://github.com/ndzuma/probeTool",
  label = "See project"
}: InlineProjectLinkProps) {
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
        {title}
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
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => posthog.capture('project_link_clicked', { project: title })}
                className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <GithubLogo weight="fill" className="w-4 h-4" />
                {label}
                <ArrowUpRight weight="bold" className="w-3 h-3 opacity-50 ml-0.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}