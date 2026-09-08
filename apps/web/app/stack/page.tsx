import type { Metadata } from "next";
import RichText, { isRenderable } from "../../components/rich-text";
import { api } from "../../lib/api";
import { content } from "../../lib/content";

export const metadata: Metadata = {
  title: "Stack",
  description: "More about my hobbies, tooling, and favourite stacks.",
};

export default async function StackPage() {
  const [stack, profile, projects, cv] = await Promise.all([
    content.stack(),
    api.getProfile().catch(() => null),
    api.getProjects().catch(() => []),
    api.getActiveCV().catch(() => null),
  ]);
  const ctx = { profile, projects, cv };

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          {stack.title}
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          {stack.intro}
        </p>
      </section>

      <div className="max-w-2xl space-y-16">
        {stack.sections.map((section, sectionIndex) => {
          const items = (section.items || []).filter((item) => item && isRenderable(item, ctx));
          if (items.length === 0) return null;
          const number = String(sectionIndex + 1).padStart(2, "0");
          return (
            <section key={`${section.title}-${sectionIndex}`}>
              <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
                <span className="text-black/30">{number}</span> {section.title}
              </h2>
              <ul className="space-y-3 text-black/80 text-base sm:text-lg">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-3">
                    <span className="text-black/30 mt-1">↳</span>
                    <span>
                      <RichText text={item} ctx={ctx} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
