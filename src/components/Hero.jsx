import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, ChevronRight, Sparkles, MapPin, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Hero() {
  const {
    year, festivalName, collegeName, collegeLocation, setShowStudentRegistration,
    statSportsCount, statAthletesCount, statStreamsCount, statDaysCount
  } = useApp();

  // Letter Stagger Animation Variants for Festival Name & Year
  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: 'spring', stiffness: 350, damping: 20 }
    }
  };

  const festivalLetters = (festivalName || 'AAHWAN').split('');
  const yearLetters = (year || '2026').split('');

  const floatingBadges = [
    { icon: '🏃', label: 'Athletics', top: '10%', left: '4%' },
    { icon: '🏏', label: 'Cricket', top: '18%', right: '5%' },
    { icon: '⚽', label: 'Football', top: '58%', left: '3%' },
    { icon: '🏐', label: 'Volleyball', top: '64%', right: '4%' },
    { icon: '🤼', label: 'Kabaddi', top: '84%', left: '7%' },
    { icon: '♟️', label: 'Chess', top: '84%', right: '7%' },
  ];

  return (
    <section id="home" className="relative min-h-[85vh] sm:min-h-[90vh] pt-24 sm:pt-28 pb-16 sm:pb-24 flex items-center justify-center text-center overflow-hidden select-none">
      
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[950px] h-[600px] sm:h-[950px] bg-blue-500/10 rounded-full blur-[140px] sm:blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-amber-400/10 rounded-full blur-[120px] sm:blur-[140px] pointer-events-none" />

      {/* Floating Interactive Sports Badges (Desktop Only) */}
      {floatingBadges.map((badge, idx) => (
        <motion.div
          key={idx}
          style={{ top: badge.top, left: badge.left, right: badge.right }}
          animate={{ y: [0, -12, 0], rotate: [0, idx % 2 === 0 ? 6 : -6, 0] }}
          transition={{ duration: 4 + idx, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.25, rotate: 0 }}
          className="hidden xl:flex absolute z-20 items-center gap-2.5 px-4 py-2 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-full shadow-lg cursor-pointer hover:border-blue-400 hover:shadow-blue-500/25 transition-all"
        >
          <span className="text-xl">{badge.icon}</span>
          <span className="text-xs font-black text-slate-800 tracking-wider uppercase">{badge.label}</span>
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center">
          
          {/* Top Crest Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-sm mb-6 sm:mb-8"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-md shrink-0">
              <Trophy size={14} />
            </div>
            <span className="text-[0.65rem] sm:text-xs font-black text-slate-800 tracking-widest uppercase flex items-center gap-1.5 sm:gap-2">
              <span>{collegeLocation}, ODISHA</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>ESTD 2009</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </motion.div>

          {/* Dynamic Reactive Display Title */}
          <motion.div
            variants={sentenceVariants}
            initial="hidden"
            animate="visible"
            className="mb-4 sm:mb-6 w-full"
          >
            <h1 className="text-5xl sm:text-8xl lg:text-[11rem] font-black tracking-tight leading-none flex flex-wrap items-center justify-center gap-2 sm:gap-6 md:gap-8">
              
              {/* Festival Name Letters */}
              <span className="inline-flex items-center">
                {festivalLetters.map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    whileHover={{ scale: 1.12, color: '#0F172A', y: -8 }}
                    className="text-stroke-huge hover:text-slate-900 cursor-pointer transition-all duration-300 inline-block px-0.5 sm:px-1"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>

              {/* Year Letters */}
              <span className="inline-flex items-center text-4xl sm:text-7xl lg:text-[9.5rem]">
                {yearLetters.map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    whileHover={{ scale: 1.12, color: '#2563EB', y: -8 }}
                    className="text-stroke-blue hover:text-blue-600 cursor-pointer transition-all duration-300 inline-block px-0.5 sm:px-1"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>

            </h1>
          </motion.div>

          {/* Dynamic College Title Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-8 sm:mb-10 max-w-5xl w-full flex flex-col items-center"
          >
            {/* Single Line: GOVERNMENT COLLEGE OF ENGINEERING */}
            <h2 className="text-xs xs:text-sm sm:text-2xl md:text-3xl lg:text-4xl font-black text-gradient-shimmer tracking-[0.08em] sm:tracking-[0.18em] uppercase leading-tight mb-2 sm:mb-3">
              {collegeName}
            </h2>

            {/* Line 2: Vector Line Flanked Location Badge */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
              <div className="h-[2px] w-8 sm:w-28 bg-gradient-to-r from-transparent via-amber-500 to-blue-600 rounded-full" />
              
              <h3 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stroke-gold hover:text-amber-600 transition-colors cursor-pointer px-1">
                {collegeLocation}
              </h3>
              
              <div className="h-[2px] w-8 sm:w-28 bg-gradient-to-l from-transparent via-amber-500 to-blue-600 rounded-full" />
            </div>

            <p className="text-[0.68rem] sm:text-sm font-black text-slate-400 tracking-[0.18em] sm:tracking-[0.25em] uppercase mt-2.5 flex items-center justify-center gap-1.5">
              <MapPin size={13} className="text-blue-600 shrink-0" />
              <span>Bhawanipatna, Odisha • Inter-Branch Meet</span>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-sm sm:text-xl text-slate-600 max-w-3xl mb-8 sm:mb-12 leading-relaxed font-normal px-2"
          >
            Celebrating athletic prowess, stamina, and competitive glory. Uniting Computer Science, Electrical, Mechanical, and Civil engineering streams across track, field, team sports, and indoor board games.
          </motion.p>

          {/* Centered Interactive Action Buttons (Full-width on Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-12 sm:mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStudentRegistration(true)}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-full shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2.5"
            >
              <UserPlus size={18} />
              <span>Student Sports Registration</span>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="#sports"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-slate-900 text-white font-black text-sm sm:text-base rounded-full shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5"
            >
              <span className="flex items-center gap-2">
                Explore Sports Events <ChevronRight size={18} />
              </span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="#schedule"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 border border-slate-200/90 font-black text-sm rounded-full shadow-md hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={17} /> Match Timetable
            </motion.a>
          </motion.div>

          {/* Full Width 4-Card Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-5xl"
          >
            {[
              { count: statSportsCount || '20+', label: 'Sports Disciplines', sub: 'Track, Field & Indoors' },
              { count: statAthletesCount || '800+', label: 'Student Athletes', sub: 'Men & Women' },
              { count: statStreamsCount || '4', label: 'Engg Streams', sub: 'CSE, EE, ME, CE' },
              { count: statDaysCount || '3', label: 'Action Days', sub: `Sports Meet ${year}` },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.06, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="award-glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
              >
                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {stat.count}
                </h3>
                <p className="text-[0.68rem] sm:text-xs font-black text-slate-800 uppercase tracking-wide mt-1.5 sm:mt-2">
                  {stat.label}
                </p>
                <p className="text-[0.62rem] sm:text-[0.75rem] font-semibold text-slate-500 mt-0.5 truncate">
                  {stat.sub}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
