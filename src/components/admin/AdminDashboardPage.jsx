import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Users, Trophy, Calendar, Sliders, LogOut, Globe,
  ShieldCheck, Clock, Layers, Camera, Sparkles, TrendingUp, CheckCircle2,
  Menu, X, ChevronRight, ChevronDown, Package, RotateCcw, Box, Home,
  Grid, Zap, LayoutDashboard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SettingsTab from './SettingsTab';
import DignitariesTab from './DignitariesTab';
import SportsTab from './SportsTab';
import ScheduleLeaderboardTab from './ScheduleLeaderboardTab';
import StudentRegistrationsTab from './StudentRegistrationsTab';
import GalleryTab from './GalleryTab';
import EquipmentStockTab from './EquipmentStockTab';
import EquipmentIssueReturnTab from './EquipmentIssueReturnTab';

export default function AdminDashboardPage() {
  const {
    logoutAdmin, setViewMode, year, festivalName, collegeName, collegeLocation,
    registrations, sports, galleryPhotos, schedule, dignitaries, equipmentList, equipmentLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState('registrations');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Grouped Navigation Structure
  const navGroups = [
    {
      groupId: 'inventory',
      groupTitle: 'Equipment & Inventory',
      icon: <Package size={16} className="text-amber-400" />,
      items: [
        {
          id: 'equipment-stocks',
          label: 'Equipment Inventory',
          shortLabel: 'Stocks',
          badge: (equipmentList || []).length,
          icon: <Box size={16} />
        },
        {
          id: 'equipment-issues',
          label: 'Issue & Return Logs',
          shortLabel: 'Issues',
          badge: (equipmentLogs || []).filter(l => l.status === 'issued').length,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <RotateCcw size={16} />
        }
      ]
    },
    {
      groupId: 'events',
      groupTitle: 'Athletics & Sports',
      icon: <Trophy size={16} className="text-blue-400" />,
      items: [
        {
          id: 'registrations',
          label: 'Student Submissions',
          shortLabel: 'Athletes',
          badge: registrations.length,
          icon: <FileText size={16} />
        },
        {
          id: 'sports',
          label: 'Sports Disciplines',
          shortLabel: 'Events',
          badge: sports.length,
          icon: <Trophy size={16} />
        },
        {
          id: 'schedule',
          label: 'Schedule & Standings',
          shortLabel: 'Schedule',
          badge: `${Object.keys(schedule).length} Days`,
          icon: <Calendar size={16} />
        },
        {
          id: 'dignitaries',
          label: 'Officers & Leads',
          shortLabel: 'Officers',
          icon: <Users size={16} />
        },
        {
          id: 'gallery',
          label: 'Photo Highlights',
          shortLabel: 'Gallery',
          badge: galleryPhotos.length,
          icon: <Camera size={16} />
        }
      ]
    },
    {
      groupId: 'settings',
      groupTitle: 'System Settings',
      icon: <Sliders size={16} className="text-emerald-400" />,
      items: [
        {
          id: 'settings',
          label: 'Website Branding',
          shortLabel: 'Settings',
          icon: <Sliders size={16} />
        }
      ]
    }
  ];

  // Quick Mobile Bottom Navigation Bar Items (Most Frequently Used)
  const mobileNavItems = [
    { id: 'registrations', label: 'Athletes', icon: <FileText size={18} /> },
    { id: 'equipment-stocks', label: 'Stocks', icon: <Box size={18} /> },
    { id: 'equipment-issues', label: 'Issues', icon: <RotateCcw size={18} /> },
    { id: 'sports', label: 'Events', icon: <Trophy size={18} /> },
    { id: 'more', label: 'More', icon: <Grid size={18} /> }
  ];

  const activeItem = navGroups.flatMap(g => g.items).find(i => i.id === activeTab) || navGroups[0].items[0];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden select-none">

      {/* MOBILE TOP BAR (< lg) */}
      <header className="lg:hidden bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <Trophy size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-xs text-white tracking-tight truncate">{festivalName} {year}</h2>
            <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest truncate">
              {activeItem.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('public')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <Globe size={13} /> Live Site
          </button>

          <button
            onClick={logoutAdmin}
            className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-500/30 transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (>= lg) */}
      <aside className="hidden lg:flex w-72 h-full bg-slate-900 border-r border-slate-800 flex-shrink-0 flex-col justify-between p-5 shadow-2xl z-40 overflow-y-auto">
        <div className="space-y-6">
          
          {/* Logo Brand Card */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20 border border-blue-400/30 shrink-0">
              <Trophy size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-lg text-white tracking-tight truncate">{festivalName} {year}</h2>
              <p className="text-[0.6rem] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Executive Control
              </p>
            </div>
          </div>

          {/* Categorized Sidebar Links */}
          <nav className="space-y-5">
            {navGroups.map(group => (
              <div key={group.groupId} className="space-y-1.5">
                <div className="text-[0.62rem] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2 py-0.5">
                  {group.icon}
                  <span>{group.groupTitle}</span>
                </div>

                <div className="space-y-1">
                  {group.items.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black scale-102'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-black border ${
                            isActive 
                              ? 'bg-white/20 text-white border-white/20' 
                              : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Admin Profile */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="font-black text-xs text-white truncate">adminaahwan</p>
                <p className="text-[0.6rem] text-slate-400 truncate">Super Administrator</p>
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100 text-slate-800">

        {/* DESKTOP HEADER BAR (>= lg) */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-3.5 items-center justify-between gap-4 shrink-0 shadow-sm z-30">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{collegeName} {collegeLocation}</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="text-blue-600 font-bold">{activeItem.label} Console</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Live Cloud Sync Active
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('public')}
              className="px-4 py-2 bg-slate-950 hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Globe size={15} /> View Live Site
            </button>

            <button
              onClick={logoutAdmin}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* MAIN WORKSPACE CONTENT PANEL */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-slate-200/90 rounded-2xl lg:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-sm overflow-x-auto"
          >
            {activeTab === 'registrations' && <StudentRegistrationsTab />}
            {activeTab === 'sports' && <SportsTab />}
            {activeTab === 'equipment-stocks' && <EquipmentStockTab />}
            {activeTab === 'equipment-issues' && <EquipmentIssueReturnTab />}
            {activeTab === 'gallery' && <GalleryTab />}
            {activeTab === 'dignitaries' && <DignitariesTab />}
            {activeTab === 'schedule' && <ScheduleLeaderboardTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </div>

      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK (< lg) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 flex items-center justify-around z-40 shadow-2xl">
        {mobileNavItems.map(item => {
          const isActive = item.id === 'more' ? mobileDrawerOpen : activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setMobileDrawerOpen(!mobileDrawerOpen);
                } else {
                  setActiveTab(item.id);
                  setMobileDrawerOpen(false);
                }
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-blue-400 font-black scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-600/20 text-blue-400' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[0.62rem] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE DRAWER MODAL OVERLAY (< lg) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col justify-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Grid size={18} className="text-blue-400" /> Admin Navigation Menu
                </h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {navGroups.map(group => (
                  <div key={group.groupId} className="space-y-1.5">
                    <div className="text-[0.62rem] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
                      {group.icon}
                      <span>{group.groupTitle}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileDrawerOpen(false);
                            }}
                            className={`p-3 rounded-2xl font-bold text-xs text-left transition-all flex flex-col justify-between gap-2 border ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={isActive ? 'text-white' : 'text-blue-400'}>{item.icon}</span>
                              {item.badge !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[0.6rem] font-black ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-black text-xs truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={logoutAdmin}
                  className="w-full py-3 bg-rose-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
                >
                  <LogOut size={16} /> Sign Out Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
