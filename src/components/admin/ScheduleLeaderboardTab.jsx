import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  CheckCircle2, 
  Calendar, 
  Trophy, 
  Flame, 
  Clock, 
  RefreshCw, 
  Sliders, 
  Award, 
  Layers, 
  Sparkles, 
  Check, 
  ChevronDown, 
  Download, 
  Search, 
  X, 
  ShieldCheck, 
  Users, 
  MapPin, 
  RotateCcw, 
  Crown,
  Table,
  SlidersHorizontal,
  Printer,
  AlertCircle
} from 'lucide-react';
import PrintableRosterModal from './PrintableRosterModal';

export default function ScheduleLeaderboardTab() {
  const {
    sports, 
    schedule, 
    addScheduleDay, 
    removeScheduleDay, 
    addFixture, 
    updateFixture,
    deleteFixture, 
    updateFixtureStatus,
    resetScheduleToDefault,
    teamPointsRule, 
    setTeamPointsRule,
    athleticsPointsRule, 
    setAthleticsPointsRule,
    updatePointsRule,
    sportWinners, 
    assignSportWinner, 
    getStandings, 
    findSportWinner,
    updateSportCategory,
    saveToCloud,
    branchPointsOverride,
    updateBranchScore,
    resetBranchScore,
    resetAllBranchScores,
    setAllPointsToZero
  } = useApp();

  // Active Desk Sub-Section Switcher: 'standings' | 'winners' | 'fixtures' | 'rules'
  const [activeSubSection, setActiveSubSection] = useState('standings');

  // Notifications
  const [toastMsg, setToastMsg] = useState('');

  // Standings Tab State
  const [selectedScoreDay, setSelectedScoreDay] = useState('overall'); // 'overall' | 1 | 2 | 3
  const [printSportTitle, setPrintSportTitle] = useState(null);

  // Winners Assignment Filter State
  const [winnerDayFilter, setWinnerDayFilter] = useState('all'); // 'all' | 1 | 2 | 3
  const [winnerSearch, setWinnerSearch] = useState('');

  // Fixtures State
  const dayNumbers = useMemo(() => {
    return Object.keys(schedule).map(Number).sort((a, b) => a - b);
  }, [schedule]);
  
  const [selectedFixtureDay, setSelectedFixtureDay] = useState(() => dayNumbers[0] || 1);
  const [showAddFixtureModal, setShowAddFixtureModal] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [showEditFixtureModal, setShowEditFixtureModal] = useState(false);
  const [newFixture, setNewFixture] = useState({
    time: '02:00 PM - 04:00 PM',
    title: '',
    location: 'GCEK Main Ground',
    status: 'upcoming',
    statusLabel: 'Upcoming'
  });

  // Engineering Branches List
  const branches = [
    { code: 'CSE', name: 'Computer Science & Engg', badge: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    { code: 'EE', name: 'Electrical Engineering', badge: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    { code: 'ME', name: 'Mechanical Engineering', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    { code: 'CE', name: 'Civil Engineering', badge: 'bg-purple-500/10 text-purple-700 border-purple-200' }
  ];

  // Calculated Standings for active day (Reactively re-evaluates on winner, override, and point rule changes)
  const activeStandings = useMemo(() => {
    return getStandings(selectedScoreDay);
  }, [getStandings, selectedScoreDay, sportWinners, branchPointsOverride, teamPointsRule, athleticsPointsRule]);

  // Check if all branches have 0 points (pre-tournament zero state)
  const allZero = useMemo(() => {
    return activeStandings.every(b => (b.totalPoints || 0) === 0);
  }, [activeStandings]);

  // Current Leader
  const currentLeader = activeStandings[0] || null;

  // Direct Points & Medals Editing State (Instant Cloud Sync)
  const [editingBranch, setEditingBranch] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsForm, setPointsForm] = useState({
    totalPoints: 0,
    athGold: 0,
    athSilver: 0,
    athBronze: 0,
    teamGold: 0,
    teamSilver: 0
  });

  const handleOpenEditBranch = (branch) => {
    setEditingBranch(branch);
    setPointsForm({
      totalPoints: branch.totalPoints ?? 0,
      athGold: branch.athGold ?? 0,
      athSilver: branch.athSilver ?? 0,
      athBronze: branch.athBronze ?? 0,
      teamGold: branch.teamGold ?? 0,
      teamSilver: branch.teamSilver ?? 0
    });
    setShowPointsModal(true);
  };

  const handleSaveBranchPoints = (e) => {
    e.preventDefault();
    if (!editingBranch) return;
    const cleanTotal = Number(pointsForm.totalPoints) || 0;
    const cleanAthGold = Number(pointsForm.athGold) || 0;
    const cleanAthSilver = Number(pointsForm.athSilver) || 0;
    const cleanAthBronze = Number(pointsForm.athBronze) || 0;
    const cleanTeamGold = Number(pointsForm.teamGold) || 0;
    const cleanTeamSilver = Number(pointsForm.teamSilver) || 0;

    updateBranchScore(editingBranch.code, {
      totalPoints: cleanTotal,
      athGold: cleanAthGold,
      athSilver: cleanAthSilver,
      athBronze: cleanAthBronze,
      teamGold: cleanTeamGold,
      teamSilver: cleanTeamSilver,
      isManual: true
    });
    setShowPointsModal(false);
    setToastMsg(`Points updated for ${editingBranch.code} & synced live!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleResetBranchToAuto = (branchCode) => {
    resetBranchScore(branchCode);
    setShowPointsModal(false);
    setToastMsg(`Reset ${branchCode} to auto-calculated scores.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSetAllToZero = () => {
    if (window.confirm("Set all branch scores to 0? This will immediately hide champions, 1st/2nd/3rd podium badges on the live website until points are awarded.")) {
      setAllPointsToZero();
      setToastMsg("All branch points set to 0. Champions/Podiums hidden on live site.");
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const handleResetAllToAuto = () => {
    if (window.confirm("Restore standings to auto-calculated points from match winners?")) {
      resetAllBranchScores();
      setToastMsg("Restored standings to auto-calculation from winners.");
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const handleSyncStandingsLive = () => {
    saveToCloud({ branchPointsOverride });
    setToastMsg("Standings synced to live website successfully!");
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filtered Sports for Winner Assignment Tab
  const filteredWinnerSports = useMemo(() => {
    return sports.filter(sport => {
      const winner = (findSportWinner && typeof findSportWinner === 'function' ? findSportWinner(sportWinners, sport) : (sportWinners[sport.id] || sportWinners[sport.title])) || {};
      const dayMatch = (sport.time || '').match(/Day\s*(\d+)/i);
      const eventDay = winner.day || (dayMatch ? parseInt(dayMatch[1], 10) : 1);
      
      const matchesDay = winnerDayFilter === 'all' || parseInt(eventDay) === parseInt(winnerDayFilter);
      const q = winnerSearch.toLowerCase();
      const matchesSearch = 
        (sport.title || '').toLowerCase().includes(q) ||
        (sport.venue || '').toLowerCase().includes(q) ||
        (sport.category || '').toLowerCase().includes(q);

      return matchesDay && matchesSearch;
    });
  }, [sports, sportWinners, winnerDayFilter, winnerSearch, findSportWinner]);

  // Total Fixture Matches Count
  const totalFixturesCount = useMemo(() => {
    return Object.values(schedule).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
  }, [schedule]);

  // 1-Click Fixture Status Switcher
  const handleStatusChange = (dayNum, fixtureId, newStatus) => {
    let label = 'Upcoming';
    if (newStatus === 'live') label = 'LIVE NOW';
    if (newStatus === 'completed') label = 'Completed';

    updateFixtureStatus(dayNum, fixtureId, newStatus, label);
    setToastMsg(`Match status set to "${label}"`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  // Add Fixture Submit
  const handleAddFixtureSubmit = (e) => {
    e.preventDefault();
    if (!newFixture.title.trim()) return;

    addFixture(selectedFixtureDay, {
      ...newFixture,
      statusLabel: newFixture.status === 'live' ? 'LIVE NOW' : newFixture.status === 'completed' ? 'Completed' : 'Upcoming'
    });

    setNewFixture({
      time: '02:00 PM - 04:00 PM',
      title: '',
      location: 'GCEK Main Ground',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    });
    setShowAddFixtureModal(false);
    setToastMsg(`Fixture added to Day ${selectedFixtureDay}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Edit Fixture Submit
  const handleEditFixtureSubmit = (e) => {
    e.preventDefault();
    if (!editingFixture || !editingFixture.title.trim()) return;

    const label = editingFixture.status === 'live' ? 'LIVE NOW' : editingFixture.status === 'completed' ? 'Completed' : 'Upcoming';
    updateFixture(editingFixture.day || selectedFixtureDay, editingFixture.id, {
      ...editingFixture,
      statusLabel: label,
      status_label: label
    });

    setShowEditFixtureModal(false);
    setEditingFixture(null);
    setToastMsg(`Fixture updated successfully!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Restore Official Match Schedule Roster
  const handleResetScheduleToDefault = () => {
    if (window.confirm("Restore official festival fixtures roster? This will reload the default 3-day championship matches timetable.")) {
      resetScheduleToDefault();
      setToastMsg("Official festival schedule roster restored & synced live!");
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // Export Standings CSV
  const handleExportStandingsCSV = () => {
    const headers = ['Rank', 'Engineering Branch', 'Code', 'Athletics Gold', 'Athletics Silver', 'Athletics Bronze', 'Athletics Pts', 'Team Gold', 'Team Silver', 'Team Pts', 'Total Medals', 'Total Points'];
    const rows = activeStandings.map((r, idx) => [
      idx + 1,
      `"${r.displayName}"`,
      r.code,
      r.athGold,
      r.athSilver,
      r.athBronze,
      r.athPoints,
      r.teamGold,
      r.teamSilver,
      r.teamPoints,
      r.totalGold + r.totalSilver + r.totalBronze,
      r.totalPoints
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AAHWAN_Standings_${selectedScoreDay}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Fixtures CSV
  const handleExportFixturesCSV = () => {
    const headers = ['Day', 'Time', 'Fixture Match', 'Location', 'Status'];
    const rows = [];
    dayNumbers.forEach(dayNum => {
      (schedule[dayNum] || []).forEach(f => {
        rows.push([
          `Day ${dayNum}`,
          `"${f.time || ''}"`,
          `"${(f.title || '').replace(/"/g, '""')}"`,
          `"${(f.location || '').replace(/"/g, '""')}"`,
          f.status || 'upcoming'
        ]);
      });
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AAHWAN_Schedule_Fixtures_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for sport emoji
  const getSportEmoji = (title = '', category = '') => {
    const t = title.toLowerCase();
    if (t.includes('100m') || t.includes('200m') || t.includes('400m') || t.includes('800m') || t.includes('race') || t.includes('sprint')) return '🏃';
    if (t.includes('jump')) return '👟';
    if (t.includes('throw') || t.includes('shot') || t.includes('discus')) return '🏋️';
    if (t.includes('cricket')) return '🏏';
    if (t.includes('football')) return '⚽';
    if (t.includes('volleyball')) return '🏐';
    if (t.includes('badminton')) return '🏸';
    if (t.includes('chess')) return '♟️';
    if (t.includes('kabaddi')) return '🤼';
    if (category === 'athletics') return '🏃';
    if (category === 'team') return '⚽';
    return '🏆';
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800">
      
      {/* 1. TOP TOOLBAR & COMPACT HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Trophy size={16} />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Schedule & Standings Command Desk</span>
              {allZero ? (
                <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <span>Standings: Awaiting Results (All 0 Pts)</span>
                </span>
              ) : currentLeader && (currentLeader.totalPoints || 0) > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Crown size={11} className="text-amber-600 fill-amber-500" />
                  <span>Leader: {currentLeader.code} ({currentLeader.totalPoints} PTS)</span>
                </span>
              ) : null}
            </h3>
          </div>
          <p className="text-[0.68rem] font-semibold text-slate-500 mt-0.5 ml-8">
            Manage real-time leaderboard, per-sport winner medals podium, and live tournament match fixtures.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {toastMsg && (
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 size={13} />
              <span>{toastMsg}</span>
            </div>
          )}

          <button
            onClick={activeSubSection === 'fixtures' ? handleExportFixturesCSV : handleExportStandingsCSV}
            title="Download CSV report"
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {activeSubSection === 'fixtures' && (
            <button
              onClick={() => setShowAddFixtureModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Fixture</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. COMPACT SEGMENTED SUB-NAVIGATION SWITCHER */}
      <div className="flex items-center justify-between gap-2 bg-slate-50/90 border border-slate-200/90 rounded-xl p-1.5 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1">
          {/* Sub-tab 1: Standings */}
          <button
            onClick={() => setActiveSubSection('standings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubSection === 'standings'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Trophy size={13} />
            <span>Leaderboard Standings</span>
          </button>

          {/* Sub-tab 2: Event Winners */}
          <button
            onClick={() => setActiveSubSection('winners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubSection === 'winners'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Award size={13} />
            <span>Assign Event Winners</span>
            <span className="px-1.5 py-0.2 rounded-full text-[0.58rem] font-black bg-slate-900/10">
              {sports.length}
            </span>
          </button>

          {/* Sub-tab 3: Match Schedule */}
          <button
            onClick={() => setActiveSubSection('fixtures')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubSection === 'fixtures'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Calendar size={13} />
            <span>Match Fixtures</span>
            <span className="px-1.5 py-0.2 rounded-full text-[0.58rem] font-black bg-slate-900/10">
              {totalFixturesCount}
            </span>
          </button>

          {/* Sub-tab 4: Rules Engine */}
          <button
            onClick={() => setActiveSubSection('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubSection === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Scoring Rules Engine</span>
          </button>
        </div>

        {/* Quick Rule Pill Snapshot */}
        <div className="hidden lg:flex items-center gap-2 text-[0.62rem] font-bold text-slate-500 pr-2">
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            🏃 Ath: {athleticsPointsRule?.gold ?? 5}/{athleticsPointsRule?.silver ?? 3}/{athleticsPointsRule?.bronze ?? 1} Pts
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            ⚽ Team: {teamPointsRule?.gold ?? 7}/{teamPointsRule?.silver ?? 5} Pts
          </span>
        </div>
      </div>

      {/* 3. SECTION CONTENT */}

      {/* ======================================================== */}
      {/* A. LEADERBOARD STANDINGS DESK */}
      {/* ======================================================== */}
      {activeSubSection === 'standings' && (
        <div className="space-y-3">
          
          {/* Filter Bar & Standings Mode */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 border border-slate-200 rounded-xl p-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400 pl-1">
                Filter Standings:
              </span>
              <button
                onClick={() => setSelectedScoreDay('overall')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  selectedScoreDay === 'overall'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🏆 Overall Championship
              </button>

              {dayNumbers.map(dayNum => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedScoreDay(dayNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    selectedScoreDay === dayNum
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Day {dayNum} Action
                </button>
              ))}
            </div>

            {/* Quick Admin Actions for Points */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleSetAllToZero}
                title="Sets all branches to 0 points. Hides false champions/podiums until points are awarded."
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <RotateCcw size={11} className="text-rose-500" />
                <span>Set All 0 (Pre-Tournament)</span>
              </button>

              <button
                onClick={handleResetAllToAuto}
                title="Restores auto-calculated scores from assigned sport winners"
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <RefreshCw size={11} className="text-blue-500" />
                <span>Auto-Calculate</span>
              </button>

              <button
                onClick={handleSyncStandingsLive}
                title="Force sync standings and points overrides directly to live website"
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Save size={11} />
                <span>Sync Live</span>
              </button>
            </div>
          </div>

          {/* Pre-Tournament Zero State Notice */}
          {allZero && (
            <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs font-medium text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Pre-Tournament Zero Points Mode Active: </span>
                  <span>All branches are at 0 points. Champion rolling shield, crowns, and 1st, 2nd, 3rd podium ranks are safely suppressed on the live website. Click <strong>"Edit"</strong> on any branch below to directly award points, or assign winners.</span>
                </div>
              </div>
            </div>
          )}

          {/* Metallic Compact High-Density Podium Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3.5">Engineering Branch</th>
                    <th className="py-2.5 px-3 text-center">Athletics Medals ({athleticsPointsRule?.gold ?? 5}/{athleticsPointsRule?.silver ?? 3}/{athleticsPointsRule?.bronze ?? 1} Pts)</th>
                    <th className="py-2.5 px-3 text-center">Team Sports Medals ({teamPointsRule?.gold ?? 7}/{teamPointsRule?.silver ?? 5} Pts)</th>
                    <th className="py-2.5 px-3 text-center">Total Medals</th>
                    <th className="py-2.5 px-3.5 text-right">Championship Score</th>
                    <th className="py-2.5 px-3 text-center w-24">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {activeStandings.map((row, idx) => {
                    const hasPoints = (row.totalPoints || 0) > 0;
                    const isGoldLeader = !allZero && hasPoints && idx === 0;
                    const isSilverLeader = !allZero && hasPoints && idx === 1;
                    const isBronzeLeader = !allZero && hasPoints && idx === 2;

                    return (
                      <tr 
                        key={row.code}
                        className={`transition-colors ${
                          isGoldLeader 
                            ? 'bg-amber-50/50 hover:bg-amber-50/80 font-black' 
                            : isSilverLeader 
                            ? 'bg-slate-50/50 hover:bg-slate-100/60' 
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-2 px-3 text-center">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-mono font-black text-xs ${
                            isGoldLeader 
                              ? 'bg-amber-500 text-slate-950 shadow-xs' 
                              : isSilverLeader 
                              ? 'bg-slate-300 text-slate-800' 
                              : isBronzeLeader 
                              ? 'bg-amber-800/20 text-amber-800' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {allZero || !hasPoints ? '—' : idx + 1}
                          </span>
                        </td>

                        {/* Branch Name & Code */}
                        <td className="py-2 px-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-xs text-slate-900 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                              {row.code}
                            </span>
                            <span className="font-black text-slate-900 text-xs">
                              {row.displayName}
                            </span>
                            {isGoldLeader && (
                              <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] font-black bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                                <Crown size={10} className="fill-amber-600 text-amber-700" /> Leading
                              </span>
                            )}
                            {row.isManual && (
                              <span className="px-1.5 py-0.2 rounded-full text-[0.58rem] font-black bg-blue-100 text-blue-700 border border-blue-200">
                                Manual Override
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Athletics Medals Breakdown */}
                        <td className="py-2 px-3 text-center text-xs font-mono font-bold">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-amber-600">🥇 {row.athGold}</span>
                            <span className="text-slate-500">🥈 {row.athSilver}</span>
                            <span className="text-amber-800">🥉 {row.athBronze}</span>
                            <span className="text-emerald-700 font-sans font-black text-[0.65rem] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {row.athPoints} Pts
                            </span>
                          </div>
                        </td>

                        {/* Team Medals Breakdown */}
                        <td className="py-2 px-3 text-center text-xs font-mono font-bold">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-amber-600">🥇 {row.teamGold}</span>
                            <span className="text-slate-500">🥈 {row.teamSilver}</span>
                            <span className="text-blue-700 font-sans font-black text-[0.65rem] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              {row.teamPoints} Pts
                            </span>
                          </div>
                        </td>

                        {/* Total Medals */}
                        <td className="py-2 px-3 text-center font-mono font-black text-xs text-slate-900">
                          {row.totalGold + row.totalSilver + row.totalBronze}
                          <span className="text-[0.62rem] text-slate-400 font-normal ml-1">
                            ({row.totalGold}G • {row.totalSilver}S • {row.totalBronze}B)
                          </span>
                        </td>

                        {/* Calculated Score */}
                        <td className="py-2 px-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs shadow-2xs inline-block ${
                            isGoldLeader
                              ? 'bg-amber-500 text-slate-950'
                              : hasPoints
                              ? 'bg-slate-900 text-amber-400'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {row.totalPoints || 0} PTS
                          </span>
                        </td>

                        {/* Action: Edit Points */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleOpenEditBranch(row)}
                            title={`Edit points and medals for ${row.code}`}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-black transition flex items-center justify-center gap-1 mx-auto cursor-pointer shadow-2xs"
                          >
                            <Edit2 size={11} className="text-amber-700" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Standings Summary Footer */}
            <div className="py-2 px-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[0.68rem] font-bold text-slate-500">
              <span>Showing rankings for {selectedScoreDay === 'overall' ? 'All 3 Championship Days' : `Day ${selectedScoreDay} Fixtures`}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Gold: {athleticsPointsRule?.gold ?? 5} / {teamPointsRule?.gold ?? 7} pts
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Silver: {athleticsPointsRule?.silver ?? 3} / {teamPointsRule?.silver ?? 5} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* B. PER-SPORT WINNERS ASSIGNMENT DESK */}
      {/* ======================================================== */}
      {activeSubSection === 'winners' && (
        <div className="space-y-3">
          
          {/* Winner Filter & Search Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 border border-slate-200 rounded-xl p-2">
            
            {/* Search Box */}
            <div className="relative min-w-[200px] max-w-xs">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search event title or venue..."
                value={winnerSearch}
                onChange={(e) => setWinnerSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
              />
              {winnerSearch && (
                <button onClick={() => setWinnerSearch('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Day Filter Switcher */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWinnerDayFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  winnerDayFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Events ({sports.length})
              </button>

              {dayNumbers.map(dayNum => (
                <button
                  key={dayNum}
                  onClick={() => setWinnerDayFilter(dayNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    winnerDayFilter === dayNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Day {dayNum}
                </button>
              ))}

              <button
                onClick={() => setPrintSportTitle('ALL_ATHLETICS')}
                className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer ml-auto"
                title="Print Official Master Athletics Participation Roster & Results"
              >
                <Printer size={13} />
                <span>Print Athletics Roster</span>
              </button>
            </div>
          </div>

          {/* HIGH-DENSITY UNIFIED TABULAR WINNER DESK */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5">Sport Event</th>
                    <th className="py-2.5 px-3">Type & Scoring Rule</th>
                    <th className="py-2.5 px-3">🥇 1st Place (Gold)</th>
                    <th className="py-2.5 px-3">🥈 2nd Place (Silver)</th>
                    <th className="py-2.5 px-3">🥉 3rd Place (Bronze)</th>
                    <th className="py-2.5 px-3.5 text-right">Day / Schedule</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredWinnerSports.length > 0 ? (
                    filteredWinnerSports.map(sport => {
                      const currentWinner = findSportWinner(sportWinners, sport) || {};
                      const titleLower = (sport.title || '').toLowerCase();
                      const isTeamSport = sport.category === 'team' || titleLower.includes('cricket') || titleLower.includes('football') || titleLower.includes('volleyball') || titleLower.includes('kabaddi') || titleLower.includes('kho');
                      const emoji = getSportEmoji(sport.title, sport.category);

                      return (
                        <tr key={sport.id} className="hover:bg-amber-50/30 transition-colors">
                          
                          {/* Event Title & Emoji */}
                          <td className="py-2 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base shrink-0">{emoji}</span>
                              <div className="min-w-0">
                                <span className="font-black text-slate-900 text-xs block truncate">
                                  {sport.title}
                                </span>
                                <span className="text-[0.62rem] text-slate-400 font-normal block truncate">
                                  {sport.venue || 'GCEK Track'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Sport Type */}
                          <td className="py-2 px-3">
                            <select
                              value={isTeamSport ? 'team' : 'athletics'}
                              onChange={(e) => updateSportCategory(sport.id, e.target.value)}
                              className={`px-2 py-0.5 rounded-md font-bold text-[0.65rem] border cursor-pointer focus:outline-none ${
                                isTeamSport 
                                  ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              <option value="athletics">🏃 Indiv ({athleticsPointsRule?.gold ?? 5}/{athleticsPointsRule?.silver ?? 3}/{athleticsPointsRule?.bronze ?? 1} Pts)</option>
                              <option value="team">⚽ Team ({teamPointsRule?.gold ?? 7}/{teamPointsRule?.silver ?? 5} Pts)</option>
                            </select>
                          </td>

                          {/* 1st Place (Gold) Dropdown */}
                          <td className="py-2 px-3">
                            <select
                              value={currentWinner.first || ''}
                              onChange={(e) => {
                                const targetDay = currentWinner.day || (sport.time?.match(/Day\s*(\d+)/i) ? parseInt(sport.time.match(/Day\s*(\d+)/i)[1], 10) : 1);
                                assignSportWinner(sport.id, { first: e.target.value, day: targetDay });
                                setToastMsg(`Updated 1st place for ${sport.title}`);
                                setTimeout(() => setToastMsg(''), 1800);
                              }}
                              className="px-2 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:border-amber-500 w-full max-w-[130px]"
                            >
                              <option value="">-- No Gold --</option>
                              {branches.map(b => (
                                <option key={b.code} value={b.code}>{b.code} ({b.name.split(' ')[0]})</option>
                              ))}
                            </select>
                          </td>

                          {/* 2nd Place (Silver) Dropdown */}
                          <td className="py-2 px-3">
                            <select
                              value={currentWinner.second || ''}
                              onChange={(e) => {
                                const targetDay = currentWinner.day || (sport.time?.match(/Day\s*(\d+)/i) ? parseInt(sport.time.match(/Day\s*(\d+)/i)[1], 10) : 1);
                                assignSportWinner(sport.id, { second: e.target.value, day: targetDay });
                                setToastMsg(`Updated 2nd place for ${sport.title}`);
                                setTimeout(() => setToastMsg(''), 1800);
                              }}
                              className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:border-slate-500 w-full max-w-[130px]"
                            >
                              <option value="">-- No Silver --</option>
                              {branches.map(b => (
                                <option key={b.code} value={b.code}>{b.code} ({b.name.split(' ')[0]})</option>
                              ))}
                            </select>
                          </td>

                          {/* 3rd Place (Bronze) Dropdown */}
                          <td className="py-2 px-3">
                            {isTeamSport ? (
                              <span className="text-[0.62rem] font-bold text-slate-400 italic px-2 py-1 rounded bg-slate-100 border border-slate-200 inline-block">
                                No 3rd Pts
                              </span>
                            ) : (
                              <select
                                value={currentWinner.third || ''}
                                onChange={(e) => {
                                  const targetDay = currentWinner.day || (sport.time?.match(/Day\s*(\d+)/i) ? parseInt(sport.time.match(/Day\s*(\d+)/i)[1], 10) : 1);
                                  assignSportWinner(sport.id, { third: e.target.value, day: targetDay });
                                  setToastMsg(`Updated 3rd place for ${sport.title}`);
                                  setTimeout(() => setToastMsg(''), 1800);
                                }}
                                className="px-2 py-1 bg-amber-900/10 border border-amber-900/20 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:border-amber-700 w-full max-w-[130px]"
                              >
                                <option value="">-- No Bronze --</option>
                                {branches.map(b => (
                                  <option key={b.code} value={b.code}>{b.code} ({b.name.split(' ')[0]})</option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* Day Schedule Tag & Print Action */}
                          <td className="py-2 px-3.5 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => setPrintSportTitle(sport.title)}
                              className="px-2 py-0.8 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-[0.62rem] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              title={`Print Official Results & Roster for ${sport.title}`}
                            >
                              <Printer size={11} className="text-amber-600" />
                              <span>Results Roster</span>
                            </button>
                            <select
                              value={currentWinner.day || 1}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                assignSportWinner(sport.id, { day: val });
                                setToastMsg(`Assigned ${sport.title} to Day ${val}`);
                                setTimeout(() => setToastMsg(''), 1800);
                              }}
                              className="px-2 py-0.5 rounded-md text-[0.65rem] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer focus:outline-none hover:bg-slate-200 transition"
                              title="Assign Scheduled Day for this Event"
                            >
                              {(dayNumbers.length > 0 ? dayNumbers : [1, 2, 3]).map(d => (
                                <option key={d} value={d}>Day {d}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No events found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="py-2 px-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[0.68rem] font-bold text-slate-500">
              <span>Showing {filteredWinnerSports.length} of {sports.length} total events</span>
              <span>Medal selections automatically update branch scores above</span>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* C. MATCH FIXTURES & LIVE STATUS DESK */}
      {/* ======================================================== */}
      {activeSubSection === 'fixtures' && (
        <div className="space-y-3">
          
          {/* Day Selector Pills & Add/Remove Day Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 border border-slate-200 rounded-xl p-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              {dayNumbers.map(dayNum => {
                const count = (schedule[dayNum] || []).length;
                const isSelected = selectedFixtureDay === dayNum;

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedFixtureDay(dayNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>Day {dayNum}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[0.58rem] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={addScheduleDay}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                title="Add Day"
              >
                <Plus size={12} />
                <span>Add Day {dayNumbers.length + 1}</span>
              </button>

              {dayNumbers.length > 1 && (
                <button
                  onClick={() => {
                    const lastDay = dayNumbers[dayNumbers.length - 1];
                    if (confirm(`Remove Day ${lastDay} and all its fixtures?`)) {
                      removeScheduleDay(lastDay);
                    }
                  }}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg cursor-pointer"
                  title="Remove Last Day"
                >
                  Remove Day
                </button>
              )}

              <button
                onClick={handleResetScheduleToDefault}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition shadow-2xs"
                title="Restore Official 3-Day Championship Match Timetable"
              >
                <RotateCcw size={12} className="text-blue-600" />
                <span>Reset Timetable</span>
              </button>
            </div>
          </div>

          {/* High-Density Fixtures Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5">Scheduled Time</th>
                    <th className="py-2.5 px-3">Fixture Match</th>
                    <th className="py-2.5 px-3">Venue / Ground</th>
                    <th className="py-2.5 px-3 text-center">Live Status Controls</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {(schedule[selectedFixtureDay] || []).length > 0 ? (
                    (schedule[selectedFixtureDay] || []).map(fixture => {
                      const isLive = fixture.status === 'live';
                      const isDone = fixture.status === 'completed';

                      return (
                        <tr key={fixture.id} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* Time */}
                          <td className="py-2 px-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs text-blue-600 flex items-center gap-1">
                              <Clock size={11} className="text-slate-400" />
                              {fixture.time}
                            </span>
                          </td>

                          {/* Match Title */}
                          <td className="py-2 px-3">
                            <span className="font-black text-slate-900 text-xs block truncate max-w-[280px]">
                              {fixture.title}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 text-[0.68rem] text-slate-600 font-medium">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{fixture.location}</span>
                            </div>
                          </td>

                          {/* 1-Click Status Switcher Chips */}
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                onClick={() => handleStatusChange(selectedFixtureDay, fixture.id, 'live')}
                                className={`px-2 py-0.5 rounded text-[0.62rem] font-black flex items-center gap-1 transition cursor-pointer ${
                                  isLive 
                                    ? 'bg-rose-600 text-white shadow-2xs animate-pulse' 
                                    : 'text-slate-600 hover:text-rose-600'
                                }`}
                              >
                                <Flame size={10} /> LIVE
                              </button>

                              <button
                                onClick={() => handleStatusChange(selectedFixtureDay, fixture.id, 'upcoming')}
                                className={`px-2 py-0.5 rounded text-[0.62rem] font-bold transition cursor-pointer ${
                                  fixture.status === 'upcoming' 
                                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs' 
                                    : 'text-slate-600 hover:text-amber-700'
                                }`}
                              >
                                Upcoming
                              </button>

                              <button
                                onClick={() => handleStatusChange(selectedFixtureDay, fixture.id, 'completed')}
                                className={`px-2 py-0.5 rounded text-[0.62rem] font-bold transition cursor-pointer ${
                                  isDone 
                                    ? 'bg-slate-900 text-white font-black shadow-2xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <CheckCircle2 size={10} /> Done
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-3.5 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => {
                                setEditingFixture({ ...fixture, day: selectedFixtureDay });
                                setShowEditFixtureModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                              title="Edit Fixture Match"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete fixture "${fixture.title}"?`)) {
                                  deleteFixture(selectedFixtureDay, fixture.id);
                                  setToastMsg('Fixture removed');
                                  setTimeout(() => setToastMsg(''), 1800);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="Delete Fixture"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No match fixtures added for Day {selectedFixtureDay} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Fixtures Footer */}
            <div className="py-2 px-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[0.68rem] font-bold text-slate-500">
              <span>Day {selectedFixtureDay} Matches: {(schedule[selectedFixtureDay] || []).length} total fixtures</span>
              <button
                onClick={() => setShowAddFixtureModal(true)}
                className="text-blue-600 hover:text-blue-800 font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> Add Match
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* D. SCORING RULES ENGINE */}
      {/* ======================================================== */}
      {activeSubSection === 'rules' && (
        <div className="space-y-3">
          <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1">
              <SlidersHorizontal size={14} className="text-blue-600" />
              <span>Championship Point Multipliers</span>
            </h4>
            <p className="text-[0.68rem] text-slate-500 font-medium">
              Configure point weights allocated to 1st (Gold), 2nd (Silver), and 3rd (Bronze) placed branches for auto-calculating the college championship shield.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Athletics Point Rule Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <Award size={14} className="text-emerald-600" />
                  <span>Athletics & Track & Field</span>
                </span>
                <span className="text-[0.62rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Individual Events
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[0.62rem] font-black text-amber-900 uppercase block mb-1">🥇 Gold</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={athleticsPointsRule.gold || 5}
                      onChange={(e) => {
                        updatePointsRule('athletics', { gold: Number(e.target.value) });
                        setToastMsg(`Athletics Gold updated to ${e.target.value} pts`);
                        setTimeout(() => setToastMsg(''), 1800);
                      }}
                      className="w-12 text-center font-black text-xs bg-white border border-amber-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-amber-800">pts</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    {[5, 6, 7].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          updatePointsRule('athletics', { gold: val });
                          setToastMsg(`Set Athletics Gold to ${val} pts`);
                          setTimeout(() => setToastMsg(''), 1800);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[0.6rem] font-black transition cursor-pointer ${
                          (athleticsPointsRule.gold || 5) === val
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[0.62rem] font-black text-slate-700 uppercase block mb-1">🥈 Silver</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={athleticsPointsRule.silver || 3}
                      onChange={(e) => {
                        updatePointsRule('athletics', { silver: Number(e.target.value) });
                        setToastMsg(`Athletics Silver updated to ${e.target.value} pts`);
                        setTimeout(() => setToastMsg(''), 1800);
                      }}
                      className="w-12 text-center font-black text-xs bg-white border border-slate-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-slate-700">pts</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    {[2, 3, 4].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          updatePointsRule('athletics', { silver: val });
                          setToastMsg(`Set Athletics Silver to ${val} pts`);
                          setTimeout(() => setToastMsg(''), 1800);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[0.6rem] font-black transition cursor-pointer ${
                          (athleticsPointsRule.silver || 3) === val
                            ? 'bg-slate-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-900/10 border border-amber-900/20">
                  <span className="text-[0.62rem] font-black text-amber-900 uppercase block mb-1">🥉 Bronze</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={athleticsPointsRule.bronze || 1}
                      onChange={(e) => {
                        updatePointsRule('athletics', { bronze: Number(e.target.value) });
                        setToastMsg(`Athletics Bronze updated to ${e.target.value} pts`);
                        setTimeout(() => setToastMsg(''), 1800);
                      }}
                      className="w-12 text-center font-black text-xs bg-white border border-amber-900/30 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-amber-900">pts</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    {[1, 2].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          updatePointsRule('athletics', { bronze: val });
                          setToastMsg(`Set Athletics Bronze to ${val} pts`);
                          setTimeout(() => setToastMsg(''), 1800);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[0.6rem] font-black transition cursor-pointer ${
                          (athleticsPointsRule.bronze || 1) === val
                            ? 'bg-amber-900 text-white shadow-2xs'
                            : 'bg-white hover:bg-amber-200 text-amber-950 border border-amber-900/30'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[0.62rem] text-slate-400">
                Applied to 100m, 200m, 400m, Long Jump, Shot Put, Discus, Chess, and all solo athletic disciplines.
              </p>
            </div>

            {/* Team Sports Point Rule Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <Trophy size={14} className="text-blue-600" />
                  <span>Team Games & Championships</span>
                </span>
                <span className="text-[0.62rem] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Team Sports
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[0.62rem] font-black text-amber-900 uppercase block mb-1">🥇 1st Place (Gold)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={teamPointsRule?.gold ?? 7}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updatePointsRule('team', { gold: val });
                        setToastMsg(`Team Gold updated to ${val} pts`);
                        setTimeout(() => setToastMsg(''), 1800);
                      }}
                      className="w-14 text-center font-black text-xs bg-white border border-amber-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-amber-800">pts</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {[7, 8, 10].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          updatePointsRule('team', { gold: val });
                          setToastMsg(`Set Team Gold to ${val} pts (Standings recalculated)`);
                          setTimeout(() => setToastMsg(''), 1800);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[0.65rem] font-black transition cursor-pointer ${
                          (teamPointsRule?.gold ?? 7) === val
                            ? 'bg-amber-600 text-white shadow-2xs ring-1 ring-amber-500'
                            : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {val} Pts
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[0.62rem] font-black text-slate-700 uppercase block mb-1">🥈 2nd Place (Silver)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={teamPointsRule.silver || 5}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updatePointsRule('team', { silver: val });
                        setToastMsg(`Team Silver updated to ${val} pts`);
                        setTimeout(() => setToastMsg(''), 1800);
                      }}
                      className="w-14 text-center font-black text-xs bg-white border border-slate-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-slate-700">pts</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {[4, 5, 6].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          updatePointsRule('team', { silver: val });
                          setToastMsg(`Set Team Silver to ${val} pts`);
                          setTimeout(() => setToastMsg(''), 1800);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[0.65rem] font-black transition cursor-pointer ${
                          (teamPointsRule.silver || 5) === val
                            ? 'bg-slate-700 text-white shadow-2xs ring-1 ring-slate-600'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {val} Pts
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[0.62rem] text-slate-400">
                  Applied to Cricket, Football, Volleyball, Kabaddi, and 4x400m Relay races.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    saveToCloud({ teamPointsRule, athleticsPointsRule });
                    setToastMsg('Points rules saved & synced to live website!');
                    setTimeout(() => setToastMsg(''), 2200);
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[0.65rem] font-black flex items-center gap-1 shadow-xs cursor-pointer transition shrink-0"
                >
                  <Save size={11} />
                  <span>Sync Cloud</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODAL: ADD FIXTURE MATCH */}
      {showAddFixtureModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="text-blue-600" size={16} />
                <span>Add Match Fixture (Day {selectedFixtureDay})</span>
              </h4>
              <button 
                onClick={() => setShowAddFixtureModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFixtureSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Match Title & Competitors *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Football Semifinals: CSE vs EE"
                  value={newFixture.title}
                  onChange={(e) => setNewFixture({ ...newFixture, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02:30 PM"
                    value={newFixture.time}
                    onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newFixture.status}
                    onChange={(e) => setNewFixture({ ...newFixture, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">🔴 Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Venue / Ground Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCEK Main Football Oval"
                  value={newFixture.location}
                  onChange={(e) => setNewFixture({ ...newFixture, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFixtureModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs shadow-xs cursor-pointer"
                >
                  Confirm Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.B. MODAL: EDIT FIXTURE MATCH */}
      {showEditFixtureModal && editingFixture && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Edit2 className="text-blue-600" size={16} />
                <span>Edit Match Fixture (Day {editingFixture.day || selectedFixtureDay})</span>
              </h4>
              <button 
                onClick={() => {
                  setShowEditFixtureModal(false);
                  setEditingFixture(null);
                }} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditFixtureSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Match Title & Competitors *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Football Semifinals: CSE vs EE"
                  value={editingFixture.title || ''}
                  onChange={(e) => setEditingFixture({ ...editingFixture, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02:30 PM"
                    value={editingFixture.time || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editingFixture.status || 'upcoming'}
                    onChange={(e) => setEditingFixture({ ...editingFixture, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">🔴 Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Day of Festival *
                </label>
                <select
                  value={editingFixture.day || selectedFixtureDay}
                  onChange={(e) => setEditingFixture({ ...editingFixture, day: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                >
                  {dayNumbers.map(d => (
                    <option key={d} value={d}>Day {d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Venue / Ground Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCEK Main Football Oval"
                  value={editingFixture.location || ''}
                  onChange={(e) => setEditingFixture({ ...editingFixture, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditFixtureModal(false);
                    setEditingFixture(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BRANCH POINTS & MEDALS (DIRECT CRUD & INSTANT CLOUD SYNC) */}
      {showPointsModal && editingBranch && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Trophy className="text-amber-500" size={18} />
                  <span>Edit Points: {editingBranch.displayName}</span>
                </h4>
                <p className="text-[0.7rem] font-semibold text-slate-500 mt-0.5">
                  Update points and medals for {editingBranch.code}. Automatically syncs live across devices.
                </p>
              </div>
              <button 
                onClick={() => setShowPointsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBranchPoints} className="space-y-4 text-xs font-semibold">
              {/* Championship Total Points */}
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
                <label className="block text-xs uppercase font-black text-amber-900 mb-1">
                  🏆 Championship Total Points *
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  required
                  value={pointsForm.totalPoints}
                  onChange={(e) => setPointsForm({ ...pointsForm, totalPoints: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 font-mono font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[0.68rem] text-amber-800/80 font-medium mt-1">
                  Setting points to 0 suppresses champion rolling shield and 1st/2nd/3rd rank badges on the live website.
                </p>
              </div>

              {/* Athletics Medals */}
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1.5">
                  🏃 Athletics & Individual Medals ({athleticsPointsRule.gold || 5}/{athleticsPointsRule.silver || 3}/{athleticsPointsRule.bronze || 1} Pts)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[0.65rem] font-bold text-amber-600 block mb-1">🥇 Gold</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsForm.athGold}
                      onChange={(e) => setPointsForm({ ...pointsForm, athGold: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-slate-500 block mb-1">🥈 Silver</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsForm.athSilver}
                      onChange={(e) => setPointsForm({ ...pointsForm, athSilver: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-amber-800 block mb-1">🥉 Bronze</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsForm.athBronze}
                      onChange={(e) => setPointsForm({ ...pointsForm, athBronze: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Team Medals */}
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1.5">
                  ⚽ Team Sports Medals ({teamPointsRule?.gold ?? 7}/{teamPointsRule?.silver ?? 5} Pts)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[0.65rem] font-bold text-amber-600 block mb-1">🥇 Team Gold</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsForm.teamGold}
                      onChange={(e) => setPointsForm({ ...pointsForm, teamGold: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-slate-500 block mb-1">🥈 Team Silver</span>
                    <input
                      type="number"
                      min="0"
                      value={pointsForm.teamSilver}
                      onChange={(e) => setPointsForm({ ...pointsForm, teamSilver: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleResetBranchToAuto(editingBranch.code)}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold text-xs cursor-pointer transition"
                >
                  Reset to Auto
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPointsModal(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Save size={14} />
                    <span>Save & Sync Live</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Roster & Results Modal */}
      {printSportTitle && (
        <PrintableRosterModal
          sportTitle={printSportTitle}
          onClose={() => setPrintSportTitle(null)}
        />
      )}

    </div>
  );
}
