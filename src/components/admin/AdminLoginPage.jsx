import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Key, 
  ShieldAlert, 
  ArrowLeft, 
  Trophy, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  User, 
  Sparkles, 
  Zap, 
  Check, 
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLoginPage() {
  const { loginAdmin, setViewMode, year, festivalName, collegeName, collegeLocation } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickFilled, setQuickFilled] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 450);
  };

  const handleQuickFill = () => {
    setUsername('adminaahwan');
    setPassword('gcekaahwanadmin2009');
    setError('');
    setQuickFilled(true);
    setTimeout(() => setQuickFilled(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none">
      
      {/* Background Decorative Mesh & Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-blue-600/12 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[160px]" />

        <svg 
          className="absolute inset-0 w-full h-full opacity-[0.03]" 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          height="100%"
        >
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Top Header Navigation Strip */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-5 z-20 px-2">
        <button
          onClick={() => setViewMode('public')}
          className="group flex items-center gap-1.5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-full backdrop-blur-xl shadow-md cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> 
          <span>Return to Portal</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-full text-[0.68rem] font-bold text-slate-400 backdrop-blur-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Supabase Ready</span>
        </div>
      </header>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[380px] bg-slate-900/75 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.65)] relative z-10 overflow-hidden"
      >
        {/* Top Iridescent Ambient Accent Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500" />

        {/* Brand Crest & Heading */}
        <div className="text-center mb-5">
          <div className="relative inline-block mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 border border-white/20 mx-auto">
              <Trophy size={22} className="drop-shadow-md text-amber-200" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-slate-950 border border-slate-800 text-[0.58rem] font-black text-amber-400 uppercase rounded-full tracking-wider shadow-xs">
              PRO
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>{festivalName || 'AAHWAN'}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">
              {year || '2025'}
            </span>
          </h2>

          <p className="text-[0.68rem] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
            {collegeName || 'Government College of Engineering Kalahandi'}
          </p>

          <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[0.62rem] font-bold text-blue-300">
            <ShieldCheck size={11} className="text-blue-400" />
            <span>Sports Council Control</span>
          </div>
        </div>

        {/* Quick Demo Helper Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleQuickFill}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
              quickFilled
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5 text-[0.72rem]">
              <Sparkles size={13} className={quickFilled ? 'text-emerald-400' : 'text-amber-400'} />
              <span>{quickFilled ? 'Demo Credentials Loaded!' : 'Quick Fill Demo Credentials'}</span>
            </span>
            <span className="text-[0.62rem] px-1.5 py-0.2 rounded bg-slate-800/80 font-mono text-slate-300">
              adminaahwan
            </span>
          </button>
        </div>

        {/* Error Alert Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold rounded-xl flex items-start gap-2 overflow-hidden shadow-md"
            >
              <ShieldAlert size={15} className="shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed text-[0.72rem]">
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[0.65rem] font-black uppercase text-slate-400 tracking-wider mb-1">
              Admin ID / Username
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. adminaahwan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] font-black uppercase text-slate-400 tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key size={14} /> 
                <span>Authenticate & Access Workspace</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Security & Verification Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[0.62rem] text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>256-bit Encrypted Session</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Authorized Personnel</span>
        </div>

      </motion.div>

      {/* Page Footer Text */}
      <footer className="mt-5 text-center text-[0.68rem] font-semibold text-slate-500">
        © {year || '2025'} {collegeName}. All rights reserved.
      </footer>

    </div>
  );
}
