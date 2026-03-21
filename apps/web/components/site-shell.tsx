"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import FloatingNav from "./floating-nav";
import Footer from "./footer";
import { Profile } from "../types/api";

type SiteShellProps = PropsWithChildren<{
  hasBlogs?: boolean;
  profile?: Profile | null;
}>;

export default function SiteShell({ children, hasBlogs = true, profile = null }: SiteShellProps) {
  const pathname = usePathname() ?? "/";

  return (
    <>
      <FloatingNav pathname={pathname} hasBlogs={hasBlogs} />
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
        </motion.div>
      </AnimatePresence>
    </>
  );
}
