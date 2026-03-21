import { Skill } from "../types/api";

type TickerRowProps = {
  reverse?: boolean;
  skills: Skill[];
};

function TickerRow({ reverse = false, skills }: TickerRowProps) {
  if (!skills || skills.length === 0) return null;
  
  // Shuffle the base skills array so each row has a unique random order
  const shuffledSkills = [...skills].sort(() => Math.random() - 0.5);

  // Multiply the array to ensure it's wide enough for a continuous scrolling effect, especially if few items
  const repeatCount = Math.max(2, Math.ceil(10 / shuffledSkills.length));
  const shiftedLogos = Array(repeatCount).fill(shuffledSkills).flat();
  
  // Calculate duration based on the number of items to keep speed constant
  const speedPerItem = 3; // seconds per item
  const duration = shiftedLogos.length * speedPerItem;

  return (
    <div 
      className={`flex w-max pause-on-hover ${reverse ? 'animate-scroll-right' : 'animate-scroll-left'}`}
      style={{ animationDuration: `${duration}s` }}
    >
      {[0, 1].map((group) => (
        <div key={group} className="flex shrink-0 items-center justify-around w-max gap-12 px-6 sm:gap-16 sm:px-8">
          {shiftedLogos.map((skill, i) => (
            <div 
              key={`${group}-${skill.id}-${i}`} 
              className="transition-all duration-300 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16"
              title={skill.name}
            >
              {/* Using standard img to avoid Next.js unconfigured remote image domain errors, since they are simpleton urls */}
              <img 
                src={skill.icon_url} 
                alt={skill.name} 
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

type LogosTickerProps = {
  skills?: Skill[];
};

export default function LogosTicker({ skills = [] }: LogosTickerProps) {
  // Filter only skills that have an icon_url
  const validSkills = skills.filter((s) => s.icon_url && s.icon_url.trim() !== "");

  // Organize by category rows
  // 1st row: programming
  const row1 = validSkills.filter((s) => s.category === "programming_language");
  
  // 2nd row: frameworks
  const row2 = validSkills.filter((s) => s.category === "framework");
  
  // 3rd row: db + tools
  const row3 = validSkills.filter((s) => s.category === "database" || s.category === "tool");
  
  // 4th row: db + tools + frameworks
  const row4 = validSkills.filter((s) => s.category === "database" || s.category === "tool" || s.category === "framework");

  // Fallback to original layout if no API skills
  if (validSkills.length === 0) {
    return (
      <section 
        className="relative w-full overflow-hidden flex flex-col gap-10 sm:gap-12 py-6 min-h-[300px] justify-center"
      >
        <div className="text-center text-black/30 text-sm">No skill icons available</div>
      </section>
    );
  }

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col gap-10 sm:gap-12 py-6"
      style={{ 
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
      }}
    >
      {row1.length > 0 && <TickerRow reverse={false} skills={row1} />}
      {row2.length > 0 && <TickerRow reverse={true} skills={row2} />}
      {row3.length > 0 && <TickerRow reverse={false} skills={row3} />}
      {row4.length > 0 && <TickerRow reverse={true} skills={row4} />}
    </section>
  );
}