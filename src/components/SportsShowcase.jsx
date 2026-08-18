import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, MapPin, Clock, Users, Search, ChevronRight } from 'lucide-react';
import { sportsData } from '../data/sportsData';
import { useApp } from '../context/AppContext';

export default function SportsShowcase({ onSelectSport }) {
  const { sports: contextSports } = useApp();
  const displaySports = contextSports && contextSports.length > 0 ? contextSports : sportsData;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: `All Events (${displaySports.length})` },
    { id: 'athletics', label: `Track & Field Athletics (${displaySports.filter(s => s.category === 'athletics').length})` },
    { id: 'team', label: `Team Sports (${displaySports.filter(s => s.category === 'team').length})` },
    { id: 'indoor', label: `Racket & Board Games (${displaySports.filter(s => s.category === 'indoor').length})` },
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
    const matchesSearch = sport.title.toLowerCase().includes(searchTerm.toLowerCase()) || sport.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="sports" className="py-24 bg-slate-50/60 relative overflow-hidden select-none">
      
      {/* Radial Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white text-blue-600 border border-blue-200/90 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
            <Trophy size={15} className="text-amber-500" /> Championships & Sports Roster
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            GCEK Sports Disciplines & Athletics
          </h2>
          
          <p className="text-slate-600 text-base font-medium">
            Explore sports by division (Boys / Girls), day, timing, and venue. Click any sport to view official rulebooks.
          </p>
        </motion.div>

        {/* Filter Bar & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3.5 mb-8 shadow-sm">
          
          {/* Category Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
            {categories.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`relative px-4 py-2 rounded-2xl font-black text-xs transition-all ${
                  activeCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {activeCategory === tab.id && (
                  <motion.div
                    layoutId="activeCategoryPillCompact"
                    className="absolute inset-0 bg-blue-600 rounded-2xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sport name or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* COMPACT SLEEK LIST (NO IMAGES) */}
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredSports.length > 0 ? (
              filteredSports.map((sport) => {
                const icon = sportIcons[sport.title] || '🏅';
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    key={sport.id}
                    onClick={() => onSelectSport(sport)}
                    className="award-glass-card rounded-2xl p-4 border border-slate-200/90 bg-white hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    
                    {/* Col 1: Category Emoji Icon + Sport Title + Category */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {icon}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                          {sport.title}
                        </h3>
                        <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider block">
                          {sport.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Col 2: Metadata Badges Group */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      
                      {/* Division Badge */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-full text-[0.7rem] font-black uppercase tracking-wide">
                        <Users size={12} className="text-amber-600" />
                        {sport.divisionName}
                      </span>

                      {/* Day & Timing Badge */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[0.7rem] font-extrabold">
                        <Clock size={12} className="text-blue-600" />
                        {sport.time}
                      </span>

                      {/* Venue Chip */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-[0.7rem] font-extrabold">
                        <MapPin size={12} className="text-emerald-600" />
                        {sport.venue}
                      </span>

                    </div>

                    {/* Col 3: Rules Action Button */}
                    <div className="pt-1 sm:pt-0 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSport(sport);
                        }}
                        className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 group-hover:bg-blue-600 text-white font-black text-[0.75rem] rounded-full transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Rules</span>
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-200">
                No sports events found matching "{searchTerm}".
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
