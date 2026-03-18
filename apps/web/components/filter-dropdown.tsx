"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretDown, Check } from "@phosphor-icons/react";

type FilterDropdownProps = {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
};

export default function FilterDropdown({ options, selected, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-end mb-8 border-b border-black/5 pb-4 relative z-20">
      <div className="flex items-center gap-3">
        <span className="text-sm text-black/40">Filter by:</span>

        {/* Desktop Row */}
        <div className="hidden sm:flex gap-2 items-center text-sm">
          {options.map(tag => (
            <button 
              key={tag} 
              onClick={() => onChange(tag)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                selected === tag 
                  ? "bg-black text-white" 
                  : "bg-black/5 hover:bg-black/10 text-black/70"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Mobile Custom Dropdown */}
        <div className="sm:hidden relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-black/80 text-sm font-medium transition-colors w-40"
          >
            {selected}
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <CaretDown weight="bold" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl p-1.5 shadow-xl flex flex-col z-50 origin-top-right"
              >
                {options.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      onChange(tag);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                      selected === tag ? "bg-black/5 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    {tag}
                    {selected === tag && <Check weight="bold" className="text-black" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}