"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GithubLogo, LinkedinLogo, XLogo, ThreadsLogo } from "@phosphor-icons/react";
import { Profile } from "../types/api";

type InlineSocialLinkProps = {
  profile?: Profile | null;
};

export default function InlineSocialLink({ profile }: InlineSocialLinkProps) {
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
        social media
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
            <div className="bg-white/90 backdrop-blur-md border border-black/10 rounded-xl p-1.5 shadow-lg flex items-center gap-1">
              <a 
                href={profile?.linkedin_url || "https://linkedin.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] p-2 rounded-lg transition-colors cursor-pointer"
                aria-label="LinkedIn"
              >
                <LinkedinLogo weight="fill" className="w-4 h-4" />
              </a>
              <a 
                href={profile?.github_url || "https://github.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-black/5 hover:bg-black/10 text-black p-2 rounded-lg transition-colors cursor-pointer"
                aria-label="GitHub"
              >
                <GithubLogo weight="fill" className="w-4 h-4" />
              </a>
              <a 
                href={profile?.twitter_url || "https://twitter.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] p-2 rounded-lg transition-colors cursor-pointer"
                aria-label="Twitter / X"
              >
                <XLogo weight="fill" className="w-4 h-4" />
              </a>
              <a 
                href={profile?.threads_url || "https://threads.net"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-black/5 hover:bg-black/10 text-black p-2 rounded-lg transition-colors cursor-pointer"
                aria-label="Threads"
              >
                <ThreadsLogo weight="fill" className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}