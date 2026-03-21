"use client";

import { useRef, useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

type CarouselProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Carousel({ title, children, className = "mt-32 w-full" }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    // 1px buffer to handle subpixel rounding
    setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    handleScroll(); // initial check
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    // Scroll by roughly the width of one card (assuming they take up ~50% minus gap)
    const amount = scrollRef.current.clientWidth * 0.5 + 16; 
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!showLeft}
            className="p-2 rounded-full border border-black/10 text-black/60 hover:text-black hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll left"
          >
            <CaretLeft weight="bold" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!showRight}
            className="p-2 rounded-full border border-black/10 text-black/60 hover:text-black hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll right"
          >
            <CaretRight weight="bold" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pt-8 -mt-8 pb-12 -mb-12 pr-[calc(50vw-50%)] -mr-[calc(50vw-50%)] pl-4 -ml-4 sm:pl-0 sm:-ml-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
