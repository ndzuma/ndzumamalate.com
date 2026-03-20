"use client";

import { useState } from "react";
import FeaturedCard from "./featured-card";
import FilterDropdown from "./filter-dropdown";
import { Blog, Tag } from "../types/api";

type BlogClientProps = {
  initialBlogs: Blog[];
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

export default function BlogClient({ initialBlogs, tags = [] }: BlogClientProps) {
  const [selectedTag, setSelectedTag] = useState("all");

  const filterableTagSlugs = new Set(tags.filter(t => t.filter).map(t => t.slug));

  const uniqueTagSlugs = Array.from(new Set(initialBlogs.flatMap((b) => b.tags || [])))
    .filter(slug => filterableTagSlugs.has(slug))
    .sort();
  const filterOptions = ["all", ...uniqueTagSlugs];

  const filterOptionsMapped = filterOptions.map(slug => ({
    value: slug,
    label: formatTagName(slug)
  }));

  const filteredBlogs =
    selectedTag === "all"
      ? initialBlogs
      : initialBlogs.filter((b) => b.tags && b.tags.includes(selectedTag));

  return (
    <>
      {initialBlogs.length > 0 && (
        <FilterDropdown
          options={filterOptionsMapped}
          selected={selectedTag}
          onChange={setSelectedTag}
        />
      )}

      {initialBlogs.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-black/40">
          No posts found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredBlogs.map((blog) => (
            <FeaturedCard
              key={blog.id}
              href={`/blog/${blog.slug || blog.id}`}
              title={blog.title}
              date={
                blog.published_at
                  ? new Date(blog.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : undefined
              }
              image={blog.cover_image_url}
            />
          ))}
        </div>
      )}
    </>
  );
}
