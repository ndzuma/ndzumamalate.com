"use client";

import Image from "next/image";
import Link from "next/link";
import { GithubLogo, LinkedinLogo, XLogo, ThreadsLogo, ArrowUp } from "@phosphor-icons/react";

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-32 pt-12 pb-8 border-t border-black/10 flex flex-col gap-16 font-sans w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        
        {/* Left: Logo */}
        <Link href="/" className="hover:scale-105 transition-transform">
          <Image 
            src="/assets/Face logo.svg" 
            alt="ndzuma malate" 
            width={56} 
            height={56} 
            className="opacity-90"
          />
        </Link>

        {/* Right: Message & Email */}
        <div className="flex flex-col sm:items-end gap-1">
          <p className="text-xl sm:text-2xl font-medium tracking-tight text-black/90">
            Thanks for stopping by.
          </p>
          <a 
            href="mailto:ndzumaxx@gmail.com" 
            className="text-black/50 hover:text-black transition-colors font-medium underline decoration-black/20 hover:decoration-black/40 underline-offset-4"
          >
            ndzumaxx@gmail.com
          </a>
        </div>

      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-6 text-sm text-black/40">
        
        {/* Left: Copyright */}
        <p>© {year} ndzuma malate. All rights reserved.</p>

        {/* Right: Socials */}
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-black hover:scale-110 transition-all"
            aria-label="GitHub"
          >
            <GithubLogo weight="fill" className="w-5 h-5" />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#0A66C2] hover:scale-110 transition-all"
            aria-label="LinkedIn"
          >
            <LinkedinLogo weight="fill" className="w-5 h-5" />
          </a>
          <a 
            href="https://threads.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-black hover:scale-110 transition-all"
            aria-label="Threads"
          >
            <ThreadsLogo weight="fill" className="w-5 h-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#1DA1F2] hover:scale-110 transition-all"
            aria-label="X (Twitter)"
          >
            <XLogo weight="fill" className="w-5 h-5" />
          </a>
          
          {/* Divider */}
          <div className="w-px h-4 bg-black/10 mx-2"></div>

          {/* Back to top */}
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-black transition-colors"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
