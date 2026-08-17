import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Edit3, Save, CheckCircle, Calendar, Trophy, Flame, Clock, RefreshCw } from 'lucide-react';

export default function ScheduleLeaderboardTab() {
  const {
    schedule, addScheduleDay, removeScheduleDay, addFixture, deleteFixture, updateFixtureStatus,
    leaderboard, updateMedalTally, dailyMedals, updateDailyMedals
  } = useApp();

  const [savedMsg, setSavedMsg] = useState('');
  const dayNumbers = Object.keys(schedule).map(Number).sort((a, b) => a - b);
  const [selectedDay, setSelectedDay] = useState(dayNumbers[0] || 1);

  const [newFixture, setNewFixture] = useState({
    time: '02:00 PM - 04:00 PM',
    title: '',
    location: 'GCEK Main Ground',
    status: 'upcoming',
    statusLabel: 'Upcoming'
  });

  const activeFixtures = schedule[selectedDay] || [];

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
    addFixture(selectedDay, newFixture);
    setNewFixture({
      time: '02:00 PM - 04:00 PM',
      title: '',
      location: 'GCEK Main Ground',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    });
    setSavedMsg(`New fixture added to Day ${selectedDay}!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Schedule & Leaderboard Scorecard Manager</h4>
          <p className="text-xs text-slate-500 font-semibold">
            1-Click match status switcher (LIVE NOW ➔ Completed ➔ Upcoming) & multi-day branch medal tallies.
          </p>
        </div>

        {savedMsg && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle size={16} /> {savedMsg}
          </div>
        )}
      </div>

      {/* MATCH FIXTURES MANAGER SECTION */}
      <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            <h5 className="font-black text-base text-slate-900">Day-Wise Match Fixtures & Live Statuses</h5>
          </div>

          {/* Add / Remove Days Controls */}
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
              onClick={() => setSelectedDay(dayNum)}
              className={`px-5 py-2 rounded-2xl font-black text-xs transition-all ${
                selectedDay === dayNum
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
          {activeFixtures.map((fixture) => (
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
                  onClick={() => handleStatusChange(selectedDay, fixture.id, 'live')}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 transition-all ${
                    fixture.status === 'live'
                      ? 'bg-rose-600 text-white shadow-md animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Flame size={12} /> LIVE NOW
                </button>

                <button
                  onClick={() => handleStatusChange(selectedDay, fixture.id, 'completed')}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 transition-all ${
                    fixture.status === 'completed'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle size={12} /> Completed
                </button>

                <button
                  onClick={() => handleStatusChange(selectedDay, fixture.id, 'upcoming')}
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1 transition-all ${
                    fixture.status === 'upcoming'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  Upcoming
                </button>

                <button
                  onClick={() => deleteFixture(selectedDay, fixture.id)}
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
          <h6 className="font-black text-xs uppercase tracking-wider text-slate-700">Add New Fixture to Day {selectedDay}</h6>
          
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

      {/* LEADERBOARD MEDAL TALLY SECTION */}
      <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          <h5 className="font-black text-base text-slate-900">Branch Championship Leaderboard Scorecard</h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaderboard.map((branch) => (
            <div key={branch.branchCode} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-black text-sm text-slate-900">{branch.branchName} ({branch.branchCode})</span>
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full">
                  {branch.totalPoints} PTS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900">
                  <span className="block text-[0.65rem] uppercase">Gold (10 Pts)</span>
                  <input
                    type="number"
                    value={branch.gold}
                    onChange={(e) => updateMedalTally(branch.branchCode, parseInt(e.target.value) || 0, branch.silver, branch.bronze)}
                    className="w-full text-center bg-white border border-amber-300 rounded-lg py-1 mt-1 font-black text-sm"
                  />
                </div>

                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 text-slate-800">
                  <span className="block text-[0.65rem] uppercase">Silver (5 Pts)</span>
                  <input
                    type="number"
                    value={branch.silver}
                    onChange={(e) => updateMedalTally(branch.branchCode, branch.gold, parseInt(e.target.value) || 0, branch.bronze)}
                    className="w-full text-center bg-white border border-slate-300 rounded-lg py-1 mt-1 font-black text-sm"
                  />
                </div>

                <div className="bg-amber-900/10 p-2 rounded-xl border border-amber-900/20 text-amber-950">
                  <span className="block text-[0.65rem] uppercase">Bronze (3 Pts)</span>
                  <input
                    type="number"
                    value={branch.bronze}
                    onChange={(e) => updateMedalTally(branch.branchCode, branch.gold, branch.silver, parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-white border border-amber-900/30 rounded-lg py-1 mt-1 font-black text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
