"use client";

import { useState } from "react";
import FeaturedCard from "./featured-card";
import FilterDropdown from "./filter-dropdown";
import { Project, Tag } from "../types/api";

type ProjectsClientProps = {
  initialProjects: Project[];
  tags?: Tag[];
};

// Helper to format slugs (e.g., "design-systems" -> "Design Systems")
function formatTagName(tag: string): string {
  if (tag.toLowerCase() === "all") return "All";
  return tag
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ProjectsClient({ initialProjects, tags = [] }: ProjectsClientProps) {
  const [selectedTag, setSelectedTag] = useState("all"); // Store slug state internally, "all" for default

  // Create a Set of tag slugs that have filter = true
  const filterableTagSlugs = new Set(tags.filter(t => t.filter).map(t => t.slug));

  // Unique sorted tag slugs from projects, but only if they are in the filterable set
  const uniqueTagSlugs = Array.from(new Set(initialProjects.flatMap((p) => p.tags || [])))
    .filter(slug => filterableTagSlugs.has(slug))
    .sort();
  const filterOptions = ["all", ...uniqueTagSlugs];

  // Map slugs to display names for the dropdown
  const filterOptionsMapped = filterOptions.map(slug => ({
    value: slug,
    label: formatTagName(slug)
  }));

  const filteredProjects =
    selectedTag === "all"
      ? initialProjects
      : initialProjects.filter((p) => p.tags && p.tags.includes(selectedTag));

  return (
    <>
      {initialProjects.length > 0 && (
        <FilterDropdown
          options={filterOptionsMapped}
          selected={selectedTag}
          onChange={setSelectedTag}
        />
      )}

      {initialProjects.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-black/40">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <FeaturedCard
              key={project.id}
              href={`/projects/${project.slug || project.id}`}
              title={project.title}
              image={project.image_url}
              repoUrl={project.repo_url}
              liveUrl={project.live_url}
            />
          ))}
        </div>
      )}
    </>
  );
}
