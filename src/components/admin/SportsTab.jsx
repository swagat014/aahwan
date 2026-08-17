import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Edit3, Save, CheckCircle, Trophy, Search, Filter, BookOpen, X, ShieldCheck, Users } from 'lucide-react';

export default function SportsTab() {
  const { sports, addSport, updateSport, deleteSport } = useApp();
  const [savedMsg, setSavedMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [ruleInputs, setRuleInputs] = useState({});

  const [newSport, setNewSport] = useState({
    id: `sport-${Date.now()}`,
    category: 'athletics',
    categoryName: 'Track Event',
    title: '',
    division: 'both',
    divisionName: 'Boys & Girls Divisions',
    image: '/assets/images/hero_sports_banner_1786976961106.png',
    venue: 'GCEK Main Track',
    time: 'Day 1 - 10:00 AM',
    coordinator: 'Athletic Board',
    desc: '',
    rules: ['Standard athletic rules apply.']
  });

  const categories = [
    { id: 'all', label: `All Events (${sports.length})` },
    { id: 'athletics', label: `Track Athletics (${sports.filter(s => s.category === 'athletics').length})` },
    { id: 'team', label: `Team Sports (${sports.filter(s => s.category === 'team').length})` },
    { id: 'indoor', label: `Indoor & Rackets (${sports.filter(s => s.category === 'indoor').length})` },
  ];

  const filteredSports = sports.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDivisionChange = (sportId, selectedDivision) => {
    let divisionName = 'Boys & Girls Divisions';
    if (selectedDivision === 'boys') divisionName = 'Boys Division Only';
    if (selectedDivision === 'girls') divisionName = 'Girls Division Only';

    updateSport(sportId, { division: selectedDivision, divisionName });
    setSavedMsg(`Division updated to "${divisionName}"!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddRule = (sportId, currentRules = []) => {
    const text = ruleInputs[sportId];
    if (!text || !text.trim()) return;

    const updatedRules = [...currentRules, text.trim()];
    updateSport(sportId, { rules: updatedRules });
    setRuleInputs({ ...ruleInputs, [sportId]: '' });
    setSavedMsg('Rule added successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleDeleteRule = (sportId, currentRules = [], indexToRemove) => {
    const updatedRules = currentRules.filter((_, idx) => idx !== indexToRemove);
    updateSport(sportId, { rules: updatedRules });
    setSavedMsg('Rule removed!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    let divName = 'Boys & Girls Divisions';
    if (newSport.division === 'boys') divName = 'Boys Division Only';
    if (newSport.division === 'girls') divName = 'Girls Division Only';

    addSport({ ...newSport, divisionName: divName, id: `sport-${Date.now()}` });
    setShowAddModal(false);
    setNewSport({
      id: '',
      category: 'athletics',
      categoryName: 'Track Event',
      title: '',
      division: 'both',
      divisionName: 'Boys & Girls Divisions',
      image: '/assets/images/hero_sports_banner_1786976961106.png',
      venue: 'GCEK Main Track',
      time: 'Day 1 - 10:00 AM',
      coordinator: 'Athletic Board',
      desc: '',
      rules: ['Standard athletic rules apply.']
    });
    setSavedMsg('New Sports discipline added successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Sports & Athletics Events Manager</h4>
          <p className="text-xs text-slate-500 font-semibold">
            Add any sports discipline and specify division (Both Boys & Girls, Boys Only, Girls Only).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle size={16} /> {savedMsg}
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1.5"
          >
            <Plus size={16} /> Add New Sport
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl font-black text-xs transition-all ${
                activeCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sport or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-600"
          />
        </div>

      </div>

      {/* Cards Grid with Division Selectors & Rules Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[650px] overflow-y-auto pr-1">
        {filteredSports.map((sport) => (
          <div key={sport.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 relative space-y-4 shadow-sm hover:shadow-md transition-all">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[0.7rem] font-black text-blue-600 uppercase tracking-widest">
                {sport.categoryName}
              </span>

              <button
                onClick={() => deleteSport(sport.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-full hover:bg-rose-50"
                title="Delete Sport"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Sport Title & Division Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.65rem] font-black uppercase text-slate-500 tracking-wider mb-1">
                  Sport Discipline Title
                </label>
                <input
                  type="text"
                  value={sport.title}
                  onChange={(e) => updateSport(sport.id, { title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* DIVISION SELECTOR DROPDOWN */}
              <div>
                <label className="block text-[0.65rem] font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                  <Users size={12} className="text-amber-600" /> Division Category
                </label>
                <select
                  value={sport.division || 'both'}
                  onChange={(e) => handleDivisionChange(sport.id, e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-amber-900 font-black text-xs focus:outline-none focus:border-amber-600"
                >
                  <option value="both">Both Boys & Girls Divisions</option>
                  <option value="boys">Boys Division Only</option>
                  <option value="girls">Girls Division Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[0.65rem] font-black uppercase text-slate-500 tracking-wider mb-1">
                  Venue Location
                </label>
                <input
                  type="text"
                  value={sport.venue}
                  onChange={(e) => updateSport(sport.id, { venue: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] font-black uppercase text-slate-500 tracking-wider mb-1">
                  Schedule Day & Time
                </label>
                <input
                  type="text"
                  value={sport.time}
                  onChange={(e) => updateSport(sport.id, { time: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                />
              </div>
            </div>

            {/* OFFICIAL RULES EDITOR */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="block text-[0.7rem] font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-blue-600" /> Official Rules & Specifications ({sport.rules ? sport.rules.length : 0})
              </label>

              {/* Current Rules List */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {sport.rules && sport.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{rule}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(sport.id, sport.rules, idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                      title="Delete Rule"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Rule Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type new rule or specification..."
                  value={ruleInputs[sport.id] || ''}
                  onChange={(e) => setRuleInputs({ ...ruleInputs, [sport.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRule(sport.id, sport.rules)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => handleAddRule(sport.id, sport.rules)}
                  className="px-3 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  + Add
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add Sport Form Overlay with Division Dropdown */}
      {showAddModal && (
        <form onSubmit={handleAddSubmit} className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 space-y-4">
          <h5 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Trophy size={18} className="text-blue-600" /> Add New Event Discipline
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Event Title (e.g. 800m Race)"
              value={newSport.title}
              onChange={(e) => setNewSport({ ...newSport, title: e.target.value })}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
            />

            <select
              value={newSport.category}
              onChange={(e) => setNewSport({
                ...newSport,
                category: e.target.value,
                categoryName: e.target.value === 'athletics' ? 'Track Event' : e.target.value === 'team' ? 'Team Sport' : 'Indoor Sport'
              })}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
            >
              <option value="athletics">Track & Field Athletics</option>
              <option value="team">Major Team Sport</option>
              <option value="indoor">Racket & Indoor Board Game</option>
            </select>

            {/* Division Selector */}
            <select
              value={newSport.division}
              onChange={(e) => setNewSport({ ...newSport, division: e.target.value })}
              className="px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-black text-amber-900"
            >
              <option value="both">Both Boys & Girls Divisions</option>
              <option value="boys">Boys Division Only</option>
              <option value="girls">Girls Division Only</option>
            </select>

            <input
              type="text"
              required
              placeholder="Venue (e.g. Main Athletic Track)"
              value={newSport.venue}
              onChange={(e) => setNewSport({ ...newSport, venue: e.target.value })}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
            />

            <input
              type="text"
              required
              placeholder="Timing (e.g. Day 2 - 09:00 AM)"
              value={newSport.time}
              onChange={(e) => setNewSport({ ...newSport, time: e.target.value })}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold sm:col-span-2"
            />

            <textarea
              placeholder="Brief Description"
              value={newSport.desc}
              onChange={(e) => setNewSport({ ...newSport, desc: e.target.value })}
              className="sm:col-span-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-5 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-full shadow-md"
            >
              Confirm Add Sport
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
