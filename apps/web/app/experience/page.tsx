"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Experience, Skill } from "../../types/api";

export default function ExperiencePage() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [expData, skillsData] = await Promise.all([
          api.getExperience(),
          api.getSkills()
        ]);
        setExperience(expData || []);
        setSkills(skillsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          experience
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          My professional journey and the technical skills I've picked up along the way.
        </p>
      </section>

      {loading ? (
        <div className="flex items-center text-black/40">Loading...</div>
      ) : (
        <div className="max-w-2xl space-y-16">
          
          {/* Section: Experience */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
                <span className="text-black/30">01</span> Work History
              </h2>
              <div className="space-y-8">
                {experience.map(job => (
                  <div key={job.id} className="group relative border-l border-black/10 pl-6 hover:border-black/30 transition-colors">
                    <div className="absolute w-2 h-2 bg-black/10 rounded-full -left-[4.5px] top-2 group-hover:bg-black/30 transition-colors"></div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                      <h3 className="text-lg font-medium text-black/90">{job.role}</h3>
                      <span className="text-sm text-black/50 font-mono">
                        {new Date(job.start_date).getFullYear()} — {job.end_date ? new Date(job.end_date).getFullYear() : "Present"}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-black/60 mb-3">{job.company} {job.location && `· ${job.location}`}</div>
                    <p className="text-base text-black/70 leading-relaxed">{job.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
                <span className="text-black/30">02</span> Core Skills
              </h2>
              <div className="flex flex-wrap gap-2 text-base">
                {skills.map(skill => (
                  <span key={skill.id} className="px-3 py-1.5 rounded-lg bg-black/5 text-black/80 font-medium">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </main>
  );
}
