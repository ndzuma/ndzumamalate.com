"use client";

import { useState } from "react";

export function ExperienceDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!description) return null;
  
  return (
    <div>
      <p className={`text-base text-black/70 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
        {description}
      </p>
      {description.length > 150 && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-black/50 hover:text-black mt-2 transition-colors"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}