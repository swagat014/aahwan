import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, MapPin, Clock, Users, Search, ChevronRight, Sparkles } from 'lucide-react';
import { sportsData } from '../data/sportsData';
import { useApp } from '../context/AppContext';

export default function SportsShowcase({ onSelectSport }) {
  const { sports: contextSports } = useApp();
  const displaySports = contextSports && contextSports.length > 0 ? contextSports : sportsData;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Events', count: displaySports.length, icon: '🏆' },
    { id: 'athletics', label: 'Track & Field', count: displaySports.filter(s => s.category === 'athletics').length, icon: '🏃' },
    { id: 'team', label: 'Team Sports', count: displaySports.filter(s => s.category === 'team').length, icon: '⚽' },
    { id: 'indoor', label: 'Rackets & Boards', count: displaySports.filter(s => s.category === 'indoor').length, icon: '🏸' },
  ];

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

  const filteredSports = displaySports.filter(sport => {
    const matchesCategory = activeCategory === 'all' || sport.category === activeCategory;
    const matchesSearch = (sport.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (sport.venue || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="sports" className="py-16 sm:py-20 bg-slate-50/60 relative overflow-hidden select-none">
      
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Compact Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-blue-600 border border-blue-200/90 rounded-full text-xs font-black uppercase tracking-widest mb-2.5 shadow-sm">
            <Trophy size={14} className="text-amber-500" /> GCEK Sports Roster
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Sports Disciplines & Championships
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm font-semibold">
            Filter by sport category or search by venue. Click any sport tile to view rules & guidelines.
          </p>
        </div>

        {/* Compact Filter Bar & Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 mb-6 shadow-sm">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sport or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* COMPACT CONTROLLED SCROLL CONTAINER (FIXES LONG SCROLL!) */}
        <div className="max-h-[480px] overflow-y-auto pr-1 sm:pr-2 space-y-2.5 custom-scrollbar rounded-2xl">
          <AnimatePresence mode="popLayout">
            {filteredSports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredSports.map((sport) => {
                  const icon = sportIcons[sport.title] || '🏅';
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      key={sport.id || sport.title}
                      onClick={() => onSelectSport(sport)}
                      className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      {/* Left: Icon + Title & Division */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {icon}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                            {sport.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[0.62rem] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.2 rounded-full uppercase tracking-wider">
                              {sport.divisionName || 'Boys & Girls'}
                            </span>
                            <span className="text-[0.62rem] font-bold text-slate-400 truncate">
                              • {sport.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Rules Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSport(sport);
                        }}
                        className="px-3 py-1.5 bg-slate-900 group-hover:bg-blue-600 text-white font-black text-[0.7rem] rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-sm"
                      >
                        <span>Rules</span>
                        <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>

                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-bold bg-white rounded-2xl border border-slate-200 text-xs">
                No sports events found matching "{searchTerm}".
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
