"use client";

import { useState } from "react";
import FeaturedCard from "../../components/featured-card";
import FilterDropdown from "../../components/filter-dropdown";

const allBlogs = [
  {
    id: 1,
    title: "Crafting Interfaces for Video Gen Workflows",
    date: "Mar 15, 2024",
    image: "/assets/blog-1-placeholder.jpg",
    published: true,
    tags: ['Design']
  },
  {
    id: 2,
    title: "How Agentic UI is different?",
    date: "Feb 02, 2024",
    image: "/assets/blog-2-placeholder.jpg",
    published: true,
    tags: ['Agents', 'Thoughts']
  },
  {
    id: 3,
    title: "Thoughts on AI toolings",
    date: "Jan 12, 2024",
    image: "/assets/blog-3-placeholder.jpg",
    published: false,
    tags: ['Thoughts']
  },
  {
    id: 4,
    title: "Designing for dense data",
    date: "Dec 05, 2023",
    image: "/assets/blog-4-placeholder.jpg",
    published: true,
    tags: ['Engineering', 'Design']
  }
];

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState('All');
  const filterOptions = ['All', 'Design', 'Engineering', 'Agents', 'Thoughts'];

  const publishedBlogs = allBlogs.filter(b => b.published);
  const filteredBlogs = selectedTag === 'All' 
    ? publishedBlogs 
    : publishedBlogs.filter(b => b.tags.includes(selectedTag));

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          blog
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          Writing about design engineering, building interfaces, and the intersection of human and agent experiences.
        </p>
      </section>

      <FilterDropdown 
        options={filterOptions} 
        selected={selectedTag} 
        onChange={setSelectedTag} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredBlogs.map((blog) => (
          <FeaturedCard 
            key={blog.id}
            href={`/blog/${blog.id}`}
            title={blog.title}
            date={blog.date}
            image={blog.image}
          />
        ))}
      </div>
    </main>
  );
}
