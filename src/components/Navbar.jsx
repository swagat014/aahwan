import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Menu, X, Flame, ChevronRight, UserPlus, Lock, Home, Users, Calendar, Award, Camera, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { year, festivalName, collegeLocation, setShowStudentRegistration, setViewMode, isAdminLoggedIn } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Festival Home', href: '#home', icon: <Home size={18} className="text-blue-500" /> },
    { name: 'Leadership & Dignitaries', href: '#dignitaries', icon: <Users size={18} className="text-indigo-500" /> },
    { name: 'Sports & Athletics Roster', href: '#sports', icon: <Trophy size={18} className="text-amber-500" /> },
    { name: 'Match Timetable & Fixtures', href: '#schedule', icon: <Calendar size={18} className="text-emerald-500" /> },
    { name: 'Branch Leaderboard Tally', href: '#leaderboard', icon: <Award size={18} className="text-purple-500" /> },
    { name: 'Highlights Photo Gallery', href: '#gallery', icon: <Camera size={18} className="text-pink-500" /> },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
      scrolled ? 'bg-white/95 backdrop-blur-xl shadow-md py-3 border-b border-slate-200/80' : 'bg-transparent py-4 sm:py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo & Brand Emblem */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0 group-hover:scale-105 transition-transform">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-slate-900 leading-none tracking-tight flex items-center gap-1.5">
                <span>{festivalName}</span>
                <span className="text-blue-600">{year}</span>
              </h1>
              <p className="text-[0.62rem] sm:text-xs font-black text-slate-500 uppercase tracking-widest mt-0.5">
                GCEK {collegeLocation}
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="font-extrabold text-xs uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors py-1 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-200" />
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowStudentRegistration(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <UserPlus size={14} /> Register Athlete
            </button>

            <a
              href="#sports"
              className="px-4 py-2 bg-blue-600 hover:bg-slate-900 text-white font-black text-xs rounded-full shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              Explore Sports
            </a>
          </div>

          {/* Mobile Right Action Bar */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowStudentRegistration(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white font-black text-xs rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-1 active:scale-95 transition-transform"
            >
              <UserPlus size={13} /> Register
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all border border-slate-200/80 active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={22} className="text-rose-600" /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* LUXURY FULL-SCREEN MOBILE HAMBURGER MENU OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden fixed inset-x-0 top-[65px] bottom-0 z-50 bg-slate-950/98 backdrop-blur-3xl text-white p-6 flex flex-col justify-between overflow-y-auto"
          >
            {/* Ambient Radial Lighting */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="space-y-6 relative z-10">
              
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[0.68rem] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} /> Navigation Directory
                </span>
                <span className="px-2.5 py-0.5 bg-blue-900/60 border border-blue-700/50 text-blue-400 text-[0.65rem] font-black rounded-full uppercase">
                  {festivalName} {year}
                </span>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-2">
                {navLinks.map((link, idx) => (
                  <motion.a
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-white font-black text-sm hover:border-blue-500 transition-all group active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {link.icon}
                      </div>
                      <span className="tracking-tight">{link.name}</span>
                    </div>

                    <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Bottom CTA Cards */}
            <div className="pt-6 border-t border-slate-800 space-y-3 relative z-10">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setShowStudentRegistration(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <UserPlus size={18} /> Student Athlete Registration
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  setViewMode(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login');
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold text-xs rounded-2xl border border-slate-800 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Lock size={15} className="text-amber-400" /> Admin Workspace Access
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
