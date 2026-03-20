"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Link as LinkIcon } from "@phosphor-icons/react";

type InlineLinkProps = {
  title: string;
  url: string;
  label?: string;
  color?: "blue" | "orange" | "purple" | "green" | "gray" | "red";
};

export default function InlineLink({ 
  title, 
  url,
  label = "Visit link",
  color = "blue"
}: InlineLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colorStyles = {
    blue: "bg-blue-100 hover:bg-blue-200",
    orange: "bg-orange-100 hover:bg-orange-200",
    purple: "bg-purple-100 hover:bg-purple-200",
    green: "bg-green-100 hover:bg-green-200",
    gray: "bg-gray-100 hover:bg-gray-200",
    red: "bg-red-100 hover:bg-red-200",
  };

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span 
        className={`font-medium text-black px-1.5 py-0.5 rounded transition-colors cursor-pointer ${colorStyles[color]}`}
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
              className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <LinkIcon weight="bold" className="w-3.5 h-3.5" />
              {label}
              <ArrowUpRight weight="bold" className="w-3 h-3 opacity-50 ml-0.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
