"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const sections = [
  { id: "architecture", label: "01 Architecture & Systems" },
  { id: "api-design", label: "02 API & Routing Design" },
  { id: "custom-cms", label: "03 Custom Embedded CMS" },
  { id: "design-system", label: "04 Design System & Components" },
  { id: "sitemap", label: "05 Sitemap" },
  { id: "database-schema", label: "06 Database Schema" },
  { id: "inspirations", label: "07 Inspirations" },
];

export function TableOfContents() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:flex flex-col gap-3 sticky top-32">
      <div className="text-xs font-mono text-black/40 uppercase tracking-widest mb-2">On this page</div>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`text-sm transition-all duration-300 flex items-center gap-3 ${
            activeId === section.id 
              ? "text-blue-600 font-medium" 
              : "text-black/40 hover:text-black/70"
          }`}
        >
          {activeId === section.id && (
            <motion.div 
              layoutId="active-toc-indicator"
              className="w-1.5 h-1.5 rounded-full bg-blue-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <span className={activeId === section.id ? "" : "ml-4"}>
            {section.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
