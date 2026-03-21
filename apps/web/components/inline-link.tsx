"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Link as LinkIcon, XLogo, YoutubeLogo } from "@phosphor-icons/react";

type InlineLinkProps = {
  title: string;
  url: string;
  label?: string;
  color?: "blue" | "orange" | "purple" | "green" | "gray" | "red" | "black";
  iconType?: "link" | "x" | "youtube";
};

export default function InlineLink({ 
  title, 
  url,
  label = "Visit link",
  color = "blue",
  iconType = "link"
}: InlineLinkProps) {
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

  const colorStyles = {
    blue: "bg-blue-100 hover:bg-blue-200 text-black",
    orange: "bg-orange-100 hover:bg-orange-200 text-black",
    purple: "bg-purple-100 hover:bg-purple-200 text-black",
    green: "bg-green-100 hover:bg-green-200 text-black",
    gray: "bg-gray-100 hover:bg-gray-200 text-black",
    red: "bg-red-100 hover:bg-red-200 text-black",
    black: "bg-black/10 hover:bg-black/20 text-black",
  };

  const getIcon = () => {
    switch (iconType) {
      case "x":
        return <XLogo weight="fill" className="w-3.5 h-3.5" />;
      case "youtube":
        return <YoutubeLogo weight="fill" className="w-3.5 h-3.5" />;
      default:
        return <LinkIcon weight="bold" className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className={`font-medium px-1.5 py-0.5 rounded transition-colors cursor-pointer ${colorStyles[color]}`}
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
                className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                {getIcon()}
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
