"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { F1WidgetData } from "../types/api";

let globalF1Data: F1WidgetData | null = null;
let globalF1Promise: Promise<F1WidgetData> | null = null;

export default function InlineF1Widget({ align = "auto" }: { align?: "left" | "center" | "right" | "auto" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [data, setData] = useState<F1WidgetData | null>(globalF1Data);
  const [loading, setLoading] = useState(!globalF1Data);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (globalF1Data) return;
    
    if (!globalF1Promise) {
      globalF1Promise = api.getF1Data();
    }
    
    globalF1Promise.then(res => {
      globalF1Data = res;
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch F1 data", err);
      setError(true);
      setLoading(false);
    });
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  let positionClasses = "";
  if (isMobile && align === "center") {
    positionClasses = "left-1/2 -translate-x-1/2 origin-top";
  } else if (align === "left") {
    positionClasses = "left-0 origin-top-left";
  } else if (align === "right") {
    positionClasses = "right-0 origin-top-right";
  } else {
    positionClasses = isMobile ? 'right-0 origin-top-right' : 'left-0 origin-top-left';
  }

  // Helpers to format names
  const getDriverName = (fullName: string) => {
    if (!fullName) return "---";
    const parts = fullName.split(' ');
    if (parts.length === 1) return fullName;
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.charAt(0)}.`;
  };

  const getTeamName = (teamName: string) => {
    if (!teamName) return "---";
    if (teamName.toLowerCase().includes("red bull")) return "Red Bull";
    if (teamName.toLowerCase().includes("mercedes")) return "Mercedes";
    if (teamName.toLowerCase().includes("ferrari")) return "Ferrari";
    if (teamName.toLowerCase().includes("mclaren")) return "McLaren";
    if (teamName.toLowerCase().includes("aston")) return "Aston Martin";
    if (teamName.toLowerCase().includes("alpine")) return "Alpine";
    if (teamName.toLowerCase().includes("williams")) return "Williams";
    if (teamName.toLowerCase().includes("haas")) return "Haas";
    if (teamName.toLowerCase().includes("sauber")) return "Sauber";
    if (teamName.toLowerCase().includes("rb")) return "RB";
    return teamName.split(' ')[0];
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const startDay = start.getDate();
      const endDay = end.getDate();
      const month = end.toLocaleString('default', { month: 'short' }); // e.g. "Mar"
      return `${startDay} - ${endDay} ${month}`;
    } catch (e) {
      return "";
    }
  };

  return (
    <span 
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className="font-medium text-black bg-red-100 px-1 rounded hover:bg-red-200 transition-colors cursor-pointer"
      >
        F1
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full pt-2 z-50 w-max ${positionClasses}`}
          >
            <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-1.5 shadow-xl font-sans">
              
              <div className="bg-[#F6F5F3] rounded-xl flex flex-col">
                
                <div className="flex flex-col sm:flex-row px-4 sm:px-5 py-4 sm:py-4 items-start sm:items-center">
                  
                  {/* Col 1: Latest Meeting */}
                  <div className="flex flex-col gap-3 min-w-[180px] sm:min-w-[130px] justify-center py-1 sm:py-0">
                    <img 
                      src="https://cdn.simpleicons.org/f1/E10600" 
                      alt="F1 Logo" 
                      className="h-5 sm:h-6 object-contain self-start" 
                    />
                    {!loading && !error && data && data.meeting.circuit_image && (
                      <img 
                        src={data.meeting.circuit_image} 
                        alt="Circuit Layout" 
                        className="h-16 w-auto object-contain mix-blend-multiply opacity-80 self-start my-1" 
                      />
                    )}
                    <div className="flex flex-col gap-0.5 mt-1">
                      {loading || error || !data ? (
                        <>
                          <div className="h-4 w-24 bg-black/5 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-32 bg-black/5 rounded animate-pulse"></div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-black tracking-tight">{data.meeting.country_name || data.meeting.location}</span>
                            {data.meeting.country_flag && (
                              <img 
                                src={data.meeting.country_flag} 
                                alt={data.meeting.country_name || "Flag"} 
                                className="h-3 w-auto rounded-[2px] object-cover" 
                              />
                            )}
                          </div>
                          <span className="text-[11px] text-black/50 font-medium">
                            {data.meeting.circuit_short_name || data.meeting.meeting_name}
                            {data.meeting.date_start && data.meeting.date_end && (
                              <> • {formatDateRange(data.meeting.date_start, data.meeting.date_end)}</>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[1px] sm:w-[1px] sm:h-auto sm:self-stretch bg-black/10 my-4 sm:my-0 sm:mx-5" />

                  {/* Col 2: Drivers Championship */}
                  <div className="flex flex-col gap-2.5 min-w-[180px] sm:min-w-[130px] w-full sm:w-auto py-1 sm:py-0">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Drivers</span>
                    <div className="flex flex-col gap-1.5">
                      {loading || error || !data ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center text-xs">
                            <span className="w-3 font-semibold text-black/60 text-right">{i + 1}</span>
                            <div className="w-0.5 h-3.5 bg-black/10 rounded-full mx-2"></div>
                            <div className="h-3 w-16 bg-black/5 rounded animate-pulse"></div>
                            <div className="h-3 w-10 bg-black/5 rounded animate-pulse ml-auto"></div>
                          </div>
                        ))
                      ) : (
                        data.drivers.slice(0, 5).map((driver, i) => (
                          <div key={driver.driver_number} className="flex items-center text-xs">
                            <span className={`w-3 font-semibold text-right ${i === 0 ? 'text-black' : 'text-black/60'}`}>
                              {driver.position_current}
                            </span>
                            <div 
                              className="w-0.5 h-3.5 rounded-full mx-2" 
                              style={{ backgroundColor: driver.team_colour ? `#${driver.team_colour}` : '#999' }}
                            ></div>
                            <span className="font-bold text-black min-w-[60px] truncate pr-2">{getDriverName(driver.full_name)}</span>
                            <span className="text-[10px] text-black/50 ml-auto font-medium">{driver.points_current} PTS</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[1px] sm:w-[1px] sm:h-auto sm:self-stretch bg-black/10 my-4 sm:my-0 sm:mx-5" />

                  {/* Col 3: Teams Championship */}
                  <div className="flex flex-col gap-2.5 min-w-[180px] sm:min-w-[130px] w-full sm:w-auto py-1 sm:py-0">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Teams</span>
                    <div className="flex flex-col gap-1.5">
                      {loading || error || !data ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center text-xs">
                            <span className="w-3 font-semibold text-black/60 text-right">{i + 1}</span>
                            <div className="w-0.5 h-3.5 bg-black/10 rounded-full mx-2"></div>
                            <div className="h-3 w-16 bg-black/5 rounded animate-pulse"></div>
                            <div className="h-3 w-10 bg-black/5 rounded animate-pulse ml-auto"></div>
                          </div>
                        ))
                      ) : (
                        data.teams.slice(0, 5).map((team, i) => {
                          // Try to match team color from top drivers to team (hacky but works since we don't have team_color in /championship_teams)
                          const driverInTeam = data.drivers.find(d => d.team_name === team.team_name);
                          const color = driverInTeam?.team_colour ? `#${driverInTeam.team_colour}` : '#999';

                          return (
                            <div key={team.team_name} className="flex items-center text-xs">
                              <span className={`w-3 font-semibold text-right ${i === 0 ? 'text-black' : 'text-black/60'}`}>
                                {team.position_current}
                              </span>
                              <div 
                                className="w-0.5 h-3.5 rounded-full mx-2" 
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="font-bold text-black min-w-[60px] truncate pr-2">{getTeamName(team.team_name)}</span>
                              <span className="text-[10px] text-black/50 ml-auto font-medium">{team.points_current} PTS</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                <div className="h-[1px] bg-black/10 mx-4 sm:mx-8" />

                <div className="py-3 px-4 text-center text-[10px] text-black/50 font-medium w-full max-w-[200px] sm:max-w-none mx-auto leading-[1.6]">
                  Data sourced from{' '}
                  <a 
                    href="https://openf1.org/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black inline-flex items-center gap-0.5 transition-all whitespace-nowrap hover:underline decoration-black/30 hover:decoration-black group"
                  >
                    openF1 API <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                  </a>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline">{' '}&amp;{' '}</span>
                  <a 
                    href="https://formula1.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black inline-flex items-center gap-0.5 transition-all whitespace-nowrap hover:underline decoration-black/30 hover:decoration-black group"
                  >
                    Formula1.com <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
