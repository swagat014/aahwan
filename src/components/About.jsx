import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Timer, Users, Award, HeartPulse, Quote, Trophy, Flame } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: <Trophy className="w-7 h-7 text-amber-500" />,
      title: 'Inter-Branch Championship',
      desc: 'High-energy rivalry between Computer Science, Electrical, Mechanical, and Civil Engineering streams for the rolling trophy.'
    },
    {
      icon: <Users className="w-7 h-7 text-blue-600" />,
      title: 'Gender-Equal Sports Culture',
      desc: 'Equal championship divisions for Boys & Girls across all 12 athletics track/field events and 8 team/court sports.'
    },
    {
      icon: <Award className="w-7 h-7 text-emerald-600" />,
      title: 'State & University Selections',
      desc: 'Scouting platform discovering top athletic talent to represent GCEK at state, university, and national sports meets.'
    },
    {
      icon: <HeartPulse className="w-7 h-7 text-indigo-600" />,
      title: 'Fitness & Leadership',
      desc: 'Fostering physical endurance, sportsmanship, and teamwork among future engineering leaders.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="about" className="py-28 bg-white relative overflow-hidden">
      
      {/* Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <Shield size={14} /> Athletic Legacy & Culture
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Pillars of GCEK Athletic Excellence
          </h2>
          
          <p className="text-slate-600 text-lg">
            AAHWAN is the signature annual sports festival of Government College of Engineering Kalahandi, uniting academic spirit with physical vigor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* 4 Pillars Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="award-glass-card p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 shadow-sm">
                  {pillar.icon}
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quote Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="award-glass-card p-8 sm:p-10 rounded-3xl relative border border-slate-200 shadow-2xl overflow-hidden group">
              <Quote className="text-blue-200/70 w-28 h-28 absolute -top-4 -right-4 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                <Flame size={14} className="text-amber-500" /> GCEK Sports Mission
              </div>

              <h3 className="font-black text-2xl text-slate-900 mb-4">
                Message from Sports Society
              </h3>
              
              <p className="text-slate-700 italic mb-8 leading-relaxed text-base">
                "At Government College of Engineering Kalahandi, engineering rigor goes hand-in-hand with athletic endurance. AAHWAN 2026 brings together hundreds of student-athletes competing across track, field, team sports, and indoor board games."
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                  GCEK
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">AAHWAN Organising Board</h4>
                  <p className="text-xs text-slate-500 font-semibold">Bhawanipatna, Kalahandi, Odisha</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
