"use client";

import Image from "next/image";
import Link from "next/link";
import { GithubLogo, LinkedinLogo, XLogo, ThreadsLogo, ArrowUp } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Profile } from "../types/api";

export default function Footer() {
  const year = new Date().getFullYear();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.getProfile().then(p => setProfile(p)).catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="pt-12 pb-8 border-t border-black/10 flex flex-col gap-16 font-sans w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        
        {/* Left: Logo */}
        <Link href="/" className="inline-block hover:scale-105 transition-transform">
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
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} 
            className="inline-block text-black/50 hover:text-black transition-colors font-medium underline decoration-black/20 hover:decoration-black/40 underline-offset-4"
          >
            {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
          </a>
        </div>

      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-6 text-sm text-black/40">
        
        {/* Left: Copyright */}
        <p>© {year} ndzuma malate. All rights reserved.</p>

        {/* Right: Socials */}
        <div className="flex items-center gap-4">
          <a 
            href={profile?.github_url || "https://github.com/ndzuma"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:text-black hover:scale-110 transition-all"
            aria-label="GitHub"
          >
            <GithubLogo weight="fill" className="w-5 h-5" />
          </a>
          <a 
            href={profile?.linkedin_url || "https://linkedin.com/in/ndzuma"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:text-[#0A66C2] hover:scale-110 transition-all"
            aria-label="LinkedIn"
          >
            <LinkedinLogo weight="fill" className="w-5 h-5" />
          </a>
          <a 
            href={profile?.threads_url || "https://threads.net"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:text-black hover:scale-110 transition-all"
            aria-label="Threads"
          >
            <ThreadsLogo weight="fill" className="w-5 h-5" />
          </a>
          <a 
            href={profile?.twitter_url || "https://twitter.com/ndzumaxx"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:text-[#1DA1F2] hover:scale-110 transition-all"
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
