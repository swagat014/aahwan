import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Users, Trophy, Calendar, Sliders, LogOut, Globe,
  ShieldCheck, Clock, Layers, Camera, Sparkles, TrendingUp, CheckCircle2,
  Menu, X, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SettingsTab from './SettingsTab';
import DignitariesTab from './DignitariesTab';
import SportsTab from './SportsTab';
import ScheduleLeaderboardTab from './ScheduleLeaderboardTab';
import StudentRegistrationsTab from './StudentRegistrationsTab';
import GalleryTab from './GalleryTab';

export default function AdminDashboardPage() {
  const {
    logoutAdmin, setViewMode, year, festivalName, collegeName, collegeLocation,
    registrations, sports, galleryPhotos, schedule, dignitaries
  } = useApp();

  const [activeTab, setActiveTab] = useState('registrations');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dayNumbers = Object.keys(schedule).map(Number);
  const totalOfficers = (dignitaries.tier1?.length || 0) + (dignitaries.tier2?.length || 0) + (dignitaries.tier3?.length || 0);

  const navItems = [
    {
      id: 'registrations',
      label: 'Student Submissions',
      shortLabel: 'Submissions',
      badge: registrations.length,
      icon: <FileText size={18} />
    },
    {
      id: 'sports',
      label: 'Sports & Athletics Events',
      shortLabel: 'Sports Events',
      badge: sports.length,
      icon: <Trophy size={18} />
    },
    {
      id: 'gallery',
      label: 'Photo Highlights Gallery',
      shortLabel: 'Photo Gallery',
      badge: galleryPhotos.length,
      icon: <Camera size={18} />
    },
    {
      id: 'dignitaries',
      label: 'Leadership & Officers',
      shortLabel: 'Leadership',
      badge: totalOfficers,
      icon: <Users size={18} />
    },
    {
      id: 'schedule',
      label: 'Schedule & Medal Tally',
      shortLabel: 'Timetable',
      badge: `${dayNumbers.length} Days`,
      icon: <Calendar size={18} />
    },
    {
      id: 'settings',
      label: 'General Website Settings',
      shortLabel: 'Settings',
      icon: <Sliders size={18} />
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row font-sans overflow-hidden selection:bg-blue-600 selection:text-white select-none">

      {/* MOBILE TOP HEADER BAR (Only Visible on Mobile & Tablet < lg) */}
      <header className="lg:hidden bg-slate-950 text-white px-4 py-3 border-b border-slate-900 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <Trophy size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-sm text-white tracking-tight truncate">{festivalName} {year}</h2>
            <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider truncate">
              Admin Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('public')}
            className="p-2 bg-slate-900 text-slate-300 hover:text-white rounded-xl border border-slate-800"
            title="View Website"
          >
            <Globe size={16} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* MOBILE HORIZONTAL NAVIGATION TAB SCROLLER (< lg) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-40">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.shortLabel}</span>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[0.6rem] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MOBILE DRAWER OVERLAY MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-[105px] bottom-0 bg-slate-950/95 backdrop-blur-xl z-50 p-5 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4">
              <span className="text-[0.65rem] font-black uppercase text-amber-400 tracking-widest block">
                Dashboard Modules
              </span>
              
              <nav className="space-y-2">
                {navItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-500" />
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <button
                onClick={logoutAdmin}
                className="w-full py-3.5 bg-rose-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <LogOut size={16} /> Sign Out Admin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED DESKTOP LEFT SIDEBAR NAVIGATION (Visible >= lg) */}
      <aside className="hidden lg:flex w-80 h-full bg-slate-950 text-white flex-shrink-0 flex-col justify-between p-5 border-r border-slate-900 shadow-2xl z-40 overflow-y-auto">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800/80 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20 border border-blue-400/30 shrink-0">
              <Trophy size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-xl text-white tracking-tight truncate">{festivalName} {year}</h2>
              <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <Sparkles size={12} className="text-amber-400 shrink-0" /> Executive Console
              </p>
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-102'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Pinned Bottom Admin Card & Logout */}
        <div className="pt-4 border-t border-slate-800/80 mt-6 space-y-3">
          <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
              AD
            </div>
            <div className="overflow-hidden">
              <h4 className="font-black text-xs text-white truncate">adminaahwan</h4>
              <p className="text-[0.62rem] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck size={11} /> Live Storage Active
              </p>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
          >
            <LogOut size={16} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* DESKTOP TOP HEADER BAR (Visible >= lg) */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between gap-4 shrink-0 shadow-sm z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {collegeName} {collegeLocation}
            </h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Annual Athletic Festival Admin Console</span>
              <span className="text-amber-500">•</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Live Site Sync Active
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('public')}
              className="px-5 py-2.5 bg-slate-950 hover:bg-blue-600 text-white font-black text-xs rounded-full shadow-lg transition-all flex items-center gap-2"
            >
              <Globe size={16} /> View Live Website
            </button>

            <button
              onClick={logoutAdmin}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 font-black text-xs rounded-full transition-all flex items-center gap-1.5 shadow-sm"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </header>

        {/* INDEPENDENTLY SCROLLABLE WORKSPACE PANEL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Analytics Overview Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label: 'Submissions', count: registrations.length, sub: 'Registered Athletes', icon: <FileText className="text-blue-600" size={18} /> },
              { label: 'Disciplines', count: sports.length, sub: 'Track & Court Events', icon: <Trophy className="text-amber-500" size={18} /> },
              { label: 'Highlights', count: galleryPhotos.length, sub: 'Supabase Gallery', icon: <Camera className="text-emerald-600" size={18} /> },
              { label: 'Officers', count: totalOfficers, sub: 'Patrons & Leads', icon: <Users className="text-indigo-600" size={18} /> },
              { label: 'Action Days', count: `${dayNumbers.length} Days`, sub: `${festivalName} ${year}`, icon: <Calendar className="text-pink-600" size={18} /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wider text-slate-500 truncate">{stat.label}</span>
                  {stat.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stat.count}</h3>
                <p className="text-[0.6rem] sm:text-[0.62rem] font-bold text-slate-400 mt-0.5 truncate">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Active Tab Workspace Module */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm overflow-x-auto">
            {activeTab === 'registrations' && <StudentRegistrationsTab />}
            {activeTab === 'sports' && <SportsTab />}
            {activeTab === 'gallery' && <GalleryTab />}
            {activeTab === 'dignitaries' && <DignitariesTab />}
            {activeTab === 'schedule' && <ScheduleLeaderboardTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>

        </div>

      </main>
    </div>
  );
}
