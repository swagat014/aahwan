import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sliders } from 'lucide-react';
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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full shadow-2xl transition-all flex items-center gap-2 font-black text-xs uppercase tracking-wider ${
        isAdminLoggedIn
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30'
          : 'bg-slate-900/90 backdrop-blur-md hover:bg-blue-600 text-white shadow-slate-900/40 border border-slate-700'
      }`}
      title={isAdminLoggedIn ? "Open Admin Dashboard Workspace" : "Admin Login Page"}
    >
      {isAdminLoggedIn ? (
        <>
          <Sliders size={18} />
          <span className="hidden sm:inline">Admin Workspace</span>
        </>
      ) : (
        <>
          <ShieldCheck size={18} className="text-amber-400" />
          <span className="hidden sm:inline">Admin Access</span>
        </>
      )}
    </motion.button>
  );
}
