import React from 'react';
import { motion } from 'framer-motion';

export default function MarqueeText() {
  const marqueeItems = [
    'AAHWAN 2026',
    'GOVT. COLLEGE OF ENGINEERING KALAHANDI',
    'TRACK & ATHLETICS',
    'CRICKET CHAMPIONS CUP',
    'FOOTBALL LEAGUE',
    'VOLLEYBALL HARD-COURT',
    'KABADDI RAIDERS',
    'KHO-KHO DASH',
    'CHESS BLITZ',
    'TABLE TENNIS',
  ];

  return (
    <div className="relative py-4 bg-slate-900 text-white overflow-hidden select-none border-y border-slate-800">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex items-center whitespace-nowrap gap-8 w-max font-black tracking-widest text-sm uppercase"
      >
        {[...marqueeItems, ...marqueeItems].map((item, idx) => (
          <div key={idx} className="flex items-center gap-8 group cursor-default">
            <span className="hover:text-blue-400 transition-colors">{item}</span>
            <span className="text-amber-400 text-xs">★</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
