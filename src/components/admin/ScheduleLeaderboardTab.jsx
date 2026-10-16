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
  SlidersHorizontal
} from 'lucide-react';

export default function ScheduleLeaderboardTab() {
  const {
    sports, 
    schedule, 
    addScheduleDay, 
    removeScheduleDay, 
    addFixture, 
    deleteFixture, 
    updateFixtureStatus,
    teamPointsRule, 
    setTeamPointsRule,
    athleticsPointsRule, 
    setAthleticsPointsRule,
    updatePointsRule,
    sportWinners, 
    assignSportWinner, 
    getStandings, 
    updateSportCategory
  } = useApp();

  // Active Desk Sub-Section Switcher: 'standings' | 'winners' | 'fixtures' | 'rules'
  const [activeSubSection, setActiveSubSection] = useState('standings');

  // Notifications
  const [toastMsg, setToastMsg] = useState('');

  // Standings Tab State
  const [selectedScoreDay, setSelectedScoreDay] = useState('overall'); // 'overall' | 1 | 2 | 3

  // Winners Assignment Filter State
  const [winnerDayFilter, setWinnerDayFilter] = useState('all'); // 'all' | 1 | 2 | 3
  const [winnerSearch, setWinnerSearch] = useState('');

  // Fixtures State
  const dayNumbers = useMemo(() => {
    return Object.keys(schedule).map(Number).sort((a, b) => a - b);
  }, [schedule]);
  
  const [selectedFixtureDay, setSelectedFixtureDay] = useState(() => dayNumbers[0] || 1);
  const [showAddFixtureModal, setShowAddFixtureModal] = useState(false);
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

  // Calculated Standings for active day
  const activeStandings = useMemo(() => {
    return getStandings(selectedScoreDay);
  }, [getStandings, selectedScoreDay]);

  // Current Leader
  const currentLeader = activeStandings[0] || null;

  // Filtered Sports for Winner Assignment Tab
  const filteredWinnerSports = useMemo(() => {
    return sports.filter(sport => {
      const winner = sportWinners[sport.id] || sportWinners[sport.title] || {};
      const eventDay = winner.day || parseInt((sport.time || '').replace(/[^0-9]/g, '')) || 1;
      
      const matchesDay = winnerDayFilter === 'all' || parseInt(eventDay) === parseInt(winnerDayFilter);
      const q = winnerSearch.toLowerCase();
      const matchesSearch = 
        (sport.title || '').toLowerCase().includes(q) ||
        (sport.venue || '').toLowerCase().includes(q) ||
        (sport.category || '').toLowerCase().includes(q);

      return matchesDay && matchesSearch;
    });
  }, [sports, sportWinners, winnerDayFilter, winnerSearch]);

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
              {currentLeader && (
                <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Crown size={11} className="text-amber-600 fill-amber-500" />
                  <span>Leader: {currentLeader.code} ({currentLeader.totalPoints} PTS)</span>
                </span>
              )}
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
            🏃 Ath: {athleticsPointsRule.gold || 5}/{athleticsPointsRule.silver || 3}/{athleticsPointsRule.bronze || 1} Pts
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            ⚽ Team: {teamPointsRule.gold || 8}/{teamPointsRule.silver || 5} Pts
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
            <div className="flex items-center gap-1.5">
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

            <div className="text-[0.65rem] text-slate-500 font-semibold pr-1">
              Auto-calculated in real time from assigned sport winners
            </div>
          </div>

          {/* Metallic Compact High-Density Podium Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3.5">Engineering Branch</th>
                    <th className="py-2.5 px-3 text-center">Athletics Medals (5/3/1 Pts)</th>
                    <th className="py-2.5 px-3 text-center">Team Sports Medals (8/5 Pts)</th>
                    <th className="py-2.5 px-3 text-center">Total Medals</th>
                    <th className="py-2.5 px-3.5 text-right">Championship Score</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {activeStandings.map((row, idx) => {
                    const isGoldLeader = idx === 0;
                    const isSilverLeader = idx === 1;
                    const isBronzeLeader = idx === 2;

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
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>

                        {/* Branch Name & Code */}
                        <td className="py-2 px-3.5">
                          <div className="flex items-center gap-2">
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
                              : 'bg-slate-900 text-amber-400'
                          }`}>
                            {row.totalPoints} PTS
                          </span>
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
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Gold: {athleticsPointsRule.gold || 5} / {teamPointsRule.gold || 8} pts
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Silver: {athleticsPointsRule.silver || 3} / {teamPointsRule.silver || 5} pts
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
                      const currentWinner = sportWinners[sport.id] || sportWinners[sport.title] || {};
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
                              <option value="athletics">🏃 Indiv (5/3/1 Pts)</option>
                              <option value="team">⚽ Team (8/5 Pts)</option>
                            </select>
                          </td>

                          {/* 1st Place (Gold) Dropdown */}
                          <td className="py-2 px-3">
                            <select
                              value={currentWinner.first || ''}
                              onChange={(e) => {
                                assignSportWinner(sport.id, { first: e.target.value });
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
                                assignSportWinner(sport.id, { second: e.target.value });
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
                                  assignSportWinner(sport.id, { third: e.target.value });
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

                          {/* Day Schedule Tag */}
                          <td className="py-2 px-3.5 text-right">
                            <span className="px-2 py-0.5 rounded-md text-[0.65rem] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Day {currentWinner.day || 1}
                            </span>
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
                          <td className="py-2 px-3.5 text-right">
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
                      onChange={(e) => updatePointsRule('athletics', { gold: Number(e.target.value) })}
                      className="w-12 text-center font-black text-xs bg-white border border-amber-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-amber-800">pts</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[0.62rem] font-black text-slate-700 uppercase block mb-1">🥈 Silver</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={athleticsPointsRule.silver || 3}
                      onChange={(e) => updatePointsRule('athletics', { silver: Number(e.target.value) })}
                      className="w-12 text-center font-black text-xs bg-white border border-slate-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-slate-700">pts</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-900/10 border border-amber-900/20">
                  <span className="text-[0.62rem] font-black text-amber-900 uppercase block mb-1">🥉 Bronze</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={athleticsPointsRule.bronze || 1}
                      onChange={(e) => updatePointsRule('athletics', { bronze: Number(e.target.value) })}
                      className="w-12 text-center font-black text-xs bg-white border border-amber-900/30 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-amber-900">pts</span>
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
                  <span className="text-[0.62rem] font-black text-amber-900 uppercase block mb-1">🥇 1st Place</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={teamPointsRule.gold || 8}
                      onChange={(e) => updatePointsRule('team', { gold: Number(e.target.value) })}
                      className="w-12 text-center font-black text-xs bg-white border border-amber-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-amber-800">pts</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[0.62rem] font-black text-slate-700 uppercase block mb-1">🥈 2nd Place</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={teamPointsRule.silver || 5}
                      onChange={(e) => updatePointsRule('team', { silver: Number(e.target.value) })}
                      className="w-12 text-center font-black text-xs bg-white border border-slate-300 rounded py-0.5"
                    />
                    <span className="text-[0.65rem] font-bold text-slate-700">pts</span>
                  </div>
                </div>
              </div>

              <p className="text-[0.62rem] text-slate-400">
                Applied to Cricket, Football, Volleyball, Kabaddi, and 4x400m Relay races (No 3rd place points).
              </p>
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

    </div>
  );
}
