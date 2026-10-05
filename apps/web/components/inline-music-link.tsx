"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SpotifyLogo, AppleLogo } from "@phosphor-icons/react";

export default function InlineMusicLink({ spotifyUrl, appleMusicUrl }: { spotifyUrl?: string; appleMusicUrl?: string }) {
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
        the most amazing playlist on earth
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
              {spotifyUrl && (
                <a 
                  href={spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 popup-chip px-3 py-1.5 text-xs font-medium cursor-pointer"
                >
                  <SpotifyLogo weight="fill" className="w-4 h-4" />
                  Spotify
                </a>
              )}
              {appleMusicUrl && (
                <a 
                  href={appleMusicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 popup-chip px-3 py-1.5 text-xs font-medium cursor-pointer"
                >
                  <AppleLogo weight="fill" className="w-4 h-4" />
                  Apple Music
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}