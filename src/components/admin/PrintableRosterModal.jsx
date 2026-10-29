import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Trophy, MapPin, Calendar, CheckCircle2, 
  Award, ShieldCheck, Download, Filter, Sliders, ChevronDown, 
  Clock, User, FileText, CheckSquare, Square, Sparkles, RefreshCw,
  Info, AlertCircle, Bookmark, Layers, Edit3, Medal, Crown, Save,
  Check, Phone, Mail, GraduationCap, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Helper to determine if a sport belongs to track & field / athletics
const isAthleticEvent = (title = '', category = '') => {
  if (category === 'athletics') return true;
  const t = (title || '').toLowerCase();
  return (
    t.includes('100m') || t.includes('200m') || t.includes('400m') ||
    t.includes('800m') || t.includes('1500m') || t.includes('sprint') ||
    t.includes('relay') || t.includes('jump') || t.includes('throw') ||
    t.includes('shot put') || t.includes('discus') || t.includes('javelin') ||
    t.includes('athletics') || t.includes('track') || t.includes('hurdle') ||
    t.includes('race')
  );
};

// Helper to get branch short code
const getBranchCode = (branch = '') => {
  const b = (branch || '').toLowerCase();
  if (b.includes('computer') || b.includes('cse')) return 'CSE';
  if (b.includes('electrical') || b.includes('ee')) return 'EE';
  if (b.includes('mechanical') || b.includes('me')) return 'ME';
  if (b.includes('civil') || b.includes('ce')) return 'CE';
  return 'CSE';
};

