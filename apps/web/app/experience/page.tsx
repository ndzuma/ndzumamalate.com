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

  const education = experience.filter(e => e.type === 'Education').sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
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
        
        {education.length > 0 && (
          <section>
            <table className="w-full text-left text-sm text-black/80">
              <tbody>
                {education.map(edu => (
                  <tr key={edu.id} className="border-b border-black/10 last:border-0 align-top">
                    <td className="py-4 font-medium w-1/3 sm:w-1/4">{edu.company}</td>
                    <td className="py-4 text-black/60 w-1/2 sm:w-auto">
                      <div className={edu.description ? "mb-2 font-medium" : ""}>{edu.role}</div>
                      {edu.description && (
                        <div className="text-sm">
                          <ExperienceDescription description={edu.description} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-right font-mono text-black/50 sm:w-1/4">
                      {new Date(edu.start_date).getFullYear()} {edu.end_date ? `— ${new Date(edu.end_date).getFullYear()}` : '— Present'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

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
            <div className="space-y-6 text-base">
              {Object.entries(
                skills.reduce((acc, skill) => {
                  const cat = skill.category || 'other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(skill);
                  return acc;
                }, {} as Record<string, typeof skills[0][]>)
              )
              .sort(([catA], [catB]) => {
                const order = ["programming_language", "framework", "database", "tool", "other", "soft_skill"];
                const aIdx = order.indexOf(catA.toLowerCase());
                const bIdx = order.indexOf(catB.toLowerCase());
                // if not found, put at the end
                if (aIdx === -1 && bIdx === -1) return catA.localeCompare(catB);
                if (aIdx === -1) return 1;
                if (bIdx === -1) return -1;
                return aIdx - bIdx;
              })
              .map(([category, catSkills]) => (
                <div key={category} className="flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-baseline border-b border-black/5 pb-6 last:border-0 last:pb-0">
                  <div className="font-medium text-black/50 capitalize w-48 shrink-0 tracking-wide text-sm">
                    {category.replace(/_/g, ' ')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map(skill => (
                      <span key={skill.id} className="px-3 py-1.5 rounded-lg bg-black/5 text-black/80 font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}