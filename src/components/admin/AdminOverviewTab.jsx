import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Package, 
  RotateCcw, 
  Calendar, 
  Sliders, 
  Camera, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Box, 
  Plus, 
  TrendingUp, 
  ChevronRight,
  Printer,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isGirlsEvent } from '../../data/sportsData';

export default function AdminOverviewTab({ setActiveTab }) {
  const { 
    festivalName, 
    year, 
    collegeName, 
    collegeLocation, 
    registrations, 
    sports, 
    equipmentList, 
    equipmentLogs, 
    schedule,
    getStandings,
    statDaysCount
  } = useApp();

  const activeIssuedLogs = (equipmentLogs || []).filter(l => l.status === 'issued');
  const totalUnits = (equipmentList || []).reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);
  const totalIssuedUnits = activeIssuedLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const availableUnits = Math.max(0, totalUnits - totalIssuedUnits);
  const availabilityPct = totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 100;

  // Branch athlete counts
  const cseAthletes = registrations.filter(r => (r.branch || '').includes('Computer') || (r.branch || '').includes('CSE')).length;
  const meAthletes = registrations.filter(r => (r.branch || '').includes('Mechanical') || (r.branch || '').includes('ME')).length;
  const eeAthletes = registrations.filter(r => (r.branch || '').includes('Electrical') || (r.branch || '').includes('EE')).length;
  const ceAthletes = registrations.filter(r => (r.branch || '').includes('Civil') || (r.branch || '').includes('CE')).length;

  const standings = getStandings('overall') || [];
  const leader = standings[0] || { code: 'TBD', totalPoints: 0, branchName: 'Pending Results' };

  // Recent 5 registrations
  const recentRegistrations = [...registrations].slice(0, 5);

  return (
    <div className="space-y-4 select-none">
      
      {/* EXECUTIVE COMPACT WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-4 sm:p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Command Center
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                {festivalName} {year} Console
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Welcome back, Sports Council Admin
            </h2>

            <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
              {collegeName}, {collegeLocation} • Realtime overview of athletes, sports inventory, fixtures, and standings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('registrations')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Users size={14} /> Rosters
            </button>
            <button
              onClick={() => setActiveTab('equipment-issues')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} /> Issue Item
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: Athletes */}
        <div 
          onClick={() => setActiveTab('registrations')}
          className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-blue-400/80 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider">Athletes Registered</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={15} />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {registrations.length}
            </div>
            <p className="text-[0.68rem] font-semibold text-slate-400">
              Boys & Girls Divisions
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[0.65rem] font-bold text-slate-500">
            <span>CSE: {cseAthletes}</span>
            <span>ME: {meAthletes}</span>
            <span>EE: {eeAthletes}</span>
            <span>CE: {ceAthletes}</span>
          </div>
        </div>

        {/* Metric 2: Equipment Stock */}
        <div 
          onClick={() => setActiveTab('equipment-stocks')}
          className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-amber-400/80 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider">Inventory Stock</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Package size={15} />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span>{availableUnits}</span>
              <span className="text-xs font-bold text-slate-400">/ {totalUnits} Units</span>
            </div>
            <p className="text-[0.68rem] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${availabilityPct > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>{availabilityPct}% Stock in store</span>
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[0.65rem] font-bold text-slate-500">
            <span>{equipmentList.length} Categories</span>
            <span className="text-amber-600 font-bold">{activeIssuedLogs.length} Active Issues</span>
          </div>
        </div>

        {/* Metric 3: Sports Events */}
        <div 
          onClick={() => setActiveTab('sports')}
          className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-indigo-400/80 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider">Disciplines</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Trophy size={15} />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {sports.length} Events
            </div>
            <p className="text-[0.68rem] font-semibold text-slate-400">
              🌸 {sports.filter(s => isGirlsEvent(s)).length} Girls • 🏃‍♂️ {sports.length} Boys
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[0.65rem] font-bold text-slate-500">
            <span className="text-pink-600 font-bold">14 Sanctioned Girls</span>
            <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              Manage <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Metric 4: Standings Leader */}
        <div 
          onClick={() => setActiveTab('schedule')}
          className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-emerald-400/80 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider">Medals Leader</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award size={15} />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span className="text-emerald-600">{leader.code}</span>
              <span className="text-xs font-black text-slate-500">{leader.totalPoints || 0} Pts</span>
            </div>
            <p className="text-[0.68rem] font-semibold text-slate-400 truncate mt-0.5">
              {leader.branchName}
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[0.65rem] font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span>🥇 {leader.totalGold || 0}</span>
              <span>🥈 {leader.totalSilver || 0}</span>
              <span>🥉 {leader.totalBronze || 0}</span>
            </span>
            <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              Points <ChevronRight size={12} />
            </span>
          </div>
        </div>

      </div>

      {/* QUICK WORKSPACE ACTIONS */}
      <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
        <div className="text-[0.62rem] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles size={12} className="text-blue-600" />
          <span>Quick Council Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setActiveTab('registrations')}
            className="p-2 bg-white hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-lg text-left transition group shadow-2xs cursor-pointer"
          >
            <div className="text-blue-600 mb-1"><FileText size={14} /></div>
            <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 truncate">Student Rosters</p>
            <p className="text-[0.62rem] font-semibold text-slate-400">Print & Filter</p>
          </button>

          <button
            onClick={() => setActiveTab('equipment-stocks')}
            className="p-2 bg-white hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 rounded-lg text-left transition group shadow-2xs cursor-pointer"
          >
            <div className="text-amber-600 mb-1"><Box size={14} /></div>
            <p className="text-xs font-black text-slate-900 group-hover:text-amber-600 truncate">New Equipment</p>
            <p className="text-[0.62rem] font-semibold text-slate-400">Add Stock Item</p>
          </button>

          <button
            onClick={() => setActiveTab('equipment-issues')}
            className="p-2 bg-white hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 rounded-lg text-left transition group shadow-2xs cursor-pointer"
          >
            <div className="text-purple-600 mb-1"><RotateCcw size={14} /></div>
            <p className="text-xs font-black text-slate-900 group-hover:text-purple-600 truncate">Issue / Return</p>
            <p className="text-[0.62rem] font-semibold text-slate-400">Checkout Items</p>
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className="p-2 bg-white hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 rounded-lg text-left transition group shadow-2xs cursor-pointer"
          >
            <div className="text-indigo-600 mb-1"><Trophy size={14} /></div>
            <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 truncate">Add Sport Event</p>
            <p className="text-[0.62rem] font-semibold text-slate-400">Disciplines & Rules</p>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="p-2 bg-white hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-lg text-left transition group shadow-2xs cursor-pointer"
          >
            <div className="text-emerald-600 mb-1"><Calendar size={14} /></div>
            <p className="text-xs font-black text-slate-900 group-hover:text-emerald-600 truncate">Enter Winners</p>
            <p className="text-[0.62rem] font-semibold text-slate-400">Match Scores</p>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 bg-white hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-300 rounded-lg text-left transition group shadow-2xs cursor-pointer"
          >
            <div className="text-rose-600 mb-1"><Sliders size={14} /></div>
            <p className="text-xs font-black text-slate-900 group-hover:text-rose-600 truncate">Site Settings</p>
            <p className="text-[0.62rem] font-semibold text-slate-400">Branding & Phone</p>
          </button>
        </div>
      </div>

      {/* DUAL DATA INSIGHT PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* PANEL A: RECENT STUDENT REGISTRATIONS */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <Users size={14} className="text-blue-600" /> Recent Athlete Submissions
              </h4>
              <p className="text-[0.65rem] font-semibold text-slate-400">Latest students self-registered</p>
            </div>
            <button
              onClick={() => setActiveTab('registrations')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-1.5">
            {recentRegistrations.length > 0 ? (
              recentRegistrations.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-2 bg-slate-50/80 hover:bg-slate-100/80 rounded-lg border border-slate-100 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-slate-900 truncate">{student.name}</p>
                    <p className="text-[0.65rem] font-semibold text-slate-500 truncate">
                      {student.rollNo} • {student.branch} ({student.gender})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[0.62rem] font-black rounded-md">
                      {student.events?.length || 0} Events
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs font-semibold text-slate-400">
                No student submissions registered yet.
              </div>
            )}
          </div>
        </div>

        {/* PANEL B: ACTIVE ISSUED EQUIPMENT AWAITING RETURN */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <RotateCcw size={14} className="text-amber-500" /> Active Equipment Loan Logs
              </h4>
              <p className="text-[0.65rem] font-semibold text-slate-400">Items currently held by students</p>
            </div>
            <button
              onClick={() => setActiveTab('equipment-issues')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Logs</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-1.5">
            {activeIssuedLogs.length > 0 ? (
              activeIssuedLogs.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-2 bg-amber-50/50 hover:bg-amber-50 rounded-lg border border-amber-200/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">{log.equipmentName}</span>
                      <span className="px-1 py-0.2 rounded bg-amber-200/70 text-amber-900 text-[0.58rem] font-black">
                        Qty: {log.qty}
                      </span>
                    </div>
                    <p className="text-[0.65rem] font-semibold text-slate-600 truncate mt-0.5">
                      Issued to {log.borrowerName} ({log.rollNo}) • {log.branch}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[0.6rem] font-bold text-slate-400 block">{log.issueDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs font-semibold text-slate-400">
                All sports equipment returned. No outstanding checkouts.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
