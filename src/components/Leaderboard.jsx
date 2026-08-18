import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Laptop, Zap, Cog, Building, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Leaderboard() {
  const {
    getStandings, teamPointsRule, athleticsPointsRule,
    festivalName, year
  } = useApp();

  const [activeTab, setActiveTab] = useState('overall'); // 'overall' | 1 | 2 | 3

  const currentStandings = getStandings(activeTab);

  const getBranchIcon = (code) => {
    switch (code) {
      case 'CSE': return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'EE': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'ME': return <Cog className="w-5 h-5 text-emerald-600" />;
      case 'CE': return <Building className="w-5 h-5 text-indigo-600" />;
      default: return <Trophy className="w-5 h-5 text-amber-500" />;
    }
  };

  const rankColors = [
    { bg: 'bg-amber-500', border: 'border-amber-400', badge: '🥇 1st Rank Champion' },
    { bg: 'bg-slate-400', border: 'border-slate-300', badge: '🥈 2nd Rank Runner-Up' },
    { bg: 'bg-amber-700', border: 'border-amber-600', badge: '🥉 3rd Rank Podium' },
    { bg: 'bg-slate-700', border: 'border-slate-600', badge: '4th Place' },
  ];

  return (
    <section id="leaderboard" className="py-24 bg-white relative overflow-hidden select-none">
      
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-amber-50 text-amber-800 border border-amber-200/90 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
            <Trophy size={15} className="text-amber-500" /> Inter-Branch Championship Scorecard
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Medal Tally & Official Standings
          </h2>

          <p className="text-slate-600 text-base sm:text-lg font-medium">
            Live point standings for the coveted {festivalName} {year} Overall Champion Rolling Shield.
          </p>
        </motion.div>

        {/* DAY SELECTOR TABS & POINT RULE BADGE */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('overall')}
              className={`px-5 py-2.5 rounded-full font-black text-xs transition-all shrink-0 ${
                activeTab === 'overall'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-102'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏆 Overall Standings
            </button>

            {[1, 2, 3].map(dayNum => (
              <button
                key={dayNum}
                onClick={() => setActiveTab(dayNum)}
                className={`px-5 py-2.5 rounded-full font-black text-xs transition-all shrink-0 ${
                  activeTab === dayNum
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Day {dayNum} Action
              </button>
            ))}
          </div>

          {/* Active Point Rule Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              <span>
                <strong>Athletics & Individual:</strong> 1st={athleticsPointsRule.gold || 5}Pts, 2nd={athleticsPointsRule.silver || 3}Pts, 3rd={athleticsPointsRule.bronze || 1}Pt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500" />
              <span>
                <strong>Team Games:</strong> 1st={teamPointsRule.gold || 8}Pts, 2nd={teamPointsRule.silver || 5}Pts
              </span>
            </div>
          </div>

        </div>

        {/* STANDINGS CONTAINER */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-5 sm:p-8 bg-gradient-to-b from-amber-50/40 via-slate-50 to-white items-end border-b border-slate-200">
            {currentStandings.slice(0, 3).map((branch, idx) => {
              const rankInfo = rankColors[idx] || rankColors[0];
              return (
                <motion.div
                  key={`podium-${branch.code || idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`bg-white border rounded-2xl p-5 text-center shadow-md ${
                    idx === 0 ? 'border-amber-400 shadow-xl ring-2 ring-amber-400/30' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${rankInfo.bg} text-white font-black text-sm flex items-center justify-center -mt-10 mx-auto border-2 border-white shadow-md mb-2`}>
                    {idx + 1}
                  </div>

                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    {rankInfo.badge}
                  </span>

                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    {branch.displayName}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700 mt-2.5 pt-2 border-t border-slate-100">
                    <span className="text-amber-600">🥇 {branch.totalGold}</span>
                    <span className="text-slate-600">🥈 {branch.totalSilver}</span>
                    <span className="text-amber-800">🥉 {branch.totalBronze}</span>
                  </div>

                  <p className="text-sm font-black text-amber-700 mt-2 bg-amber-50 py-1.5 rounded-xl border border-amber-200">
                    {branch.totalPoints} PTS
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* METALLIC SCORECARD TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[0.68rem] sm:text-xs">
                  <th className="py-4 px-4 sm:px-6">Rank</th>
                  <th className="py-4 px-4 sm:px-6">Engineering Branch</th>
                  <th className="py-4 px-3 sm:px-6 text-center">Athletics Medals (5/3/1 Pts)</th>
                  <th className="py-4 px-3 sm:px-6 text-center">Team Medals (8/5 Pts)</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Points Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {currentStandings.map((row, idx) => (
                  <tr key={`table-row-${row.code || idx}`} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-black text-slate-900">
                      #{idx + 1}
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-black text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {getBranchIcon(row.code)}
                      </div>
                      <span className="truncate">{row.displayName}</span>
                    </td>

                    <td className="py-4 px-3 sm:px-6 text-center font-bold text-slate-700">
                      🥇{row.athGold} 🥈{row.athSilver} 🥉{row.athBronze}
                    </td>

                    <td className="py-4 px-3 sm:px-6 text-center font-bold text-slate-700">
                      🥇{row.teamGold} 🥈{row.teamSilver}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <span className="px-3.5 py-1 bg-slate-900 text-amber-400 font-black text-xs sm:text-sm rounded-full shadow-sm">
                        {row.totalPoints} PTS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </section>
  );
}
