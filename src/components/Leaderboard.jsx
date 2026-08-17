import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Laptop, Zap, Cog, Building } from 'lucide-react';
import { leaderboardData } from '../data/scheduleData';

export default function Leaderboard() {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'LaptopCode': return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Cog': return <Cog className="w-5 h-5 text-emerald-600" />;
      case 'Building': return <Building className="w-5 h-5 text-indigo-600" />;
      default: return <Trophy className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section id="leaderboard" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            <Award size={14} /> Inter-Branch Championship
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Medal Tally & Leaderboard
          </h2>
          <p className="text-slate-600 text-lg">
            Live point standings for the coveted AAHWAN 2026 Overall Champion Rolling Shield.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 sm:p-8 bg-gradient-to-b from-blue-50/70 to-white items-end border-b border-slate-200">
            
            {/* Rank 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-2 sm:order-1 bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-900 font-black text-base flex items-center justify-center -mt-11 mx-auto border-2 border-white shadow-sm mb-3">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Electrical (EE)</h3>
              <p className="text-xs font-black text-blue-600 mt-1">68 Points</p>
            </motion.div>

            {/* Rank 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 sm:order-2 bg-white border-2 border-amber-400 rounded-2xl p-6 text-center shadow-2xl sm:-translate-y-4 glow-gold"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-black text-lg flex items-center justify-center -mt-12 mx-auto border-2 border-white shadow-md mb-3">
                1
              </div>
              <h3 className="font-black text-slate-900 text-lg">Computer Science (CSE)</h3>
              <p className="text-xs font-black text-amber-600 mt-1">85 Points</p>
            </motion.div>

            {/* Rank 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-3 bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-black text-base flex items-center justify-center -mt-11 mx-auto border-2 border-white shadow-sm mb-3">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Mechanical (ME)</h3>
              <p className="text-xs font-black text-blue-600 mt-1">54 Points</p>
            </motion.div>

          </div>

          {/* Full Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Branch / Department</th>
                  <th className="py-4 px-6">Gold</th>
                  <th className="py-4 px-6">Silver</th>
                  <th className="py-4 px-6">Bronze</th>
                  <th className="py-4 px-6">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leaderboardData.map((row, idx) => (
                  <motion.tr
                    key={row.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-black text-slate-900">#{row.rank}</td>
                    <td className="py-4 px-6 font-black text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        {getIcon(row.icon)}
                      </div>
                      <span>{row.branch}</span>
                    </td>
                    <td className="py-4 px-6 font-black text-amber-600">🥇 {row.gold}</td>
                    <td className="py-4 px-6 font-black text-slate-500">🥈 {row.silver}</td>
                    <td className="py-4 px-6 font-black text-amber-800">🥉 {row.bronze}</td>
                    <td className="py-4 px-6 font-black text-slate-900 text-base">{row.points} Pts</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </section>
  );
}
