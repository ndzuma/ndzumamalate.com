import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24 items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl sm:text-5xl font-medium mb-4 tracking-tight">
        404
      </h1>
      <p className="text-lg sm:text-xl text-black/60 leading-relaxed mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        href="/"
        className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/5 hover:bg-black/10 text-black font-medium transition-colors"
      >
        <ArrowLeft weight="bold" className="transition-transform group-hover/btn:-translate-x-1" />
        Back to home
      </Link>
    </main>
  );
}
