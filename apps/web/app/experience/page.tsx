import { api } from "../../lib/api";
import { ExperienceDescription } from "../../components/experience-description";

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "Present";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function ExperiencePage() {
  const [experience, skills] = await Promise.all([
    api.getExperience().catch(() => []),
    api.getSkills().catch(() => [])
  ]);

  const work = experience.filter(e => e.type === 'Work' || !e.type);
  const hackathons = experience.filter(e => e.type === 'Hackathon');
  const openSource = experience.filter(e => e.type === 'Open-Source');
  const volunteering = experience.filter(e => e.type === 'Volunteering');

  const expSections = [
    { title: 'Work History', data: work },
    { title: 'Hackathons', data: hackathons },
    { title: 'Open Source', data: openSource },
    { title: 'Volunteering', data: volunteering },
  ].filter(s => s.data.length > 0);

  let sectionCounter = 1;

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          experience
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          My professional journey and the technical skills I've picked up along the way.
        </p>
      </section>

      <div className="max-w-2xl space-y-16 px-4 sm:px-0">
        
        {expSections.map((section) => {
          const currentNum = String(sectionCounter++).padStart(2, '0');
          return (
            <section key={section.title}>
              <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
                <span className="text-black/30">{currentNum}</span> {section.title}
              </h2>
              <div className="space-y-8">
                {section.data.map(job => (
                  <div key={job.id} className="group relative border-l border-black/10 pl-6 hover:border-black/30 transition-colors">
                    <div className="absolute w-2 h-2 bg-black/10 rounded-full -left-[4.5px] top-2 group-hover:bg-black/30 transition-colors"></div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                      <h3 className="text-lg font-medium text-black/90">{job.role}</h3>
                      <span className="text-sm text-black/50 font-mono">
                        {formatDate(job.start_date)} — {formatDate(job.end_date)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-black/60 mb-3">{job.company} {job.location && `· ${job.location}`}</div>
                    <ExperienceDescription description={job.description || ""} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {skills.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
              <span className="text-black/30">{String(sectionCounter++).padStart(2, '0')}</span> Core Skills
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
    </main>
  );
}