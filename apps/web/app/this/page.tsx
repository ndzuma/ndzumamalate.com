import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "This",
  description: "About this website.",
};

export default function ThisPage() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          this
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          How this site was built, the architecture behind it, and why it exists.
        </p>
      </section>
      
      {/* Content to be added later */}
      <div className="h-64 rounded-3xl border border-dashed border-black/10 flex items-center justify-center text-black/40">
        Work in progress...
      </div>
    </main>
  );
}