import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, MapPin, Phone, Mail, ShieldCheck, Heart, 
  Sparkles, Lock, ArrowUpRight, Globe, ArrowUp, 
  ExternalLink, Calendar, Award, UserPlus, Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const {
    setViewMode, year, festivalName, collegeName, collegeLocation,
    helplinePhone, helplineEmail, campusAddress,
    setShowStudentRegistration, isAdminLoggedIn
  } = useApp();

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (isAdminLoggedIn) {
      setViewMode('admin-dashboard');
    } else {
      setViewMode('admin-login');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Festival Home', href: '#home', badge: 'Live' },
    { label: 'Sports Disciplines', href: '#sports', badge: '20+' },
    { label: 'Match Timetable & Fixtures', href: '#schedule', badge: 'Day 1-3' },
    { label: 'Branch Medal Leaderboard', href: '#leaderboard', badge: 'Tally' },
    { label: 'Leadership & Officers', href: '#dignitaries' },
    { label: 'Photo Highlights Gallery', href: '#gallery' },
  ];

  return (
    <footer className="bg-[#06080d] text-white relative overflow-hidden select-none border-t border-slate-800/80">

      {/* TOP GLOW ACCENT LINE */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 via-amber-400/50 to-transparent" />

      {/* AMBIENT RADIAL LIGHTING MESH */}
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* GIANT FADED BACKGROUND "FOOTER" WATERMARK TYPOGRAPHY */}
      <div 
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 leading-none"
      >
        <span className="text-[19vw] sm:text-[22vw] font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white/[0.06] via-white/[0.015] to-transparent select-none whitespace-nowrap translate-y-[22%] drop-shadow-2xl font-mono">
          FOOTER
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 sm:pb-14 relative z-10">

        {/* 1. TOP PRE-FOOTER INTERACTIVE ACTION RIBBON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-10 sm:pb-14 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25 border border-blue-400/30 shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white tracking-tight">
                  {festivalName} <span className="text-blue-400">{year}</span>
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[0.62rem] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Meet
                </span>
              </div>
              <p className="text-[0.68rem] sm:text-xs font-semibold text-slate-400">
                Government College of Engineering, Kalahandi • Annual Athletic Meet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowStudentRegistration(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus size={14} />
              <span>Register Athlete</span>
            </button>

            <button
              onClick={scrollToTop}
              className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Return to top"
            >
              <span>Back to Top</span>
              <ArrowUp size={13} className="text-amber-400" />
            </button>
          </div>
        </div>

        {/* 2. MAIN 3-COLUMN BRAND & CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 py-12 sm:py-16 border-b border-slate-800/80">

          {/* Col 1: College Crest & Institutional Overview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[0.65rem] font-bold text-slate-300">
              <Sparkles size={11} className="text-amber-400" />
              <span>GCEK Athletic Society • Estd 2009</span>
            </div>

            <h4 className="font-black text-xl text-white leading-snug">
              {collegeName}
            </h4>

            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
              Fostering athletic stamina, leadership, and camaraderie across Computer Science, Electrical, Mechanical, and Civil engineering branches at {collegeLocation}.
            </p>

            <div className="pt-2 flex items-start gap-2.5 text-xs font-semibold text-slate-400">
              <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>{campusAddress || 'Bandopala, Bhawanipatna, Kalahandi, Odisha - 766002'}</span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[0.65rem] font-bold">
                🏛️ Autonomous Institute
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[0.65rem] font-bold">
                🏅 Inter-Branch Meet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[0.65rem] font-bold">
                ⚡ 4 Streams
              </span>
            </div>
          </div>

          {/* Col 2: Championship Navigation (3 Cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h5 className="font-black text-xs uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <span>Championship Directory</span>
            </h5>

            <ul className="space-y-2 text-xs sm:text-sm font-bold text-slate-300">
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors flex items-center justify-between py-1 group"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />
                      <span>{link.label}</span>
                    </span>

                    {link.badge ? (
                      <span className="text-[0.6rem] font-black px-1.5 py-0.2 rounded-md bg-slate-900 text-slate-400 border border-slate-800 group-hover:border-blue-500/50 group-hover:text-blue-300 transition-colors">
                        {link.badge}
                      </span>
                    ) : (
                      <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-400" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Emergency Helplines & Control Room (4 Cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <h5 className="font-black text-xs uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <span>Control Room & Helplines</span>
            </h5>

            <div className="space-y-2.5 text-xs font-semibold text-slate-300">
              
              <div className="p-3 bg-slate-900/80 border border-slate-800/90 rounded-xl space-y-1 hover:border-slate-700 transition-colors">
                <span className="text-slate-500 uppercase text-[0.62rem] font-black tracking-wider block">
                  Official Athletic Email
                </span>
                <a 
                  href={`mailto:${helplineEmail}`} 
                  className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 text-xs truncate"
                >
                  <Mail size={13} className="text-blue-400 shrink-0" />
                  <span className="truncate">{helplineEmail}</span>
                </a>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800/90 rounded-xl space-y-1 hover:border-slate-700 transition-colors">
                <span className="text-slate-500 uppercase text-[0.62rem] font-black tracking-wider block">
                  Festival Coordinator Line
                </span>
                <a 
                  href={`tel:${helplinePhone}`} 
                  className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 text-xs"
                >
                  <Phone size={13} className="text-blue-400 shrink-0" />
                  <span>{helplinePhone}</span>
                </a>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800/90 rounded-xl space-y-1 hover:border-slate-700 transition-colors">
                <span className="text-slate-500 uppercase text-[0.62rem] font-black tracking-wider block">
                  Medical & Arena First-Aid
                </span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span>Arena Medical Camp (Ground Side)</span>
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* 3. BOTTOM LEGAL & CREDITS STRIP */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          
          <div className="text-center sm:text-left">
            <span>© {year} {collegeName}, {collegeLocation}. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[0.7rem]">
            <span className="inline-flex items-center gap-1 text-slate-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
              <span>Engineered with passion by</span>
              <strong className="text-amber-400 font-black">SWAGAT RANJAN CHOUDHURY</strong>
            </span>

            {/* Discreet Admin Portal Link */}
            <button
              onClick={handleAdminClick}
              className="text-slate-500 hover:text-amber-400 text-[0.68rem] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
              title="Sports Officer Portal Access"
            >
              <Lock size={11} className="text-slate-600 hover:text-amber-400 transition-colors" />
              <span>Officer Portal</span>
            </button>
          </div>

        </div>

      </div>

    </footer>
  );
}
