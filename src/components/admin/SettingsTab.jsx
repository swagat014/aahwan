import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Save, CheckCircle, Sliders, Globe, Phone, Mail, 
  Trophy, Users, Calendar, Layers, MapPin, Sparkles, Building2 
} from 'lucide-react';

export default function SettingsTab() {
  const {
    year, setYear,
    festivalName, setFestivalName,
    collegeName, setCollegeName,
    collegeLocation, setCollegeLocation,
    helplinePhone, setHelplinePhone,
    helplineEmail, setHelplineEmail,
    statSportsCount, setStatSportsCount,
    statAthletesCount, setStatAthletesCount,
    statStreamsCount, setStatStreamsCount,
    statDaysCount, setStatDaysCount
  } = useApp();

  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Settings & public counters saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-3.5 select-none text-slate-800">

      {/* 1. COMPACT TELEMETRY & CONTROLS HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Sliders size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">System & Platform Branding</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Synced
                </span>
              </div>
              <p className="text-[0.68rem] text-slate-500 font-semibold truncate">
                Configure festival branding, college metadata, hero metric counters, and official helplines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {savedMsg && (
              <span className="text-[0.68rem] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl animate-in fade-in flex items-center gap-1">
                <CheckCircle size={12} /> {savedMsg}
              </span>
            )}

            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save size={13} />
              <span>Save Changes</span>
            </button>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* 2. SECTION: FESTIVAL BRANDING & IDENTITY (8 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-blue-600" />
              <span>Festival Identity & College Info</span>
            </h4>
            <span className="text-[0.65rem] font-bold text-slate-400">Header & Hero Branding</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                Festival Title *
              </label>
              <input
                type="text"
                required
                value={festivalName}
                onChange={(e) => setFestivalName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                Edition Year *
              </label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                College Full Name (Rendered on Hero) *
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                College Location / District Badge *
              </label>
              <input
                type="text"
                required
                value={collegeLocation}
                onChange={(e) => setCollegeLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-blue-600 text-white flex items-center justify-center font-black text-[0.65rem]">
                🏆
              </div>
              <div>
                <span className="font-black text-xs">{festivalName} <span className="text-blue-400">{year}</span></span>
                <span className="text-[0.62rem] text-slate-400 block">GCEK {collegeLocation}</span>
              </div>
            </div>
            <span className="text-[0.6rem] font-mono text-amber-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md">
              Live Preview
            </span>
          </div>
        </div>

        {/* 3. SECTION: OFFICIAL HELPLINES & CONTACTS (4 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} className="text-blue-600" />
              <span>Official Helplines</span>
            </h4>
            <span className="text-[0.65rem] font-bold text-slate-400">Footer Contacts</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1 flex items-center gap-1">
                <Mail size={11} className="text-blue-600" /> Official Sports Email *
              </label>
              <input
                type="email"
                required
                value={helplineEmail}
                onChange={(e) => setHelplineEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1 flex items-center gap-1">
                <Phone size={11} className="text-blue-600" /> Helpline Contact Phone *
              </label>
              <input
                type="text"
                required
                value={helplinePhone}
                onChange={(e) => setHelplinePhone(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[0.68rem] text-slate-600 space-y-1">
              <p className="font-bold text-blue-900 flex items-center gap-1">
                <Building2 size={12} className="text-blue-600" /> GCEK Sports Society Office
              </p>
              <p className="text-slate-500">Government College of Engineering, Bhawanipatna, Kalahandi, Odisha - 766002</p>
            </div>
          </div>
        </div>

        {/* 4. SECTION: PUBLIC HERO COUNTER STATS (Full 12 cols) */}
        <div className="lg:col-span-12 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              <span>Public Hero Counter Metrics</span>
            </h4>
            <span className="text-[0.65rem] font-bold text-slate-400">Public Home 4-Card Banner</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* Stat 1: Sports Disciplines */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.65rem] uppercase font-black text-slate-500">Disciplines</label>
                <Trophy size={13} className="text-blue-600" />
              </div>
              <input
                type="text"
                required
                placeholder="20+"
                value={statSportsCount}
                onChange={(e) => setStatSportsCount(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[0.6rem] text-slate-400 block font-semibold">Track, Field & Indoors</span>
            </div>

            {/* Stat 2: Student Athletes */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.65rem] uppercase font-black text-slate-500">Athletes</label>
                <Users size={13} className="text-emerald-600" />
              </div>
              <input
                type="text"
                required
                placeholder="800+"
                value={statAthletesCount}
                onChange={(e) => setStatAthletesCount(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[0.6rem] text-slate-400 block font-semibold">Men & Women Athletes</span>
            </div>

            {/* Stat 3: Engineering Streams */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.65rem] uppercase font-black text-slate-500">Streams</label>
                <Layers size={13} className="text-indigo-600" />
              </div>
              <input
                type="text"
                required
                placeholder="4"
                value={statStreamsCount}
                onChange={(e) => setStatStreamsCount(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[0.6rem] text-slate-400 block font-semibold">CSE, EE, ME, CE</span>
            </div>

            {/* Stat 4: Action Days */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.65rem] uppercase font-black text-slate-500">Action Days</label>
                <Calendar size={13} className="text-pink-600" />
              </div>
              <input
                type="text"
                required
                placeholder="3"
                value={statDaysCount}
                onChange={(e) => setStatDaysCount(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[0.6rem] text-slate-400 block font-semibold">Sports Meet Duration</span>
            </div>

          </div>
        </div>

      </div>

    </form>
  );
}
