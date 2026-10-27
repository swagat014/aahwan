import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  CheckCircle2, 
  Trophy, 
  Search, 
  Filter, 
  BookOpen, 
  X, 
  ShieldCheck, 
  Users,
  Download,
  LayoutGrid,
  Table,
  MapPin,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Heart,
  Printer
} from 'lucide-react';
import { isGirlsEvent, isBoysEvent, GIRLS_ALLOWED_SPORTS_TITLES } from '../../data/sportsData';
import PrintableRosterModal from './PrintableRosterModal';
import { isTeamSportTitle, getTeamSquadSize } from '../StudentRegistrationModal';

export default function SportsTab() {
  const { 
    sports, addSport, updateSport, deleteSport, updateSportCategory,
    teamSquadSizes = {}, updateTeamSquadSize, DEFAULT_TEAM_SQUAD_SIZES 
  } = useApp();
  
  // UI States
  const [toastMsg, setToastMsg] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'athletics' | 'team' | 'indoor'
  const [divisionFilter, setDivisionFilter] = useState('all'); // 'all' | 'both' | 'boys' | 'girls' | 'boys-only'
  const [printSportTitle, setPrintSportTitle] = useState(null);
  
  // Sorting State
  const [sortField, setSortField] = useState('title'); // 'title' | 'category' | 'division' | 'venue'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Selection State
  const [selectedSportIds, setSelectedSportIds] = useState([]);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [rulesModalSport, setRulesModalSport] = useState(null);
  const [newRuleInput, setNewRuleInput] = useState('');

  // Add / Edit Form State
  const [sportForm, setSportForm] = useState({
    title: '',
    category: 'athletics',
    categoryName: 'Track Event',
    division: 'both',
    divisionName: 'Boys & Girls Divisions',
    venue: 'GCEK Synthetic Athletic Track',
    time: 'Day 1 - 09:00 AM',
    coordinator: 'Athletic Board',
    desc: '',
    rules: ['Standard athletic rules apply.', 'Proper sports gear & bib required.'],
    squadSize: 12
  });

  // Team Sports Catalogue for Quick Squad Size Administration
  const teamSportsConfigList = [
    { title: 'Volleyball Championship', icon: '🏐', desc: 'Court Power Sport' },
    { title: 'Badminton Championship', icon: '🏸', desc: 'Racket Team Championship' },
    { title: 'Kabaddi League', icon: '🤼', desc: 'Pro Mat Raiders & Tackles' },
    { title: 'Kho-Kho Tournament', icon: '🏃', desc: 'Tactical Chase & Dodge' },
    { title: 'Football Champions Cup', icon: '⚽', desc: '11-a-side Field Tournament' },
    { title: 'Cricket Tournament', icon: '🏏', desc: 'Inter-Branch T20 League' },
    { title: 'Tug of War Championship', icon: '🪢', desc: 'Raw Strength Pull Battle' },
    { title: 'Table Tennis Championship', icon: '🏓', desc: 'Fast Spin & Counter Battle' },
    { title: 'Chess Rapid & Blitz Tournament', icon: '♟️', desc: 'Mind Board Grandmaster Squad' },
    { title: '4 x 400m Relay Race', icon: '🏃‍♂️', desc: 'Grand Finale 4-Leg Sprint' }
  ];

  // Category Definitions
  const categories = [
    { id: 'all', label: 'All Disciplines', icon: '🏆', color: 'bg-blue-600' },
    { id: 'athletics', label: 'Track & Field', icon: '🏃', color: 'bg-cyan-600' },
    { id: 'team', label: 'Team Sports', icon: '⚽', color: 'bg-emerald-600' },
    { id: 'indoor', label: 'Indoor & Rackets', icon: '🏸', color: 'bg-purple-600' },
  ];

  // Helper to get sport emoji
  const getSportEmoji = (title = '', category = '') => {
    const t = title.toLowerCase();
    if (t.includes('100m') || t.includes('200m') || t.includes('400m') || t.includes('800m') || t.includes('sprint') || t.includes('race') || t.includes('relay')) return '🏃';
    if (t.includes('jump')) return '👟';
    if (t.includes('throw') || t.includes('shot') || t.includes('discus') || t.includes('javelin')) return '🏋️';
    if (t.includes('cricket')) return '🏏';
    if (t.includes('football')) return '⚽';
    if (t.includes('volleyball')) return '🏐';
    if (t.includes('badminton')) return '🏸';
    if (t.includes('chess')) return '♟️';
    if (t.includes('kabaddi')) return '🤼';
    if (t.includes('table tennis') || t.includes('tennis')) return '🏓';
    if (t.includes('tug of war') || t.includes('tugofwar')) return '🪢';
    if (t.includes('kho')) return '🏃‍♂️';
    if (category === 'athletics') return '🏃';
    if (category === 'team') return '⚽';
    if (category === 'indoor') return '♟️';
    return '🏆';
  };

  // Metrics
  const totalCount = sports.length;
  const athCount = sports.filter(s => s.category === 'athletics').length;
  const teamCount = sports.filter(s => s.category === 'team').length;
  const indoorCount = sports.filter(s => s.category === 'indoor').length;
  
  // Division Breakdown Metrics
  const girlsSportsCount = sports.filter(s => isGirlsEvent(s)).length; // 14 Sanctioned Events
  const boysSportsCount = sports.filter(s => isBoysEvent(s)).length;   // 21 Events
  const boysOnlyCount = sports.filter(s => s.division === 'boys').length; // 7 Boys-Only Events
  const bothDivCount = sports.filter(s => (s.division || 'both') === 'both').length; // 14 Shared
  const singleDivCount = totalCount - bothDivCount;

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Sports
  const filteredSports = useMemo(() => {
    return sports.filter(s => {
      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
      const matchesDivision = 
        divisionFilter === 'all' ? true :
        divisionFilter === 'girls' ? isGirlsEvent(s) :
        divisionFilter === 'boys' ? isBoysEvent(s) :
        divisionFilter === 'boys-only' ? s.division === 'boys' :
        divisionFilter === 'girls-only' ? s.division === 'girls' :
        divisionFilter === 'both' ? (s.division || 'both') === 'both' :
        (s.division || 'both') === divisionFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        (s.title || '').toLowerCase().includes(q) ||
        (s.venue || '').toLowerCase().includes(q) ||
        (s.time || '').toLowerCase().includes(q) ||
        (s.categoryName || '').toLowerCase().includes(q);

      return matchesCategory && matchesDivision && matchesSearch;
    }).sort((a, b) => {
      let valA = '', valB = '';
      if (sortField === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (sortField === 'category') {
        valA = (a.category || '').toLowerCase();
        valB = (b.category || '').toLowerCase();
      } else if (sortField === 'division') {
        valA = (a.division || 'both').toLowerCase();
        valB = (b.division || 'both').toLowerCase();
      } else if (sortField === 'venue') {
        valA = (a.venue || '').toLowerCase();
        valB = (b.venue || '').toLowerCase();
      }
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [sports, activeCategory, divisionFilter, searchTerm, sortField, sortDirection]);

  // Multi-select handlers
  const isAllSelected = filteredSports.length > 0 && selectedSportIds.length === filteredSports.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSportIds([]);
    } else {
      setSelectedSportIds(filteredSports.map(s => s.id));
    }
  };

  const toggleSelectSport = (id) => {
    setSelectedSportIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Operations
  const handleBulkDivisionChange = (newDivision) => {
    let divName = 'Boys & Girls Divisions';
    if (newDivision === 'boys') divName = 'Boys Division Only';
    if (newDivision === 'girls') divName = 'Girls Division Only';

    selectedSportIds.forEach(id => {
      updateSport(id, { division: newDivision, divisionName: divName });
    });
    setToastMsg(`Updated division for ${selectedSportIds.length} sports`);
    setSelectedSportIds([]);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleBulkDelete = () => {
    if (selectedSportIds.length === 0) return;
    if (confirm(`Permanently remove ${selectedSportIds.length} selected disciplines?`)) {
      selectedSportIds.forEach(id => deleteSport(id));
      setSelectedSportIds([]);
      setToastMsg('Selected disciplines removed');
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  // Quick Division Update on Single Sport
  const handleDivisionChange = (sportId, selectedDivision) => {
    let divisionName = 'Boys & Girls Divisions';
    if (selectedDivision === 'boys') divisionName = 'Boys Division Only';
    if (selectedDivision === 'girls') divisionName = 'Girls Division Only';

    updateSport(sportId, { division: selectedDivision, divisionName });
    setToastMsg(`Updated division to "${divisionName}"`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Quick Category / Scoring System Update
  const handleCategoryChange = (sportId, newCategory) => {
    let categoryName = 'Track Event';
    if (newCategory === 'team') categoryName = 'Team Sport';
    if (newCategory === 'indoor') categoryName = 'Indoor Sport';

    updateSportCategory(sportId, newCategory);
    updateSport(sportId, { category: newCategory, categoryName });
    setToastMsg(`Updated discipline type to "${categoryName}"`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Rule Handlers
  const handleAddRule = (sportId, currentRules = []) => {
    if (!newRuleInput.trim()) return;
    const updatedRules = [...(currentRules || []), newRuleInput.trim()];
    updateSport(sportId, { rules: updatedRules });
    
    // Update local state if rules modal is open
    if (rulesModalSport && rulesModalSport.id === sportId) {
      setRulesModalSport({ ...rulesModalSport, rules: updatedRules });
    }
    setNewRuleInput('');
    setToastMsg('Rule added successfully');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleDeleteRule = (sportId, currentRules = [], indexToRemove) => {
    const updatedRules = (currentRules || []).filter((_, idx) => idx !== indexToRemove);
    updateSport(sportId, { rules: updatedRules });
    if (rulesModalSport && rulesModalSport.id === sportId) {
      setRulesModalSport({ ...rulesModalSport, rules: updatedRules });
    }
    setToastMsg('Rule removed');
    setTimeout(() => setToastMsg(''), 2000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingSport(null);
    setSportForm({
      title: '',
      category: activeCategory !== 'all' ? activeCategory : 'athletics',
      categoryName: activeCategory === 'team' ? 'Team Sport' : activeCategory === 'indoor' ? 'Indoor Sport' : 'Track Event',
      division: 'both',
      divisionName: 'Boys & Girls Divisions',
      venue: 'GCEK Synthetic Athletic Track',
      time: 'Day 1 - 09:00 AM',
      coordinator: 'Athletic Board',
      desc: '',
      rules: ['Standard athletic rules apply.', 'Proper sports gear & bib required.'],
      squadSize: 12
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (sport) => {
    setEditingSport(sport);
    setSportForm({
      title: sport.title || '',
      category: sport.category || 'athletics',
      categoryName: sport.categoryName || 'Track Event',
      division: sport.division || 'both',
      divisionName: sport.divisionName || 'Boys & Girls Divisions',
      venue: sport.venue || 'GCEK Synthetic Athletic Track',
      time: sport.time || 'Day 1 - 09:00 AM',
      coordinator: sport.coordinator || 'Athletic Board',
      desc: sport.desc || '',
      rules: sport.rules || [],
      squadSize: teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes)
    });
    setShowAddModal(true);
  };

  // Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!sportForm.title.trim()) return;

    let divName = 'Boys & Girls Divisions';
    if (sportForm.division === 'boys') divName = 'Boys Division Only';
    if (sportForm.division === 'girls') divName = 'Girls Division Only';

    let catName = 'Track Event';
    if (sportForm.category === 'team') catName = 'Team Sport';
    if (sportForm.category === 'indoor') catName = 'Indoor Sport';

    if (editingSport) {
      updateSport(editingSport.id, {
        ...sportForm,
        divisionName: divName,
        categoryName: catName
      });
      if (sportForm.squadSize) {
        updateTeamSquadSize(sportForm.title, sportForm.squadSize);
      }
      setToastMsg(`Updated "${sportForm.title}" successfully`);
    } else {
      addSport({
        ...sportForm,
        id: `sport-${Date.now()}`,
        divisionName: divName,
        categoryName: catName,
        image: '/assets/images/hero_sports_banner_1786976961106.png'
      });
      if (sportForm.squadSize) {
        updateTeamSquadSize(sportForm.title, sportForm.squadSize);
      }
      setToastMsg(`Added "${sportForm.title}" discipline`);
    }

    setShowAddModal(false);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Discipline Title', 'Discipline Type', 'Division', 'Venue Location', 'Schedule Day & Time', 'Official Rules Count'];
    const rows = filteredSports.map(s => [
      `"${s.id}"`,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      `"${s.category === 'team' ? 'Team Sport (8/5 Pts)' : 'Individual Track & Field (5/3/1 Pts)'}"`,
      `"${s.division === 'boys' ? 'Boys Only' : s.division === 'girls' ? 'Girls Only' : 'Both Boys & Girls'}"`,
      `"${(s.venue || '').replace(/"/g, '""')}"`,
      `"${(s.time || '').replace(/"/g, '""')}"`,
      s.rules ? s.rules.length : 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AAHWAN_Sports_Disciplines_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = searchTerm || activeCategory !== 'all' || divisionFilter !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setDivisionFilter('all');
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800">
      
      {/* 1. COMPACT TOP TOOLBAR & HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Trophy size={16} />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Sports Disciplines Master Desk</span>
              <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-blue-100 text-blue-800 border border-blue-200">
                {totalCount} Events
              </span>
            </h3>
          </div>
          <p className="text-[0.68rem] font-semibold text-slate-500 mt-0.5 ml-8">
            Manage championship roster, gender divisions, point weighting rules (5/3/1 vs 8/5), venues, and official rulebooks.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Toast Notification */}
          {toastMsg && (
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 size={13} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* View Mode Toggle: Table / Grid */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact Tabular Grid"
            >
              <Table size={13} />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact Cards Grid"
            >
              <LayoutGrid size={13} />
              <span className="hidden md:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            title="Export disciplines roster as CSV"
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Discipline</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT INTERACTIVE KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Tile 1: Total */}
        <button
          onClick={() => { setActiveCategory('all'); setDivisionFilter('all'); }}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            activeCategory === 'all' && divisionFilter === 'all'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>All Events</span>
            <Trophy size={13} className="text-blue-500" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{totalCount}</div>
          <p className="text-[0.58rem] font-semibold text-slate-400 truncate">Total Disciplines</p>
        </button>

        {/* Tile 2: Track & Field */}
        <button
          onClick={() => setActiveCategory(prev => prev === 'athletics' ? 'all' : 'athletics')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            activeCategory === 'athletics'
              ? 'bg-cyan-50 border-cyan-300 ring-2 ring-cyan-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Track & Field</span>
            <span className="text-xs">🏃</span>
          </div>
          <div className="text-lg font-black text-cyan-600 mt-0.5">{athCount}</div>
          <p className="text-[0.58rem] font-bold text-cyan-600 truncate">5/3/1 Pts Rule</p>
        </button>

        {/* Tile 3: Team Sports */}
        <button
          onClick={() => setActiveCategory(prev => prev === 'team' ? 'all' : 'team')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            activeCategory === 'team'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Team Sports</span>
            <span className="text-xs">⚽</span>
          </div>
          <div className="text-lg font-black text-emerald-600 mt-0.5">{teamCount}</div>
          <p className="text-[0.58rem] font-bold text-emerald-600 truncate">8/5 Pts Rule</p>
        </button>

        {/* Tile 4: Indoor & Rackets */}
        <button
          onClick={() => setActiveCategory(prev => prev === 'indoor' ? 'all' : 'indoor')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            activeCategory === 'indoor'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Indoor & Racket</span>
            <span className="text-xs">🏸</span>
          </div>
          <div className="text-lg font-black text-purple-600 mt-0.5">{indoorCount}</div>
          <p className="text-[0.58rem] font-bold text-purple-600 truncate">Chess, Badminton, TT</p>
        </button>

        {/* Tile 5: Girls Sports Division */}
        <button
          onClick={() => setDivisionFilter(prev => prev === 'girls' ? 'all' : 'girls')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            divisionFilter === 'girls'
              ? 'bg-pink-50 border-pink-300 ring-2 ring-pink-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Girls Sports</span>
            <span className="text-xs">🌸</span>
          </div>
          <div className="text-lg font-black text-pink-600 mt-0.5">{girlsSportsCount}</div>
          <p className="text-[0.58rem] font-bold text-pink-600 truncate">14 Approved Events</p>
        </button>

        {/* Tile 6: Boys Exclusive */}
        <button
          onClick={() => setDivisionFilter(prev => prev === 'boys-only' ? 'all' : 'boys-only')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            divisionFilter === 'boys-only'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Boys Exclusive</span>
            <ShieldCheck size={13} className="text-indigo-500" />
          </div>
          <div className="text-lg font-black text-indigo-600 mt-0.5">{boysOnlyCount}</div>
          <p className="text-[0.58rem] font-bold text-indigo-600 truncate">Cricket, Football + 5</p>
        </button>
      </div>

      {/* DEDICATED SECTION: GIRLS & BOYS CHAMPIONSHIP SPORTS DESK */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white shadow-md relative overflow-hidden space-y-3">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
              <Users size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                  Championship Division Master Hub (Boys & Girls Sports)
                </h4>
                <span className="px-1.5 py-0.2 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 font-black text-[0.62rem]">
                  14 Girls Events
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-black text-[0.62rem]">
                  21 Boys Events
                </span>
              </div>
              <p className="text-[0.65rem] text-slate-300 font-medium">
                Official GCEK Division Policy: Girls Division is strictly restricted to 14 sanctioned disciplines. Boys participate across all 21 disciplines.
              </p>
            </div>
          </div>

          {/* Segmented Quick Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 shrink-0 self-stretch sm:self-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setDivisionFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition cursor-pointer shrink-0 ${
                divisionFilter === 'all'
                  ? 'bg-white text-slate-900 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => setDivisionFilter('girls')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                divisionFilter === 'girls'
                  ? 'bg-pink-600 text-white font-black shadow-xs'
                  : 'text-pink-300 hover:text-pink-200 hover:bg-pink-900/30'
              }`}
            >
              <span>🌸</span>
              <span>Girls Only ({girlsSportsCount})</span>
            </button>

            <button
              onClick={() => setDivisionFilter('boys')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                divisionFilter === 'boys'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/30'
              }`}
            >
              <span>🏃‍♂️</span>
              <span>Boys Roster ({boysSportsCount})</span>
            </button>

            <button
              onClick={() => setDivisionFilter('boys-only')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                divisionFilter === 'boys-only'
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'text-indigo-300 hover:text-indigo-200 hover:bg-indigo-900/30'
              }`}
            >
              <span>🛡️</span>
              <span>Boys Exclusive ({boysOnlyCount})</span>
            </button>
          </div>
        </div>

        {/* Dual Split Visual Inspector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 relative z-10 pt-1">
          {/* Card 1: Girls Division Sanctioned 14 Events Roster */}
          <div className={`p-3 rounded-xl border transition-all ${
            divisionFilter === 'girls' 
              ? 'bg-pink-950/40 border-pink-500/50 ring-1 ring-pink-500/30' 
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🌸</span>
                <span className="text-xs font-black text-pink-300">Girls Division Official Roster (14 Events)</span>
              </div>
              <button
                onClick={() => setDivisionFilter(prev => prev === 'girls' ? 'all' : 'girls')}
                className="text-[0.62rem] font-bold text-pink-400 hover:text-pink-300 underline cursor-pointer"
              >
                {divisionFilter === 'girls' ? 'Show All' : 'Filter View'}
              </button>
            </div>

            <p className="text-[0.62rem] text-slate-300 mt-1.5 leading-relaxed">
              Only these 14 sanctioned sports disciplines are active when students select Girls Division in registration:
            </p>

            {/* Grid of the 14 Approved Girls Events */}
            <div className="flex flex-wrap gap-1 mt-2">
              {GIRLS_ALLOWED_SPORTS_TITLES.map((title, idx) => (
                <span 
                  key={idx}
                  className="px-1.5 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-200 text-[0.6rem] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <span>{getSportEmoji(title)}</span>
                  <span>{title}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Boys Division & Exclusive Tournaments */}
          <div className={`p-3 rounded-xl border transition-all ${
            divisionFilter === 'boys-only' 
              ? 'bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30' 
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🏃‍♂️</span>
                <span className="text-xs font-black text-blue-300">Boys Championship & Exclusive Sports (21 Events)</span>
              </div>
              <button
                onClick={() => setDivisionFilter(prev => prev === 'boys-only' ? 'all' : 'boys-only')}
                className="text-[0.62rem] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                {divisionFilter === 'boys-only' ? 'Show All' : 'Filter Exclusive'}
              </button>
            </div>

            <p className="text-[0.62rem] text-slate-300 mt-1.5 leading-relaxed">
              Boys participate across all 21 disciplines, including these 7 exclusive tournaments:
            </p>

            {/* Grid of 7 Boys-Only Events */}
            <div className="flex flex-wrap gap-1 mt-2">
              {[
                'Cricket Tournament',
                'Football Champions Cup',
                'Volleyball Championship',
                'Table Tennis Championship',
                '800m Middle-Distance Race',
                '1500m Distance Race',
                'Triple Jump (Hop, Step & Jump)'
              ].map((title, idx) => (
                <span 
                  key={idx}
                  className="px-1.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-200 text-[0.6rem] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <span>{getSportEmoji(title)}</span>
                  <span>{title}</span>
                  <span className="text-[0.52rem] opacity-75 font-mono">(Boys Only)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SECTION: TEAM SPORTS SQUAD SIZES & PLAYER LIMITS MANAGEMENT */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-800/60 rounded-2xl p-3.5 sm:p-4 text-white shadow-lg relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md font-black">
              <Users size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-amber-100 tracking-tight">
                  Team Sports Squad Size & Player Limits Manager
                </h4>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[0.6rem] uppercase tracking-wider">
                  Admin Managed • Cloud Synced
                </span>
              </div>
              <p className="text-[0.65rem] text-slate-300 font-medium">
                Admin can configure required squad sizes for each team sport (e.g. Tug of War, Chess, Table Tennis, Cricket, etc.). Changes instantly update the Student Registration Form on all devices.
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Grid of Team Sports with Steppers & Quick Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 relative z-10">
          {teamSportsConfigList.map((sport) => {
            const currentSize = teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes);
            return (
              <div
                key={sport.title}
                className="p-2.5 bg-slate-950/70 border border-amber-500/20 rounded-xl hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-2 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base">{sport.icon}</span>
                      <span className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                        {sport.title.replace(' Tournament', '').replace(' Championship', '').replace(' Champions Cup', '').replace(' League', '')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[0.6rem] text-slate-400 truncate">{sport.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] uppercase font-bold text-amber-200/80">Squad Size:</span>
                    <div className="flex items-center gap-1 bg-amber-950/60 p-0.5 rounded-lg border border-amber-500/30">
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(1, currentSize - 1);
                          updateTeamSquadSize(sport.title, next);
                          setToastMsg(`Updated ${sport.title} squad size to ${next}`);
                        }}
                        className="w-5 h-5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-slate-950 font-black text-xs flex items-center justify-center transition cursor-pointer"
                        title="Decrease squad size"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={32}
                        value={currentSize}
                        onChange={(e) => {
                          const next = Math.max(1, Math.min(32, parseInt(e.target.value, 10) || 1));
                          updateTeamSquadSize(sport.title, next);
                        }}
                        className="w-7 text-center bg-transparent text-amber-300 font-mono font-black text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.min(32, currentSize + 1);
                          updateTeamSquadSize(sport.title, next);
                          setToastMsg(`Updated ${sport.title} squad size to ${next}`);
                        }}
                        className="w-5 h-5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-slate-950 font-black text-xs flex items-center justify-center transition cursor-pointer"
                        title="Increase squad size"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center justify-end gap-1">
                    {[4, 8, 12, 16].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          updateTeamSquadSize(sport.title, num);
                          setToastMsg(`Set ${sport.title} to ${num} players`);
                        }}
                        className={`px-1.5 py-0.2 rounded text-[0.58rem] font-black transition cursor-pointer ${
                          currentSize === num
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {num}P
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2.5 space-y-2.5 shadow-2xs">
        
        {/* Row 1: Search + Division Selector + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search discipline title, venue, or timing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Division & Category Filter Selectors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Gender Divisions ({totalCount})</option>
              <option value="girls">Girls Division Only (14 Sanctioned Events)</option>
              <option value="boys">Boys Division (All 21 Events)</option>
              <option value="boys-only">Boys Exclusive Tournaments (7 Events)</option>
              <option value="both">Both Boys & Girls Shared (14 Events)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
                title="Reset active filters"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {categories.map(cat => {
            const count = cat.id === 'all' 
              ? sports.length 
              : sports.filter(s => s.category === cat.id).length;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white font-black shadow-2xs ring-1 ring-blue-700/30' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[0.58rem] font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. VIEW RENDERING: HIGH-DENSITY TABULAR (DEFAULT) OR COMPACT CARDS */}
      {viewMode === 'table' ? (
        
        /* === COMPACT TABULAR VIEW === */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Table Header */}
              <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  {/* Select All */}
                  <th className="py-2.5 px-3 w-8 text-center">
                    <button 
                      onClick={toggleSelectAll} 
                      className="p-1 hover:text-blue-400 text-slate-400 transition cursor-pointer flex items-center justify-center mx-auto"
                      title={isAllSelected ? 'Deselect all' : 'Select all'}
                    >
                      {isAllSelected ? (
                        <CheckSquare size={14} className="text-blue-400" />
                      ) : selectedSportIds.length > 0 ? (
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-xs flex items-center justify-center text-white text-[10px] font-black">
                          -
                        </div>
                      ) : (
                        <Square size={14} />
                      )}
                    </button>
                  </th>

                  {/* Discipline Title */}
                  <th 
                    onClick={() => handleSort('title')}
                    className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Sport Discipline</span>
                      {sortField === 'title' ? (
                        sortDirection === 'asc' ? <ArrowUp size={11} className="text-blue-400" /> : <ArrowDown size={11} className="text-blue-400" />
                      ) : (
                        <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Discipline Type & Points Rule */}
                  <th 
                    onClick={() => handleSort('category')}
                    className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Type & Scoring Weight</span>
                      {sortField === 'category' ? (
                        sortDirection === 'asc' ? <ArrowUp size={11} className="text-blue-400" /> : <ArrowDown size={11} className="text-blue-400" />
                      ) : (
                        <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Division */}
                  <th 
                    onClick={() => handleSort('division')}
                    className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Division</span>
                      {sortField === 'division' ? (
                        sortDirection === 'asc' ? <ArrowUp size={11} className="text-blue-400" /> : <ArrowDown size={11} className="text-blue-400" />
                      ) : (
                        <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Squad Size / Players */}
                  <th className="py-2.5 px-3 text-center">Squad Size / Players</th>

                  {/* Venue & Schedule */}
                  <th 
                    onClick={() => handleSort('venue')}
                    className="py-2.5 px-3 cursor-pointer hover:text-blue-400 transition select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Venue & Schedule</span>
                      {sortField === 'venue' ? (
                        sortDirection === 'asc' ? <ArrowUp size={11} className="text-blue-400" /> : <ArrowDown size={11} className="text-blue-400" />
                      ) : (
                        <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                      )}
                    </div>
                  </th>

                  {/* Official Rules Book */}
                  <th className="py-2.5 px-3 text-center">Rules & Specs</th>

                  {/* Actions */}
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredSports.length > 0 ? (
                  filteredSports.map((sport) => {
                    const isSelected = selectedSportIds.includes(sport.id);
                    const emoji = getSportEmoji(sport.title, sport.category);
                    const rulesCount = sport.rules ? sport.rules.length : 0;
                    const isTeam = sport.category === 'team';

                    return (
                      <tr 
                        key={sport.id} 
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-blue-50/70 border-l-2 border-l-blue-600' 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => toggleSelectSport(sport.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer flex items-center justify-center mx-auto"
                          >
                            {isSelected ? (
                              <CheckSquare size={14} className="text-blue-600" />
                            ) : (
                              <Square size={14} className="hover:text-slate-600" />
                            )}
                          </button>
                        </td>

                        {/* Title & Emoji */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base shrink-0 p-1 bg-slate-100 rounded-lg border border-slate-200">
                              {emoji}
                            </span>
                            <div className="min-w-0">
                              <span className="font-black text-slate-900 text-xs block truncate hover:text-blue-600 transition">
                                {sport.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {isGirlsEvent(sport) ? (
                                  <span className="px-1.5 py-0.2 rounded-md bg-pink-50 text-pink-700 border border-pink-200 text-[0.58rem] font-bold inline-flex items-center gap-0.5">
                                    <span>🌸</span>
                                    <span>Girls Eligible</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[0.58rem] font-semibold">
                                    Boys Exclusive
                                  </span>
                                )}

                                {sport.division === 'boys' ? (
                                  <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[0.58rem] font-bold inline-flex items-center gap-0.5">
                                    <span>🏃‍♂️</span>
                                    <span>Boys Only</span>
                                  </span>
                                ) : (sport.division || 'both') === 'both' ? (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.58rem] font-bold inline-flex items-center gap-0.5">
                                    <span>⚡</span>
                                    <span>Dual Division</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded-md bg-pink-100 text-pink-800 border border-pink-300 text-[0.58rem] font-bold">
                                    Girls Only
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Scoring System Dropdown */}
                        <td className="py-2 px-3">
                          <select
                            value={isTeam ? 'team' : 'athletics'}
                            onChange={(e) => handleCategoryChange(sport.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-md font-bold text-[0.65rem] border cursor-pointer focus:outline-none ${
                              isTeam 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            }`}
                          >
                            <option value="athletics">🏃 Individual (5/3/1 Pts)</option>
                            <option value="team">⚽ Team Sport (8/5 Pts)</option>
                          </select>
                        </td>

                        {/* Division Dropdown */}
                        <td className="py-2 px-3">
                          <select
                            value={sport.division || 'both'}
                            onChange={(e) => handleDivisionChange(sport.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-md font-bold text-[0.65rem] border cursor-pointer focus:outline-none ${
                              (sport.division || 'both') === 'both'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : (sport.division === 'boys')
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-pink-50 text-pink-800 border-pink-200'
                            }`}
                          >
                            <option value="both">Both Boys & Girls</option>
                            <option value="boys">Boys Division Only</option>
                            <option value="girls">Girls Division Only</option>
                          </select>
                        </td>

                        {/* Squad Size / Players */}
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {(sport.category === 'team' || isTeamSportTitle(sport.title)) ? (
                            <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/90 rounded-lg p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes);
                                  const next = Math.max(1, current - 1);
                                  updateTeamSquadSize(sport.title, next);
                                  setToastMsg(`Set ${sport.title} squad to ${next} players`);
                                }}
                                className="w-5 h-5 rounded bg-white hover:bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center transition cursor-pointer shadow-2xs"
                                title="Decrease squad size"
                              >
                                -
                              </button>
                              <span className="font-mono font-black text-xs text-amber-950 px-1 min-w-[20px]">
                                {teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes);
                                  const next = Math.min(32, current + 1);
                                  updateTeamSquadSize(sport.title, next);
                                  setToastMsg(`Set ${sport.title} squad to ${next} players`);
                                }}
                                className="w-5 h-5 rounded bg-white hover:bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center transition cursor-pointer shadow-2xs"
                                title="Increase squad size"
                              >
                                +
                              </button>
                              <span className="text-[0.6rem] font-bold text-amber-800 pr-1">Players</span>
                            </div>
                          ) : (
                            <span className="text-[0.62rem] text-slate-400 font-semibold italic">1 Athlete (Indiv)</span>
                          )}
                        </td>

                        {/* Venue & Schedule */}
                        <td className="py-2 px-3">
                          <div className="space-y-0.5 text-[0.65rem]">
                            <div className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-[180px]">
                              <MapPin size={10} className="text-slate-400 shrink-0" />
                              <span className="truncate">{sport.venue || 'GCEK Track'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 font-mono">
                              <Clock size={10} className="shrink-0" />
                              <span className="truncate">{sport.time || 'TBD'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Rules Button */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => setRulesModalSport(sport)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-[0.65rem] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                            title="View and edit official rules"
                          >
                            <BookOpen size={11} className="text-blue-600" />
                            <span>{rulesCount} Rules</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3.5 text-right space-x-1 shrink-0 whitespace-nowrap">
                          <button
                            onClick={() => setPrintSportTitle(sport.title)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title={`Print Official Roster for ${sport.title}`}
                          >
                            <Printer size={13} />
                          </button>

                          <button
                            onClick={() => openEditModal(sport)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Discipline"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove "${sport.title}" from sports roster?`)) {
                                deleteSport(sport.id);
                                setToastMsg('Discipline removed');
                                setTimeout(() => setToastMsg(''), 2000);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Discipline"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Trophy size={28} className="mx-auto text-slate-300" />
                        <p className="text-xs font-bold text-slate-700">No sports disciplines found</p>
                        <p className="text-[0.68rem] text-slate-400">
                          {hasActiveFilters 
                            ? 'No events match your active search or filter criteria.' 
                            : 'No sports have been registered yet.'}
                        </p>
                        {hasActiveFilters ? (
                          <button
                            onClick={resetAllFilters}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold mt-2 cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        ) : (
                          <button
                            onClick={openAddModal}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold mt-2 cursor-pointer"
                          >
                            + Add First Discipline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="py-2 px-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[0.68rem] font-bold text-slate-500">
            <div>
              Showing <span className="text-slate-900 font-black">{filteredSports.length}</span> of {totalCount} total disciplines
              {selectedSportIds.length > 0 && (
                <span className="ml-2 text-blue-600 font-black">
                  ({selectedSportIds.length} selected)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Track: {athCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Team: {teamCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Indoor: {indoorCount}
              </span>
            </div>
          </div>
        </div>

      ) : (

        /* === COMPACT HIGH-DENSITY CARDS GRID === */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredSports.map((sport) => {
            const emoji = getSportEmoji(sport.title, sport.category);
            const isTeam = sport.category === 'team';
            const rulesCount = sport.rules ? sport.rules.length : 0;
            const isSelected = selectedSportIds.includes(sport.id);

            return (
              <div 
                key={sport.id}
                className={`bg-white border rounded-xl p-3 space-y-2.5 shadow-2xs hover:shadow-xs transition relative ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-200'
                }`}
              >
                {/* Card Top: Emoji + Title + Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base p-1 bg-slate-100 rounded-lg shrink-0">
                      {emoji}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 text-xs truncate">
                        {sport.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {isGirlsEvent(sport) ? (
                          <span className="px-1.5 py-0.2 rounded bg-pink-50 text-pink-700 border border-pink-200 text-[0.55rem] font-bold">
                            🌸 Girls
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[0.55rem] font-semibold">
                            Boys Only
                          </span>
                        )}
                        <span className="text-[0.58rem] text-slate-400 font-medium truncate">
                          • {sport.categoryName || (isTeam ? 'Team Sport' : 'Track Event')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setPrintSportTitle(sport.title)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title={`Print Official Roster for ${sport.title}`}
                    >
                      <Printer size={12} />
                    </button>
                    <button
                      onClick={() => openEditModal(sport)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${sport.title}"?`)) deleteSport(sport.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Dropdowns: Scoring Type & Division */}
                <div className="grid grid-cols-2 gap-1.5 text-[0.65rem]">
                  <div>
                    <label className="text-[0.58rem] font-bold uppercase text-slate-400 block mb-0.5">
                      Scoring Rule
                    </label>
                    <select
                      value={isTeam ? 'team' : 'athletics'}
                      onChange={(e) => handleCategoryChange(sport.id, e.target.value)}
                      className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="athletics">🏃 5/3/1 Pts</option>
                      <option value="team">⚽ 8/5 Pts</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[0.58rem] font-bold uppercase text-slate-400 block mb-0.5">
                      Division
                    </label>
                    <select
                      value={sport.division || 'both'}
                      onChange={(e) => handleDivisionChange(sport.id, e.target.value)}
                      className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="both">Both Boys & Girls</option>
                      <option value="boys">Boys Only</option>
                      <option value="girls">Girls Only</option>
                    </select>
                  </div>
                </div>

                {/* Squad Size Stepper in Grid View */}
                {(sport.category === 'team' || isTeamSportTitle(sport.title)) && (
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-1.5 flex items-center justify-between">
                    <span className="text-[0.6rem] font-black uppercase text-amber-900 flex items-center gap-1">
                      <Users size={11} className="text-amber-600" />
                      <span>Squad:</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const current = teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes);
                          const next = Math.max(1, current - 1);
                          updateTeamSquadSize(sport.title, next);
                          setToastMsg(`Set ${sport.title} squad to ${next} players`);
                        }}
                        className="w-4 h-4 rounded bg-white hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-xs text-amber-950 px-1">
                        {teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes)} Players
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = teamSquadSizes[sport.title] || getTeamSquadSize(sport.title, teamSquadSizes);
                          const next = Math.min(32, current + 1);
                          updateTeamSquadSize(sport.title, next);
                          setToastMsg(`Set ${sport.title} squad to ${next} players`);
                        }}
                        className="w-4 h-4 rounded bg-white hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Venue & Schedule */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[0.62rem] text-slate-500">
                  <div className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin size={10} className="shrink-0 text-slate-400" />
                    <span className="truncate">{sport.venue || 'GCEK Track'}</span>
                  </div>

                  <button
                    onClick={() => setRulesModalSport(sport)}
                    className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold transition flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <BookOpen size={10} />
                    <span>{rulesCount} Rules</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. FLOATING MULTI-SELECT DOCK */}
      {selectedSportIds.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 text-white backdrop-blur-xl px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-[94vw] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 pr-2 border-r border-slate-800 shrink-0">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center">
              {selectedSportIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">Selected</span>
          </div>

          {/* Quick Division Setting */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleBulkDivisionChange('both')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Set Both
            </button>
            <button
              onClick={() => handleBulkDivisionChange('boys')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Set Boys
            </button>
            <button
              onClick={() => handleBulkDivisionChange('girls')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Set Girls
            </button>
          </div>

          {/* Bulk Delete */}
          <button
            onClick={handleBulkDelete}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>

          {/* Clear Selection */}
          <button
            onClick={() => setSelectedSportIds([])}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Deselect all"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 6. MODAL: RULES & SPECIFICATIONS DRAWER */}
      {rulesModalSport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Rules & Guidelines</h4>
                  <p className="text-[0.62rem] font-semibold text-slate-400">
                    {rulesModalSport.title} ({rulesModalSport.rules?.length || 0} registered)
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setRulesModalSport(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Existing Rules List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {rulesModalSport.rules && rulesModalSport.rules.length > 0 ? (
                rulesModalSport.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800 leading-tight">{rule}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rulesModalSport.id, rulesModalSport.rules, idx)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer shrink-0"
                      title="Remove rule"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No custom rules added yet. Add one below.
                </p>
              )}
            </div>

            {/* Quick Rule Suggestion Pills */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <span className="text-[0.6rem] font-black uppercase text-slate-400 block">
                Quick Preset Suggestions:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  'Standard IAAF athletic start rules apply.',
                  'Direct knockout tournament bracket format.',
                  'Each branch can register up to 3 athletes.',
                  'Proper college sports attire & shoes mandatory.'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleAddRule(rulesModalSport.id, rulesModalSport.rules);
                      setNewRuleInput(suggestion);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.6rem] font-bold transition cursor-pointer text-left truncate max-w-full"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Rule Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Type specific rule or requirement..."
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRule(rulesModalSport.id, rulesModalSport.rules)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddRule(rulesModalSport.id, rulesModalSport.rules)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg transition shadow-xs cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setRulesModalSport(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Close Rulebook
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. MODAL: ADD / EDIT DISCIPLINE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Trophy size={16} className="text-blue-600" />
                <span>{editingSport ? 'Edit Sport Discipline' : 'Add Sport Discipline'}</span>
              </h4>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Discipline Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1500m Distance Run, Kho-Kho"
                  value={sportForm.title}
                  onChange={(e) => setSportForm({ ...sportForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Discipline Type
                  </label>
                  <select
                    value={sportForm.category}
                    onChange={(e) => setSportForm({ ...sportForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="athletics">Track & Field (5/3/1 Pts)</option>
                    <option value="team">Major Team Sport (8/5 Pts)</option>
                    <option value="indoor">Indoor & Rackets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Gender Division
                  </label>
                  <select
                    value={sportForm.division}
                    onChange={(e) => setSportForm({ ...sportForm, division: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="both">Both Boys & Girls</option>
                    <option value="boys">Boys Division Only</option>
                    <option value="girls">Girls Division Only</option>
                  </select>
                </div>
              </div>

              {/* Team Squad Size Field */}
              {(sportForm.category === 'team' || isTeamSportTitle(sportForm.title)) && (
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[0.65rem] uppercase font-black text-amber-900">
                      Required Team Squad Size (Number of Players) *
                    </label>
                    <span className="font-mono font-black text-amber-800 text-xs">
                      {sportForm.squadSize || 12} Players
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={sportForm.squadSize || 12}
                      onChange={(e) => setSportForm({ ...sportForm, squadSize: Math.max(1, Math.min(32, parseInt(e.target.value, 10) || 1)) })}
                      className="w-24 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900 font-mono font-black text-xs focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {[4, 6, 8, 10, 12, 16].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSportForm({ ...sportForm, squadSize: num })}
                          className={`px-2 py-1 rounded text-[0.62rem] font-black border transition cursor-pointer ${
                            (sportForm.squadSize || 12) === num
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                          }`}
                        >
                          {num}P
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Venue Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GCEK Synthetic Track"
                    value={sportForm.venue}
                    onChange={(e) => setSportForm({ ...sportForm, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Day & Schedule Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Day 1 - 10:30 AM"
                    value={sportForm.time}
                    onChange={(e) => setSportForm({ ...sportForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Brief Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of the event..."
                  value={sportForm.desc}
                  onChange={(e) => setSportForm({ ...sportForm, desc: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs shadow-xs cursor-pointer"
                >
                  {editingSport ? 'Save Changes' : 'Add Discipline'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Official Printable Roster Modal */}
      {printSportTitle && (
        <PrintableRosterModal
          sportTitle={printSportTitle}
          onClose={() => setPrintSportTitle(null)}
        />
      )}

    </div>
  );
}
