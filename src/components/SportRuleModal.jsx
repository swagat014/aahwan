import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, MapPin, Clock, Users, ShieldCheck, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SportRuleModal({ sport, onClose }) {
  const { setShowStudentRegistration } = useApp();

  if (!sport) return null;

  const sportIcons = {
    '100m Sprint': '🏃',
    '200m Sprint': '🏃‍♂️',
    '400m Sprint': '🏃‍♀️',
    '800m Middle-Distance Race': '🏃‍♂️',
    '1500m Distance Race': '🏃',
    'Long Jump': '👟',
    'High Jump': '🚀',
    'Triple Jump (Hop, Step & Jump)': '👟',
    'Discus Throw': '🥏',
    'Javelin Throw': '🗡️',
    'Shot Put Throw': '🏋️',
    '4 x 400m Relay Race': '🏃‍♂️',
    'Cricket Tournament': '🏏',
    'Football Champions Cup': '⚽',
    'Badminton Championship': '🏸',
    'Chess Rapid & Blitz Tournament': '♟️',
    'Volleyball Championship': '🏐',
    'Kho-Kho Tournament': '🏃',
    'Table Tennis Championship': '🏓',
    'Kabaddi League': '🤼'
  };

  const icon = sportIcons[sport.title] || '🏅';

  const handleOpenRegistration = () => {
    onClose();
    setShowStudentRegistration(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 select-none">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Clean Modal Container (No Top Banner Image) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200"
        >
          
          {/* Top Bar with Category & Close Button */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xl shrink-0">
                {icon}
              </span>
              <div>
                <span className="text-[0.68rem] font-black uppercase text-blue-600 tracking-wider block">
                  {sport.categoryName} • {sport.divisionName}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{sport.title}</h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors shadow-sm shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-5 space-y-5">
            
            {/* Clean Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-blue-600 shrink-0" />
                <div>
                  <span className="text-[0.65rem] uppercase text-slate-500 font-bold block">Timing</span>
                  <span className="text-slate-900 font-black">{sport.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[0.65rem] uppercase text-slate-500 font-bold block">Venue</span>
                  <span className="text-slate-900 font-black">{sport.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-amber-600 shrink-0" />
                <div>
                  <span className="text-[0.65rem] uppercase text-slate-500 font-bold block">Division</span>
                  <span className="text-slate-900 font-black">{sport.divisionName}</span>
                </div>
              </div>
            </div>

            {/* Overview Section */}
            {sport.desc && (
              <div className="space-y-1">
                <h4 className="text-[0.7rem] font-black uppercase text-slate-500 tracking-wider">Overview</h4>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{sport.desc}</p>
              </div>
            )}

            {/* Official Rules & Technical Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <BookOpen size={16} className="text-blue-600" /> Official Rules & Regulations
              </h4>
              
              <ul className="space-y-2">
                {sport.rules && sport.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-800">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[0.65rem] uppercase text-slate-500 font-black block">Ready to compete?</span>
              <span className="text-xs font-bold text-slate-800">Register now for {sport.title}</span>
            </div>

            <button
              onClick={handleOpenRegistration}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Register as Athlete</span>
              <ChevronRight size={16} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
