"use client";

import Link from "next/link";
import Image from "next/image";
import { GithubLogo, Globe } from "@phosphor-icons/react";

type FeaturedCardProps = {
  href: string;
  title: string;
  date?: string;
  image?: string;
  repoUrl?: string;
  liveUrl?: string;
  className?: string; // added to allow carousel sizing
};

export default function FeaturedCard({ href, title, date, image, repoUrl, liveUrl, className = "" }: FeaturedCardProps) {
  return (
    <div className={`group flex flex-col gap-4 snap-start shrink-0 ${className}`}>
      <div className="w-full aspect-[16/9] rounded-3xl bg-black/5 border border-black/10 overflow-hidden relative shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md block">
        <Link href={href} className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          {/* 
            When you have real images, replace the above pattern with:
            {image && <Image src={image} alt={title} fill className="object-cover" />}
          */}
        </Link>

        {/* Action Buttons (bottom-left) */}
        {(repoUrl || liveUrl) && (
          <div className="absolute bottom-3 left-3 flex gap-2 z-10">
            {repoUrl && (
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/btn flex items-center bg-white/60 backdrop-blur-md text-black/90 rounded-full p-2 hover:bg-white/90 hover:scale-[1.05] hover:-rotate-2 transition-all duration-300 shadow-sm"
                title="Go to repo"
              >
                <GithubLogo weight="bold" className="w-4 h-4 shrink-0" />
                <span className="max-w-0 overflow-hidden text-xs font-semibold whitespace-nowrap group-hover/btn:max-w-[80px] group-hover/btn:ml-1.5 transition-all duration-300 ease-out">
                  Go to repo
                </span>
              </a>
            )}
            {liveUrl && (
              <a 
                href={liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/btn flex items-center bg-white/60 backdrop-blur-md text-black/90 rounded-full p-2 hover:bg-white/90 hover:scale-[1.05] hover:rotate-2 transition-all duration-300 shadow-sm"
                title="Try it out"
              >
                <Globe weight="bold" className="w-4 h-4 shrink-0" />
                <span className="max-w-0 overflow-hidden text-xs font-semibold whitespace-nowrap group-hover/btn:max-w-[80px] group-hover/btn:ml-1.5 transition-all duration-300 ease-out">
                  Try it out
                </span>
              </a>
            )}
          </div>
        )}
      </div>
      
      <Link href={href} className="px-1 flex flex-col gap-1">
        <h3 className="font-medium text-[15px] sm:text-base tracking-tight group-hover:text-black/70 transition-colors">
          {title}
        </h3>
        {date && (
          <p className="text-sm text-black/40">
            {date}
          </p>
        )}
      </Link>
    </div>
  );
}