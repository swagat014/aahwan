import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Star, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Dignitaries() {
  const { dignitaries, collegeLocation } = useApp();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="dignitaries" className="py-14 sm:py-20 bg-slate-50/80 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-[0.68rem] sm:text-xs font-black uppercase tracking-widest mb-3 shadow-xs">
            <Crown size={14} className="text-amber-500" /> Leadership & Governance
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2.5 sm:mb-3">
            GCEK Sports Society Officers
          </h2>
          
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Guiding athletic excellence, university representation, and tournament governance at Government College of Engineering {collegeLocation}.
          </p>
        </motion.div>

        {/* TIER 1: Executive Patronage (Principal & DSW) */}
        {dignitaries.tier1 && dignitaries.tier1.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="h-[2px] w-8 sm:w-12 bg-amber-400 rounded-full" />
              <h3 className="font-black text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500 text-center">
                Executive Patronage & University Leadership
              </h3>
              <div className="h-[2px] w-8 sm:w-12 bg-amber-400 rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
            >
              {dignitaries.tier1.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="award-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center border-2 border-amber-300/80 shadow-md hover:shadow-xl transition-all flex flex-col items-center group relative overflow-hidden bg-white"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-bl-full pointer-events-none" />

                  {/* Compact Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3.5 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-blue-600 to-emerald-500 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>

                  <span className="inline-block px-3 py-1 bg-amber-100/90 text-amber-800 text-[0.68rem] font-black rounded-full uppercase tracking-wider mb-2 shadow-2xs border border-amber-200">
                    {leader.role}
                  </span>

                  <h4 className="font-black text-lg sm:text-xl text-slate-900 mb-0.5">{leader.name}</h4>
                  <p className="text-[0.7rem] font-bold text-slate-500 mb-3">{leader.dept}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-amber-500 text-slate-700 text-xs italic mt-auto leading-relaxed text-left w-full">
                    "{leader.quote}"
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* TIER 2: Faculty Leadership (VP Sports & Faculty Coordinators) */}
        {dignitaries.tier2 && dignitaries.tier2.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="h-[2px] w-8 sm:w-12 bg-blue-500 rounded-full" />
              <h3 className="font-black text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500 text-center">
                Faculty Leadership & Sports Operations
              </h3>
              <div className="h-[2px] w-8 sm:w-12 bg-blue-500 rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
            >
              {dignitaries.tier2.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="award-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col items-center group bg-white"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>

                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[0.68rem] font-black rounded-full uppercase tracking-wider mb-2 border border-blue-200/60">
                    {leader.role}
                  </span>

                  <h4 className="font-black text-base sm:text-lg text-slate-900 mb-0.5">{leader.name}</h4>
                  <p className="text-[0.7rem] font-bold text-slate-500 mb-3">{leader.dept}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-blue-600 text-slate-700 text-xs italic mt-auto leading-relaxed text-left w-full">
                    "{leader.quote}"
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* TIER 3: Student Leadership (Sports Secretary & Student Coordinators) */}
        {dignitaries.tier3 && dignitaries.tier3.length > 0 && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="h-[2px] w-8 sm:w-12 bg-emerald-500 rounded-full" />
              <h3 className="font-black text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500 text-center">
                Student Body Officers & Conveners
              </h3>
              <div className="h-[2px] w-8 sm:w-12 bg-emerald-500 rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
            >
              {dignitaries.tier3.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="award-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col items-center group bg-white"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>

                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[0.68rem] font-black rounded-full uppercase tracking-wider mb-2 border border-emerald-200/60">
                    {leader.role}
                  </span>

                  <h4 className="font-black text-base sm:text-lg text-slate-900 mb-0.5">{leader.name}</h4>
                  <p className="text-[0.7rem] font-bold text-slate-500 mb-3">{leader.dept}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-emerald-500 text-slate-700 text-xs italic mt-auto leading-relaxed text-left w-full">
                    "{leader.quote}"
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

      </div>
    </section>
  );
}
