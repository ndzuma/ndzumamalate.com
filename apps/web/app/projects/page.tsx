import ProjectsClient from "../../components/projects-client";
import { api } from "../../lib/api";

export const metadata = {
  title: "Projects",
  description: "A selection of my recent work, side projects, and ongoing experiments in pushing the boundaries of interface design.",
};

export default async function ProjectsPage() {
  const [allProjects, allTags] = await Promise.all([
    api.getProjects().catch(() => []),
    api.getTags().catch(() => [])
  ]);
  console.log(allProjects)
  console.log(allTags)
  
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          projects
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          A selection of my recent work, side projects, and ongoing experiments in pushing the boundaries of interface design.
        </p>
      </section>

      <ProjectsClient initialProjects={allProjects} tags={allTags} />
    </main>
  );
}
