import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Key, ShieldAlert, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLoginModal() {
  const { showAdminLogin, setShowAdminLogin, loginAdmin } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAdminLogin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Invalid Admin credentials. Access denied.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAdminLogin(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={() => setShowAdminLogin(false)}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-5 mx-auto shadow-sm">
            <Lock size={28} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 text-center mb-1">
            AWAHAAN Admin Portal
          </h3>
          <p className="text-xs text-slate-500 font-semibold text-center mb-6">
            Government College of Engineering Kalahandi
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl mb-5 flex items-center gap-2"
            >
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label 
                htmlFor="modal_admin_user"
                className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2"
              >
                Admin Username / ID
              </label>
              <div className="relative">
                <input
                  id="modal_admin_user"
                  name="modal_admin_user"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Enter admin ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="modal_admin_pass"
                className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2"
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="modal_admin_pass"
                  name="modal_admin_pass"
                  type="password"
                  required
                  autoComplete="new-password"
                  spellCheck="false"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key size={18} /> Login to Admin Panel
                </>
              )}
            </button>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
