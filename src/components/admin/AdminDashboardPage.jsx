import React, { useState } from 'react';
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
  Grid,
  ChevronRight,
  X,
  CheckCircle2,
  Sparkles,
  FileText,
  Award,
  ShieldCheck,
  Building2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AdminOverviewTab from './AdminOverviewTab';
import AdminSidebar from './AdminSidebar';
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
    logoutAdmin, 
    setViewMode, 
    year, 
    festivalName, 
    collegeName, 
    collegeLocation,
    registrations, 
    sports, 
    galleryPhotos, 
    schedule, 
    equipmentList, 
    equipmentLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeIssuedCount = (equipmentLogs || []).filter(l => l.status === 'issued').length;
  const totalEquipUnits = (equipmentList || []).reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);

  // Grouped Navigation Sections
  const navSections = [
    {
      sectionId: 'overview-sec',
      sectionTitle: 'Dashboard',
      items: [
        {
          id: 'overview',
          label: 'Executive Overview',
          shortLabel: 'Overview',
          icon: <LayoutDashboard size={17} />,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }
      ]
    },
    {
      sectionId: 'inventory-sec',
      sectionTitle: 'Equipment & Inventory Desk',
      badge: `${(equipmentList || []).length} Items`,
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-950/20',
      items: [
        {
          id: 'equipment-stocks',
          label: 'Stock & Inventory',
          shortLabel: 'Stock',
          icon: <Box size={17} />,
          badge: (equipmentList || []).length
        },
        {
          id: 'equipment-issues',
          label: 'Issue & Return Logs',
          shortLabel: 'Issues',
          icon: <RotateCcw size={17} />,
          badge: activeIssuedCount > 0 ? activeIssuedCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        }
      ]
    },
    {
      sectionId: 'athletics-sec',
      sectionTitle: 'Athletics & Competition Hub',
      badge: `${(registrations || []).length} Athletes`,
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-950/20',
      items: [
        {
          id: 'registrations',
          label: 'Athletes & Rosters',
          shortLabel: 'Athletes',
          icon: <Users size={17} />,
          badge: (registrations || []).length
        },
        {
          id: 'sports',
          label: 'Sports Disciplines',
          shortLabel: 'Sports',
          icon: <Trophy size={17} />,
          badge: (sports || []).length
        },
        {
          id: 'schedule',
          label: 'Schedule & Standings',
          shortLabel: 'Schedule',
          icon: <Calendar size={17} />,
          badge: `${Object.keys(schedule || {}).length} Days`
        }
      ]
    },
    {
      sectionId: 'council-sec',
      sectionTitle: 'Council & Platform',
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-950/20',
      items: [
        {
          id: 'dignitaries',
          label: 'Officers & Leads',
          shortLabel: 'Officers',
          icon: <Award size={17} />
        },
        {
          id: 'gallery',
          label: 'Photo Highlights',
          shortLabel: 'Gallery',
          icon: <Camera size={17} />,
          badge: (galleryPhotos || []).length
        },
        {
          id: 'settings',
          label: 'System & Branding',
          shortLabel: 'Settings',
          icon: <Sliders size={17} />
        }
      ]
    }
  ];

  // Mobile Bottom Dock Quick Items
  const mobileDockItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'equipment-stocks', label: 'Inventory', icon: <Box size={18} />, badge: activeIssuedCount > 0 ? activeIssuedCount : undefined },
    { id: 'equipment-issues', label: 'Issues', icon: <RotateCcw size={18} /> },
    { id: 'registrations', label: 'Athletes', icon: <Users size={18} /> },
    { id: 'more', label: 'More', icon: <Grid size={18} /> }
  ];

  const allItems = navSections.flatMap(s => s.items);
  const currentItem = allItems.find(i => i.id === activeTab) || allItems[0];
  const currentSection = navSections.find(s => s.items.some(i => i.id === activeTab)) || navSections[0];

  const isInventorySection = activeTab === 'equipment-stocks' || activeTab === 'equipment-issues';
  const isAthleticsSection = activeTab === 'registrations' || activeTab === 'sports' || activeTab === 'schedule';
  const isCouncilSection = activeTab === 'dignitaries' || activeTab === 'gallery' || activeTab === 'settings';

  return (
    <div className="h-screen w-screen bg-[#090D16] text-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden select-none">

      {/* MOBILE TOP NAVIGATION BAR (< lg) */}
      <header className="lg:hidden bg-slate-900/98 backdrop-blur-xl px-3 py-2.5 border-b border-slate-800/90 flex items-center justify-between z-40 shrink-0 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <Trophy size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <h2 className="font-black text-xs text-white tracking-tight truncate">
                {festivalName} {year}
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            </div>
            <p className="text-[0.6rem] font-bold text-slate-400 truncate mt-0.5">
              <span className={isInventorySection ? 'text-amber-400' : isAthleticsSection ? 'text-blue-400' : 'text-purple-400'}>
                {currentItem.label}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setViewMode('public')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[0.68rem] font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer"
            title="Switch to public site view"
          >
            <Globe size={12} className="text-blue-400" />
            <span className="hidden xs:inline">Live Site</span>
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 flex items-center justify-center cursor-pointer"
            title="All Modules Drawer"
          >
            <Grid size={15} />
          </button>

          <button
            onClick={logoutAdmin}
            className="p-1.5 bg-rose-950/40 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-900/40 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* DESKTOP MODULAR & PREMIUM COLLAPSIBLE SIDEBAR (>= lg) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* MAIN WORKSPACE CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100/90 text-slate-800">

        {/* DESKTOP HEADER BAR (>= lg) */}
        <header className="hidden lg:flex bg-white border-b border-slate-200/80 px-5 py-2.5 items-center justify-between gap-4 shrink-0 shadow-2xs z-30">
          <div>
            <div className="flex items-center gap-1.5 text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">
              <span>{currentSection.sectionTitle}</span>
              <span>/</span>
              <span className={isInventorySection ? 'text-amber-600' : 'text-blue-600'}>
                {currentItem.label}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              <span>{collegeName}</span>
              <span className="text-xs font-semibold text-slate-400">• {collegeLocation}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[0.68rem] font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Realtime Cloud Synced</span>
            </div>

            <button
              onClick={() => setViewMode('public')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Globe size={13} /> 
              <span>View Portal</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <LogOut size={13} /> 
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* MAIN TAB CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 pb-24 lg:pb-4 space-y-3">
          
          {/* SECTION SUB-NAVBAR FOR EQUIPMENT & INVENTORY */}
          {isInventorySection && (
            <div className="bg-white border border-amber-200/70 rounded-xl p-2.5 sm:px-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <Package size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[0.6rem] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                      Equipment Desk
                    </span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-[0.65rem] font-bold text-slate-500 truncate">
                      {totalEquipUnits} Units Total
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                    {activeTab === 'equipment-stocks' ? 'Equipment Stock Catalog' : 'Issue & Return Records'}
                  </h3>
                </div>
              </div>

              {/* Segmented Switcher for Inventory */}
              <div className="w-full sm:w-auto flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 overflow-x-auto scrollbar-thin">
                <button
                  onClick={() => setActiveTab('equipment-stocks')}
                  className={`flex-1 sm:flex-initial justify-center px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'equipment-stocks'
                      ? 'bg-amber-600 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Box size={13} />
                  <span>Stock Inventory</span>
                  <span className={`px-1 py-0.2 rounded-full text-[0.58rem] font-black ${
                    activeTab === 'equipment-stocks' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(equipmentList || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('equipment-issues')}
                  className={`flex-1 sm:flex-initial justify-center px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'equipment-issues'
                      ? 'bg-amber-600 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw size={13} />
                  <span>Issue & Return</span>
                  {activeIssuedCount > 0 && (
                    <span className={`px-1 py-0.2 rounded-full text-[0.58rem] font-black ${
                      activeTab === 'equipment-issues' ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {activeIssuedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SECTION SUB-NAVBAR FOR ATHLETICS & COMPETITION */}
          {isAthleticsSection && (
            <div className="bg-white border border-blue-200/70 rounded-xl p-2.5 sm:px-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0">
                  <Trophy size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[0.6rem] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                      Athletics Hub
                    </span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-[0.65rem] font-bold text-slate-500 truncate">
                      {(registrations || []).length} Athletes
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">
                    {activeTab === 'registrations' && 'Student Submissions & Rosters'}
                    {activeTab === 'sports' && 'Sports Disciplines & Rules'}
                    {activeTab === 'schedule' && 'Match Fixtures & Standings'}
                  </h3>
                </div>
              </div>

              {/* Segmented Switcher for Athletics */}
              <div className="w-full sm:w-auto flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 overflow-x-auto scrollbar-thin">
                <button
                  onClick={() => setActiveTab('registrations')}
                  className={`flex-1 sm:flex-initial justify-center px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'registrations'
                      ? 'bg-blue-600 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={13} />
                  <span>Athletes</span>
                  <span className={`px-1 py-0.2 rounded-full text-[0.58rem] font-black ${
                    activeTab === 'registrations' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(registrations || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('sports')}
                  className={`flex-1 sm:flex-initial justify-center px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'sports'
                      ? 'bg-blue-600 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy size={13} />
                  <span>Disciplines</span>
                  <span className={`px-1 py-0.2 rounded-full text-[0.58rem] font-black ${
                    activeTab === 'sports' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(sports || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex-1 sm:flex-initial justify-center px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'schedule'
                      ? 'bg-blue-600 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Standings</span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN MODULE CONTENT CARD */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-5 shadow-2xs"
          >
            {activeTab === 'overview' && <AdminOverviewTab setActiveTab={setActiveTab} />}
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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-1.5 py-1 flex items-center justify-around z-40 shadow-2xl pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]">
        {mobileDockItems.map(item => {
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
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
                isActive ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${
                isActive ? 'bg-amber-500/15 text-amber-400' : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-[0.62rem] font-bold tracking-tight">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-950" />
              )}
            </button>
          );
        })}
      </nav>

      {/* MOBILE DRAWER OVERLAY (< lg) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex flex-col justify-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 sm:p-5 space-y-3.5 max-h-[85vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Sheet Drag Handle */}
              <div className="w-10 h-1 bg-slate-700/80 rounded-full mx-auto -mt-1 mb-2" />

              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Grid size={16} className="text-blue-400" />
                  <span>All Council Modules</span>
                </h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Sections */}
              <div className="space-y-3.5">
                {navSections.map(sec => (
                  <div key={sec.sectionId} className="space-y-1.5">
                    <span className={`text-[0.62rem] font-black uppercase tracking-wider block px-1 ${sec.accentColor || 'text-slate-400'}`}>
                      {sec.sectionTitle}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {sec.items.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileDrawerOpen(false);
                            }}
                            className={`p-2.5 rounded-xl font-bold text-xs text-left transition-all flex flex-col justify-between gap-2 border cursor-pointer active:scale-98 ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 font-black'
                                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={isActive ? 'text-white' : 'text-blue-400'}>{item.icon}</span>
                              {item.badge !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[0.58rem] font-black ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-xs truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={logoutAdmin}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
                >
                  <LogOut size={15} /> Sign Out Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
