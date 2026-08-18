import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, ShieldAlert, ArrowLeft, Trophy, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLoginPage() {
  const { loginAdmin, setViewMode, year, festivalName } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden select-none">

      {/* Background Radial Glows */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Back Link */}
      <button
        onClick={() => setViewMode('public')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-colors px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-full backdrop-blur-md"
      >
        <ArrowLeft size={16} /> Return to Public Portal
      </button>

      {/* Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl max-w-md w-full p-8 sm:p-10 shadow-2xl relative z-10"
      >

        {/* Crest Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center mb-5 mx-auto shadow-xl shadow-blue-600/20 border border-blue-400/30">
          <Trophy size={32} />
        </div>

        <h2 className="text-3xl font-black text-center text-white mb-1">
          {festivalName} {year} Admin
        </h2>
        <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest mb-8">
          Government College of Engineering Kalahandi
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-bold rounded-2xl mb-6 flex items-start gap-3"
          >
            <ShieldAlert size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-400 tracking-widest mb-2">
              Admin ID / Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter Admin ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-white font-extrabold text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-black uppercase text-slate-400 tracking-widest mb-2">
              Admin Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-white font-extrabold text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key size={18} /> Sign In to Admin Workspace
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-slate-500 text-[0.75rem] font-semibold flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Supabase Storage & Data Sync Active</span>
        </div>

      </motion.div>
    </div>
  );
}
