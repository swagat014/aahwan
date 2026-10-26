import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, CheckCircle2, User, BookOpen, Send, Check, 
  MapPin, Calendar, Phone, Mail, Hash, Sparkles, Shield,
  ArrowRight, Download, CheckCircle, GraduationCap, ChevronRight, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isGirlsEvent, GIRLS_ALLOWED_SPORTS_TITLES } from '../data/sportsData';

export default function StudentRegistrationModal() {
  const { 
    showStudentRegistration, setShowStudentRegistration, 
    sports, addRegistration, year, festivalName, collegeName, collegeLocation 
  } = useApp();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    'Kabaddi League': '🤼',
    'Tug of War Championship': '🪢'
  };

  const isGirls = formData.gender === 'Girls Division';

  // Strict division filtering: Girls can only view & select the 14 sanctioned girls events
  const availableSports = sports.filter(s => {
    if (isGirls) {
      return isGirlsEvent(s);
    }
    // Boys Division includes boys sports & dual sports
    return s.division !== 'girls';
  });

  const filteredSports = availableSports.filter(s => {
    return activeCategory === 'all' || s.category === activeCategory;
  });

  // Switch championship division with immediate auto-cleaning of incompatible events
  const handleDivisionChange = (newGender) => {
    setFormData(prev => {
      let updatedEvents = prev.events;
      if (newGender === 'Girls Division') {
        // Automatically prune any selected events that are not in the approved 14 girls sports
        updatedEvents = prev.events.filter(e => isGirlsEvent(e));
      }
      return {
        ...prev,
        gender: newGender,
        events: updatedEvents
      };
    });
  };

  // Toggle sport discipline selection
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

  // Auto-select initial sport if passed through modal trigger
  React.useEffect(() => {
    if (typeof showStudentRegistration === 'string' && showStudentRegistration.trim()) {
      const sportTitle = showStudentRegistration.trim();
      setFormData(prev => ({
        ...prev,
        events: prev.events.includes(sportTitle) ? prev.events : [sportTitle, ...prev.events]
      }));
    }
  }, [showStudentRegistration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanRollNo = formData.rollNo.trim().toUpperCase();
    const cleanPhone = formData.phone.trim();

    if (!cleanName || !cleanRollNo || !cleanPhone) {
      alert('Please fill in your Name, Roll Number, and WhatsApp Phone Number.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit phone number for WhatsApp verification.');
      return;
    }
    if (formData.events.length === 0) {
      alert('Please select at least one sports discipline to register.');
      return;
    }
    // Safety check for Girls Division
    if (isGirls) {
      const invalidEvent = formData.events.find(ev => !isGirlsEvent(ev));
      if (invalidEvent) {
        alert(`"${invalidEvent}" is not an authorized Girls Championship event. Only the 14 approved events are permitted.`);
        return;
      }
    }
    if (!formData.fitnessDeclared) {
      alert('Please confirm the physical fitness declaration box.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = (formData.email || '').trim() || `${cleanRollNo.toLowerCase()}@gcekbpatna.ac.in`;
      const regToken = await addRegistration({
        name: cleanName,
        rollNo: cleanRollNo,
        branch: formData.branch,
        year: formData.year,
        gender: formData.gender,
        phone: cleanPhone,
        email: cleanEmail,
        events: formData.events,
        timestamp: new Date().toISOString()
      });
      setSubmittedReg(regToken);
    } catch (err) {
      console.error('Registration submission failed:', err);
      alert(`Registration could not be saved to database: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 select-none">

        {/* Ambient Darkened Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* SLEEK, COMPACT PREMIUM MODAL DIALOG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="bg-white text-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200/90 text-xs p-4 sm:p-5"
        >
          {/* Close Trigger Button */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors shadow-2xs z-20 cursor-pointer"
            title="Close dialog"
          >
            <X size={15} />
          </button>

          {!submittedReg ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* 1. COMPACT PREMIUM HEADER */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
                  <Trophy size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                      Athlete Registration
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 font-black text-[0.62rem] uppercase tracking-wider">
                      {festivalName} {year}
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-slate-400 font-semibold mt-0.5">
                    Government College of Engineering, {collegeLocation}
                  </p>
                </div>
              </div>

              {/* 2. SLEEK DIVISION SELECTOR (Boys / Girls Segmented Switcher) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 tracking-wider">
                    Championship Division *
                  </label>
                  {isGirls ? (
                    <span className="text-[0.6rem] font-black text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded-md">
                      🌸 14 Approved Girls Events Only
                    </span>
                  ) : (
                    <span className="text-[0.6rem] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                      🏃‍♂️ Men's Roster Available
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                  {[
                    { id: 'Boys Division', label: "Men's / Boys", icon: '🏃‍♂️', activeClass: 'bg-white text-blue-900 border-blue-500 shadow-xs font-black' },
                    { id: 'Girls Division', label: "Women's / Girls (14 Events)", icon: '🏃‍♀️', activeClass: 'bg-white text-pink-900 border-pink-500 shadow-xs font-black' }
                  ].map(div => {
                    const isSelected = formData.gender === div.id;
                    return (
                      <button
                        type="button"
                        key={div.id}
                        onClick={() => handleDivisionChange(div.id)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? `${div.activeClass}`
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-sm">{div.icon}</span>
                        <span className="truncate">{div.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. STUDENT PROFILE INFORMATION (Compact Grid) */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <User size={12} className="text-blue-600" />
                    <span>Personal & Academic Info</span>
                  </span>
                  <span className="text-[0.6rem] text-slate-400 font-bold">GCEK Student Body</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[0.62rem] uppercase font-bold text-slate-600 mb-0.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyabrata Mohanty"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
                    />
                  </div>

                  {/* Roll No */}
                  <div>
                    <label className="block text-[0.62rem] uppercase font-bold text-slate-600 mb-0.5">
                      Roll / Reg No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2101105012"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 uppercase"
                    />
                  </div>

                  {/* WhatsApp Contact */}
                  <div>
                    <label className="block text-[0.62rem] uppercase font-bold text-slate-600 mb-0.5">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
                    />
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-[0.62rem] uppercase font-bold text-slate-600 mb-0.5">
                      Academic Year *
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="1st Year">1st Year (B.Tech)</option>
                      <option value="2nd Year">2nd Year (B.Tech)</option>
                      <option value="3rd Year">3rd Year (B.Tech)</option>
                      <option value="4th Year">4th Year (B.Tech)</option>
                    </select>
                  </div>
                </div>

                {/* Branch Stream Chips (Single Row) */}
                <div>
                  <label className="block text-[0.62rem] uppercase font-bold text-slate-600 mb-1">
                    Branch Stream *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {branches.map(b => {
                      const isSelected = formData.branch === b.label;
                      return (
                        <button
                          type="button"
                          key={b.code}
                          onClick={() => setFormData({ ...formData, branch: b.label })}
                          className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-black'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 font-bold'
                          }`}
                        >
                          <span className="text-xs leading-none">{b.icon}</span>
                          <span className="text-[0.65rem] font-black mt-0.5">{b.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. SPORTS DISCIPLINES SELECTION */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.65rem] uppercase font-black text-slate-600 tracking-wider flex items-center gap-1">
                      <BookOpen size={12} className={isGirls ? "text-pink-600" : "text-blue-600"} />
                      <span>{isGirls ? "Girls Disciplines (14 Allowed)" : "Select Disciplines"}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-black border ${
                      formData.events.length > 0
                        ? isGirls ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}>
                      {formData.events.length} Selected
                    </span>
                  </div>
                </div>

                {/* Category Filter Pills (Dynamically calculated based on available division sports) */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                  {[
                    { id: 'all', label: `All (${availableSports.length})` },
                    { id: 'athletics', label: `Track & Field (${availableSports.filter(s => s.category === 'athletics').length})` },
                    { id: 'team', label: `Team Sports (${availableSports.filter(s => s.category === 'team').length})` },
                    { id: 'indoor', label: `Indoors (${availableSports.filter(s => s.category === 'indoor').length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[0.65rem] transition-all shrink-0 cursor-pointer ${
                        activeCategory === tab.id
                          ? isGirls ? 'bg-pink-700 text-white shadow-2xs font-black' : 'bg-slate-900 text-white shadow-2xs font-black'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Event Tiles Grid (Compact Row View) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-0.5">
                  {filteredSports.map(s => {
                    const isSelected = formData.events.includes(s.title);
                    const icon = sportIcons[s.title] || '🏅';
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleEventToggle(s.title)}
                        title={s.title}
                        className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? isGirls 
                              ? 'bg-pink-50 text-pink-900 border-pink-400 shadow-2xs'
                              : 'bg-blue-50 text-blue-900 border-blue-500 shadow-2xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="min-w-0">
                            <h5 className="font-bold text-[0.7rem] truncate leading-tight">{s.title}</h5>
                            <span className="text-[0.58rem] text-slate-400 block truncate">
                              {s.categoryName || 'Athletics'} • {s.divisionName || 'Championship'}
                            </span>
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected 
                            ? isGirls ? 'bg-pink-600 border-pink-600 text-white' : 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-slate-50'
                        }`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. PHYSICAL FITNESS PLEDGE (Compact Checkbox) */}
              <div className="flex items-start gap-2 p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[0.65rem] text-amber-900 font-semibold leading-tight">
                <input
                  type="checkbox"
                  id="fitnessCheck"
                  checked={formData.fitnessDeclared}
                  onChange={(e) => setFormData({ ...formData, fitnessDeclared: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
                />
                <label htmlFor="fitnessCheck" className="cursor-pointer">
                  I declare that I am physically fit to participate in the selected events and will abide by the GCEK Sports Society code of sportsmanship.
                </label>
              </div>

              {/* 6. SUBMIT ACTION BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Submit Athlete Registration</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* 7. SLEEK ATHLETE RECEIPT / CONFIRMATION PASS */
            <div className="text-center py-4 space-y-4">
              
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                <CheckCircle2 size={26} />
              </div>

              <div>
                <span className="text-[0.62rem] uppercase font-black tracking-widest text-emerald-600 block mb-0.5">
                  Official Registration Confirmed
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Welcome to {festivalName} {year}!
                </h3>
                <p className="text-[0.68rem] text-slate-500 max-w-xs mx-auto mt-0.5 font-semibold">
                  Your athlete verification token has been recorded in the GCEK Sports Society database.
                </p>
              </div>

              {/* Sleek Digital Athlete Pass Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 max-w-sm mx-auto text-left text-xs font-semibold text-slate-800 space-y-2 shadow-2xs">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[0.68rem]">
                  <span className="text-slate-400 uppercase font-black">Athlete Pass Token</span>
                  <span className="text-blue-600 font-mono font-black bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {submittedReg.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[0.68rem]">
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">Athlete Name</span>
                    <span className="font-black text-slate-900">{submittedReg.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">Roll Number</span>
                    <span className="font-mono font-bold text-slate-800">{submittedReg.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">Branch & Year</span>
                    <span className="font-bold text-slate-700">{submittedReg.branch} ({submittedReg.year})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">Division</span>
                    <span className="font-bold text-slate-700">{submittedReg.gender}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[0.6rem] uppercase font-bold mb-1">
                    Enrolled Events ({submittedReg.events.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {submittedReg.events.map((e, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-blue-800 border border-blue-200 rounded-md text-[0.62rem] font-bold shadow-2xs">
                        🏅 {e}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              <button
                onClick={handleClose}
                className="w-full max-w-sm py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Pass & Return to Site
              </button>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
