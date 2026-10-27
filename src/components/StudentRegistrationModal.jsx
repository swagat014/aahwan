import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, CheckCircle2, User, Users, BookOpen, Send, Check, 
  MapPin, Calendar, Phone, Mail, Hash, Sparkles, Shield,
  ArrowRight, Download, CheckCircle, GraduationCap, ChevronRight, AlertCircle,
  RefreshCw, Zap, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isGirlsEvent, GIRLS_ALLOWED_SPORTS_TITLES } from '../data/sportsData';

// Helper to determine if a sport title belongs to team sports category
export const isTeamSportTitle = (title = '') => {
  const t = (title || '').toLowerCase();
  return (
    t.includes('volleyball') ||
    t.includes('football') ||
    t.includes('cricket') ||
    t.includes('kabaddi') ||
    t.includes('kho') ||
    t.includes('badminton') ||
    t.includes('tug') ||
    t.includes('relay') ||
    t.includes('table tennis') ||
    t.includes('chess')
  );
};

// Exact team squad sizes (reads dynamic admin setting or sensible defaults)
export const getTeamSquadSize = (sportTitle = '', teamSquadSizes = {}) => {
  if (sportTitle && teamSquadSizes && teamSquadSizes[sportTitle]) {
    return teamSquadSizes[sportTitle];
  }
  const t = (sportTitle || '').toLowerCase();
  if (t.includes('cricket') || t.includes('football')) return 16;
  if (t.includes('table tennis') || t.includes('chess') || t.includes('relay')) return 4;
  if (t.includes('volleyball') || t.includes('badminton') || t.includes('kabaddi') || t.includes('kho') || t.includes('tug')) return 12;
  return 12;
};

