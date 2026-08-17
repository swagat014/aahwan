import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy, CheckCircle2, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Schedule() {
  const { schedule, year } = useApp();
  const dayNumbers = Object.keys(schedule).map(Number).sort((a, b) => a - b);
  const [activeDay, setActiveDay] = useState(dayNumbers[0] || 1);

  const activeFixtures = schedule[activeDay] || [];

  return (
    <section id="schedule" className="py-24 bg-white relative overflow-hidden select-none">
      
      {/* Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 border border-blue-200/90 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
            <Calendar size={15} className="text-amber-500" /> Match Fixtures & Timetable
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            AAHWAN {year} Official Schedule
          </h2>
          
          <p className="text-slate-600 text-base font-medium">
            Track live heats, preliminary rounds, and championship finals across all festival action days.
          </p>
        </motion.div>

        {/* Dynamic Day Selector Tabs (Compact) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {dayNumbers.map(dayNum => (
            <button
              key={dayNum}
              onClick={() => setActiveDay(dayNum)}
              className={`relative px-6 py-2.5 rounded-full font-black text-xs transition-colors ${
                activeDay === dayNum
                  ? 'text-white'
                  : 'text-slate-700 hover:text-blue-600 bg-slate-100'
              }`}
            >
              {activeDay === dayNum && (
                <motion.div
                  layoutId="activeSchedulePillCompact"
                  className="absolute inset-0 bg-blue-600 rounded-full shadow-md shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Day {dayNum} Action</span>
            </button>
          ))}
        </div>

        {/* Compact Match Fixtures Cards List */}
        <div className="max-w-4xl mx-auto space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {activeFixtures.length > 0 ? (
                activeFixtures.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="award-glass-card rounded-2xl p-4 border border-slate-200/90 bg-white hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      
                      {/* Compact Clock Emblem */}
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-sm shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Clock size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[0.7rem] font-black text-blue-600 uppercase tracking-widest">{item.time}</span>
                          
                          {/* Status Badge */}
                          {item.status === 'live' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-[0.62rem] rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                              <Flame size={10} /> {item.statusLabel}
                            </span>
                          )}

                          {item.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-black text-[0.62rem] rounded-full uppercase">
                              <CheckCircle2 size={10} /> {item.statusLabel}
                            </span>
                          )}

                          {item.status === 'upcoming' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/90 font-black text-[0.62rem] rounded-full uppercase">
                              {item.statusLabel}
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Venue Location Chip */}
                    <div className="shrink-0 pt-1 sm:pt-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold">
                        <MapPin size={13} className="text-emerald-600 shrink-0" />
                        <span>{item.location}</span>
                      </span>
                    </div>

                  </motion.div>
                ))
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-bold">
                  No match fixtures scheduled for Day {activeDay} yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
