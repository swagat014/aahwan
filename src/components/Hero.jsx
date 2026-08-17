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
    <section id="home" className="relative min-h-[90vh] pt-16 pb-24 flex items-center justify-center text-center overflow-hidden select-none">
      
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Interactive Sports Badges Around Hero */}
      {floatingBadges.map((badge, idx) => (
        <motion.div
          key={idx}
          style={{ top: badge.top, left: badge.left, right: badge.right }}
          animate={{ y: [0, -12, 0], rotate: [0, idx % 2 === 0 ? 6 : -6, 0] }}
          transition={{ duration: 4 + idx, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.25, rotate: 0 }}
          className="hidden xl:flex absolute z-20 items-center gap-2.5 px-4.5 py-2.5 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-full shadow-lg cursor-pointer hover:border-blue-400 hover:shadow-blue-500/25 transition-all"
        >
          <span className="text-xl">{badge.icon}</span>
          <span className="text-xs font-black text-slate-800 tracking-wider uppercase">{badge.label}</span>
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center">
          
          {/* Top Award-Winning Crest Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-sm mb-8"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-md">
              <Trophy size={16} />
            </div>
            <span className="text-xs font-black text-slate-800 tracking-widest uppercase flex items-center gap-2">
              <span>BHAWANIPATNA, ODISHA</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>ESTD 2009</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </motion.div>

          {/* Dynamic Reactive Display Title */}
          <motion.div
            variants={sentenceVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 w-full"
          >
            <h1 className="text-6xl sm:text-8xl lg:text-[12rem] font-black tracking-tight leading-none flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
              
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
              <span className="inline-flex items-center text-5xl sm:text-7xl lg:text-[10rem]">
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
            className="mb-10 max-w-5xl w-full flex flex-col items-center"
          >
            {/* Single Line: GOVERNMENT COLLEGE OF ENGINEERING */}
            <h2 className="whitespace-nowrap text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-gradient-shimmer tracking-[0.14em] sm:tracking-[0.18em] uppercase leading-none mb-3">
              {collegeName}
            </h2>

            {/* Line 2: Vector Line Flanked Location Badge */}
            <div className="flex items-center justify-center gap-6 w-full">
              <div className="h-[2px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-amber-500 to-blue-600 rounded-full" />
              
              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[0.3em] uppercase text-stroke-gold hover:text-amber-600 transition-colors cursor-pointer px-2">
                {collegeLocation}
              </h3>
              
              <div className="h-[2px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-amber-500 to-blue-600 rounded-full" />
            </div>

            <p className="text-xs sm:text-sm font-black text-slate-400 tracking-[0.25em] uppercase mt-3 flex items-center gap-2">
              <MapPin size={14} className="text-blue-600" />
              Bhawanipatna, Odisha • Inter-Branch Championship
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-600 max-w-3xl mb-12 leading-relaxed font-normal"
          >
            Celebrating athletic prowess, stamina, and competitive glory. Uniting Computer Science, Electrical, Mechanical, and Civil engineering streams across track, field, team sports, and indoor board games.
          </motion.p>

          {/* Centered Interactive Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStudentRegistration(true)}
              className="group relative px-9 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-full shadow-2xl shadow-emerald-500/30 transition-all flex items-center gap-2.5 overflow-hidden"
            >
              <UserPlus size={20} />
              <span>Student Sports Registration</span>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="#sports"
              className="group relative px-8 py-4 bg-blue-600 hover:bg-slate-900 text-white font-black text-base rounded-full shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2.5 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Sports Events <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              href="#schedule"
              className="px-8 py-4 bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 border-2 border-slate-200/90 font-black text-base rounded-full shadow-md hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2"
            >
              <Calendar size={18} /> View Match Fixtures
            </motion.a>
          </motion.div>

          {/* Full Width 4-Card Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-5xl"
          >
            {[
              { count: statSportsCount || '20+', label: 'Sports Disciplines', sub: 'Track, Field & Indoors' },
              { count: statAthletesCount || '800+', label: 'Student Athletes', sub: 'Men & Women Categories' },
              { count: statStreamsCount || '4', label: 'Engg Streams', sub: 'CSE, EE, ME, CE' },
              { count: statDaysCount || '3', label: 'Action Days', sub: `Annual Sports Meet ${year}` },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.06, y: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="award-glass-card rounded-3xl p-6 text-center shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
              >
                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {stat.count}
                </h3>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wide mt-2">
                  {stat.label}
                </p>
                <p className="text-[0.75rem] font-semibold text-slate-500 mt-0.5">
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
