import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  Sliders,
  LogOut,
  Globe,
  Package,
  RotateCcw,
  Box,
  Camera,
  Award,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Wifi,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed 
}) {
  const {
    logoutAdmin,
    setViewMode,
    year,
    festivalName,
    registrations,
    sports,
    galleryPhotos,
    schedule,
    equipmentList,
    equipmentLogs
  } = useApp();

  const activeIssuedCount = (equipmentLogs || []).filter(l => l.status === 'issued').length;

  const navSections = [
    {
      sectionId: 'command',
      title: 'Command Deck',
      accent: 'blue',
      items: [
        {
          id: 'overview',
          label: 'Executive Overview',
          shortLabel: 'Overview',
          icon: <LayoutDashboard size={15} />,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }
      ]
    },
    {
      sectionId: 'inventory',
      title: 'Equipment & Inventory Desk',
      badge: `${(equipmentList || []).length} Items`,
      accent: 'amber',
      accentHeaderColor: 'text-amber-400',
      activeBg: 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent text-amber-200 border-amber-500/35',
      activeBar: 'bg-amber-400',
      containerBg: 'bg-gradient-to-b from-amber-950/20 to-transparent border-amber-500/15',
      items: [
        {
          id: 'equipment-stocks',
          label: 'Stock Inventory',
          shortLabel: 'Stock',
          icon: <Box size={15} />,
          badge: (equipmentList || []).length
        },
        {
          id: 'equipment-issues',
          label: 'Issue & Return Logs',
          shortLabel: 'Issues',
          icon: <RotateCcw size={15} />,
          badge: activeIssuedCount > 0 ? activeIssuedCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-black'
        }
      ]
    },
    {
      sectionId: 'athletics',
      title: 'Athletics & Competitions',
      badge: `${(registrations || []).length} Athletes`,
      accent: 'blue',
      accentHeaderColor: 'text-blue-400',
      activeBg: 'bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-transparent text-blue-200 border-blue-500/35',
      activeBar: 'bg-blue-400',
      containerBg: 'bg-gradient-to-b from-blue-950/20 to-transparent border-blue-500/15',
      items: [
        {
          id: 'registrations',
          label: 'Athletes & Rosters',
          shortLabel: 'Athletes',
          icon: <Users size={15} />,
          badge: (registrations || []).length
        },
        {
          id: 'sports',
          label: 'Sports Disciplines',
          shortLabel: 'Sports',
          icon: <Trophy size={15} />,
          badge: (sports || []).length
        },
        {
          id: 'schedule',
          label: 'Schedule & Standings',
          shortLabel: 'Schedule',
          icon: <Calendar size={15} />,
          badge: `${Object.keys(schedule || {}).length} Days`
        }
      ]
    },
    {
      sectionId: 'council',
      title: 'Council & Platform',
      accent: 'purple',
      accentHeaderColor: 'text-purple-400',
      activeBg: 'bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-transparent text-purple-200 border-purple-500/35',
      activeBar: 'bg-purple-400',
      containerBg: 'bg-gradient-to-b from-purple-950/15 to-transparent border-purple-500/10',
      items: [
        {
          id: 'dignitaries',
          label: 'Officers & Leads',
          shortLabel: 'Officers',
          icon: <Award size={15} />
        },
        {
          id: 'gallery',
          label: 'Photo Highlights',
          shortLabel: 'Gallery',
          icon: <Camera size={15} />,
          badge: (galleryPhotos || []).length
        },
        {
          id: 'settings',
          label: 'System & Branding',
          shortLabel: 'Settings',
          icon: <Sliders size={15} />
        }
      ]
    }
  ];

  return (
    <aside 
      className={`hidden lg:flex h-full bg-[#080C14] border-r border-slate-800/80 flex-shrink-0 flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 relative select-none ${
        collapsed ? 'w-16 p-2' : 'w-60 p-3'
      }`}
    >
      {/* Top Ambient Edge Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-amber-500/30 pointer-events-none" />

      {/* TOP HEADER: BRAND + COLLAPSE TOGGLE */}
      <div className="space-y-3 shrink-0">
        <div className={`flex items-center pb-2.5 border-b border-slate-800/80 ${
          collapsed ? 'justify-center flex-col gap-1.5' : 'justify-between'
        }`}>
          {/* Logo Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 border border-white/20 shrink-0">
              <Trophy size={16} className="text-amber-200" />
            </div>

            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-black text-sm text-white tracking-tight truncate">
                    {festivalName || 'AAHWAN'}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[0.6rem] font-black">
                    {year || '2025'}
                  </span>
                </div>
                <p className="text-[0.58rem] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Console Active</span>
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* NAVIGATION SECTIONS LIST */}
      <nav className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-0.5 scrollbar-thin">
        {navSections.map(sec => {
          return (
            <div
              key={sec.sectionId}
              className={`rounded-xl transition-all ${
                collapsed 
                  ? 'p-0.5' 
                  : `p-1.5 border ${sec.containerBg || 'border-slate-800/60 bg-slate-900/20'}`
              }`}
            >
              {/* Section Title (Expanded Mode) */}
              {!collapsed && (
                <div className="flex items-center justify-between px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-wider">
                  <span className={sec.accentHeaderColor || 'text-slate-400'}>
                    {sec.title}
                  </span>
                  {sec.badge && (
                    <span className="text-[0.55rem] px-1 py-0.2 rounded bg-slate-800/80 text-slate-400 font-bold">
                      {sec.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Navigation Items */}
              <div className="space-y-0.5 mt-0.5">
                {sec.items.map(item => {
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center relative transition-all rounded-lg text-xs font-bold cursor-pointer group ${
                        collapsed 
                          ? 'justify-center p-2' 
                          : 'justify-between px-2 py-1.5'
                      } ${
                        isActive
                          ? `${sec.activeBg || 'bg-blue-600/20 text-white border-blue-500/35'} border shadow-2xs font-black`
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Left Neon Accent Bar for Active Item */}
                      {isActive && (
                        <span 
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full shadow-sm ${
                            sec.activeBar || 'bg-blue-500'
                          }`} 
                        />
                      )}

                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`shrink-0 transition-transform group-hover:scale-105 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-slate-400 group-hover:text-white'
                        }`}>
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span className="truncate text-[0.72rem] tracking-tight">{item.label}</span>
                        )}
                      </div>

                      {/* Numerical Counter Badge */}
                      {!collapsed && item.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[0.58rem] font-black border transition-colors shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Small notification dot in collapsed mode */}
                      {collapsed && item.badge !== undefined && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* FOOTER AREA: REALTIME TELEMETRY + ADMIN PROFILE */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 shrink-0">
        
        {/* Realtime Telemetry Card (Expanded Mode Only) */}
        {!collapsed && (
          <div className="p-1.5 px-2 bg-slate-900/50 rounded-lg border border-slate-800/80 flex items-center justify-between text-[0.6rem] text-slate-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <Wifi size={12} className="text-emerald-400" />
              <span>Realtime Cloud DB</span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
            </span>
          </div>
        )}

        {/* User Card & Controls */}
        <div className={`p-1.5 bg-slate-900/70 rounded-xl border border-slate-800/90 flex items-center ${
          collapsed ? 'flex-col gap-1.5 justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-[0.65rem] flex items-center justify-center shrink-0 border border-white/10 shadow-xs">
              AD
            </div>

            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="font-black text-xs text-white truncate">adminaahwan</p>
                <p className="text-[0.58rem] font-bold text-slate-400 truncate">Council Admin</p>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-0.5 ${collapsed ? 'flex-col w-full' : ''}`}>
            {/* View Live Site Button */}
            <button
              onClick={() => setViewMode('public')}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="View Public Site"
            >
              <Globe size={13} />
            </button>

            {/* Logout Button */}
            <button
              onClick={logoutAdmin}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

      </div>

    </aside>
  );
}
