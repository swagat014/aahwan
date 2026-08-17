import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Users, Trophy, Calendar, Sliders, LogOut, Globe,
  ShieldCheck, Clock, Layers, Camera, Sparkles, TrendingUp, CheckCircle2,
  RefreshCw, ShieldAlert
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

  const dayNumbers = Object.keys(schedule).map(Number);
  const totalOfficers = (dignitaries.tier1?.length || 0) + (dignitaries.tier2?.length || 0) + (dignitaries.tier3?.length || 0);

  const navItems = [
    {
      id: 'registrations',
      label: 'Student Submissions',
      badge: registrations.length,
      icon: <FileText size={18} />
    },
    {
      id: 'sports',
      label: 'Sports & Athletics Events',
      badge: sports.length,
      icon: <Trophy size={18} />
    },
    {
      id: 'gallery',
      label: 'Photo Highlights Gallery',
      badge: galleryPhotos.length,
      icon: <Camera size={18} />
    },
    {
      id: 'dignitaries',
      label: 'Leadership & Officers',
      badge: totalOfficers,
      icon: <Users size={18} />
    },
    {
      id: 'schedule',
      label: 'Schedule & Medal Tally',
      badge: `${dayNumbers.length} Days`,
      icon: <Calendar size={18} />
    },
    {
      id: 'settings',
      label: 'General Website Settings',
      icon: <Sliders size={18} />
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row font-sans overflow-hidden selection:bg-blue-600 selection:text-white select-none">
      
      {/* FIXED LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-80 h-full bg-slate-950 text-white flex-shrink-0 flex flex-col justify-between p-5 border-r border-slate-900 shadow-2xl z-40 overflow-y-auto">
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
                <ShieldCheck size={11} /> Supabase Bucket "aahwan"
              </p>
            </div>
          </div>

          {/* Prominent Pinned Sign Out Button */}
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
        
        {/* FIXED TOP HEADER BAR WITH LIVE SYNC BADGE */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm z-30">
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

          {/* Quick Header Actions */}
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
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Analytics Overview Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Student Submissions', count: registrations.length, sub: 'Registered Athletes', icon: <FileText className="text-blue-600" size={20} /> },
              { label: 'Sports Disciplines', count: sports.length, sub: 'Track & Court Events', icon: <Trophy className="text-amber-500" size={20} /> },
              { label: 'Photo Highlights', count: galleryPhotos.length, sub: 'Supabase Gallery', icon: <Camera className="text-emerald-600" size={20} /> },
              { label: 'Leadership Officers', count: totalOfficers, sub: 'Patrons & Leads', icon: <Users className="text-indigo-600" size={20} /> },
              { label: 'Action Days', count: `${dayNumbers.length} Days`, sub: `AAHWAN ${year}`, icon: <Calendar className="text-pink-600" size={20} /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.68rem] font-black uppercase tracking-wider text-slate-500 truncate">{stat.label}</span>
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900">{stat.count}</h3>
                <p className="text-[0.62rem] font-bold text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Active Tab Workspace Module */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
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
