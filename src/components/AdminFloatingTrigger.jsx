import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LayoutDashboard, Sliders, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminFloatingTrigger() {
  const { isAdminLoggedIn, setViewMode } = useApp();

  const handleClick = () => {
    if (isAdminLoggedIn) {
      setViewMode('admin-dashboard');
    } else {
      setViewMode('admin-login');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full shadow-2xl transition-all flex items-center gap-2.5 font-black text-xs uppercase tracking-wider backdrop-blur-xl border cursor-pointer ${
        isAdminLoggedIn
          ? 'bg-blue-600/95 hover:bg-blue-500 text-white border-blue-400/40 shadow-blue-600/30'
          : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/80 shadow-slate-950/50 hover:border-slate-600'
      }`}
      title={isAdminLoggedIn ? "Open Admin Control Dashboard" : "Access Admin Login Portal"}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isAdminLoggedIn ? 'bg-emerald-400' : 'bg-amber-400'
        }`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isAdminLoggedIn ? 'bg-emerald-400' : 'bg-amber-400'
        }`} />
      </span>

      {isAdminLoggedIn ? (
        <>
          <LayoutDashboard size={15} />
          <span className="hidden sm:inline">Admin Dashboard</span>
        </>
      ) : (
        <>
          <ShieldCheck size={15} className="text-amber-400" />
          <span className="hidden sm:inline">Admin Portal</span>
        </>
      )}
    </motion.button>
  );
}