export default function PrintableRosterModal({ sportTitle, onClose }) {
  const { 
    registrations = [], 
    collegeName = 'GOVERNMENT COLLEGE OF ENGINEERING', 
    collegeLocation = 'KALAHANDI', 
    year = '2026',
    festivalName = 'AAHWAN',
    sports = [],
    sportWinners = {},
    assignSportWinner,
    athleticsPointsRule = { gold: 5, silver: 3, bronze: 1 },
    teamPointsRule = { gold: 7, silver: 5, bronze: 0 }
  } = useApp();

  // Internal interactive controls state
  const [selectedSportTitle, setSelectedSportTitle] = useState(sportTitle || 'ALL_ATHLETICS');
  const [selectedDivision, setSelectedDivision] = useState('all'); // 'all' | 'Boys Division' | 'Girls Division'
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all'); // 'all' | 'CSE' | 'EE' | 'ME' | 'CE'
  const [templateMode, setTemplateMode] = useState('participation'); // 'participation' | 'results' | 'officiating'
  const [extraBlankRows, setExtraBlankRows] = useState(3); // 0, 3, 5, 8
  const [isCompact, setIsCompact] = useState(false);
  const [pageOrientation, setPageOrientation] = useState('portrait'); // 'portrait' | 'landscape'
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showResultsDesk, setShowResultsDesk] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Find sport object from sports list if individual event selected
  const sportObj = useMemo(() => {
    if (selectedSportTitle === 'ALL_ATHLETICS' || selectedSportTitle === 'ALL_SPORTS') return null;
    return sports.find(s => 
      s.title?.toLowerCase() === selectedSportTitle?.toLowerCase() ||
      s.title?.toLowerCase().includes(selectedSportTitle?.toLowerCase()) ||
      selectedSportTitle?.toLowerCase().includes(s.title?.toLowerCase())
    );
  }, [sports, selectedSportTitle]);

  const isMasterAthletics = selectedSportTitle === 'ALL_ATHLETICS';
  const isMasterAllSports = selectedSportTitle === 'ALL_SPORTS';
  const isIndividualEvent = !isMasterAthletics && !isMasterAllSports;

  // Active sport ID key for winner assignment
  const sportKey = sportObj?.id || selectedSportTitle;

  // Editable event metadata state
  const [customVenue, setCustomVenue] = useState('GCEK Synthetic Athletic Track');
  const [customTime, setCustomTime] = useState('Day 1 • 09:30 AM');
  const [customReferee, setCustomReferee] = useState('Athletic Board & Faculty Referees');
  const [customBenchmark, setCustomBenchmark] = useState('10.82s (GCEK Meet Record)');

  // Local state for Winners & Results Desk
  const [winner1Name, setWinner1Name] = useState('');
  const [winner1Roll, setWinner1Roll] = useState('');
  const [winner1Branch, setWinner1Branch] = useState('CSE');
  const [winner1Mark, setWinner1Mark] = useState('');

  const [winner2Name, setWinner2Name] = useState('');
  const [winner2Roll, setWinner2Roll] = useState('');
  const [winner2Branch, setWinner2Branch] = useState('EE');
  const [winner2Mark, setWinner2Mark] = useState('');

  const [winner3Name, setWinner3Name] = useState('');
  const [winner3Roll, setWinner3Roll] = useState('');
  const [winner3Branch, setWinner3Branch] = useState('ME');
  const [winner3Mark, setWinner3Mark] = useState('');

  const [isNMR, setIsNMR] = useState(false); // New Meet Record

  // Sync existing winners from AppContext when active event changes
  useEffect(() => {
    const existing = sportWinners[sportKey] || (sportObj ? sportWinners[sportObj.title] : null) || {};
    
    // First place
    setWinner1Branch(existing.first || 'CSE');
    setWinner1Name(existing.firstStudent?.name || existing.firstStudentName || '');
    setWinner1Roll(existing.firstStudent?.rollNo || existing.firstStudentRoll || '');
    setWinner1Mark(existing.firstMark || existing.winningMark || '');

    // Second place
    setWinner2Branch(existing.second || 'EE');
    setWinner2Name(existing.secondStudent?.name || existing.secondStudentName || '');
    setWinner2Roll(existing.secondStudent?.rollNo || existing.secondStudentRoll || '');
    setWinner2Mark(existing.secondMark || '');

    // Third place
    setWinner3Branch(existing.third || 'ME');
    setWinner3Name(existing.thirdStudent?.name || existing.thirdStudentName || '');
    setWinner3Roll(existing.thirdStudent?.rollNo || existing.thirdStudentRoll || '');
    setWinner3Mark(existing.thirdMark || '');

    setIsNMR(Boolean(existing.nmr));
  }, [selectedSportTitle, sportKey, sportWinners, sportObj]);

  // Update venue and time defaults when sport changes
  useEffect(() => {
    if (isMasterAthletics) {
      setCustomVenue('GCEK Synthetic Athletic Track & Field Complex');
      setCustomTime('All 3 Meet Days (Day 1 - Day 3)');
      setCustomReferee('Athletic Board & Lead Track Referees');
      setCustomBenchmark('IAAF Standard Meets');
    } else if (isMasterAllSports) {
      setCustomVenue('GCEK Sports Grounds, Mat Arena & Indoor Halls');
      setCustomTime('Annual Sports Meet 2026');
      setCustomReferee('GCEK Sports Council & Physical Education Board');
      setCustomBenchmark('Inter-Branch Championship');
    } else if (sportObj) {
      setCustomVenue(sportObj.venue || 'GCEK Synthetic Athletic Track');
      setCustomTime(sportObj.time || 'Day 1 • 09:30 AM');
      setCustomReferee(sportObj.coordinator || 'Athletic Board Referees & Judges');
      setCustomBenchmark(
        sportObj.title?.includes('100m') ? '10.82s (GCEK Meet Record)' :
        sportObj.title?.includes('200m') ? '22.45s (GCEK Meet Record)' :
        sportObj.title?.includes('400m') ? '51.10s (GCEK Meet Record)' :
        sportObj.title?.includes('Long Jump') ? '6.45m (GCEK Record)' :
        sportObj.title?.includes('High Jump') ? '1.85m (GCEK Record)' :
        sportObj.title?.includes('Shot Put') ? '11.80m (GCEK Record)' :
        sportObj.title?.includes('Discus') ? '34.50m (GCEK Record)' :
        sportObj.title?.includes('Javelin') ? '48.20m (GCEK Record)' :
        sportObj.category === 'athletics' ? 'Championship Standard' : 'Inter-Branch Match'
      );
    } else {
      setCustomVenue('GCEK Main Sports Arena');
      setCustomTime('Day 1 • 09:30 AM');
      setCustomReferee('Athletic Board & Faculty Referees');
      setCustomBenchmark('Official Championship Standard');
    }
  }, [selectedSportTitle, sportObj, isMasterAthletics, isMasterAllSports]);

  // Filter athletes who have participated (expands squad players on team sport sheets)
  const allFilteredAthletes = useMemo(() => {
    const list = [];
    registrations.forEach(r => {
      const studentEvents = (r.events || []).filter(e => typeof e === 'string' && !e.startsWith('TEAM_ROSTER:'));
      const isTeam = r.registrationType === 'team' || Boolean(r.teamPlayers && r.teamPlayers.length > 0);
      const cur = (selectedSportTitle || '').trim().toLowerCase();

      let matches = false;
      if (isMasterAthletics) {
        matches = studentEvents.some(e => isAthleticEvent(e));
      } else if (isMasterAllSports) {
        matches = studentEvents.length > 0 || isTeam;
      } else {
        matches = studentEvents.some(e => {
          const ev = (e || '').trim().toLowerCase();
          return ev === cur || ev.includes(cur) || cur.includes(ev);
        }) || (r.teamSport && r.teamSport.toLowerCase().includes(cur));
      }

      if (!matches) return;

      if (isTeam && r.teamPlayers && r.teamPlayers.length > 0 && !isMasterAthletics && !isMasterAllSports) {
        // Expand all 12 or 16 squad players so each player is printed on the official match sheet
        r.teamPlayers.forEach(p => {
          list.push({
            id: `${r.id}-${p.rollNo || p.name}`,
            rollNo: p.rollNo || r.rollNo,
            name: `${p.name}${p.isCaptain ? ' (Team Captain)' : ''}`,
            branch: r.branch,
            year: p.year || r.year,
            gender: r.gender,
            phone: p.phone || r.phone,
            events: [r.teamSport || selectedSportTitle],
            isCaptain: p.isCaptain,
            isTeamPlayer: true,
            teamCaptainName: r.name
          });
        });
      } else {
        list.push(r);
      }
    });
    return list;
  }, [registrations, selectedSportTitle, isMasterAthletics, isMasterAllSports]);

  // Apply division & branch filters
  const registeredStudents = useMemo(() => {
    return allFilteredAthletes.filter(r => {
      const matchesDivision = selectedDivision === 'all' || r.gender === selectedDivision;
      const branchCode = getBranchCode(r.branch);
      const matchesBranch = selectedBranchFilter === 'all' || branchCode === selectedBranchFilter;
      return matchesDivision && matchesBranch;
    });
  }, [allFilteredAthletes, selectedDivision, selectedBranchFilter]);

  // Metrics breakdown
  const metrics = useMemo(() => {
    const total = allFilteredAthletes.length;
    const boys = allFilteredAthletes.filter(r => r.gender === 'Boys Division').length;
    const girls = allFilteredAthletes.filter(r => r.gender === 'Girls Division').length;
    const cse = registeredStudents.filter(r => getBranchCode(r.branch) === 'CSE').length;
    const ee = registeredStudents.filter(r => getBranchCode(r.branch) === 'EE').length;
    const me = registeredStudents.filter(r => getBranchCode(r.branch) === 'ME').length;
    const ce = registeredStudents.filter(r => getBranchCode(r.branch) === 'CE').length;
    return { total, boys, girls, cse, ee, me, ce };
  }, [allFilteredAthletes, registeredStudents]);

  // Save Results & Winners to AppContext
  const handleSaveResults = (e) => {
    if (e) e.preventDefault();
    if (!isIndividualEvent) {
      alert('Please select a specific sport (e.g. 100m Sprint) to record and declare official winners.');
      return;
    }

    if (assignSportWinner) {
      assignSportWinner(sportKey, {
        first: winner1Branch,
        second: winner2Branch,
        third: winner3Branch,
        firstStudent: { name: winner1Name, rollNo: winner1Roll, branch: winner1Branch },
        secondStudent: { name: winner2Name, rollNo: winner2Roll, branch: winner2Branch },
        thirdStudent: { name: winner3Name, rollNo: winner3Roll, branch: winner3Branch },
        firstStudentName: winner1Name,
        firstStudentRoll: winner1Roll,
        secondStudentName: winner2Name,
        secondStudentRoll: winner2Roll,
        thirdStudentName: winner3Name,
        thirdStudentRoll: winner3Roll,
        firstMark: winner1Mark,
        secondMark: winner2Mark,
        thirdMark: winner3Mark,
        winningMark: winner1Mark,
        nmr: isNMR,
        completed: Boolean(winner1Name || winner1Branch)
      });
    }

    setToastMsg(`✓ Official Results saved for ${selectedSportTitle}! Leaderboard updated.`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Quick crown a participant from table row
  const crownParticipant = (student, place) => {
    const branch = getBranchCode(student.branch);
    if (place === 1) {
      if (winner1Roll === student.rollNo) {
        // clear
        setWinner1Name('');
        setWinner1Roll('');
      } else {
        setWinner1Name(student.name);
        setWinner1Roll(student.rollNo);
        setWinner1Branch(branch);
      }
    } else if (place === 2) {
      if (winner2Roll === student.rollNo) {
        setWinner2Name('');
        setWinner2Roll('');
      } else {
        setWinner2Name(student.name);
        setWinner2Roll(student.rollNo);
        setWinner2Branch(branch);
      }
    } else if (place === 3) {
      if (winner3Roll === student.rollNo) {
        setWinner3Name('');
        setWinner3Roll('');
      } else {
        setWinner3Name(student.name);
        setWinner3Roll(student.rollNo);
        setWinner3Branch(branch);
      }
    }

    setToastMsg(`Assigned ${student.name} as ${place === 1 ? '🥇 1st Place' : place === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}. Click "Save Results" to publish!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Generation timestamp & document ref code
  const documentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const documentRefCode = useMemo(() => {
    const slug = isMasterAthletics ? 'ATH-MASTER' :
      isMasterAllSports ? 'ALL-MEET' :
      (selectedSportTitle || 'EVENT').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    return `GCEK/SPORTS/AAH-${year}/ROST-${slug}`;
  }, [selectedSportTitle, isMasterAthletics, isMasterAllSports, year]);

  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['S.No', 'Bib No', 'Roll No', 'Name', 'Division', 'Branch', 'Year', 'Phone', 'Email', 'Events Participated', 'Placement / Award'];
    const rows = registeredStudents.map((s, idx) => {
      let winLabel = 'Participant';
      if (winner1Roll === s.rollNo || (winner1Name && winner1Name.toLowerCase() === s.name?.toLowerCase())) winLabel = `1st Place (Gold Medal - ${winner1Mark || 'Winner'})`;
      else if (winner2Roll === s.rollNo || (winner2Name && winner2Name.toLowerCase() === s.name?.toLowerCase())) winLabel = `2nd Place (Silver Medal - ${winner2Mark || 'Runner Up'})`;
      else if (winner3Roll === s.rollNo || (winner3Name && winner3Name.toLowerCase() === s.name?.toLowerCase())) winLabel = `3rd Place (Bronze Medal - ${winner3Mark || '2nd Runner Up'})`;

      return [
        idx + 1,
        `"BIB-${101 + idx}"`,
        `"${s.rollNo || ''}"`,
        `"${s.name || ''}"`,
        `"${s.gender || ''}"`,
        `"${s.branch || ''}"`,
        `"${s.year || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.email || ''}"`,
        `"${(s.events || []).join('; ')}"`,
        `"${winLabel}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `${(selectedSportTitle || 'athletics_roster').replace(/\s+/g, '_')}_Official_Roster.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard shortcut for print (Ctrl + P) & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedSportTitle) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:static print:block">

        {/* Dynamic Media Print Style for this document */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 ${pageOrientation};
              margin: 7mm 8mm 8mm 8mm;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-isolated-sheet {
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
            }
            .print-table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            .print-table th, .print-table td {
              border-color: #0F172A !important;
              color: #0F172A !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-table thead {
              display: table-header-group !important;
            }
            .print-table tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}} />

        {/* Backdrop (Screen only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md print:hidden"
        />

        {/* Main Modal Shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 border border-slate-200/90 overflow-hidden flex flex-col max-h-[95vh] w-full ${
            pageOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-5xl'
          } print:shadow-none print:border-none print:max-w-none print:w-full print:max-h-none print:rounded-none print:static print:block`}
        >

          {/* ========================================================================= */}
          {/* SCREEN TOOLBAR & CUSTOMIZATION CONTROLS (Hidden during printing)           */}
          {/* ========================================================================= */}
          <div className="bg-slate-900 text-white p-3 sm:p-4.5 border-b border-slate-800 shrink-0 print:hidden space-y-3">
            
            {/* Top Row: Title, Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Trophy size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                      <span>Athletics & Sports Roster Print Studio</span>
                      <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {year} Official Meet
                      </span>
                    </h3>
                  </div>
                  <p className="text-[0.68rem] text-slate-400 font-medium truncate">
                    Official participant rosters, officiating score-sheets & certified winner result declarations
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                
                {/* Results Desk Toggle Button */}
                {isIndividualEvent && (
                  <button
                    onClick={() => setShowResultsDesk(!showResultsDesk)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      showResultsDesk
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                    }`}
                    title="Declare or record 1st, 2nd, 3rd place winners for this event"
                  >
                    <Crown size={14} className={showResultsDesk ? 'text-slate-950' : 'text-amber-400'} />
                    <span>Declare / Edit Results</span>
                  </button>
                )}

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  title="Download CSV participant list"
                >
                  <Download size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 sm:px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                  title="Print Official Sheet (Ctrl + P)"
                >
                  <Printer size={16} />
                  <span>Print Sheet</span>
                  <span className="hidden sm:inline-block text-[0.65rem] opacity-75 font-mono bg-black/20 px-1.5 py-0.5 rounded ml-1">Ctrl+P</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 border border-slate-700/80 flex items-center justify-center transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

            </div>

            {/* Notification Toast if present */}
            {toastMsg && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* Event Selector, Division, Branch & Sheet Mode Switcher */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              
              {/* Event Picker Dropdown */}
              <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
                <span className="text-[0.68rem] font-black text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Trophy size={12} />
                  <span>Roster:</span>
                </span>
                <select
                  value={selectedSportTitle}
                  onChange={(e) => {
                    setSelectedSportTitle(e.target.value);
                    if (e.target.value === 'ALL_ATHLETICS' || e.target.value === 'ALL_SPORTS') {
                      setShowResultsDesk(false);
                      setTemplateMode('participation');
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-black text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <optgroup label="🌟 MASTER ROSTERS">
                    <option value="ALL_ATHLETICS">🏃 All Athletics Events (Master Participation Roster)</option>
                    <option value="ALL_SPORTS">🏆 All Sports Combined (Meet Master Roster)</option>
                  </optgroup>
                  
                  <optgroup label="🏃 TRACK & FIELD (ATHLETICS)">
                    {sports.filter(s => isAthleticEvent(s.title, s.category)).map(s => (
                      <option key={s.id || s.title} value={s.title}>
                        {s.title} ({s.categoryName || 'Athletics'})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="⚽ TEAM & INDOOR SPORTS">
                    {sports.filter(s => !isAthleticEvent(s.title, s.category)).map(s => (
                      <option key={s.id || s.title} value={s.title}>
                        {s.title} ({s.categoryName || s.category || 'Tournament'})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Division Filter */}
              <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setSelectedDivision('all')}
                  className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold transition cursor-pointer ${
                    selectedDivision === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Genders ({metrics.total})
                </button>
                <button
                  onClick={() => setSelectedDivision('Boys Division')}
                  className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold transition cursor-pointer ${
                    selectedDivision === 'Boys Division'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Boys ({metrics.boys})
                </button>
                <button
                  onClick={() => setSelectedDivision('Girls Division')}
                  className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold transition cursor-pointer ${
                    selectedDivision === 'Girls Division'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Girls ({metrics.girls})
                </button>
              </div>

              {/* Branch Filter Dropdown */}
              <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="bg-transparent text-[0.68rem] font-bold text-slate-300 focus:outline-none cursor-pointer px-1.5 py-0.5"
                >
                  <option value="all" className="bg-slate-900">All Branches</option>
                  <option value="CSE" className="bg-slate-900">CSE Dept ({metrics.cse})</option>
                  <option value="EE" className="bg-slate-900">EE Dept ({metrics.ee})</option>
                  <option value="ME" className="bg-slate-900">ME Dept ({metrics.me})</option>
                  <option value="CE" className="bg-slate-900">CE Dept ({metrics.ce})</option>
                </select>
              </div>

              {/* Template Mode Tabs */}
              <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setTemplateMode('participation')}
                  className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-black transition cursor-pointer ${
                    templateMode === 'participation'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Participant Roll of Students who Participated"
                >
                  Participation Roster
                </button>
                <button
                  onClick={() => setTemplateMode('results')}
                  className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-black transition cursor-pointer flex items-center gap-1 ${
                    templateMode === 'results'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Official Winners & Results Declaration Sheet"
                >
                  <Crown size={11} />
                  <span>Winners & Results</span>
                </button>
                <button
                  onClick={() => setTemplateMode('officiating')}
                  className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-black transition cursor-pointer ${
                    templateMode === 'officiating'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ground Score-Sheet for Stopwatch & Trials"
                >
                  Score-Sheet
                </button>
              </div>

              {/* Secondary Layout Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                
                {/* Spot Rows */}
                <select
                  value={extraBlankRows}
                  onChange={(e) => setExtraBlankRows(Number(e.target.value))}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[0.68rem] font-bold text-slate-300 focus:outline-none cursor-pointer"
                  title="Add blank rows for wild cards / spot entries"
                >
                  <option value={0}>+0 Spot Rows</option>
                  <option value={3}>+3 Spot Rows</option>
                  <option value={5}>+5 Spot Rows</option>
                  <option value={8}>+8 Spot Rows</option>
                </select>

                {/* Density Switch */}
                <button
                  onClick={() => setIsCompact(!isCompact)}
                  className={`px-2 py-1 rounded-lg text-[0.68rem] font-bold border transition cursor-pointer ${
                    isCompact 
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Compact Density (Fit more athletes on 1 page)"
                >
                  {isCompact ? 'Compact Fit' : 'Normal'}
                </button>

                {/* Orientation Switch */}
                <button
                  onClick={() => setPageOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[0.68rem] font-bold capitalize transition cursor-pointer"
                  title="Toggle A4 Portrait vs Landscape"
                >
                  {pageOrientation} A4
                </button>

                {/* Toggle Metadata Editor */}
                <button
                  onClick={() => setShowMetadataEditor(!showMetadataEditor)}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    showMetadataEditor 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Customize Venue, Schedule Time & Referee Info"
                >
                  <Edit3 size={13} />
                </button>

              </div>

            </div>

            {/* =============================================================== */}
            {/* 🏆 WINNER & RESULTS DECLARATION DESK (Expandable Drawer)       */}
            {/* =============================================================== */}
            {showResultsDesk && isIndividualEvent && (
              <div className="mt-3 p-3.5 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-amber-400" />
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Official Podium Results & Winners Declaration Desk: {selectedSportTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isNMR}
                        onChange={(e) => setIsNMR(e.target.checked)}
                        className="rounded accent-amber-500 cursor-pointer"
                      />
                      <span>★ New Meet Record (NMR)</span>
                    </label>
                    <button
                      onClick={handleSaveResults}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save & Publish</span>
                    </button>
                  </div>
                </div>

                {/* 3-Column Winners Cards: 1st, 2nd, 3rd */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  
                  {/* 🥇 1st Place (Gold Champion) */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-amber-400 font-black text-xs">
                      <span className="flex items-center gap-1">🥇 1st Place (Gold)</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[0.62rem]">
                        +{athleticsPointsRule.gold || 5} Pts
                      </span>
                    </div>

                    {/* Student picker dropdown from participating students */}
                    <div>
                      <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Select Winner</label>
                      <select
                        value={winner1Roll || ''}
                        onChange={(e) => {
                          const s = registeredStudents.find(st => st.rollNo === e.target.value);
                          if (s) {
                            setWinner1Roll(s.rollNo);
                            setWinner1Name(s.name);
                            setWinner1Branch(getBranchCode(s.branch));
                          } else {
                            setWinner1Roll('');
                          }
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
                      >
                        <option value="">-- Choose Participating Athlete --</option>
                        {registeredStudents.map(s => (
                          <option key={s.rollNo} value={s.rollNo}>
                            {s.name} ({s.rollNo} • {getBranchCode(s.branch)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Student Name</label>
                        <input
                          type="text"
                          value={winner1Name}
                          onChange={(e) => setWinner1Name(e.target.value)}
                          placeholder="Athlete Name"
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Branch</label>
                        <select
                          value={winner1Branch}
                          onChange={(e) => setWinner1Branch(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-bold"
                        >
                          <option value="CSE">CSE Dept</option>
                          <option value="EE">EE Dept</option>
                          <option value="ME">ME Dept</option>
                          <option value="CE">CE Dept</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Winning Mark / Stopwatch Time</label>
                      <input
                        type="text"
                        value={winner1Mark}
                        onChange={(e) => setWinner1Mark(e.target.value)}
                        placeholder="e.g. 10.85s or 5.92m"
                        className="w-full px-2 py-1 bg-slate-900 border border-amber-500/50 rounded text-xs text-amber-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* 🥈 2nd Place (Silver Medal) */}
                  <div className="p-3 bg-slate-400/10 border border-slate-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-black text-xs">
                      <span className="flex items-center gap-1">🥈 2nd Place (Silver)</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-500/20 text-slate-200 text-[0.62rem]">
                        +{athleticsPointsRule.silver || 3} Pts
                      </span>
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Select Runner-Up</label>
                      <select
                        value={winner2Roll || ''}
                        onChange={(e) => {
                          const s = registeredStudents.find(st => st.rollNo === e.target.value);
                          if (s) {
                            setWinner2Roll(s.rollNo);
                            setWinner2Name(s.name);
                            setWinner2Branch(getBranchCode(s.branch));
                          } else {
                            setWinner2Roll('');
                          }
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
                      >
                        <option value="">-- Choose Participating Athlete --</option>
                        {registeredStudents.map(s => (
                          <option key={s.rollNo} value={s.rollNo}>
                            {s.name} ({s.rollNo} • {getBranchCode(s.branch)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Student Name</label>
                        <input
                          type="text"
                          value={winner2Name}
                          onChange={(e) => setWinner2Name(e.target.value)}
                          placeholder="Athlete Name"
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Branch</label>
                        <select
                          value={winner2Branch}
                          onChange={(e) => setWinner2Branch(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-bold"
                        >
                          <option value="CSE">CSE Dept</option>
                          <option value="EE">EE Dept</option>
                          <option value="ME">ME Dept</option>
                          <option value="CE">CE Dept</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Mark / Stopwatch Time</label>
                      <input
                        type="text"
                        value={winner2Mark}
                        onChange={(e) => setWinner2Mark(e.target.value)}
                        placeholder="e.g. 11.05s or 5.75m"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* 🥉 3rd Place (Bronze Medal) */}
                  <div className="p-3 bg-amber-900/15 border border-amber-800/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-amber-600 font-black text-xs">
                      <span className="flex items-center gap-1">🥉 3rd Place (Bronze)</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-900/30 text-amber-300 text-[0.62rem]">
                        +{athleticsPointsRule.bronze || 1} Pt
                      </span>
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Select 2nd Runner-Up</label>
                      <select
                        value={winner3Roll || ''}
                        onChange={(e) => {
                          const s = registeredStudents.find(st => st.rollNo === e.target.value);
                          if (s) {
                            setWinner3Roll(s.rollNo);
                            setWinner3Name(s.name);
                            setWinner3Branch(getBranchCode(s.branch));
                          } else {
                            setWinner3Roll('');
                          }
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
                      >
                        <option value="">-- Choose Participating Athlete --</option>
                        {registeredStudents.map(s => (
                          <option key={s.rollNo} value={s.rollNo}>
                            {s.name} ({s.rollNo} • {getBranchCode(s.branch)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Student Name</label>
                        <input
                          type="text"
                          value={winner3Name}
                          onChange={(e) => setWinner3Name(e.target.value)}
                          placeholder="Athlete Name"
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Branch</label>
                        <select
                          value={winner3Branch}
                          onChange={(e) => setWinner3Branch(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-bold"
                        >
                          <option value="CSE">CSE Dept</option>
                          <option value="EE">EE Dept</option>
                          <option value="ME">ME Dept</option>
                          <option value="CE">CE Dept</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[0.6rem] font-bold text-slate-400 uppercase block mb-0.5">Mark / Stopwatch Time</label>
                      <input
                        type="text"
                        value={winner3Mark}
                        onChange={(e) => setWinner3Mark(e.target.value)}
                        placeholder="e.g. 11.20s or 5.60m"
                        className="w-full px-2 py-1 bg-slate-900 border border-amber-900/40 rounded text-xs text-amber-400 font-mono font-bold"
                      />
                    </div>
                  </div>

                </div>

                <div className="text-[0.65rem] text-slate-400 flex items-center justify-between">
                  <span>💡 Tip: You can also click the 🥇, 🥈, 🥉 buttons directly on any row in the participant table below to crown them!</span>
                  <button
                    onClick={() => {
                      setWinner1Name(''); setWinner1Roll(''); setWinner1Mark('');
                      setWinner2Name(''); setWinner2Roll(''); setWinner2Mark('');
                      setWinner3Name(''); setWinner3Roll(''); setWinner3Mark('');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                  >
                    Clear All Winners
                  </button>
                </div>

              </div>
            )}

            {/* Collapsible Metadata Editor Drawer */}
            {showMetadataEditor && (
              <div className="mt-2.5 p-3 bg-slate-800/90 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">Venue / Ground</label>
                  <input
                    type="text"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="e.g. Synthetic Track Oval"
                  />
                </div>
                <div>
                  <label className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">Schedule Timing</label>
                  <input
                    type="text"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="e.g. Day 1 • 09:30 AM"
                  />
                </div>
                <div>
                  <label className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">Meet Record / Standard</label>
                  <input
                    type="text"
                    value={customBenchmark}
                    onChange={(e) => setCustomBenchmark(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="e.g. 10.82s (Record)"
                  />
                </div>
                <div>
                  <label className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">Chief Referee / Convener</label>
                  <input
                    type="text"
                    value={customReferee}
                    onChange={(e) => setCustomReferee(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="e.g. Athletic Board Referees"
                  />
                </div>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* PRINTABLE DOCUMENT CANVAS - ISOLATED & FORMATTED FOR A4 PAPER              */}
          {/* ========================================================================= */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible">
            
            <div 
              id="printable-roster-sheet" 
              className={`print-isolated-sheet bg-white mx-auto shadow-xl rounded-xl sm:rounded-2xl border border-slate-200/90 text-slate-950 font-sans ${
                pageOrientation === 'landscape' ? 'max-w-[1020px]' : 'max-w-[850px]'
              } ${isCompact ? 'p-4 sm:p-6' : 'p-6 sm:p-8'} space-y-4 sm:space-y-5 print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:max-w-none`}
            >

              {/* ------------------------------------------------------------------- */}
              {/* 1. OFFICIAL UNIVERSITY & ATHLETIC BOARD LETTERHEAD                   */}
              {/* ------------------------------------------------------------------- */}
              <div className="border-b-2 border-slate-900 pb-3 text-center relative">
                
                {/* Official College Crest Badge & Watermark motif */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  
                  {/* Left Seal / Emblem */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-900 p-1 flex items-center justify-center shrink-0 bg-white">
                    <div className="w-full h-full rounded-full border border-slate-900 flex flex-col items-center justify-center text-center p-0.5">
                      <Trophy size={16} className="text-slate-900" />
                      <span className="text-[0.45rem] font-black uppercase tracking-tighter text-slate-900 leading-none mt-0.5">GCEK</span>
                      <span className="text-[0.38rem] font-bold text-slate-600 leading-none">ESTD 2009</span>
                    </div>
                  </div>

                  {/* Centered Authority Letterhead */}
                  <div className="flex-1 px-2">
                    <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-slate-950 leading-tight">
                      {collegeName}, {collegeLocation}
                    </h1>
                    <p className="text-[0.65rem] sm:text-[0.72rem] font-bold uppercase tracking-widest text-slate-700 mt-0.5">
                      Bhawanipatna, Kalahandi, Odisha - 766002 • Established 2009 • Affiliated to BPUT
                    </p>
                    <p className="text-[0.62rem] sm:text-[0.7rem] font-black uppercase tracking-wider text-blue-900 mt-0.5">
                      Department of Physical Education • Annual Athletic Association
                    </p>
                  </div>

                  {/* Right Authentication Crest */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-900 p-1 flex items-center justify-center shrink-0 bg-white">
                    <div className="w-full h-full rounded-full border border-slate-900 flex flex-col items-center justify-center text-center p-0.5">
                      <Award size={16} className="text-slate-900" />
                      <span className="text-[0.45rem] font-black uppercase tracking-tighter text-slate-900 leading-none mt-0.5">OFFICIAL</span>
                      <span className="text-[0.38rem] font-bold text-slate-600 leading-none">{year}</span>
                    </div>
                  </div>

                </div>

                {/* Festival & Document Heading Ribbon */}
                <div className="bg-slate-950 text-white py-1 px-3 rounded-md flex items-center justify-between text-[0.65rem] sm:text-xs font-black uppercase tracking-wider print:bg-slate-900">
                  <span>{festivalName} {year} ANNUAL ATHLETIC MEET & SPORTS EXTRAVAGANZA</span>
                  <span className="font-mono text-[0.62rem] opacity-90">{documentDate}</span>
                </div>

                {/* Document Type Title */}
                <div className="mt-1.5 flex items-center justify-between text-[0.68rem] sm:text-[0.75rem] font-black uppercase text-slate-900 px-1">
                  <span className="text-blue-950 tracking-wide font-black">
                    {templateMode === 'participation' ? 
                      (isMasterAthletics ? 'OFFICIAL ATHLETIC DISCIPLINES PARTICIPATION ROSTER' :
                       isMasterAllSports ? 'OFFICIAL MEET MASTER PARTICIPATION ROSTER' :
                       `OFFICIAL EVENT PARTICIPATION ROSTER: ${selectedSportTitle.toUpperCase()}`) :
                     templateMode === 'results' ? 
                      `OFFICIAL RESULTS DECLARATION & PODIUM CHAMPIONS CERTIFICATION` :
                      `OFFICIAL OFFICIATING SCORE-SHEET & TRIALS RECORD`}
                  </span>
                  <span className="font-mono text-[0.62rem] text-slate-600 font-bold">
                    DOC REF: {documentRefCode}
                  </span>
                </div>

              </div>

              {/* ------------------------------------------------------------------- */}
              {/* 2. RICH EVENT TELEMETRY & SPECIFICATIONS BOX                         */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-900 rounded-lg p-2.5 sm:p-3 bg-slate-50/70 text-slate-900 text-xs font-bold print:bg-white space-y-2">
                
                {/* 4-Tile Event Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left">
                  
                  {/* Tile 1: Discipline */}
                  <div className="border-r border-slate-300 pr-2">
                    <span className="text-slate-500 uppercase block text-[0.6rem] tracking-wider">Discipline / Category</span>
                    <span className="text-sm sm:text-base font-black text-slate-950 uppercase block truncate">
                      {isMasterAthletics ? 'All Athletics (Track & Field)' :
                       isMasterAllSports ? 'All Sports Combined' : selectedSportTitle}
                    </span>
                    <span className="text-[0.62rem] text-blue-900 font-bold block truncate">
                      {isMasterAthletics ? 'Sprint, Relay, Jumps & Throws' :
                       sportObj?.categoryName || 'Annual Sports Discipline'}
                    </span>
                  </div>

                  {/* Tile 2: Division & Gender */}
                  <div className="border-r border-slate-300 pr-2">
                    <span className="text-slate-500 uppercase block text-[0.6rem] tracking-wider">Division / Category</span>
                    <span className="text-xs sm:text-sm font-black text-slate-950 block">
                      {selectedDivision === 'all' ? 'Boys & Girls (Combined)' : selectedDivision}
                    </span>
                    <span className="text-[0.62rem] text-slate-600 block">
                      {selectedBranchFilter === 'all' ? 'All Engineering Branches' : `${selectedBranchFilter} Department Only`}
                    </span>
                  </div>

                  {/* Tile 3: Venue & Schedule Time */}
                  <div className="border-r border-slate-300 pr-2">
                    <span className="text-slate-500 uppercase block text-[0.6rem] tracking-wider">Venue & Schedule</span>
                    <span className="text-xs sm:text-sm font-black text-slate-950 block truncate">
                      {customVenue}
                    </span>
                    <span className="text-[0.62rem] font-mono text-slate-700 block">
                      {customTime}
                    </span>
                  </div>

                  {/* Tile 4: Record Benchmark & Convener */}
                  <div>
                    <span className="text-slate-500 uppercase block text-[0.6rem] tracking-wider">Benchmark / Standard</span>
                    <span className="text-xs sm:text-sm font-black text-blue-900 block truncate">
                      {isNMR ? '★ NEW MEET RECORD (NMR)' : customBenchmark}
                    </span>
                    <span className="text-[0.62rem] text-slate-600 block truncate">
                      Desk: {customReferee}
                    </span>
                  </div>

                </div>

                {/* Sub-bar: Athletes Telemetry & Branch Distribution */}
                <div className="pt-2 border-t border-slate-300 flex flex-wrap items-center justify-between text-[0.65rem] sm:text-[0.7rem] text-slate-800 font-semibold gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-950">
                      Total Participating Students: {registeredStudents.length + (templateMode !== 'results' ? extraBlankRows : 0)}
                    </span>
                    <span className="text-slate-500">
                      ({registeredStudents.length} Confirmed {templateMode !== 'results' && `+ ${extraBlankRows} Spot Entries`})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-bold">Branch Breakdown:</span>
                    <span>CSE: <b className="text-slate-950">{metrics.cse}</b></span>
                    <span>•</span>
                    <span>EE: <b className="text-slate-950">{metrics.ee}</b></span>
                    <span>•</span>
                    <span>ME: <b className="text-slate-950">{metrics.me}</b></span>
                    <span>•</span>
                    <span>CE: <b className="text-slate-950">{metrics.ce}</b></span>
                  </div>
                </div>

              </div>

              {/* ------------------------------------------------------------------- */}
              {/* 3. PODIUM CHAMPIONS VICTORY BANNER (If Results Mode & Winners Set)  */}
              {/* ------------------------------------------------------------------- */}
              {templateMode === 'results' && (winner1Name || winner2Name || winner3Name) && (
                <div className="border-2 border-slate-900 rounded-xl p-3 bg-gradient-to-r from-amber-50 via-white to-amber-50 text-slate-950 print-break-avoid space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900/40 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Crown size={15} className="text-amber-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Official Podium Results & Medal Standings
                      </span>
                    </div>
                    {isNMR && (
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[0.62rem] uppercase tracking-wider border border-amber-400">
                        ★ New Meet Record Established ★
                      </span>
                    )}
                  </div>

                  {/* 3-Column Podium Standings */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    
                    {/* 🥇 Gold */}
                    <div className="p-2 border border-slate-900 rounded-lg bg-amber-100/70">
                      <div className="text-[0.65rem] font-black uppercase text-amber-900 tracking-wider">
                        🥇 1st Place (Gold Medal)
                      </div>
                      <div className="text-xs font-black text-slate-950 uppercase mt-0.5 truncate">
                        {winner1Name || 'Winner Unassigned'}
                      </div>
                      <div className="text-[0.62rem] font-bold text-slate-700">
                        {winner1Roll ? `${winner1Roll} • ` : ''}{winner1Branch} Dept
                      </div>
                      {winner1Mark && (
                        <div className="mt-1 font-mono font-black text-amber-950 text-xs bg-white/80 py-0.5 rounded border border-amber-300">
                          Mark: {winner1Mark}
                        </div>
                      )}
                      <div className="text-[0.6rem] font-bold text-blue-900 mt-0.5">
                        +{athleticsPointsRule.gold || 5} Pts Awarded
                      </div>
                    </div>

                    {/* 🥈 Silver */}
                    <div className="p-2 border border-slate-900 rounded-lg bg-slate-100">
                      <div className="text-[0.65rem] font-black uppercase text-slate-700 tracking-wider">
                        🥈 2nd Place (Silver Medal)
                      </div>
                      <div className="text-xs font-black text-slate-950 uppercase mt-0.5 truncate">
                        {winner2Name || 'Runner-Up Unassigned'}
                      </div>
                      <div className="text-[0.62rem] font-bold text-slate-700">
                        {winner2Roll ? `${winner2Roll} • ` : ''}{winner2Branch} Dept
                      </div>
                      {winner2Mark && (
                        <div className="mt-1 font-mono font-black text-slate-900 text-xs bg-white py-0.5 rounded border border-slate-300">
                          Mark: {winner2Mark}
                        </div>
                      )}
                      <div className="text-[0.6rem] font-bold text-blue-900 mt-0.5">
                        +{athleticsPointsRule.silver || 3} Pts Awarded
                      </div>
                    </div>

                    {/* 🥉 Bronze */}
                    <div className="p-2 border border-slate-900 rounded-lg bg-amber-50">
                      <div className="text-[0.65rem] font-black uppercase text-amber-800 tracking-wider">
                        🥉 3rd Place (Bronze Medal)
                      </div>
                      <div className="text-xs font-black text-slate-950 uppercase mt-0.5 truncate">
                        {winner3Name || '2nd Runner-Up Unassigned'}
                      </div>
                      <div className="text-[0.62rem] font-bold text-slate-700">
                        {winner3Roll ? `${winner3Roll} • ` : ''}{winner3Branch} Dept
                      </div>
                      {winner3Mark && (
                        <div className="mt-1 font-mono font-black text-amber-900 text-xs bg-white py-0.5 rounded border border-amber-300">
                          Mark: {winner3Mark}
                        </div>
                      )}
                      <div className="text-[0.6rem] font-bold text-blue-900 mt-0.5">
                        +{athleticsPointsRule.bronze || 1} Pt Awarded
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* 4. ATHLETES PARTICIPATION & RESULTS TABLE - PRECISION BORDERS       */}
              {/* ------------------------------------------------------------------- */}
              <div className="overflow-x-auto">
                <table className="print-table w-full text-left text-xs border-collapse border-2 border-slate-950">
                  
                  {/* Table Header: Changes with templateMode */}
                  <thead>
                    <tr className="bg-slate-200 text-slate-950 border-b-2 border-slate-950 font-black uppercase text-[0.68rem] tracking-wider print:bg-slate-200">
                      
                      {/* Mode 1: Participation Roster */}
                      {templateMode === 'participation' && (
                        <>
                          <th className="p-2 border-r border-slate-950 w-9 text-center">S.N</th>
                          <th className="p-2 border-r border-slate-950 w-12 text-center">Bib #</th>
                          <th className="p-2 border-r border-slate-950 w-24">Reg / Roll No</th>
                          <th className="p-2 border-r border-slate-950">Athlete Full Name</th>
                          <th className="p-2 border-r border-slate-950 w-24">Branch & Yr</th>
                          <th className="p-2 border-r border-slate-950 w-12 text-center">Div</th>
                          <th className="p-2 border-r border-slate-950">
                            {isMasterAthletics ? 'Participated Athletics Events' : 
                             isMasterAllSports ? 'Registered Meet Events' : 'Discipline'}
                          </th>
                          <th className="p-2 border-r border-slate-950 w-24">Contact Phone</th>
                          <th className="p-2 border-r border-slate-950 w-24 text-center">Result / Award</th>
                          <th className="p-2 w-24 text-center">Athlete Sign</th>
                        </>
                      )}

                      {/* Mode 2: Official Results Sheet */}
                      {templateMode === 'results' && (
                        <>
                          <th className="p-2 border-r border-slate-950 w-24 text-center">Standing</th>
                          <th className="p-2 border-r border-slate-950 w-12 text-center">Bib #</th>
                          <th className="p-2 border-r border-slate-950 w-24">Roll Number</th>
                          <th className="p-2 border-r border-slate-950">Athlete Full Name</th>
                          <th className="p-2 border-r border-slate-950 w-28">Branch (Team)</th>
                          <th className="p-2 border-r border-slate-950 w-24 text-center">Recorded Mark</th>
                          <th className="p-2 border-r border-slate-950 w-20 text-center">Trophy Pts</th>
                          <th className="p-2 w-28 text-center">Convener Sign</th>
                        </>
                      )}

                      {/* Mode 3: Officiating Score Sheet */}
                      {templateMode === 'officiating' && (
                        <>
                          <th className="p-2 border-r border-slate-950 w-9 text-center">S.N</th>
                          <th className="p-2 border-r border-slate-950 w-12 text-center">Bib #</th>
                          <th className="p-2 border-r border-slate-950 w-24">Reg / Roll No</th>
                          <th className="p-2 border-r border-slate-950">Athlete Full Name</th>
                          <th className="p-2 border-r border-slate-950 w-24">Branch & Yr</th>
                          <th className="p-2 border-r border-slate-950 w-12 text-center">Div</th>
                          <th className="p-2 border-r border-slate-950 w-12 text-center">Lane</th>
                          <th className="p-2 border-r border-slate-950 w-20 text-center">Trial 1 / Heat</th>
                          <th className="p-2 border-r border-slate-950 w-20 text-center">Trial 2 / Semi</th>
                          <th className="p-2 border-r border-slate-950 w-20 text-center bg-slate-300/80">Final Mark</th>
                          <th className="p-2 border-r border-slate-950 w-14 text-center">Rank</th>
                          <th className="p-2 w-24 text-center">Referee Sign</th>
                        </>
                      )}

                    </tr>
                  </thead>

                  {/* Table Rows */}
                  <tbody className="divide-y divide-slate-950 font-medium text-slate-900">
                    
                    {/* 1. Verified Participating Students */}
                    {registeredStudents.length > 0 ? (
                      registeredStudents.map((s, idx) => {
                        const bibNo = `BIB-${101 + idx}`;
                        const isBoys = s.gender === 'Boys Division';
                        const rowPadding = isCompact ? 'py-1 px-2' : 'py-2 px-2.5';
                        const branchCode = getBranchCode(s.branch);

                        // Check if this student won 1st, 2nd, or 3rd
                        const is1st = winner1Roll === s.rollNo || (winner1Name && winner1Name.toLowerCase() === s.name?.toLowerCase());
                        const is2nd = winner2Roll === s.rollNo || (winner2Name && winner2Name.toLowerCase() === s.name?.toLowerCase());
                        const is3rd = winner3Roll === s.rollNo || (winner3Name && winner3Name.toLowerCase() === s.name?.toLowerCase());

                        // Relevant events for this athlete
                        const athleticEvents = (s.events || []).filter(e => isAthleticEvent(e));
                        const displayEvents = isMasterAthletics ? athleticEvents : s.events || [];

                        return (
                          <tr 
                            key={s.id || idx} 
                            className={`border-b border-slate-950 transition-colors ${
                              is1st ? 'bg-amber-100/60 font-bold' :
                              is2nd ? 'bg-slate-100/80 font-bold' :
                              is3rd ? 'bg-amber-50/70 font-bold' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            
                            {/* Mode 1: Participation Roster Columns */}
                            {templateMode === 'participation' && (
                              <>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-bold text-xs`}>
                                  {idx + 1}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-mono font-bold text-[0.68rem] text-slate-800`}>
                                  #{101 + idx}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-mono font-bold text-xs text-slate-900`}>
                                  {s.rollNo}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-black text-slate-950 uppercase text-xs`}>
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span>{s.name}</span>
                                      {is1st && <span className="text-amber-700">🥇</span>}
                                      {is2nd && <span className="text-slate-600">🥈</span>}
                                      {is3rd && <span className="text-amber-800">🥉</span>}
                                    </div>

                                    {/* Screen Quick Crown Action Buttons */}
                                    {isIndividualEvent && (
                                      <div className="print:hidden flex items-center gap-0.5 shrink-0">
                                        <button
                                          onClick={() => crownParticipant(s, 1)}
                                          className={`px-1 py-0.2 rounded text-[0.6rem] font-black cursor-pointer ${
                                            is1st ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 hover:bg-amber-100 text-slate-600'
                                          }`}
                                          title="Crown as 1st Place (Gold)"
                                        >
                                          🥇
                                        </button>
                                        <button
                                          onClick={() => crownParticipant(s, 2)}
                                          className={`px-1 py-0.2 rounded text-[0.6rem] font-black cursor-pointer ${
                                            is2nd ? 'bg-slate-300 text-slate-950' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                          }`}
                                          title="Crown as 2nd Place (Silver)"
                                        >
                                          🥈
                                        </button>
                                        <button
                                          onClick={() => crownParticipant(s, 3)}
                                          className={`px-1 py-0.2 rounded text-[0.6rem] font-black cursor-pointer ${
                                            is3rd ? 'bg-amber-800 text-white' : 'bg-slate-100 hover:bg-amber-100 text-slate-600'
                                          }`}
                                          title="Crown as 3rd Place (Bronze)"
                                        >
                                          🥉
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-[0.68rem] font-semibold`}>
                                  {branchCode} <span className="text-slate-500">({s.year || 'Yr'})</span>
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center text-[0.65rem] font-bold`}>
                                  {isBoys ? 'M' : 'W'}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-[0.65rem]`}>
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {displayEvents.length > 0 ? (
                                      displayEvents.map((e, eIdx) => (
                                        <span key={eIdx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-semibold text-[0.62rem] border border-slate-200 print:bg-white print:border-slate-300">
                                          {e}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-400 italic text-[0.6rem]">Registered Athlete</span>
                                    )}
                                  </div>
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-mono text-[0.68rem]`}>
                                  {s.phone || '-'}
                                </td>
                                {/* Result / Award Status */}
                                <td className={`${rowPadding} border-r border-slate-950 text-center text-[0.65rem] font-bold`}>
                                  {is1st ? (
                                    <span className="text-amber-900 font-black">
                                      🥇 1st (Gold) {winner1Mark && `• ${winner1Mark}`}
                                    </span>
                                  ) : is2nd ? (
                                    <span className="text-slate-800 font-black">
                                      🥈 2nd (Silver) {winner2Mark && `• ${winner2Mark}`}
                                    </span>
                                  ) : is3rd ? (
                                    <span className="text-amber-950 font-black">
                                      🥉 3rd (Bronze) {winner3Mark && `• ${winner3Mark}`}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium">Participated</span>
                                  )}
                                </td>
                                <td className={`${rowPadding} text-center`}></td>
                              </>
                            )}

                            {/* Mode 2: Official Results Columns */}
                            {templateMode === 'results' && (
                              <>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-black text-xs`}>
                                  {is1st ? '🥇 1st Place (Gold)' :
                                   is2nd ? '🥈 2nd Place (Silver)' :
                                   is3rd ? '🥉 3rd Place (Bronze)' :
                                   `${idx + 1}th Position`}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-mono font-bold text-[0.68rem]`}>
                                  #{101 + idx}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-mono font-bold text-xs`}>
                                  {s.rollNo}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-black text-slate-950 uppercase text-xs`}>
                                  <div className="flex items-center justify-between gap-1">
                                    <span>{s.name}</span>
                                    {isIndividualEvent && (
                                      <div className="print:hidden flex items-center gap-0.5 shrink-0">
                                        <button
                                          onClick={() => crownParticipant(s, 1)}
                                          className={`px-1 py-0.2 rounded text-[0.6rem] font-black cursor-pointer ${
                                            is1st ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 hover:bg-amber-100 text-slate-600'
                                          }`}
                                          title="1st Place"
                                        >
                                          🥇
                                        </button>
                                        <button
                                          onClick={() => crownParticipant(s, 2)}
                                          className={`px-1 py-0.2 rounded text-[0.6rem] font-black cursor-pointer ${
                                            is2nd ? 'bg-slate-300 text-slate-950' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                          }`}
                                          title="2nd Place"
                                        >
                                          🥈
                                        </button>
                                        <button
                                          onClick={() => crownParticipant(s, 3)}
                                          className={`px-1 py-0.2 rounded text-[0.6rem] font-black cursor-pointer ${
                                            is3rd ? 'bg-amber-800 text-white' : 'bg-slate-100 hover:bg-amber-100 text-slate-600'
                                          }`}
                                          title="3rd Place"
                                        >
                                          🥉
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-[0.68rem] font-semibold`}>
                                  {branchCode} ({s.year || 'Yr'})
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-mono font-bold`}>
                                  {is1st ? (winner1Mark || '-') :
                                   is2nd ? (winner2Mark || '-') :
                                   is3rd ? (winner3Mark || '-') : '-'}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-black`}>
                                  {is1st ? `+${athleticsPointsRule.gold || 5} Pts` :
                                   is2nd ? `+${athleticsPointsRule.silver || 3} Pts` :
                                   is3rd ? `+${athleticsPointsRule.bronze || 1} Pt` : '-'}
                                </td>
                                <td className={`${rowPadding} text-center`}></td>
                              </>
                            )}

                            {/* Mode 3: Officiating Sheet Columns */}
                            {templateMode === 'officiating' && (
                              <>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-bold text-xs`}>
                                  {idx + 1}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-mono font-bold text-[0.68rem] text-slate-800`}>
                                  #{101 + idx}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-mono font-bold text-xs text-slate-900`}>
                                  {s.rollNo}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 font-black text-slate-950 uppercase text-xs`}>
                                  {s.name}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-[0.68rem] font-semibold`}>
                                  {branchCode} <span className="text-slate-500">({s.year || 'Yr'})</span>
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center text-[0.65rem] font-bold`}>
                                  {isBoys ? 'M' : 'W'}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center bg-slate-50/50 font-mono`}>
                                  {is1st ? winner1Mark : is2nd ? winner2Mark : is3rd ? winner3Mark : ''}
                                </td>
                                <td className={`${rowPadding} border-r border-slate-950 text-center font-black`}>
                                  {is1st ? '1st 🥇' : is2nd ? '2nd 🥈' : is3rd ? '3rd 🥉' : ''}
                                </td>
                                <td className={`${rowPadding} text-center`}></td>
                              </>
                            )}

                          </tr>
                        );
                      })
                    ) : (
                      /* Empty list: Render placeholder info if no one registered */
                      <tr>
                        <td colSpan={templateMode === 'participation' ? 10 : templateMode === 'results' ? 8 : 12} className="p-4 text-center text-slate-500 font-bold bg-slate-50/50 print:bg-white">
                          <p className="text-xs font-black uppercase text-slate-700">Official Blank Ground Officiating Template</p>
                          <p className="text-[0.65rem] text-slate-500">No online athlete pre-registrations logged. Complete candidate entries manually on the field below.</p>
                        </td>
                      </tr>
                    )}

                    {/* 2. Extra Blank Spot-Entry Rows for Referees (Only in Participation or Officiating mode) */}
                    {templateMode !== 'results' && Array.from({ length: registeredStudents.length === 0 ? Math.max(8, extraBlankRows) : extraBlankRows }).map((_, i) => {
                      const spotIndex = registeredStudents.length + i + 1;
                      const rowPadding = isCompact ? 'py-1.5 px-2' : 'py-2.5 px-2.5';

                      return (
                        <tr key={`blank-${i}`} className="border-b border-slate-950 bg-slate-50/20">
                          {templateMode === 'participation' && (
                            <>
                              <td className={`${rowPadding} border-r border-slate-950 text-center font-bold text-xs text-slate-400`}>
                                {spotIndex}
                              </td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center font-mono text-[0.65rem] text-slate-400`}>
                                #{100 + spotIndex}
                              </td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300 font-mono text-[0.65rem]`}>
                                [ Spot Entry ]
                              </td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300 text-center`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center text-slate-300`}></td>
                              <td className={`${rowPadding} text-center`}></td>
                            </>
                          )}

                          {templateMode === 'officiating' && (
                            <>
                              <td className={`${rowPadding} border-r border-slate-950 text-center font-bold text-xs text-slate-400`}>
                                {spotIndex}
                              </td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center font-mono text-[0.65rem] text-slate-400`}>
                                #{100 + spotIndex}
                              </td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300 font-mono text-[0.65rem]`}>
                                [ Spot Entry ]
                              </td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-slate-300 text-center`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center bg-slate-50/50`}></td>
                              <td className={`${rowPadding} border-r border-slate-950 text-center`}></td>
                              <td className={`${rowPadding} text-center`}></td>
                            </>
                          )}
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* 5. OFFICIAL OFFICIATING LEGEND & DISQUALIFICATION CODES              */}
              {/* ------------------------------------------------------------------- */}
              <div className="border border-slate-900 rounded-lg p-2.5 bg-slate-50/70 text-[0.62rem] sm:text-[0.68rem] text-slate-900 print:bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-black uppercase tracking-wider text-slate-950">Officiating Legend:</span>
                  <span><b>[ Q ]</b> Qualified</span>
                  <span>•</span>
                  <span><b>[ DNS ]</b> Did Not Start</span>
                  <span>•</span>
                  <span><b>[ DNF ]</b> Did Not Finish</span>
                  <span>•</span>
                  <span><b>[ DQ ]</b> Disqualified</span>
                  <span>•</span>
                  <span><b>[ NMR ]</b> New Meet Record</span>
                  <span>•</span>
                  <span><b>[ 🥇 1st ]</b> 5 Pts</span>
                  <span>•</span>
                  <span><b>[ 🥈 2nd ]</b> 3 Pts</span>
                  <span>•</span>
                  <span><b>[ 🥉 3rd ]</b> 1 Pt</span>
                </div>
                <div className="text-slate-600 font-semibold italic text-[0.6rem]">
                  Protests must be submitted in writing within 15 mins of finish with Convener.
                </div>
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* 6. MULTI-TIER OFFICIAL SIGNATORY BLOCK & AUTHENTICATION SEAL         */}
              {/* ------------------------------------------------------------------- */}
              <div className="pt-8 sm:pt-12 grid grid-cols-4 gap-4 text-center text-[0.68rem] sm:text-xs font-bold text-slate-950 print-break-avoid">
                
                {/* 1. Student Secretary */}
                <div>
                  <div className="border-t-2 border-slate-950 pt-1.5 font-black uppercase text-[0.65rem] sm:text-[0.72rem]">
                    Student Sports Secretary
                  </div>
                  <p className="text-[0.58rem] sm:text-[0.62rem] text-slate-600 font-medium">
                    Field Marshaling & Attendance Checked
                  </p>
                </div>

                {/* 2. Field Referee / Umpire */}
                <div>
                  <div className="border-t-2 border-slate-950 pt-1.5 font-black uppercase text-[0.65rem] sm:text-[0.72rem]">
                    Chief Field Referee / Judge
                  </div>
                  <p className="text-[0.58rem] sm:text-[0.62rem] text-slate-600 font-medium">
                    Times & Winning Marks Certified
                  </p>
                </div>

                {/* 3. Faculty Convener */}
                <div>
                  <div className="border-t-2 border-slate-950 pt-1.5 font-black uppercase text-[0.65rem] sm:text-[0.72rem]">
                    Faculty Sports Convener
                  </div>
                  <p className="text-[0.58rem] sm:text-[0.62rem] text-slate-600 font-medium">
                    Athletic Association Scrutiny
                  </p>
                </div>

                {/* 4. VP Sports / Principal Approval */}
                <div>
                  <div className="border-t-2 border-slate-950 pt-1.5 font-black uppercase text-[0.65rem] sm:text-[0.72rem]">
                    VP Sports / Principal GCEK
                  </div>
                  <p className="text-[0.58rem] sm:text-[0.62rem] text-slate-600 font-medium">
                    Executive Seal & Ratification
                  </p>
                </div>

              </div>

              {/* ------------------------------------------------------------------- */}
              {/* 7. OFFICIAL FOOTER WITH SECURITY TOKEN & PAGE METADATA               */}
              {/* ------------------------------------------------------------------- */}
              <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[0.58rem] sm:text-[0.62rem] text-slate-500 font-mono font-medium">
                <div>
                  CONFIDENTIAL • OFFICIAL ATHLETIC COUNCIL PROPERTY • {collegeName}
                </div>
                <div className="flex items-center gap-2">
                  <span>REF: {documentRefCode}</span>
                  <span>•</span>
                  <span>PAGE 1 OF 1</span>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* BOTTOM PREVIEW BAR (Screen only)                                          */}
          {/* ========================================================================= */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-slate-600 print:hidden shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-800 font-bold">Print Ready:</span>
              <span className="text-slate-500">
                {templateMode === 'participation' ? 'Athletics & student participation roll' :
                 templateMode === 'results' ? 'Official certified results declaration sheet' :
                 'Official officiating score-sheet'}
              </span>
              {winner1Name && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[0.62rem] font-black border border-amber-300">
                  🥇 1st: {winner1Name} ({winner1Branch})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 transition font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Official Document</span>
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
