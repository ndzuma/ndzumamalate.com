"use client";

import { useState } from "react";
import FeaturedCard from "../../components/featured-card";
import FilterDropdown from "../../components/filter-dropdown";

const allProjects = [
  {
    id: 1,
    title: "Agentic UI Framework",
    image: "/assets/project-1-placeholder.jpg",
    repoUrl: "https://github.com",
    liveUrl: "https://vercel.com",
    published: true,
    tags: ['Next.js', 'AI/ML']
  },
  {
    id: 2,
    title: "Video Gen Workflows",
    image: "/assets/project-2-placeholder.jpg",
    repoUrl: "https://github.com",
    liveUrl: "https://vercel.com",
    published: true,
    tags: ['Design']
  },
  {
    id: 3,
    title: "Brand Workshops powered by AI",
    image: "/assets/project-3-placeholder.jpg",
    repoUrl: "https://github.com",
    published: false,
    tags: ['AI/ML']
  },
  {
    id: 4,
    title: "Trading Extensions",
    image: "/assets/project-4-placeholder.jpg",
    liveUrl: "https://vercel.com",
    published: true,
    tags: ['Fintech']
  }
];

export default function ProjectsPage() {
  const [selectedTag, setSelectedTag] = useState('All');
  const filterOptions = ['All', 'Next.js', 'AI/ML', 'Design', 'Fintech'];

  const publishedProjects = allProjects.filter(p => p.published);
  const filteredProjects = selectedTag === 'All' 
    ? publishedProjects 
    : publishedProjects.filter(p => p.tags.includes(selectedTag));

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

      <FilterDropdown 
        options={filterOptions} 
        selected={selectedTag} 
        onChange={setSelectedTag} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProjects.map((project) => (
          <FeaturedCard 
            key={project.id}
            href={`/projects/${project.id}`}
            title={project.title}
            image={project.image}
            repoUrl={project.repoUrl}
            liveUrl={project.liveUrl}
          />
        ))}
      </div>
    </main>
  );
}
