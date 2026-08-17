import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Phone, Mail, ShieldCheck, Heart, Sparkles, Lock, ArrowUpRight, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const {
    setViewMode, year, festivalName, collegeName, collegeLocation, dignitaries,
    helplinePhone, helplineEmail
  } = useApp();

  const handleAdminClick = (e) => {
    e.preventDefault();
    setViewMode('admin-login');
  };

  const navLinks = [
    { label: 'Festival Home', href: '#' },
    { label: 'Leadership & Officers', href: '#dignitaries' },
    { label: 'Sports & Athletics List', href: '#sports' },
    { label: 'Match Fixtures & Timetable', href: '#schedule' },
    { label: 'Photo Highlights Gallery', href: '#gallery' },
  ];

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-900 select-none">

      {/* Radial Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10">

        {/* Top Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-slate-800/80">

          {/* Col 1: Brand Emblem & College Overview (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tight text-white">{festivalName} {year}</h3>
                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <Sparkles size={12} className="text-amber-400" /> Annual Athletic Meet
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {collegeName}, {collegeLocation}. Celebrating athletic prowess, teamwork, and championship excellence across 20+ sports disciplines.
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <span>GCEK Campus, Bandopala, Bhawanipatna, Kalahandi, Odisha - 766002</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-amber-400">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm font-bold text-slate-300">
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Emergency Helplines & Contact (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-amber-400">Emergency & Helplines</h4>

            <div className="space-y-3 text-xs font-bold text-slate-300">
              <div>
                <span className="text-slate-500 uppercase text-[0.65rem] block mb-0.5">Official Sports Email</span>
                <a href={`mailto:${helplineEmail}`} className="hover:text-blue-400 flex items-center gap-1.5 font-black text-amber-400">
                  <Mail size={13} className="text-blue-400" /> {helplineEmail}
                </a>
              </div>

              <div>
                <span className="text-slate-500 uppercase text-[0.65rem] block mb-0.5">Official Festival Helpline</span>
                <a href={`tel:${helplinePhone}`} className="hover:text-blue-400 flex items-center gap-1.5 font-black text-amber-400">
                  <Phone size={13} className="text-blue-400" /> {helplinePhone}
                </a>
              </div>

              <div>
                <span className="text-slate-500 uppercase text-[0.65rem] block mb-0.5">Principal's Office</span>
                <a href="tel:+916770222123" className="hover:text-blue-400 flex items-center gap-1.5">
                  <Phone size={13} className="text-blue-400" /> +91 6770 222123
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Campus Map Badge (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-amber-400">Festival Portal</h4>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Portal Sync</span>
              </div>

              <span className="text-[0.68rem] font-bold text-slate-400 block leading-tight">
                Government College of Engineering Kalahandi
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar (Copyright & Admin Access) */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <div>
            © {year} {collegeName} {collegeLocation}. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span>Developer : SWAGAT RANJAN CHOUDHURY</span>

            {/* DISCREET ADMIN ACCESS LINK */}
            <button
              onClick={handleAdminClick}
              className="text-slate-600 hover:text-amber-400 text-[0.68rem] font-black uppercase tracking-wider flex items-center gap-1 transition-colors group"
              title="Admin Portal Access"
            >
              <Lock size={12} className="group-hover:text-amber-400 transition-colors" /> Admin Access
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
