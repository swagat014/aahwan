import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Edit3, Save, CheckCircle, Calendar, Trophy, Flame, Clock, RefreshCw, Sliders, Award, Layers, Sparkles, Check, ChevronDown } from 'lucide-react';

export default function ScheduleLeaderboardTab() {
  const {
    sports, schedule, addScheduleDay, removeScheduleDay, addFixture, deleteFixture, updateFixtureStatus,
    teamPointsRule, setTeamPointsRule,
    athleticsPointsRule, setAthleticsPointsRule,
    updatePointsRule,
    sportWinners, assignSportWinner, getStandings, updateSportCategory
  } = useApp();

  const [savedMsg, setSavedMsg] = useState('');
  const [selectedSportDay, setSelectedSportDay] = useState('all');
  const [selectedScoreDay, setSelectedScoreDay] = useState('overall');
  const dayNumbers = Object.keys(schedule).map(Number).sort((a, b) => a - b);
  const [selectedFixtureDay, setSelectedFixtureDay] = useState(dayNumbers[0] || 1);

  const [newFixture, setNewFixture] = useState({
    time: '02:00 PM - 04:00 PM',
    title: '',
    location: 'GCEK Main Ground',
    status: 'upcoming',
    statusLabel: 'Upcoming'
  });

  const branches = [
    { code: 'CSE', name: 'Computer Science & Engg' },
    { code: 'EE', name: 'Electrical Engineering' },
    { code: 'ME', name: 'Mechanical Engineering' },
    { code: 'CE', name: 'Civil Engineering' }
  ];

  const handleStatusChange = (dayNum, fixtureId, newStatus) => {
    let label = 'Upcoming';
    if (newStatus === 'live') label = 'LIVE NOW';
    if (newStatus === 'completed') label = 'Completed';

    updateFixtureStatus(dayNum, fixtureId, newStatus, label);
    setSavedMsg(`Match status updated to "${label}"!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddFixtureSubmit = (e) => {
    e.preventDefault();
    if (!newFixture.title) return;
    addFixture(selectedFixtureDay, newFixture);
    setNewFixture({
      time: '02:00 PM - 04:00 PM',
      title: '',
      location: 'GCEK Main Ground',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    });
    setSavedMsg(`New fixture added to Day ${selectedFixtureDay}!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const filteredSports = sports.filter(sport => {
    if (selectedSportDay === 'all') return true;
    const winner = sportWinners[sport.id] || sportWinners[sport.title] || {};
    const eventDay = winner.day || parseInt((sport.time || '').replace(/[^0-9]/g, '')) || 1;
    return parseInt(eventDay) === parseInt(selectedSportDay);
  });

  // Calculated Standings for active tab
  const activeStandings = getStandings(selectedScoreDay);

  return (
    <div className="space-y-8 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Per-Sport Winner Assignment & Standings Calculator</h4>
          <p className="text-xs text-slate-500 font-semibold">
            Assign 1st, 2nd, and 3rd winning branches per sport discipline to auto-calculate Day-Wise and Overall Standings!
          </p>
        </div>

        {savedMsg && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle size={16} /> {savedMsg}
          </div>
        )}
      </div>

      {/* ACTIVE POINT WEIGHT RULES BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-amber-400" />
            <h5 className="font-black text-base">Point Calculation Rules</h5>
          </div>
          <span className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
            Admin Rule Engine Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Athletics Rules */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <Award size={14} /> Athletics & Individual Events
              </span>
              <span className="text-[0.65rem] font-extrabold text-slate-400">100m, 200m, Jump, Chess</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
              <div className="bg-amber-500/20 text-amber-300 p-2 rounded-xl border border-amber-500/30">
                🥇 1st: {athleticsPointsRule.gold || 5} Pts
              </div>
              <div className="bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-700">
                🥈 2nd: {athleticsPointsRule.silver || 3} Pts
              </div>
              <div className="bg-amber-900/30 text-amber-400 p-2 rounded-xl border border-amber-800/40">
                🥉 3rd: {athleticsPointsRule.bronze || 1} Pt
              </div>
            </div>
          </div>

          {/* Team Game Rules */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-400 flex items-center gap-1">
                <Trophy size={14} /> Team Sports & Games
              </span>
              <span className="text-[0.65rem] font-extrabold text-slate-400">Cricket, Football, Volley, Kabaddi</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
              <div className="bg-amber-500/20 text-amber-300 p-2 rounded-xl border border-amber-500/30">
                🥇 1st: {teamPointsRule.gold || 8} Pts
              </div>
              <div className="bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-700">
                🥈 2nd: {teamPointsRule.silver || 5} Pts
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: PER-SPORT WINNERS ASSIGNMENT BOARD */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            <div>
              <h5 className="font-black text-base text-slate-900">Per-Sport Event Winners Assignment</h5>
              <p className="text-xs text-slate-500 font-semibold">Select 1st, 2nd, and 3rd winning branches for each event</p>
            </div>
          </div>

          {/* Filter per Day */}
          <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSelectedSportDay('all')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                selectedSportDay === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Events ({sports.length})
            </button>

            {[1, 2, 3].map(dayNum => (
              <button
                key={dayNum}
                onClick={() => setSelectedSportDay(dayNum)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  selectedSportDay === dayNum ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Day {dayNum}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Winners Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSports.map(sport => {
            const currentWinner = sportWinners[sport.id] || sportWinners[sport.title] || {};
            const titleLower = (sport.title || '').toLowerCase();
            const isTeamSport = sport.category === 'team' || titleLower.includes('relay') || titleLower.includes('cricket') || titleLower.includes('football') || titleLower.includes('kabaddi') || titleLower.includes('volleyball') || titleLower.includes('kho-kho');

            return (
              <div key={sport.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                
                {/* Header Badge & Category Selector */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <select
                    value={isTeamSport ? 'team' : 'athletics'}
                    onChange={(e) => updateSportCategory(sport.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-full text-[0.65rem] font-black uppercase cursor-pointer focus:outline-none transition-all ${
                      isTeamSport ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    <option value="athletics">🏃 Individual (5/3/1 Pts)</option>
                    <option value="team">⚽ Team Sport (8/5 Pts)</option>
                  </select>

                  <span className="text-[0.65rem] font-black text-slate-400 uppercase">
                    Day {currentWinner.day || 1}
                  </span>
                </div>

                <h6 className="font-black text-sm text-slate-900 tracking-tight">{sport.title}</h6>

                {/* Dropdowns */}
                <div className="space-y-2 pt-1 text-xs font-bold">
                  
                  {/* 1st Place (Gold) */}
                  <div className="flex items-center justify-between gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                    <span className="text-amber-900 font-black shrink-0">🥇 1st Gold:</span>
                    <select
                      value={currentWinner.first || ''}
                      onChange={(e) => assignSportWinner(sport.id, { first: e.target.value })}
                      className="bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-amber-500 w-full max-w-[160px]"
                    >
                      <option value="">-- Select Winner --</option>
                      {branches.map(b => (
                        <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* 2nd Place (Silver) */}
                  <div className="flex items-center justify-between gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-700 font-black shrink-0">🥈 2nd Silver:</span>
                    <select
                      value={currentWinner.second || ''}
                      onChange={(e) => assignSportWinner(sport.id, { second: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-slate-500 w-full max-w-[160px]"
                    >
                      <option value="">-- Select Winner --</option>
                      {branches.map(b => (
                        <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* 3rd Place (Bronze) */}
                  <div className={`flex items-center justify-between gap-2 p-2 rounded-xl border ${
                    isTeamSport ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-amber-900/10 border-amber-900/20'
                  }`}>
                    <span className="text-amber-950 font-black shrink-0">🥉 3rd Bronze:</span>
                    {isTeamSport ? (
                      <span className="text-[0.68rem] font-black text-rose-600 uppercase tracking-wider">No 3rd Pts</span>
                    ) : (
                      <select
                        value={currentWinner.third || ''}
                        onChange={(e) => assignSportWinner(sport.id, { third: e.target.value })}
                        className="bg-white border border-amber-900/30 rounded-lg px-2 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-amber-700 w-full max-w-[160px]"
                      >
                        <option value="">-- Select Winner --</option>
                        {branches.map(b => (
                          <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                        ))}
                      </select>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: LIVE AUTO-CALCULATED STANDINGS TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-blue-600" />
            <div>
              <h5 className="font-black text-base text-slate-900">Real-Time Auto-Calculated Leaderboard</h5>
              <p className="text-xs text-slate-500 font-semibold">Calculated automatically from assigned event winners</p>
            </div>
          </div>

          {/* Standings Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSelectedScoreDay('overall')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                selectedScoreDay === 'overall' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏆 Overall Standings
            </button>

            {[1, 2, 3].map(dayNum => (
              <button
                key={dayNum}
                onClick={() => setSelectedScoreDay(dayNum)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                  selectedScoreDay === dayNum ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Day {dayNum} Action
              </button>
            ))}
          </div>
        </div>

        {/* Metallic Auto-Calculated Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[0.7rem]">
                <th className="p-4">Rank</th>
                <th className="p-4">Engineering Stream</th>
                <th className="p-4 text-center">Athletics Medals (5/3/1 Pts)</th>
                <th className="p-4 text-center">Team Medals (8/5 Pts)</th>
                <th className="p-4 text-center">Total Medals</th>
                <th className="p-4 text-right">Calculated Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {activeStandings.map((row, idx) => (
                <tr key={row.code} className="hover:bg-amber-50/40 transition-colors">
                  <td className="p-4 font-mono font-black text-slate-900">
                    #{idx + 1}
                  </td>

                  <td className="p-4 font-black text-slate-900">
                    {row.displayName}
                  </td>

                  <td className="p-4 text-center text-slate-700 font-extrabold">
                    🥇{row.athGold} 🥈{row.athSilver} 🥉{row.athBronze} <span className="text-emerald-600">({row.athPoints} Pts)</span>
                  </td>

                  <td className="p-4 text-center text-slate-700 font-extrabold">
                    🥇{row.teamGold} 🥈{row.teamSilver} <span className="text-blue-600">({row.teamPoints} Pts)</span>
                  </td>

                  <td className="p-4 text-center font-black text-slate-900">
                    🥇{row.totalGold} 🥈{row.totalSilver} 🥉{row.totalBronze}
                  </td>

                  <td className="p-4 text-right">
                    <span className="px-3 py-1 bg-slate-900 text-amber-400 font-black text-xs rounded-full">
                      {row.totalPoints} PTS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* SECTION 3: MATCH FIXTURES & LIVE STATUS MANAGER */}
      <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            <h5 className="font-black text-base text-slate-900">Day-Wise Match Fixtures & Live Statuses</h5>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addScheduleDay}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-sm flex items-center gap-1"
            >
              <Plus size={14} /> Add Day {dayNumbers.length + 1}
            </button>

            {dayNumbers.length > 1 && (
              <button
                onClick={() => removeScheduleDay(dayNumbers[dayNumbers.length - 1])}
                className="px-3 py-1.5 bg-rose-100 text-rose-700 font-bold text-xs rounded-full hover:bg-rose-200"
              >
                Remove Last Day
              </button>
            )}
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {dayNumbers.map(dayNum => (
            <button
              key={dayNum}
              onClick={() => setSelectedFixtureDay(dayNum)}
              className={`px-5 py-2 rounded-2xl font-black text-xs transition-all ${
                selectedFixtureDay === dayNum
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Day {dayNum} ({schedule[dayNum]?.length || 0} Matches)
            </button>
          ))}
        </div>

        {/* Active Day Fixtures List */}
        <div className="space-y-3">
          {(schedule[selectedFixtureDay] || []).map((fixture) => (
            <div key={fixture.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-600">{fixture.time}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-500">{fixture.location}</span>
                </div>
                <h6 className="font-extrabold text-sm text-slate-900">{fixture.title}</h6>
              </div>

              {/* 1-CLICK STATUS SWITCHER BUTTONS */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStatusChange(selectedFixtureDay, fixture.id, 'live')}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 transition-all ${
                    fixture.status === 'live'
                      ? 'bg-rose-600 text-white shadow-md animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Flame size={12} /> LIVE NOW
                </button>

                <button
                  onClick={() => handleStatusChange(selectedFixtureDay, fixture.id, 'completed')}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 transition-all ${
                    fixture.status === 'completed'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle size={12} /> Completed
                </button>

                <button
                  onClick={() => handleStatusChange(selectedFixtureDay, fixture.id, 'upcoming')}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 transition-all ${
                    fixture.status === 'upcoming'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  Upcoming
                </button>

                <button
                  onClick={() => deleteFixture(selectedFixtureDay, fixture.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50"
                  title="Delete Fixture"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Fixture Form */}
        <form onSubmit={handleAddFixtureSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <h6 className="font-black text-xs uppercase tracking-wider text-slate-700">Add New Fixture to Day {selectedFixtureDay}</h6>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Match Title (e.g. Football Final)"
              value={newFixture.title}
              onChange={(e) => setNewFixture({ ...newFixture, title: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />

            <input
              type="text"
              required
              placeholder="Timing (e.g. 02:00 PM - 04:00 PM)"
              value={newFixture.time}
              onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />

            <input
              type="text"
              required
              placeholder="Location (e.g. Main Pitch)"
              value={newFixture.location}
              onChange={(e) => setNewFixture({ ...newFixture, location: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white font-black text-xs rounded-full shadow-sm"
            >
              + Add Fixture
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
