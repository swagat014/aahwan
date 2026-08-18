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
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="dignitaries" className="py-28 bg-slate-50/80 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
            <Crown size={15} className="text-amber-500" /> Leadership & Governance
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            GCEK Sports Society Officers
          </h2>
          
          <p className="text-slate-600 text-lg font-medium">
            Guiding athletic excellence, university representation, and tournament governance at Government College of Engineering {collegeLocation}.
          </p>
        </motion.div>

        {/* TIER 1: Executive Patronage (Principal & DSW) */}
        {dignitaries.tier1 && dignitaries.tier1.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-[2px] w-12 bg-amber-400 rounded-full" />
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.25em] text-slate-500">
                Executive Patronage & University Leadership
              </h3>
              <div className="h-[2px] w-12 bg-amber-400 rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {dignitaries.tier1.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="award-glass-card rounded-3xl p-8 text-center border-2 border-amber-300/80 shadow-xl transition-all flex flex-col items-center group relative overflow-hidden bg-white"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-bl-full pointer-events-none" />

                  {/* Avatar */}
                  <div className="relative w-40 h-40 mb-6 rounded-full p-2 bg-gradient-to-tr from-amber-500 via-blue-600 to-emerald-500 shadow-xl group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  </div>

                  <span className="inline-block px-4 py-1.5 bg-amber-100/90 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider mb-3 shadow-sm border border-amber-200">
                    {leader.role}
                  </span>

                  <h4 className="font-black text-2xl text-slate-900 mb-1">{leader.name}</h4>
                  <p className="text-xs font-bold text-slate-500 mb-5">{leader.dept}</p>

                  <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-amber-500 text-slate-700 text-xs italic mt-auto leading-relaxed text-left">
                    "{leader.quote}"
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* TIER 2: Faculty Leadership (VP Sports & Faculty Coordinators) */}
        {dignitaries.tier2 && dignitaries.tier2.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-[2px] w-12 bg-blue-500 rounded-full" />
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.25em] text-slate-500">
                Faculty Leadership & Sports Operations
              </h3>
              <div className="h-[2px] w-12 bg-blue-500 rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {dignitaries.tier2.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="award-glass-card rounded-3xl p-7 text-center border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col items-center group bg-white"
                >
                  <div className="relative w-36 h-36 mb-5 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  </div>

                  <span className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider mb-3">
                    {leader.role}
                  </span>

                  <h4 className="font-black text-xl text-slate-900 mb-1">{leader.name}</h4>
                  <p className="text-xs font-bold text-slate-500 mb-4">{leader.dept}</p>

                  <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-blue-600 text-slate-700 text-xs italic mt-auto leading-relaxed text-left">
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
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-[2px] w-12 bg-emerald-500 rounded-full" />
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.25em] text-slate-500">
                Student Body Officers & Conveners
              </h3>
              <div className="h-[2px] w-12 bg-emerald-500 rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {dignitaries.tier3.map((leader, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="award-glass-card rounded-3xl p-7 text-center border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col items-center group bg-white"
                >
                  <div className="relative w-36 h-36 mb-5 rounded-full p-1.5 bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  </div>

                  <span className="inline-block px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider mb-3">
                    {leader.role}
                  </span>

                  <h4 className="font-black text-xl text-slate-900 mb-1">{leader.name}</h4>
                  <p className="text-xs font-bold text-slate-500 mb-4">{leader.dept}</p>

                  <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-emerald-500 text-slate-700 text-xs italic mt-auto leading-relaxed text-left">
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
