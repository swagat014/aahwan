import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, CheckCircle2, User, BookOpen, Send, Check, MapPin, Calendar, Smartphone, Mail
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StudentRegistrationModal() {
  const { showStudentRegistration, setShowStudentRegistration, sports, addRegistration, year, collegeName, collegeLocation } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    branch: 'Computer Science & Engg',
    year: '3rd Year',
    gender: 'Boys Division',
    phone: '',
    email: '',
    events: [],
    fitnessDeclared: false
  });

  const [submittedReg, setSubmittedReg] = useState(null);

  if (!showStudentRegistration) return null;

  const branches = [
    { code: 'CSE', label: 'Computer Science & Engg', icon: '💻' },
    { code: 'EE', label: 'Electrical Engineering', icon: '⚡' },
    { code: 'ME', label: 'Mechanical Engineering', icon: '⚙️' },
    { code: 'CE', label: 'Civil Engineering', icon: '🏗️' }
  ];

  const sportIcons = {
    '100m Sprint': '🏃',
    '200m Sprint': '🏃‍♂️',
    '400m Sprint': '🏃‍♀️',
    '800m Middle-Distance Race': '🏃‍♂️',
    '1500m Distance Race': '🏃',
    'Long Jump': '👟',
    'High Jump': '🚀',
    'Triple Jump (Hop, Step & Jump)': '👟',
    'Discus Throw': '🥏',
    'Javelin Throw': '🗡️',
    'Shot Put Throw': '🏋️',
    '4 x 400m Relay Race': '🏃‍♂️',
    'Cricket Tournament': '🏏',
    'Football Champions Cup': '⚽',
    'Badminton Championship': '🏸',
    'Chess Rapid & Blitz Tournament': '♟️',
    'Volleyball Championship': '🏐',
    'Kho-Kho Tournament': '🏃',
    'Table Tennis Championship': '🏓',
    'Kabaddi League': '🤼'
  };

  const filteredSports = sports.filter(s => {
    return activeCategory === 'all' || s.category === activeCategory;
  });

  const handleEventToggle = (eventTitle) => {
    setFormData(prev => {
      const exists = prev.events.includes(eventTitle);
      if (exists) {
        return { ...prev, events: prev.events.filter(e => e !== eventTitle) };
      } else {
        return { ...prev, events: [...prev.events, eventTitle] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo || !formData.phone) {
      alert('Please fill in your Name, Roll Number, and Phone Number.');
      return;
    }
    if (formData.events.length === 0) {
      alert('Please select at least one sports event to participate.');
      return;
    }
    if (!formData.fitnessDeclared) {
      alert('Please check the physical fitness declaration box.');
      return;
    }

    const regToken = addRegistration(formData);
    setSubmittedReg(regToken);
  };

  const handleClose = () => {
    setShowStudentRegistration(false);
    setSubmittedReg(null);
    setFormData({
      name: '',
      rollNo: '',
      branch: 'Computer Science & Engg',
      year: '3rd Year',
      gender: 'Boys Division',
      phone: '',
      email: '',
      events: [],
      fitnessDeclared: false
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 select-none">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Crisp Light Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white text-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors shadow-sm z-20"
          >
            <X size={20} />
          </button>

          {!submittedReg ? (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3 mx-auto shadow-sm">
                  <Trophy size={28} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Student Sports Registration
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  AWAHAAN {year} • {collegeName} {collegeLocation}
                </p>
              </div>

              {/* Division Selector (Boys / Girls) */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-2 text-center">
                  Select Championship Division *
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {[
                    { id: 'Boys Division', label: "Men's / Boys Division", icon: '🏃‍♂️', activeColor: 'bg-blue-50 border-blue-600 text-blue-900' },
                    { id: 'Girls Division', label: "Women's / Girls Division", icon: '🏃‍♀️', activeColor: 'bg-pink-50 border-pink-600 text-pink-900' }
                  ].map(div => {
                    const isSelected = formData.gender === div.id;
                    return (
                      <div
                        key={div.id}
                        onClick={() => setFormData({ ...formData, gender: div.id })}
                        className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${isSelected
                          ? `${div.activeColor} shadow-md font-black`
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                      >
                        <span className="text-2xl">{div.icon}</span>
                        <span className="font-extrabold text-xs uppercase tracking-wider">{div.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Profile Info Fields */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-4">
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Student Profile Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyabrata Mohanty"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                      Roll No / Registration No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2101105012"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Branch Cards */}
                  <div className="sm:col-span-2">
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-2">
                      Engineering Branch Stream *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {branches.map(b => {
                        const isSelected = formData.branch === b.label;
                        return (
                          <div
                            key={b.code}
                            onClick={() => setFormData({ ...formData, branch: b.label })}
                            className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 font-extrabold'
                              }`}
                          >
                            <div className="text-lg mb-0.5">{b.icon}</div>
                            <div className="text-xs">{b.code}</div>
                            <div className="text-[0.62rem] opacity-80 truncate">{b.label.split(' ')[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm"
                    >
                      <option value="1st Year">1st Year (B.Tech)</option>
                      <option value="2nd Year">2nd Year (B.Tech)</option>
                      <option value="3rd Year">3rd Year (B.Tech)</option>
                      <option value="4th Year">4th Year (B.Tech)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                      WhatsApp Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sports Event Selection Section */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" /> Select Sports Events to Participate *
                  </h4>

                  <span className="px-3.5 py-1 bg-blue-100 text-blue-800 font-black text-xs rounded-full">
                    {formData.events.length} Selected
                  </span>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: `All Events (${sports.length})` },
                    { id: 'athletics', label: `Track & Field (${sports.filter(s => s.category === 'athletics').length})` },
                    { id: 'team', label: `Team Sports (${sports.filter(s => s.category === 'team').length})` },
                    { id: 'indoor', label: `Rackets & Indoors (${sports.filter(s => s.category === 'indoor').length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-4 py-1.5 rounded-2xl font-black text-xs transition-all ${activeCategory === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {filteredSports.map(s => {
                    const isSelected = formData.events.includes(s.title);
                    const icon = sportIcons[s.title] || '🏅';
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleEventToggle(s.title)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 ${isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 font-bold'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{icon}</span>
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-xs truncate">{s.title}</h5>
                            <p className={`text-[0.65rem] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                              {s.categoryName}
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-white text-blue-600' : 'border-slate-300 bg-slate-50'
                          }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fitness Pledge */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900">
                <input
                  type="checkbox"
                  id="fitnessCheckLight"
                  checked={formData.fitnessDeclared}
                  onChange={(e) => setFormData({ ...formData, fitnessDeclared: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="fitnessCheckLight" className="cursor-pointer leading-relaxed">
                  I declare that I am physically fit to participate in the selected sports events and will strictly adhere to the GCEK Sports Society code of sportsmanship.
                </label>
              </div>

              {/* Submit Action */}
              <div className="text-right pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-9 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2.5 ml-auto"
                >
                  <Send size={18} /> Submit Sports Registration
                </button>
              </div>

            </form>
          ) : (
            /* Simple Clean Success Screen (No pass card) */
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={44} />
              </div>

              <div>
                <h3 className="text-3xl font-black text-slate-900">Registration Successful!</h3>
                <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto mt-1">
                  Thank you <strong>{submittedReg.name}</strong>! Your sports registration for AWAHAAN {year} has been successfully recorded.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 max-w-lg mx-auto text-left text-xs font-bold text-slate-800 space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 uppercase">Registration ID</span>
                  <span className="text-blue-600 font-mono font-black">{submittedReg.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 uppercase">Roll Number</span>
                  <span className="font-mono font-black">{submittedReg.rollNo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 uppercase">Branch & Year</span>
                  <span>{submittedReg.branch} ({submittedReg.year})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 uppercase">Division</span>
                  <span>{submittedReg.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block mb-2">Registered Events ({submittedReg.events.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {submittedReg.events.map((e, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-xl text-[0.72rem] font-black">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="px-9 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-full shadow-md"
              >
                Close Registration
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
