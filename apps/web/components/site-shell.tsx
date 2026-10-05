"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useLayoutEffect, type PropsWithChildren } from "react";

import FloatingNav from "./floating-nav";
import Footer from "./footer";
import { Profile } from "../types/api";
import type { HideablePage } from "../lib/nav";

type SiteShellProps = PropsWithChildren<{
  hasWritings?: boolean;
  hiddenPages?: HideablePage[];
  profile?: Profile | null;
}>;

/**
 * Next scrolls a newly mounted page's content into view, which lands it below
 * the nav padding (looks auto-scrolled). Rendered after the page inside the
 * keyed wrapper, so its layout effect runs after Next's and wins.
 */
function ScrollToTop() {
  useLayoutEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return null;
}

export default function SiteShell({ children, hasWritings = true, hiddenPages = [], profile = null }: SiteShellProps) {
  const pathname = usePathname() ?? "/";

  return (
    <>
      <FloatingNav pathname={pathname} hasWritings={hasWritings} hiddenPages={hiddenPages} />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto w-full max-w-[min(96vw,112rem)] px-5 pt-24 pb-8 sm:px-8 sm:pt-28 min-h-screen flex flex-col"
        >
          <div className="flex-grow">{children}</div>
          <Footer profile={profile} />
          <ScrollToTop />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
