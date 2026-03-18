"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EnvelopeSimple, List, X } from "@phosphor-icons/react";

type FloatingNavProps = {
  pathname: string;
};

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/experience", label: "Experience" },
  { href: "/stack", label: "Stack" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FloatingNav({ pathname }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Background Gradient Fade (Sits underneath nav, above page content) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-32 bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-transparent" />

      {/* Actual Navigation */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6 sm:px-8">
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex w-full max-w-6xl flex-col relative"
        >
          <div className="flex items-center justify-between w-full">
            {/* Left: Logo (Free standing) */}
            <div className="flex flex-1 items-center justify-start">
              <Link
                href="/"
                aria-label="Home"
                className="nav-logo-link flex items-center justify-center transition-transform hover:scale-105 h-11 w-11"
              >
                <Image
                  src="/assets/Face logo.svg"
                  alt="ndzuma malate"
                  width={32}
                  height={32}
                  priority
                  className="nav-logo"
                />
              </Link>
            </div>

            {/* Center: Routes (Inside pill - Desktop only) */}
            <div className="hidden sm:flex flex-none items-center justify-center">
              <div className="flex items-center gap-1 rounded-[1.75rem] border border-black/[0.07] bg-white/60 px-2 py-1.5 shadow-[0_8px_32px_rgba(17,17,17,0.04)] backdrop-blur-xl sm:px-3 sm:py-2">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      style={{
                        backgroundColor: active ? "#000000" : "transparent",
                        color: active ? "#ffffff" : "rgba(0, 0, 0, 0.5)",
                      }}
                      className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium tracking-[-0.01em] transition-colors duration-200 hover:bg-black/[0.05] hover:text-black/80 sm:px-4 sm:py-2"
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                          e.currentTarget.style.color = "rgba(0, 0, 0, 0.8)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "rgba(0, 0, 0, 0.5)";
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Contact (Desktop only) */}
            <div className="hidden sm:flex flex-1 items-center justify-end gap-2">
              <Link
                href="/contact"
                className="flex h-11 px-5 items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-black/5 text-black text-sm font-medium tracking-tight transition-transform hover:scale-105 shadow-sm"
                aria-label="Contact"
              >
                Contact me
              </Link>
            </div>

            {/* Mobile: Hamburger Button */}
            <div className="flex sm:hidden flex-1 items-center justify-end">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 backdrop-blur-xl border border-black/5 text-black transition-transform hover:scale-105 shadow-sm"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X weight="bold" className="h-5 w-5" /> : <List weight="bold" className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full right-0 mt-4 w-56 rounded-3xl bg-white/95 backdrop-blur-2xl border border-black/10 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.12)] flex flex-col gap-1 sm:hidden origin-top-right overflow-hidden"
              >
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium tracking-tight transition-colors ${
                        active ? "bg-black/5 text-black" : "text-black/60 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                
                <div className="h-px w-full bg-black/5 my-1" />
                
                <Link
                  href="/contact"
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium tracking-tight text-black hover:bg-black/5 transition-colors"
                >
                  Contact me
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

        </nav>
      </header>
    </>
  );
}
