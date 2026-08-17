import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, CheckCircle, Sliders, Globe, Phone, Mail, Trophy, Users, Calendar, Layers } from 'lucide-react';

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
    setSavedMsg('General Website Details & Home Page Counter Stats updated successfully!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">General Website Settings & Home Counters</h4>
          <p className="text-xs text-slate-500 font-semibold">
            Edit festival branding, official helpline contacts, and Home Page counter statistics live on the public site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle size={16} /> {savedMsg}
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* SECTION 1: HOME PAGE METRICS & COUNTER STATS EDITOR */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
        <h5 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" /> Home Page Counter Statistics Editor
        </h5>
        <p className="text-xs text-slate-500 font-semibold">
          Customize the numbers displayed in the Hero section stat banner on the public Home Page.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1">
              <Trophy size={12} className="text-blue-600" /> Sports Disciplines No.
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 20+"
              value={statSportsCount}
              onChange={(e) => setStatSportsCount(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1">
              <Users size={12} className="text-emerald-600" /> Student Athletes No.
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 800+"
              value={statAthletesCount}
              onChange={(e) => setStatAthletesCount(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1">
              <Layers size={12} className="text-indigo-600" /> Engg Streams No.
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 4"
              value={statStreamsCount}
              onChange={(e) => setStatStreamsCount(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-pink-600" /> Action Days No.
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 3"
              value={statDaysCount}
              onChange={(e) => setStatDaysCount(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

        </div>
      </div>

      {/* SECTION 2: OFFICIAL HELPLINE CONTACT DETAILS */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
        <h5 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Phone size={18} className="text-blue-600" /> Official Helplines & Contact Information
        </h5>
        <p className="text-xs text-slate-500 font-semibold">
          Update official email and phone contacts rendered in the Footer and help section.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1">
              <Mail size={12} className="text-blue-600" /> Official Sports Email
            </label>
            <input
              type="email"
              required
              placeholder="sports@gcekbpatna.ac.in"
              value={helplineEmail}
              onChange={(e) => setHelplineEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1">
              <Phone size={12} className="text-blue-600" /> Official Festival Helpline Phone
            </label>
            <input
              type="text"
              required
              placeholder="+91 6765 220011"
              value={helplinePhone}
              onChange={(e) => setHelplinePhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: FESTIVAL BRANDING & COLLEGE TITLE */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
        <h5 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Globe size={18} className="text-indigo-600" /> Festival Branding & College Info
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1">
              Festival Title
            </label>
            <input
              type="text"
              required
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1">
              Festival Edition Year
            </label>
            <input
              type="text"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1">
              College Full Name (Renders in Single Line on Hero)
            </label>
            <input
              type="text"
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1">
              College Location / District Tag
            </label>
            <input
              type="text"
              required
              value={collegeLocation}
              onChange={(e) => setCollegeLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm"
            />
          </div>
        </div>
      </div>

    </form>
  );
}
