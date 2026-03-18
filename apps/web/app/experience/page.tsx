import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience & Skills | ndzumamalate.com",
  description: "My professional experience and technical skills.",
};

const experience = [
  {
    id: 1,
    company: "Example Corp",
    role: "Senior Frontend Engineer",
    location: "Remote",
    description: "Led the development of the core agentic UI framework. Mentored junior developers and established design system guidelines.",
    startDate: "2022-01-01",
    endDate: "Present"
  },
  {
    id: 2,
    company: "Tech Startup Inc.",
    role: "Full Stack Developer",
    location: "Maputo, MZ",
    description: "Built and scaled the MVP from 0 to 10k users. Managed Postgres databases and Go microservices.",
    startDate: "2019-06-01",
    endDate: "2021-12-31"
  }
];

const skills = [
  { id: 1, name: "TypeScript", proficiency: 90 },
  { id: 2, name: "React / Next.js", proficiency: 95 },
  { id: 3, name: "Go", proficiency: 85 },
  { id: 4, name: "PostgreSQL", proficiency: 80 },
  { id: 5, name: "Tailwind CSS", proficiency: 95 },
];

export default function ExperiencePage() {
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

      <div className="max-w-2xl space-y-16">
        
        {/* Section: Experience */}
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
                    {new Date(job.startDate).getFullYear()} — {job.endDate === "Present" ? "Present" : new Date(job.endDate).getFullYear()}
                  </span>
                </div>
                <div className="text-sm font-medium text-black/60 mb-3">{job.company} {job.location && `· ${job.location}`}</div>
                <p className="text-base text-black/70 leading-relaxed">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Skills */}
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

      </div>
    </main>
  );
}
