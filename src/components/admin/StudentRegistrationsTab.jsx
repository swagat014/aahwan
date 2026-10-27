import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Trash2, Printer, Search, Filter, CheckCircle, BookOpen, 
  ShieldCheck, Mail, Phone, UserCheck, Calendar, Download, X,
  User, Sparkles, ChevronRight, GraduationCap, RefreshCw, Database,
  Award, Eye, AlertTriangle, CheckSquare, Square, Loader2
} from 'lucide-react';
import PrintableRosterModal from './PrintableRosterModal';

export default function StudentRegistrationsTab() {
  const { 
    registrations, 
    deleteRegistration, 
    bulkDeleteRegistrations, 
    sports, 
    refreshCloudData, 
    cloudSyncStatus, 
    lastSyncedTime 
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all'); // 'all' | 'individual' | 'team'
  const [printSportTitle, setPrintSportTitle] = useState(null);
  const [viewingTeamRoster, setViewingTeamRoster] = useState(null);

  // Multi-select & Deletion States
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // { type: 'single', student } | { type: 'bulk' } | null
  const [toastNotification, setToastNotification] = useState(null); // { type: 'success' | 'error', text: '' }

  // Auto-fetch fresh registrations directly from the database on mount and poll every 15s
  useEffect(() => {
    let isMounted = true;
    const fetchFresh = async () => {
      if (refreshCloudData) {
        setIsRefreshing(true);
        try {
          await refreshCloudData();
        } catch (err) {
          console.warn('Failed to load fresh registrations from database:', err);
        } finally {
          if (isMounted) setIsRefreshing(false);
        }
      }
    };

    fetchFresh();

    const interval = setInterval(() => {
      if (refreshCloudData && !isRefreshing) {
        refreshCloudData();
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter Registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const term = searchTerm.toLowerCase().trim();
      const isTeam = r.registrationType === 'team' || Boolean(r.teamPlayers && r.teamPlayers.length > 0);
      
      const matchesSearch = !term || 
        (r.name && r.name.toLowerCase().includes(term)) || 
        (r.rollNo && r.rollNo.toLowerCase().includes(term)) ||
        (r.phone && r.phone.toLowerCase().includes(term)) ||
        (r.captainName && r.captainName.toLowerCase().includes(term)) ||
        (r.captainRollNo && r.captainRollNo.toLowerCase().includes(term)) ||
        (isTeam && r.teamPlayers && r.teamPlayers.some(p => 
          (p.name && p.name.toLowerCase().includes(term)) || 
          (p.rollNo && p.rollNo.toLowerCase().includes(term))
        ));

      const matchesSport = selectedSportFilter === 'all' || 
        (r.events && r.events.some(e => e.toLowerCase().includes(selectedSportFilter.toLowerCase()))) ||
        (r.teamSport && r.teamSport.toLowerCase().includes(selectedSportFilter.toLowerCase()));

      const matchesBranch = selectedBranchFilter === 'all' || (r.branch && r.branch.includes(selectedBranchFilter));
      const matchesGender = selectedGenderFilter === 'all' || r.gender === selectedGenderFilter;

      const matchesType = selectedTypeFilter === 'all' ||
        (selectedTypeFilter === 'team' && isTeam) ||
        (selectedTypeFilter === 'individual' && !isTeam);

      return matchesSearch && matchesSport && matchesBranch && matchesGender && matchesType;
    });
  }, [registrations, searchTerm, selectedSportFilter, selectedBranchFilter, selectedGenderFilter, selectedTypeFilter]);

  // Quick Metrics
  const metrics = useMemo(() => {
    const total = registrations.length;
    const teams = registrations.filter(r => r.registrationType === 'team' || Boolean(r.teamPlayers && r.teamPlayers.length > 0)).length;
    const individuals = total - teams;
    const boys = registrations.filter(r => r.gender === 'Boys Division').length;
    const girls = registrations.filter(r => r.gender === 'Girls Division').length;
    return { total, teams, individuals, boys, girls };
  }, [registrations]);

  const hasActiveFilters = searchTerm !== '' || selectedSportFilter !== 'all' || selectedBranchFilter !== 'all' || selectedGenderFilter !== 'all' || selectedTypeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSportFilter('all');
    setSelectedBranchFilter('all');
    setSelectedGenderFilter('all');
    setSelectedTypeFilter('all');
  };

  // Toast Helper
  const showToast = (text, type = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Multi-Selection Logic
  const filteredIds = useMemo(() => filteredRegistrations.map(r => r.id), [filteredRegistrations]);
  const isAllFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Execute Single Delete
  const handleExecuteSingleDelete = async (student) => {
    if (!student) return;
    const targetIdentifier = student.id || student.rollNo;
    setDeletingId(targetIdentifier);
    try {
      const res = await deleteRegistration(student);
      if (res && res.error) {
        showToast(`Deletion failed: ${res.error}`, 'error');
      } else {
        setSelectedIds(prev => prev.filter(id => id !== student.id && id !== student.rollNo));
        showToast(`Registration for ${student.name || 'athlete'} (${student.rollNo || ''}) permanently removed.`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting registration', 'error');
    } finally {
      setDeletingId(null);
      setDeleteConfirmModal(null);
    }
  };

  // Execute Bulk Delete
  const handleExecuteBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const targets = registrations.filter(r => selectedIds.includes(r.id) || selectedIds.includes(r.rollNo));
      const count = targets.length || selectedIds.length;
      await bulkDeleteRegistrations(targets.length > 0 ? targets : selectedIds);
      setSelectedIds([]);
      showToast(`Successfully deleted ${count} athlete registration(s) from database.`, 'success');
    } catch (err) {
      showToast(err.message || 'Bulk deletion error', 'error');
    } finally {
      setIsBulkDeleting(false);
      setDeleteConfirmModal(null);
    }
  };

  // CSV Export for Student Athletes & Team Rosters
  const handleExportCSV = () => {
    const headers = [
      'Registration ID',
      'Registration Type',
      'Captain / Athlete Name',
      'Roll No',
      'Division',
      'Branch',
      'Academic Year',
      'WhatsApp Phone',
      'Email',
      'Events / Sport',
      'Squad Size',
      'Full Team Roster (Name [Roll, Year, Phone])'
    ];

    const rows = filteredRegistrations.map(r => {
      const isTeam = r.registrationType === 'team' || Boolean(r.teamPlayers && r.teamPlayers.length > 0);
      const squadSize = isTeam ? (r.teamPlayers ? r.teamPlayers.length : 12) : 1;
      const rosterSummary = isTeam && r.teamPlayers && r.teamPlayers.length > 0
        ? r.teamPlayers.map(p => `${p.name} [Roll: ${p.rollNo}, Year: ${p.year}, Phone: ${p.phone}]${p.isCaptain ? ' {CAPTAIN}' : ''}`).join('; ')
        : 'N/A (Individual Athlete)';

      return [
        `"${r.id || ''}"`,
        `"${isTeam ? 'Team Sport' : 'Individual Athlete'}"`,
        `"${r.captainName || r.name || ''}"`,
        `"${r.captainRollNo || r.rollNo || ''}"`,
        `"${r.gender || ''}"`,
        `"${r.branch || ''}"`,
        `"${r.year || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.email || ''}"`,
        `"${(r.events || [r.teamSport]).filter(e => !e.startsWith('TEAM_ROSTER:')).join('; ')}"`,
        squadSize,
        `"${rosterSummary.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filterSuffix = selectedSportFilter !== 'all' ? `_${selectedSportFilter.replace(/\s+/g, '_')}` : '';
    link.setAttribute('download', `gcek_registrations_roster${filterSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800 relative">
      
      {/* TOAST NOTIFICATION BANNER */}
      {toastNotification && (
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all shadow-md animate-in fade-in slide-in-from-top-2 ${
          toastNotification.type === 'error'
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastNotification.type === 'error' ? (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastNotification.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setToastNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* STICKY BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-30 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <div>
              <span className="text-xs font-black tracking-tight block">
                {selectedIds.length} Athlete{selectedIds.length > 1 ? 's' : ''} Selected
              </span>
              <span className="text-[0.65rem] text-slate-400">
                Bulk delete will remove records from live Supabase DB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Deselect All
            </button>

            <button
              type="button"
              onClick={() => setDeleteConfirmModal({ type: 'bulk' })}
              disabled={isBulkDeleting}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. COMPACT TELEMETRY & ACTIONS HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Student Athletes & Teams Desk</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[0.65rem] font-black">
                  {registrations.length} Registrations
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.62rem] font-bold">
                  <Database size={10} className="text-emerald-600" />
                  <span>Supabase Live</span>
                </span>
              </div>
              <p className="text-[0.68rem] text-slate-500 font-semibold truncate">
                Real-time cloud database • {lastSyncedTime ? `Synced at ${lastSyncedTime}` : 'Connected'}
              </p>
            </div>
          </div>

          {/* Quick Actions (Sync, Export & Print) */}
          <div className="flex items-center gap-1.5 self-end sm:self-center w-full sm:w-auto flex-wrap">
            <button
              onClick={async () => {
                if (refreshCloudData) {
                  setIsRefreshing(true);
                  await refreshCloudData();
                  setTimeout(() => setIsRefreshing(false), 600);
                }
              }}
              disabled={isRefreshing || cloudSyncStatus === 'syncing'}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Fetch fresh registrations from Supabase Database"
            >
              <RefreshCw size={13} className={isRefreshing || cloudSyncStatus === 'syncing' ? 'animate-spin' : ''} />
              <span>{isRefreshing || cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredRegistrations.length === 0}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download CSV Roster with Player Details"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {selectedSportFilter !== 'all' ? (
              <button
                onClick={() => setPrintSportTitle(selectedSportFilter)}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span className="truncate max-w-[140px]">Print {selectedSportFilter}</span>
              </button>
            ) : (
              <button
                onClick={() => setPrintSportTitle('ALL_ATHLETICS')}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Print Official Master Athletics Participation Roster & Results"
              >
                <Printer size={13} />
                <span>Print Athletics Roster</span>
              </button>
            )}
          </div>

        </div>

        {/* High-Density Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50/80 rounded-xl p-1.5 border border-slate-200/60">
            <span className="text-[0.62rem] uppercase font-bold text-slate-400 block tracking-wider">Filtered</span>
            <span className="text-sm font-black text-slate-900">{filteredRegistrations.length}</span>
          </div>
          <div className="bg-amber-50/70 rounded-xl p-1.5 border border-amber-200/70">
            <span className="text-[0.62rem] uppercase font-bold text-amber-800 block tracking-wider">👥 Team Squads</span>
            <span className="text-sm font-black text-amber-900">{metrics.teams}</span>
          </div>
          <div className="bg-indigo-50/50 rounded-xl p-1.5 border border-indigo-100/70">
            <span className="text-[0.62rem] uppercase font-bold text-indigo-700 block tracking-wider">🏃 Individuals</span>
            <span className="text-sm font-black text-indigo-900">{metrics.individuals}</span>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-1.5 border border-blue-100/70">
            <span className="text-[0.62rem] uppercase font-bold text-blue-600 block tracking-wider">Boys Division</span>
            <span className="text-sm font-black text-blue-700">{metrics.boys}</span>
          </div>
          <div className="bg-pink-50/50 rounded-xl p-1.5 border border-pink-100/70">
            <span className="text-[0.62rem] uppercase font-bold text-pink-600 block tracking-wider">Girls Division</span>
            <span className="text-sm font-black text-pink-700">{metrics.girls}</span>
          </div>
        </div>

      </div>

      {/* 2. COMPACT SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Captain, Player, Roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Registration Type Filter */}
          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Types (Individual & Teams)</option>
              <option value="team">👥 Team Squads Only</option>
              <option value="individual">🏃 Individual Athletes Only</option>
            </select>
          </div>

          {/* Sport Filter Dropdown */}
          <div>
            <select
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Sports ({sports.length})</option>
              {sports.map(s => (
                <option key={s.id} value={s.title}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter Dropdown */}
          <div>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science (CSE)</option>
              <option value="Electrical">Electrical Engg (EE)</option>
              <option value="Mechanical">Mechanical Engg (ME)</option>
              <option value="Civil">Civil Engg (CE)</option>
            </select>
          </div>

          {/* Gender / Division Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Divisions</option>
              <option value="Boys Division">Boys Division</option>
              <option value="Girls Division">Girls Division</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. MOBILE STACKED CARDS VIEW (md:hidden) */}
      <div className="md:hidden space-y-2.5">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((student) => {
            const isBoys = student.gender === 'Boys Division';
            const isTeam = student.registrationType === 'team' || Boolean(student.teamPlayers && student.teamPlayers.length > 0);
            const squadCount = student.teamPlayers ? student.teamPlayers.length : 12;
            const isSelected = selectedIds.includes(student.id);
            const isTargetDeleting = deletingId === (student.id || student.rollNo);

            return (
              <div 
                key={student.id} 
                className={`bg-white border rounded-2xl p-3 shadow-xs space-y-2.5 transition-all ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20' 
                    : isTeam ? 'border-amber-300 ring-1 ring-amber-400/20' : 'border-slate-200/90'
                }`}
              >
                {/* Card Top Row with Selection Checkbox & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* Multi-select checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelectOne(student.id)}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                      title={isSelected ? "Deselect athlete" : "Select athlete"}
                    >
                      {isSelected ? (
                        <CheckSquare size={17} className="text-blue-600" />
                      ) : (
                        <Square size={17} className="text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    <span className="font-mono font-black text-[0.68rem] text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-lg border border-blue-200/60">
                      {student.rollNo}
                    </span>

                    {isTeam ? (
                      <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Users size={10} className="text-amber-700" />
                        <span>Team Squad ({squadCount}P)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Individual
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                      isBoys 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {isBoys ? "Boys" : "Girls"}
                    </span>
                  </div>

                  {/* Single Delete Action Trigger */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmModal({ type: 'single', student })}
                    disabled={isTargetDeleting}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    title={`Delete registration for ${student.name}`}
                  >
                    {isTargetDeleting ? (
                      <Loader2 size={15} className="animate-spin text-rose-600" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>

                {/* Athlete/Captain Name & Academic Info */}
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isTeam 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : isBoys ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {isTeam ? <Users size={15} className="text-amber-700" /> : student.name ? student.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs text-slate-900 leading-snug truncate flex items-center gap-1.5">
                      <span>{student.name}</span>
                      {isTeam && (
                        <span className="text-[0.55rem] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                          CAPTAIN
                        </span>
                      )}
                    </h4>
                    <p className="text-[0.65rem] font-semibold text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <GraduationCap size={11} className="text-slate-400 shrink-0" />
                      <span>{student.branch}</span>
                      <span className="text-slate-300">•</span>
                      <span>{student.year}</span>
                    </p>
                  </div>
                </div>

                {/* Contact Pill */}
                {(student.phone || student.email) && (
                  <div className="flex items-center gap-2 text-[0.65rem] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    {student.phone && (
                      <a 
                        href={`tel:${student.phone}`} 
                        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-mono"
                      >
                        <Phone size={11} className="text-slate-400" />
                        <span>{student.phone}</span>
                      </a>
                    )}
                    {student.email && (
                      <span className="flex items-center gap-1 text-slate-500 truncate">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Registered Events / View Team Roster Button */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">{isTeam ? 'Team Sport' : 'Events'}</span>
                    <span>{isTeam ? `${squadCount} Players` : `${student.events?.length || 0} registered`}</span>
                  </div>

                  {isTeam ? (
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[0.68rem] font-bold">
                        🏆 {student.teamSport || student.events?.[0]}
                      </span>
                      <button
                        onClick={() => setViewingTeamRoster(student)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Roster ({squadCount})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {student.events && student.events.length > 0 ? (
                        student.events.filter(e => !e.startsWith('TEAM_ROSTER:')).map((e, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setPrintSportTitle(e)}
                            className="px-2 py-0.5 bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 rounded-md text-[0.65rem] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title={`Print roster for ${e}`}
                          >
                            <span className="text-[0.6rem]">🏅</span>
                            <span>{e}</span>
                          </button>
                        ))
                      ) : (
                        <span className="text-[0.65rem] italic text-slate-400">No events selected</span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No athletes match the current search filters.</p>
            <button 
              onClick={clearFilters}
              className="mt-2 text-xs font-black text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. DESKTOP METALLIC TABULAR VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[0.68rem]">
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-white cursor-pointer inline-flex items-center justify-center transition-colors"
                    title={isAllFilteredSelected ? "Deselect all filtered" : "Select all filtered"}
                  >
                    {isAllFilteredSelected ? (
                      <CheckSquare size={16} className="text-blue-400" />
                    ) : (
                      <Square size={16} className="text-slate-400 hover:text-white" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">Roll / Reg No</th>
                <th className="py-2.5 px-3">Athlete / Team Captain</th>
                <th className="py-2.5 px-3">Type & Division</th>
                <th className="py-2.5 px-3">Branch & Year</th>
                <th className="py-2.5 px-3">Enrolled Discipline(s)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((student) => {
                  const isBoys = student.gender === 'Boys Division';
                  const isTeam = student.registrationType === 'team' || Boolean(student.teamPlayers && student.teamPlayers.length > 0);
                  const squadCount = student.teamPlayers ? student.teamPlayers.length : 12;
                  const isSelected = selectedIds.includes(student.id);
                  const isTargetDeleting = deletingId === (student.id || student.rollNo);

                  return (
                    <tr 
                      key={student.id} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/70' 
                          : isTeam ? 'hover:bg-amber-50/50 bg-amber-50/15' : 'hover:bg-blue-50/40'
                      }`}
                    >
                      {/* Checkbox cell */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(student.id)}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer inline-flex items-center justify-center transition-colors"
                          title={isSelected ? "Deselect athlete" : "Select athlete"}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} className="text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-black text-blue-600 whitespace-nowrap">
                        {student.rollNo}
                      </td>

                      <td className="py-2.5 px-3 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[0.65rem] shrink-0 ${
                            isTeam
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isBoys ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {isTeam ? <Users size={12} className="text-amber-700" /> : student.name ? student.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div className="truncate max-w-[170px]">
                            <div className="truncate">{student.name}</div>
                            {isTeam && (
                              <span className="text-[0.6rem] font-bold text-amber-700 block -mt-0.5">
                                Team Captain • {student.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap space-x-1">
                        {isTeam ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Users size={10} className="text-amber-700" />
                            <span>Team ({squadCount}P)</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Individual
                          </span>
                        )}

                        <span className={`inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                          isBoys 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-pink-50 text-pink-700 border border-pink-100'
                        }`}>
                          {isBoys ? "Boys" : "Girls"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        <div className="truncate max-w-[140px]" title={`${student.branch} (${student.year})`}>
                          {student.branch} <span className="text-slate-400">({student.year})</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {isTeam ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-[0.65rem] font-black flex items-center gap-1">
                              <span>🏆</span>
                              <span>{student.teamSport || student.events?.[0]}</span>
                            </span>
                            <button
                              onClick={() => setViewingTeamRoster(student)}
                              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[0.62rem] rounded-md shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="View full player roster"
                            >
                              <Eye size={10} />
                              <span>View Squad ({squadCount})</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {student.events && student.events.length > 0 ? (
                              student.events.filter(e => !e.startsWith('TEAM_ROSTER:')).map((e, idx) => (
                                <button 
                                  key={idx} 
                                  onClick={() => setPrintSportTitle(e)}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-800 border border-slate-200/80 rounded-md text-[0.65rem] font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 group"
                                  title={`Click to print official roster for ${e}`}
                                >
                                  <span>{e}</span>
                                  <Printer size={9} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                                </button>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-[0.65rem]">None</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                        {isTeam && (
                          <button
                            onClick={() => setViewingTeamRoster(student)}
                            className="text-amber-700 hover:text-amber-900 p-1.5 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer inline-flex items-center gap-1 text-[0.65rem] font-bold"
                            title="View Full Squad Roster"
                          >
                            <Users size={13} />
                            <span>Roster</span>
                          </button>
                        )}
                        {student.events && student.events.length > 0 && (
                          <button
                            onClick={() => setPrintSportTitle(student.events[0])}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            title={`Print Roster for ${student.events[0]}`}
                          >
                            <Printer size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmModal({ type: 'single', student })}
                          disabled={isTargetDeleting}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Registration"
                        >
                          {isTargetDeleting ? (
                            <Loader2 size={14} className="animate-spin text-rose-600" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No athlete or team registrations found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CUSTOM IN-APP DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            
            {/* Modal Icon & Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {deleteConfirmModal.type === 'bulk' 
                    ? `Delete ${selectedIds.length} Athlete Registrations?` 
                    : 'Permanently Delete Registration?'}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  This action will remove the record(s) from the Supabase live database and synced storage.
                </p>
              </div>
            </div>

            {/* Details Box for Single Delete */}
            {deleteConfirmModal.type === 'single' && deleteConfirmModal.student && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[0.62rem]">Athlete / Captain</span>
                  <span className="font-black text-slate-900">{deleteConfirmModal.student.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[0.62rem]">Roll No</span>
                  <span className="font-mono font-bold text-blue-700">{deleteConfirmModal.student.rollNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[0.62rem]">Branch & Year</span>
                  <span className="font-semibold text-slate-700">{deleteConfirmModal.student.branch} ({deleteConfirmModal.student.year})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[0.62rem]">Discipline / Type</span>
                  <span className="font-semibold text-slate-700">
                    {deleteConfirmModal.student.registrationType === 'team' || deleteConfirmModal.student.teamPlayers?.length > 0
                      ? `👥 Team (${deleteConfirmModal.student.teamSport || deleteConfirmModal.student.events?.[0]})`
                      : `🏃 ${deleteConfirmModal.student.events?.join(', ') || 'Athletics'}`}
                  </span>
                </div>
              </div>
            )}

            {/* Warning Box for Bulk Delete */}
            {deleteConfirmModal.type === 'bulk' && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs font-semibold text-amber-900">
                ⚠️ You are about to permanently delete <strong>{selectedIds.length}</strong> selected registration records across all disciplines. This cannot be undone.
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                disabled={deletingId !== null || isBulkDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmModal.type === 'bulk') {
                    handleExecuteBulkDelete();
                  } else {
                    handleExecuteSingleDelete(deleteConfirmModal.student);
                  }
                }}
                disabled={deletingId !== null || isBulkDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {(deletingId !== null || isBulkDeleting) && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                <span>
                  {deletingId !== null || isBulkDeleting ? 'Deleting...' : 'Delete Permanently'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL: SQUAD ROSTER VIEWER (Interactive Full Team Breakdown) */}
      {viewingTeamRoster && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-300 flex items-center justify-center font-black">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>{viewingTeamRoster.teamSport || viewingTeamRoster.events[0] || 'Team Sport'} Squad</span>
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-100 text-amber-900 border border-amber-200">
                      {viewingTeamRoster.teamPlayers?.length || 12} Players Roster
                    </span>
                  </h4>
                  <p className="text-[0.68rem] text-slate-500 font-semibold mt-0.5">
                    {viewingTeamRoster.branch} • {viewingTeamRoster.gender}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingTeamRoster(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Captain Summary Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[0.68rem] font-bold">
              <div>
                <span className="text-[0.6rem] text-amber-800 uppercase block font-black">Team Captain</span>
                <span className="text-slate-900">{viewingTeamRoster.captainName || viewingTeamRoster.name}</span>
              </div>
              <div>
                <span className="text-[0.6rem] text-amber-800 uppercase block font-black">Captain Roll No</span>
                <span className="font-mono text-slate-900">{viewingTeamRoster.captainRollNo || viewingTeamRoster.rollNo}</span>
              </div>
              <div>
                <span className="text-[0.6rem] text-amber-800 uppercase block font-black">WhatsApp Mobile</span>
                <a href={`tel:${viewingTeamRoster.captainPhone || viewingTeamRoster.phone}`} className="font-mono text-blue-600 hover:underline">
                  {viewingTeamRoster.captainPhone || viewingTeamRoster.phone}
                </a>
              </div>
              <div>
                <span className="text-[0.6rem] text-amber-800 uppercase block font-black">Registration ID</span>
                <span className="font-mono text-slate-600 truncate block">{viewingTeamRoster.id}</span>
              </div>
            </div>

            {/* Players Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-black uppercase text-[0.62rem] tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">#</th>
                    <th className="py-2 px-3">Player Name</th>
                    <th className="py-2 px-3">Roll / Reg No</th>
                    <th className="py-2 px-3">Academic Year</th>
                    <th className="py-2 px-3">WhatsApp Mobile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {(viewingTeamRoster.teamPlayers || []).map((p, idx) => {
                    const isCap = idx === 0 || p.isCaptain;
                    return (
                      <tr key={idx} className={isCap ? "bg-amber-50/60 font-black" : "hover:bg-slate-50"}>
                        <td className="py-2 px-3 text-center">
                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-mono font-black text-[0.65rem] ${
                            isCap ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 font-bold">{p.name}</span>
                            {isCap && (
                              <span className="text-[0.55rem] font-black bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                                CAPTAIN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">
                          {p.rollNo}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {p.year}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          <a href={`tel:${p.phone}`} className="text-slate-600 hover:text-blue-600">
                            {p.phone}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[0.68rem] text-slate-400 font-semibold">
                Official Roster Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintSportTitle(viewingTeamRoster.teamSport || viewingTeamRoster.events[0]);
                    setViewingTeamRoster(null);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Official Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingTeamRoster(null)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. PRINTABLE ROSTER MODAL TRIGGER */}
      {printSportTitle && (
        <PrintableRosterModal
          sportTitle={printSportTitle}
          onClose={() => setPrintSportTitle(null)}
        />
      )}

    </div>
  );
}