export default function StudentRegistrationModal() {
  const { 
    showStudentRegistration, setShowStudentRegistration, 
    sports, addRegistration, year, festivalName, collegeName, collegeLocation,
    teamSquadSizes 
  } = useApp();

  // Mode: 'individual' | 'team'
  const [registrationType, setRegistrationType] = useState('individual');

  // Individual Form State
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

  // Team Registration State
  const [selectedTeamSport, setSelectedTeamSport] = useState('Volleyball Championship');
  const [teamFitnessDeclared, setTeamFitnessDeclared] = useState(false);

  // Array of player objects: [{ name, rollNo, year, phone, isCaptain }]
  const targetSquadSize = getTeamSquadSize(selectedTeamSport, teamSquadSizes);
  const [teamPlayers, setTeamPlayers] = useState(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: '',
      rollNo: '',
      year: '3rd Year',
      phone: '',
      isCaptain: i === 0
    }));
  });

  const [submittedReg, setSubmittedReg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resize squad roster automatically whenever target squad size changes (12 or 16)
  useEffect(() => {
    setTeamPlayers(prev => {
      const current = [...prev];
      if (current.length === targetSquadSize) return current;
      if (current.length < targetSquadSize) {
        const extra = Array.from({ length: targetSquadSize - current.length }, () => ({
          name: '',
          rollNo: '',
          year: formData.year || '3rd Year',
          phone: '',
          isCaptain: false
        }));
        return [...current, ...extra];
      }
      return current.slice(0, targetSquadSize);
    });
  }, [targetSquadSize, formData.year]);

  // Sync Captain details to Player #1 slot automatically
  useEffect(() => {
    setTeamPlayers(prev => {
      if (prev.length === 0) return prev;
      const first = prev[0];
      if (
        first.name === formData.name &&
        first.rollNo === formData.rollNo &&
        first.phone === formData.phone &&
        first.year === formData.year
      ) {
        return prev;
      }
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        name: formData.name,
        rollNo: formData.rollNo,
        phone: formData.phone,
        year: formData.year,
        isCaptain: true
      };
      return updated;
    });
  }, [formData.name, formData.rollNo, formData.phone, formData.year]);

  // Auto-select initial sport if passed through modal trigger (Hooks MUST run before any early return)
  useEffect(() => {
    if (typeof showStudentRegistration === 'string' && showStudentRegistration.trim()) {
      const sportTitle = showStudentRegistration.trim();
      if (isTeamSportTitle(sportTitle)) {
        setRegistrationType('team');
        setSelectedTeamSport(sportTitle);
      } else {
        setRegistrationType('individual');
        setFormData(prev => ({
          ...prev,
          events: prev.events.includes(sportTitle) ? prev.events : [sportTitle, ...prev.events]
        }));
      }
    }
  }, [showStudentRegistration]);

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

  // Team sports catalogue with enforced squad sizes (admin configurable)
  const teamSportsOptions = [
    { title: 'Volleyball Championship', icon: '🏐', category: 'Team Ball Sport' },
    { title: 'Badminton Championship', icon: '🏸', category: 'Team Racket Sport' },
    { title: 'Kabaddi League', icon: '🤼', category: 'Team Contact Sport' },
    { title: 'Kho-Kho Tournament', icon: '🏃', category: 'Team Chase Sport' },
    { title: 'Football Champions Cup', icon: '⚽', category: 'Team Field Sport' },
    { title: 'Cricket Tournament', icon: '🏏', category: 'Team Field Sport' },
    { title: 'Tug of War Championship', icon: '🪢', category: 'Team Pull Sport' },
    { title: 'Table Tennis Championship', icon: '🏓', category: 'Team Racket Sport' },
    { title: 'Chess Rapid & Blitz Tournament', icon: '♟️', category: 'Team Mind Sport' },
    { title: '4 x 400m Relay Race', icon: '🏃‍♂️', category: 'Team Relay Sport' }
  ].map(s => ({
    ...s,
    size: getTeamSquadSize(s.title, teamSquadSizes)
  }));

  // Available team sports filtered by championship division
  const availableTeamSports = teamSportsOptions.filter(s => {
    if (isGirls) {
      return isGirlsEvent(s.title);
    }
    return true;
  });

  // Strict division filtering for individual sports:
  // Strictly exclude ANY team sport, racket sport, mind sport, or relay
  const availableIndividualSports = sports.filter(s => {
    if (s.category === 'team' || isTeamSportTitle(s.title)) {
      return false;
    }
    if (isGirls) {
      return isGirlsEvent(s);
    }
    return s.division !== 'girls';
  });

  const filteredIndividualSports = availableIndividualSports.filter(s => {
    if (activeCategory === 'all') return true;
    const catName = (s.categoryName || '').toLowerCase();
    const title = (s.title || '').toLowerCase();
    if (activeCategory === 'track') return catName.includes('track') || title.includes('sprint') || title.includes('race') || title.includes('100m') || title.includes('200m') || title.includes('400m') || title.includes('800m') || title.includes('1500m');
    if (activeCategory === 'field') return catName.includes('field') || title.includes('jump') || title.includes('throw') || title.includes('put');
    return true;
  });

  // Switch championship division
  const handleDivisionChange = (newGender) => {
    setFormData(prev => {
      let updatedEvents = prev.events;
      if (newGender === 'Girls Division') {
        updatedEvents = prev.events.filter(e => isGirlsEvent(e));
      }
      return {
        ...prev,
        gender: newGender,
        events: updatedEvents
      };
    });

    // If active team sport not allowed in new division, default to first available
    if (newGender === 'Girls Division') {
      const allowedTeam = teamSportsOptions.find(t => isGirlsEvent(t.title));
      if (allowedTeam) {
        setSelectedTeamSport(allowedTeam.title);
      }
    }
  };

  // Toggle sport discipline selection (Individual Mode)
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

  // Update specific player in squad roster
  const handlePlayerChange = (index, field, value) => {
    setTeamPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    // If Player 1 is updated, keep Captain profile in sync
    if (index === 0) {
      if (field === 'name') setFormData(prev => ({ ...prev, name: value }));
      if (field === 'rollNo') setFormData(prev => ({ ...prev, rollNo: value.toUpperCase() }));
      if (field === 'phone') setFormData(prev => ({ ...prev, phone: value }));
      if (field === 'year') setFormData(prev => ({ ...prev, year: value }));
    }
  };

  // Quick fill helper for demo/testing convenience
  const handleQuickFillDemoSquad = () => {
    const defaultPrefix = formData.branch.includes('Computer') ? 'CSE' : formData.branch.includes('Electrical') ? 'EE' : formData.branch.includes('Mechanical') ? 'ME' : 'CE';
    const sampleNames = [
      'Priyabrata Mohanty', 'Rohit Kumar Sahoo', 'Ayush Dash', 'Sourav Jena',
      'Debasish Rout', 'Aman Swain', 'Bikash Patra', 'Subham Nayak',
      'Rakesh Behera', 'Alok Mohapatra', 'Sameer Samal', 'Deepak Pradhan',
      'Aniket Giri', 'Chandan Parida', 'Sanjay Mallick', 'Omkar Biswal'
    ];

    setTeamPlayers(prev => {
      return prev.map((p, idx) => {
        if (idx === 0) {
          return {
            name: formData.name || sampleNames[0],
            rollNo: formData.rollNo || `2101105001`,
            year: formData.year || '3rd Year',
            phone: formData.phone || '9861000001',
            isCaptain: true
          };
        }
        return {
          name: p.name || sampleNames[idx % sampleNames.length],
          rollNo: p.rollNo || `21011050${(idx + 1).toString().padStart(2, '0')}`,
          year: p.year || (idx % 2 === 0 ? '3rd Year' : '2nd Year'),
          phone: p.phone || `98610000${(idx + 1).toString().padStart(2, '0')}`,
          isCaptain: false
        };
      });
    });

    if (!formData.name) setFormData(prev => ({ ...prev, name: sampleNames[0], rollNo: '2101105001', phone: '9861000001' }));
  };

  // Submit Individual Registration
  const handleIndividualSubmit = async (e) => {
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
        registrationType: 'individual',
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

  // Submit Team Sport Registration (Captain Entry)
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    const cleanCaptainName = formData.name.trim();
    const cleanCaptainRoll = formData.rollNo.trim().toUpperCase();
    const cleanCaptainPhone = formData.phone.trim();

    if (!cleanCaptainName || !cleanCaptainRoll || !cleanCaptainPhone) {
      alert('Please fill in Captain Name, Roll Number, and WhatsApp Number.');
      return;
    }
    if (cleanCaptainPhone.replace(/\D/g, '').length < 10) {
      alert('Captain phone number must be a valid 10-digit number.');
      return;
    }

    // Verify all target squad players are filled
    for (let i = 0; i < targetSquadSize; i++) {
      const p = teamPlayers[i];
      if (!p || !p.name?.trim() || !p.rollNo?.trim() || !p.phone?.trim()) {
        alert(`Player #${i + 1} (${i === 0 ? 'Team Captain' : 'Team Member'}) is incomplete. Please enter Player Name, Registration/Roll No, and Mobile Number.`);
        return;
      }
      if (p.phone.replace(/\D/g, '').length < 10) {
        alert(`Player #${i + 1} (${p.name}) phone number must be at least 10 digits.`);
        return;
      }
    }

    if (!teamFitnessDeclared) {
      alert("Please check the Captain's bonafide team declaration box before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = (formData.email || '').trim() || `${cleanCaptainRoll.toLowerCase()}@gcekbpatna.ac.in`;
      
      const cleanRoster = teamPlayers.slice(0, targetSquadSize).map((p, idx) => ({
        index: idx + 1,
        name: p.name.trim(),
        rollNo: p.rollNo.trim().toUpperCase(),
        year: p.year || formData.year || '3rd Year',
        phone: p.phone.trim(),
        isCaptain: idx === 0
      }));

      const regToken = await addRegistration({
        name: `${cleanCaptainName} (Captain)`,
        rollNo: cleanCaptainRoll,
        branch: formData.branch,
        year: formData.year,
        gender: formData.gender,
        phone: cleanCaptainPhone,
        email: cleanEmail,
        events: [selectedTeamSport],
        registrationType: 'team',
        captainName: cleanCaptainName,
        captainRollNo: cleanCaptainRoll,
        captainPhone: cleanCaptainPhone,
        teamSport: selectedTeamSport,
        teamPlayers: cleanRoster,
        timestamp: new Date().toISOString()
      });

      setSubmittedReg(regToken);
    } catch (err) {
      console.error('Team registration submission failed:', err);
      alert(`Team registration could not be saved to database: ${err.message || 'Please check your connection and try again.'}`);
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
    setTeamFitnessDeclared(false);
  };

  // Squad roster progress count
  const squadFilledCount = teamPlayers.slice(0, targetSquadSize).filter(p => p.name?.trim() && p.rollNo?.trim() && p.phone?.trim()).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 select-none">

        {/* Ambient Darkened Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* SLEEK, RESPONSIVE MODAL DIALOG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className={`bg-white text-slate-800 rounded-2xl sm:rounded-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200/90 text-xs p-3.5 sm:p-6 ${
            registrationType === 'team' ? 'max-w-3xl' : 'max-w-xl'
          }`}
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
            <div className="space-y-3.5">

              {/* 1. TOP HEADER & TOURNAMENT BADGE */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white flex items-center justify-center font-black shadow-md shrink-0 ${
                  registrationType === 'team'
                    ? 'bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/20 text-slate-950'
                    : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/20'
                }`}>
                  {registrationType === 'team' ? <Users size={18} /> : <Trophy size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                      {registrationType === 'team' ? 'Team Sports Captain Registration' : 'Individual Athlete Registration'}
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

              {/* 2. REGISTRATION TYPE SWITCHER */}
              <div>
                <label className="block text-[0.62rem] uppercase font-black text-slate-500 tracking-wider mb-1">
                  Select Registration Type *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('individual')}
                    className={`py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      registrationType === 'individual'
                        ? 'bg-white text-blue-900 border border-blue-400 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User size={14} className="text-blue-600" />
                    <span>🏃 Individual Athlete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegistrationType('team')}
                    className={`py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      registrationType === 'team'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border border-amber-500 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users size={14} className="text-amber-950" />
                    <span>👥 Team Sport (Captain Entry)</span>
                  </button>
                </div>
              </div>

              {/* 3. DIVISION SELECTOR (Boys / Girls) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[0.62rem] uppercase font-black text-slate-600 tracking-wider">
                    Championship Division *
                  </label>
                  {isGirls ? (
                    <span className="text-[0.6rem] font-black text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded-md">
                      🌸 14 Approved Girls Events Only
                    </span>
                  ) : (
                    <span className="text-[0.6rem] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                      🏃‍♂️ Men's / Boys Championship
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                  {[
                    { id: 'Boys Division', label: "Men's / Boys", icon: '🏃‍♂️', activeClass: 'bg-white text-blue-900 border-blue-500 shadow-xs font-black' },
                    { id: 'Girls Division', label: "Women's / Girls", icon: '🏃‍♀️', activeClass: 'bg-white text-pink-900 border-pink-500 shadow-xs font-black' }
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

              {/* ======================================================== */}
              {/* BRANCH A: TEAM SPORT REGISTRATION (CAPTAIN & SQUAD)      */}
              {/* ======================================================== */}
              {registrationType === 'team' ? (
                <form onSubmit={handleTeamSubmit} className="space-y-3.5">
                  
                  {/* Step 1: Captain Personal Info */}
                  <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] uppercase font-black text-amber-900 tracking-wider flex items-center gap-1">
                        <Award size={13} className="text-amber-600" />
                        <span>Team Captain Information (Slot #1)</span>
                      </span>
                      <span className="text-[0.6rem] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                        Team Lead & Official Contact
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[0.62rem] uppercase font-bold text-slate-700 mb-0.5">
                          Captain Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Priyabrata Mohanty"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.62rem] uppercase font-bold text-slate-700 mb-0.5">
                          Captain Roll / Reg No *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2101105012"
                          value={formData.rollNo}
                          onChange={(e) => setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-amber-500 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.62rem] uppercase font-bold text-slate-700 mb-0.5">
                          Captain WhatsApp Mobile *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9861000001"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Branch and Academic Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-100">
                      <div>
                        <label className="block text-[0.62rem] uppercase font-bold text-slate-700 mb-1">
                          Team Engineering Branch *
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {branches.map(b => {
                            const isSelected = formData.branch === b.label;
                            return (
                              <button
                                type="button"
                                key={b.code}
                                onClick={() => setFormData({ ...formData, branch: b.label })}
                                className={`py-1 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                                  isSelected
                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 font-bold'
                                }`}
                              >
                                <span className="text-xs leading-none">{b.icon}</span>
                                <span className="text-[0.65rem] font-black mt-0.5">{b.code}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[0.62rem] uppercase font-bold text-slate-700 mb-1">
                          Captain Academic Year *
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="1st Year">1st Year (B.Tech)</option>
                          <option value="2nd Year">2nd Year (B.Tech)</option>
                          <option value="3rd Year">3rd Year (B.Tech)</option>
                          <option value="4th Year">4th Year (B.Tech)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Choose Team Sport */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] uppercase font-black text-slate-700 tracking-wider flex items-center gap-1">
                        <Trophy size={13} className="text-amber-500" />
                        <span>Select Team Sport (Required Squad Size Enforced)</span>
                      </span>
                      <span className="text-[0.62rem] font-black text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {targetSquadSize} Players Required
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                      {availableTeamSports.map(s => {
                        const isSelected = selectedTeamSport === s.title;
                        return (
                          <div
                            key={s.title}
                            onClick={() => setSelectedTeamSport(s.title)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500 text-amber-950 font-black shadow-xs ring-1 ring-amber-500/30'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-bold'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-base">{s.icon}</span>
                              <span className="text-[0.68rem] font-black leading-tight truncate">{s.title.replace(' Tournament', '').replace(' Championship', '').replace(' Champions Cup', '').replace(' League', '')}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[0.6rem]">
                              <span className="text-slate-400">{s.size} Squad</span>
                              <span className={`font-mono font-black px-1.5 py-0.2 rounded ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                                {s.size} P
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Complete Squad Roster Entry (12 or 16 Players) */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-black text-slate-900 tracking-tight flex items-center gap-1">
                            <Users size={14} className="text-blue-600" />
                            <span>Official Squad Roster ({targetSquadSize} Players)</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-black ${
                            squadFilledCount === targetSquadSize
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {squadFilledCount} / {targetSquadSize} Completed
                          </span>
                        </div>
                        <p className="text-[0.62rem] text-slate-500 font-semibold mt-0.5">
                          Player 1 is designated as Team Captain. All {targetSquadSize} players must be filled with Name, Reg No, Year, and Mobile.
                        </p>
                      </div>

                      {/* Roster Helpers */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={handleQuickFillDemoSquad}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[0.62rem] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="Auto-fill sample squad for quick testing"
                        >
                          <Zap size={11} className="text-amber-500" />
                          <span>Quick Fill</span>
                        </button>
                      </div>
                    </div>

                    {/* Players Input Table / Grid */}
                    <div className="space-y-1.5 max-h-72 sm:max-h-80 overflow-y-auto scrollbar-thin pr-1">
                      {teamPlayers.slice(0, targetSquadSize).map((p, idx) => {
                        const isCap = idx === 0;
                        return (
                          <div 
                            key={`player-row-${idx}`}
                            className={`p-2 rounded-xl border grid grid-cols-12 gap-1.5 items-center transition-colors ${
                              isCap 
                                ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {/* Slot Badge */}
                            <div className="col-span-12 sm:col-span-2 flex items-center gap-1.5">
                              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-mono font-black text-[0.65rem] shrink-0 ${
                                isCap ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className={`text-[0.62rem] font-black truncate ${
                                isCap ? 'text-amber-900 font-black' : 'text-slate-500 font-bold'
                              }`}>
                                {isCap ? '👑 CAPTAIN' : `Player #${idx + 1}`}
                              </span>
                            </div>

                            {/* Player Name */}
                            <div className="col-span-6 sm:col-span-3">
                              <input
                                type="text"
                                required
                                placeholder={isCap ? "Captain Name *" : "Player Name *"}
                                value={p.name}
                                onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[0.68rem] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                              />
                            </div>

                            {/* Reg / Roll No */}
                            <div className="col-span-6 sm:col-span-3">
                              <input
                                type="text"
                                required
                                placeholder="Roll / Reg No *"
                                value={p.rollNo}
                                onChange={(e) => handlePlayerChange(idx, 'rollNo', e.target.value.toUpperCase())}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[0.68rem] font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 uppercase"
                              />
                            </div>

                            {/* Academic Year */}
                            <div className="col-span-6 sm:col-span-2">
                              <select
                                value={p.year}
                                onChange={(e) => handlePlayerChange(idx, 'year', e.target.value)}
                                className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[0.65rem] font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                              >
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                              </select>
                            </div>

                            {/* Mobile No */}
                            <div className="col-span-6 sm:col-span-2">
                              <input
                                type="tel"
                                required
                                placeholder="Mobile No *"
                                value={p.phone}
                                onChange={(e) => handlePlayerChange(idx, 'phone', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[0.68rem] font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Captain Declaration */}
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-[0.65rem] text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      id="teamFitnessCheck"
                      required
                      checked={teamFitnessDeclared}
                      onChange={(e) => setTeamFitnessDeclared(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
                    />
                    <label htmlFor="teamFitnessCheck" className="cursor-pointer">
                      I, as Team Captain, hereby certify that all {targetSquadSize} players listed above are bonafide students of {formData.branch} stream and are physically & medically fit to participate in the {selectedTeamSport} for {festivalName} {year}.
                    </label>
                  </div>

                  {/* Step 5: Submit Action */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        <span>Submitting Team Squad to Database...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Team Registration ({targetSquadSize} Players Roster)</span>
                      </>
                    )}
                  </button>

                </form>
              ) : (
                /* ======================================================== */
                /* BRANCH B: INDIVIDUAL ATHLETE REGISTRATION                */
                /* ======================================================== */
                <form onSubmit={handleIndividualSubmit} className="space-y-3.5">
                  
                  {/* Student Academic & Personal Info */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                        <User size={12} className="text-blue-600" />
                        <span>Personal & Academic Info</span>
                      </span>
                      <span className="text-[0.6rem] text-slate-400 font-bold">GCEK Student Body</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

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
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500 uppercase"
                        />
                      </div>

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
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.62rem] uppercase font-bold text-slate-600 mb-0.5">
                          Academic Year *
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="1st Year">1st Year (B.Tech)</option>
                          <option value="2nd Year">2nd Year (B.Tech)</option>
                          <option value="3rd Year">3rd Year (B.Tech)</option>
                          <option value="4th Year">4th Year (B.Tech)</option>
                        </select>
                      </div>
                    </div>

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

                  {/* Individual Disciplines Selection */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] uppercase font-black text-slate-600 tracking-wider flex items-center gap-1">
                        <BookOpen size={12} className={isGirls ? "text-pink-600" : "text-blue-600"} />
                        <span>{isGirls ? "Girls Disciplines (14 Allowed)" : "Select Disciplines"}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-black border ${
                        formData.events.length > 0
                          ? isGirls ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {formData.events.length} Selected
                      </span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                      {[
                        { id: 'all', label: `All Athletics (${availableIndividualSports.length})` },
                        { id: 'track', label: `Track Events (${availableIndividualSports.filter(s => (s.categoryName || '').toLowerCase().includes('track') || s.title.includes('Sprint') || s.title.includes('Race') || s.title.includes('100m') || s.title.includes('200m') || s.title.includes('400m') || s.title.includes('800m') || s.title.includes('1500m')).length})` },
                        { id: 'field', label: `Field Events (${availableIndividualSports.filter(s => (s.categoryName || '').toLowerCase().includes('field') || s.title.includes('Jump') || s.title.includes('Throw') || s.title.includes('Shot')).length})` }
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

                    {/* Event Tiles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-0.5">
                      {filteredIndividualSports.map(s => {
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
                                <p className="font-bold text-[0.68rem] leading-tight truncate">{s.title}</p>
                                <p className="text-[0.6rem] text-slate-400 font-semibold">{s.categoryName || s.category}</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected 
                                ? isGirls ? 'bg-pink-600 border-pink-600 text-white' : 'bg-blue-600 border-blue-600 text-white' 
                                : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check size={10} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fitness Declaration */}
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-[0.65rem] text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      id="fitnessCheck"
                      required
                      checked={formData.fitnessDeclared}
                      onChange={(e) => setFormData({ ...formData, fitnessDeclared: e.target.checked })}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
                    />
                    <label htmlFor="fitnessCheck" className="cursor-pointer">
                      I declare that I am physically fit to participate in the selected events and will abide by the GCEK Sports Society code of sportsmanship.
                    </label>
                  </div>

                  {/* Submit Action */}
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
              )}

            </div>
          ) : (
            /* ======================================================== */
            /* 4. SLEEK CONFIRMATION PASS / RECEIPT                     */
            /* ======================================================== */
            <div className="text-center py-3 space-y-4">
              
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                <CheckCircle2 size={26} />
              </div>

              <div>
                <span className="text-[0.62rem] uppercase font-black tracking-widest text-emerald-600 block mb-0.5">
                  {submittedReg.registrationType === 'team' ? 'Official Team Roster Confirmed' : 'Athlete Registration Confirmed'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {submittedReg.registrationType === 'team' ? `${submittedReg.teamSport || submittedReg.events[0]} Registered!` : `Welcome to ${festivalName} ${year}!`}
                </h3>
                <p className="text-[0.68rem] text-slate-500 max-w-xs mx-auto mt-0.5 font-semibold">
                  {submittedReg.registrationType === 'team'
                    ? `Team squad with ${submittedReg.teamPlayers?.length || 12} players officially registered in the GCEK Sports database.`
                    : 'Your athlete verification token has been recorded in the GCEK Sports Society database.'}
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs font-semibold text-slate-800 space-y-2.5 shadow-2xs">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[0.68rem]">
                  <span className="text-slate-400 uppercase font-black">
                    {submittedReg.registrationType === 'team' ? 'Team Pass Token' : 'Athlete Pass Token'}
                  </span>
                  <span className="text-blue-600 font-mono font-black bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {submittedReg.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[0.68rem]">
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">
                      {submittedReg.registrationType === 'team' ? 'Team Captain' : 'Athlete Name'}
                    </span>
                    <span className="font-black text-slate-900">{submittedReg.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">Roll / Reg Number</span>
                    <span className="font-mono font-bold text-slate-800">{submittedReg.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">Branch & Division</span>
                    <span className="font-bold text-slate-700">{submittedReg.branch} • {submittedReg.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[0.6rem] uppercase">WhatsApp Contact</span>
                    <span className="font-mono font-bold text-slate-800">{submittedReg.phone}</span>
                  </div>
                </div>

                {/* Team Roster or Enrolled Events */}
                {submittedReg.registrationType === 'team' && submittedReg.teamPlayers && submittedReg.teamPlayers.length > 0 ? (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[0.65rem] font-bold text-slate-700">
                      <span className="uppercase tracking-wider text-slate-500">Official Team Roster</span>
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full font-black text-[0.62rem]">
                        {submittedReg.teamPlayers.length} Players Squad
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-[0.65rem] bg-white">
                      {submittedReg.teamPlayers.map((p, idx) => (
                        <div key={idx} className="p-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-4 h-4 rounded-full inline-flex items-center justify-center font-mono font-black text-[0.58rem] ${
                              idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-black text-slate-900 truncate">{p.name}</span>
                            {idx === 0 && (
                              <span className="text-[0.55rem] font-black bg-amber-100 text-amber-800 px-1 py-0.2 rounded border border-amber-200">
                                CAPTAIN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-mono text-slate-500 text-[0.62rem] shrink-0">
                            <span>{p.rollNo}</span>
                            <span>•</span>
                            <span>{p.year}</span>
                            <span>•</span>
                            <span>{p.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[0.6rem] uppercase font-bold mb-1">
                      Enrolled Events ({submittedReg.events?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(submittedReg.events || []).map((e, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white text-blue-800 border border-blue-200 rounded-md text-[0.62rem] font-bold shadow-2xs">
                          🏅 {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <button
                onClick={handleClose}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
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
