import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sportsData as initialSports } from '../data/sportsData';
import { scheduleData as initialSchedule, leaderboardData as initialLeaderboard, dignitariesData as initialDignitaries } from '../data/scheduleData';
import { supabase, uploadImageToSupabase } from '../lib/supabaseClient';

const AppContext = createContext();

function sanitizePhotoUrl(url, fallback = '/assets/images/hero_sports_banner_1786976961106.png') {
  if (!url || typeof url !== 'string' || url.startsWith('blob:')) {
    return fallback;
  }
  return url;
}

function normalizeDignitariesStructure(parsed) {
  if (!parsed) return initialDignitaries;

  let t1 = [], t2 = [], t3 = [];
  if (Array.isArray(parsed)) {
    parsed.forEach(item => {
      const tier = (item.tier || '').toLowerCase();
      const person = {
        name: item.name,
        role: item.role,
        dept: item.dept || item.designation || '',
        image: sanitizePhotoUrl(item.image, '/assets/images/gcek_principal_vp_1786977233454.png'),
        quote: item.quote || `${item.role} at GCEK Sports Society.`
      };
      if (tier === 'tier1' || tier === 'leadership') t1.push(person);
      else if (tier === 'tier2' || tier === 'patrons') t2.push(person);
      else t3.push(person);
    });
  } else if (typeof parsed === 'object') {
    t1 = parsed.tier1 || parsed.leadership || [];
    t2 = parsed.tier2 || parsed.patrons || [];
    t3 = parsed.tier3 || parsed.coordinators || [];
  }

  if (!t1.length && !t2.length && !t3.length) return initialDignitaries;

  const res = {
    tier1: (t1.length ? t1 : initialDignitaries.tier1 || []).map(p => ({
      ...p,
      image: sanitizePhotoUrl(p.image, '/assets/images/gcek_principal_vp_1786977233454.png')
    })),
    tier2: (t2.length ? t2 : initialDignitaries.tier2 || []).map(p => ({
      ...p,
      image: sanitizePhotoUrl(p.image, '/assets/images/gcek_principal_vp_1786977233454.png')
    })),
    tier3: (t3.length ? t3 : initialDignitaries.tier3 || []).map(p => ({
      ...p,
      image: sanitizePhotoUrl(p.image, '/assets/images/sports_secretary_action_1786977259887.png')
    }))
  };

  // Provide backward-compatible aliases
  res.leadership = res.tier1;
  res.patrons = res.tier2;
  res.coordinators = res.tier3;

  return res;
}

export function AppProvider({ children }) {
  // Website General Settings State
  const [year, setYear] = useState(() => localStorage.getItem('aahwan_year') || localStorage.getItem('AWAHAAN_year') || '2026');
  const [festivalName, setFestivalName] = useState(() => localStorage.getItem('aahwan_name') || localStorage.getItem('AWAHAAN_name') || 'AAHWAN');
  const [collegeName, setCollegeName] = useState(() => localStorage.getItem('aahwan_college') || localStorage.getItem('AWAHAAN_college') || 'GOVERNMENT COLLEGE OF ENGINEERING');
  const [collegeLocation, setCollegeLocation] = useState(() => localStorage.getItem('aahwan_location') || localStorage.getItem('AWAHAAN_location') || 'KALAHANDI');
  const [campusAddress, setCampusAddress] = useState('Bhawanipatna, Kalahandi, Odisha - 766002');
  const [helplinePhone, setHelplinePhone] = useState(() => localStorage.getItem('aahwan_phone') || localStorage.getItem('AWAHAAN_phone') || '+91 6765 220011');
  const [helplineEmail, setHelplineEmail] = useState(() => localStorage.getItem('aahwan_email') || localStorage.getItem('AWAHAAN_email') || 'sports@gcekbpatna.ac.in');

  // Home Page Counter Stats States
  const [statSportsCount, setStatSportsCount] = useState(() => localStorage.getItem('aahwan_stat_sports') || localStorage.getItem('AWAHAAN_stat_sports') || '20+');
  const [statAthletesCount, setStatAthletesCount] = useState(() => localStorage.getItem('aahwan_stat_athletes') || localStorage.getItem('AWAHAAN_stat_athletes') || '800+');
  const [statStreamsCount, setStatStreamsCount] = useState(() => localStorage.getItem('aahwan_stat_streams') || localStorage.getItem('AWAHAAN_stat_streams') || '4');
  const [statDaysCount, setStatDaysCount] = useState(() => localStorage.getItem('aahwan_stat_days') || localStorage.getItem('AWAHAAN_stat_days') || '3');

  // Dynamic Data States (Sanitized against broken blob: URLs from Netlify/local storage)
  const [dignitaries, setDignitaries] = useState(() => {
    const saved = localStorage.getItem('aahwan_dignitaries') || localStorage.getItem('AWAHAAN_dignitaries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeDignitariesStructure(parsed);
      } catch (e) {
        console.warn('Failed to parse dignitaries:', e);
      }
    }
    return normalizeDignitariesStructure(initialDignitaries);
  });

  const [sports, setSports] = useState(() => {
    const saved = localStorage.getItem('aahwan_sports') || localStorage.getItem('AWAHAAN_sports');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        // Ensure canonical sports like Tug of War exist in local state
        initialSports.forEach(initSport => {
          const exists = parsed.some(s => s.id === initSport.id || (s.title && s.title.toLowerCase() === initSport.title.toLowerCase()));
          if (!exists) {
            parsed.push(initSport);
          }
        });
        // Sync default division rules for the canonical roster
        parsed = parsed.map(s => {
          const initMatch = initialSports.find(init => init.id === s.id || (init.title && init.title.toLowerCase() === (s.title || '').toLowerCase()));
          return {
            ...s,
            division: s.division || (initMatch ? initMatch.division : 'both'),
            divisionName: s.divisionName || (initMatch ? initMatch.divisionName : 'Boys & Girls Divisions'),
            image: sanitizePhotoUrl(s.image, '/assets/images/hero_sports_banner_1786976961106.png')
          };
        });
        return parsed;
      } catch (e) {
        console.warn('Failed to parse sports:', e);
      }
    }
    return initialSports;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('aahwan_schedule') || localStorage.getItem('AWAHAAN_schedule');
    return saved ? JSON.parse(saved) : initialSchedule;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('aahwan_leaderboard') || localStorage.getItem('AWAHAAN_leaderboard');
    return saved ? JSON.parse(saved) : initialLeaderboard;
  });

  // Custom Point Weighting Rules (Admin Managed)
  // Athletics: 1st=5, 2nd=3, 3rd=1
  // Team Games: 1st=8, 2nd=5, 3rd=0 (No 3rd place points)
  const [teamPointsRule, setTeamPointsRule] = useState(() => {
    const saved = localStorage.getItem('aahwan_team_points_rule');
    return saved ? JSON.parse(saved) : { gold: 8, silver: 5, bronze: 0 };
  });

  const [athleticsPointsRule, setAthleticsPointsRule] = useState(() => {
    const saved = localStorage.getItem('aahwan_ath_points_rule');
    return saved ? JSON.parse(saved) : { gold: 5, silver: 3, bronze: 1 };
  });

  // Per-Sport Winner Assignments State ({ [sportId]: { day: 1|2|3, first: 'CSE', second: 'EE', third: 'ME' } })
  const [sportWinners, setSportWinners] = useState(() => {
    const saved = localStorage.getItem('aahwan_sport_winners');
    return saved ? JSON.parse(saved) : {
      'sport-100m': { day: 1, first: 'CSE', second: 'EE', third: 'ME' },
      'sport-200m': { day: 1, first: 'EE', second: 'CSE', third: 'CE' },
      'sport-400m': { day: 1, first: 'CSE', second: 'ME', third: 'EE' },
      'sport-longjump': { day: 1, first: 'ME', second: 'CSE', third: 'CE' },
      'sport-cricket': { day: 1, first: 'CSE', second: 'ME', third: '' }, // Team: 1st=8, 2nd=5, 3rd=0
      'sport-football': { day: 2, first: 'EE', second: 'CE', third: '' },  // Team: 1st=8, 2nd=5, 3rd=0
      'sport-volleyball': { day: 2, first: 'CSE', second: 'EE', third: '' },// Team: 1st=8, 2nd=5, 3rd=0
      'sport-kabaddi': { day: 2, first: 'ME', second: 'CSE', third: '' },   // Team: 1st=8, 2nd=5, 3rd=0
      'sport-chess': { day: 2, first: 'CSE', second: 'EE', third: 'ME' },
      'sport-badminton': { day: 3, first: 'EE', second: 'CSE', third: 'CE' },
      'sport-relay': { day: 3, first: 'CSE', second: 'ME', third: '' }     // Team: 1st=8, 2nd=5, 3rd=0
    };
  });

  // Per-Day Medal Progression State (Athletics vs Team Sports)
  const [dailyMedals, setDailyMedals] = useState(() => {
    const saved = localStorage.getItem('aahwan_daily_medals') || localStorage.getItem('AWAHAAN_daily_medals');
    return saved ? JSON.parse(saved) : {
      1: [
        { code: 'CSE', branchName: 'Computer Science & Engg', athGold: 3, athSilver: 1, athBronze: 1, teamGold: 1, teamSilver: 0, teamBronze: 0 },
        { code: 'EE', branchName: 'Electrical Engineering', athGold: 2, athSilver: 2, athBronze: 1, teamGold: 0, teamSilver: 1, teamBronze: 0 },
        { code: 'ME', branchName: 'Mechanical Engineering', athGold: 1, athSilver: 2, athBronze: 1, teamGold: 0, teamSilver: 0, teamBronze: 1 },
        { code: 'CE', branchName: 'Civil Engineering', athGold: 1, athSilver: 0, athBronze: 2, teamGold: 0, teamSilver: 0, teamBronze: 0 }
      ],
      2: [
        { code: 'CSE', branchName: 'Computer Science & Engg', athGold: 3, athSilver: 2, athBronze: 1, teamGold: 1, teamSilver: 1, teamBronze: 0 },
        { code: 'EE', branchName: 'Electrical Engineering', athGold: 2, athSilver: 2, athBronze: 2, teamGold: 1, teamSilver: 0, teamBronze: 1 },
        { code: 'ME', branchName: 'Mechanical Engineering', athGold: 2, athSilver: 2, athBronze: 1, teamGold: 0, teamSilver: 1, teamBronze: 0 },
        { code: 'CE', branchName: 'Civil Engineering', athGold: 1, athSilver: 2, athBronze: 2, teamGold: 0, teamSilver: 0, teamBronze: 1 }
      ],
      3: [
        { code: 'CSE', branchName: 'Computer Science & Engg', athGold: 2, athSilver: 1, athBronze: 1, teamGold: 1, teamSilver: 0, teamBronze: 0 },
        { code: 'EE', branchName: 'Electrical Engineering', athGold: 2, athSilver: 1, athBronze: 1, teamGold: 0, teamSilver: 1, teamBronze: 0 },
        { code: 'ME', branchName: 'Mechanical Engineering', athGold: 1, athSilver: 2, athBronze: 0, teamGold: 1, teamSilver: 0, teamBronze: 0 },
        { code: 'CE', branchName: 'Civil Engineering', athGold: 1, athSilver: 1, athBronze: 1, teamGold: 0, teamSilver: 0, teamBronze: 1 }
      ]
    };
  });

  // Photo Highlights Gallery State
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = localStorage.getItem('aahwan_gallery') || localStorage.getItem('AWAHAAN_gallery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return (parsed || []).map(p => ({
          ...p,
          image: sanitizePhotoUrl(p.image, '/assets/images/hero_sports_banner_1786976961106.png')
        })).filter(p => p.image && !p.image.startsWith('blob:'));
      } catch (e) {
        console.warn('Failed to parse gallery photos:', e);
      }
    }
    return [
      {
        id: 'gal-1',
        title: 'Athletics Track & 100m Sprint Heats',
        category: 'Athletics',
        image: '/assets/images/hero_sports_banner_1786976961106.png',
        timestamp: 'Day 1'
      },
      {
        id: 'gal-2',
        title: 'Inter-Branch Cricket Championship',
        category: 'Team Sports',
        image: '/assets/images/cricket_football_action_1786976997763.png',
        timestamp: 'Day 1'
      },
      {
        id: 'gal-3',
        title: 'Kabaddi & Volleyball Arena Highlights',
        category: 'Team Sports',
        image: '/assets/images/indoor_team_sports_1786977084385.png',
        timestamp: 'Day 2'
      },
      {
        id: 'gal-4',
        title: 'Principal & Dignitaries Opening March Past',
        category: 'Ceremony',
        image: '/assets/images/gcek_principal_vp_1786977233454.png',
        timestamp: 'Day 1'
      },
      {
        id: 'gal-5',
        title: 'Student Athletes & Mind Chess Tournament',
        category: 'Indoor Games',
        image: '/assets/images/sports_secretary_action_1786977259887.png',
        timestamp: 'Day 2'
      }
    ];
  });

  // Student Registrations State
  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem('AWAHAAN_registrations');
    return saved ? JSON.parse(saved) : [
      {
        id: 'reg-101',
        rollNo: '2101105012',
        name: 'Aakash Mohanty',
        branch: 'Computer Science & Engg',
        year: '3rd Year',
        gender: 'Boys Division',
        phone: '+91 98765 43210',
        email: 'aakash.cse@gcek.ac.in',
        events: ['100m Sprint', '4 x 400m Relay Race', 'Cricket Tournament'],
        timestamp: '2026-08-17T10:30:00.000Z'
      },
      {
        id: 'reg-102',
        rollNo: '2201105045',
        name: 'Priyanka Sahoo',
        branch: 'Electrical Engineering',
        year: '2nd Year',
        gender: 'Girls Division',
        phone: '+91 91234 56789',
        email: 'priyanka.ee@gcek.ac.in',
        events: ['200m Sprint', 'Long Jump', 'Badminton Championship'],
        timestamp: '2026-08-17T11:15:00.000Z'
      },
      {
        id: 'reg-103',
        rollNo: '2001105089',
        name: 'Rohan Kumar Das',
        branch: 'Mechanical Engineering',
        year: '4th Year',
        gender: 'Boys Division',
        phone: '+91 99887 76655',
        email: 'rohan.me@gcek.ac.in',
        events: ['Shot Put Throw', 'Discus Throw', 'Kabaddi League'],
        timestamp: '2026-08-17T12:00:00.000Z'
      }
    ];
  });

  // Equipment Inventory & Issue/Return Register State
  const [equipmentList, setEquipmentList] = useState(() => {
    const saved = localStorage.getItem('aahwan_equipment');
    return saved ? JSON.parse(saved) : [
      { id: 'eq-1', name: 'Cricket Tournament Bats', category: 'Cricket', totalQty: 12, condition: 'Good Condition', location: 'Main Sports Store', notes: 'SS English Willow' },
      { id: 'eq-2', name: 'Cricket Leather Balls', category: 'Cricket', totalQty: 30, condition: 'New Pack', location: 'Store Box 2', notes: 'SG Red Leather' },
      { id: 'eq-3', name: 'Match Footballs (Nivia)', category: 'Football', totalQty: 15, condition: 'Good Condition', location: 'Main Sports Store', notes: 'Size 5 Match Balls' },
      { id: 'eq-4', name: 'Volleyballs (Mikasa)', category: 'Volleyball', totalQty: 10, condition: 'Good Condition', location: 'Store Box 1', notes: 'Tournament Approved' },
      { id: 'eq-5', name: 'Badminton Rackets', category: 'Badminton', totalQty: 16, condition: 'Good Condition', location: 'Indoor Store', notes: 'Yonex Graphite' },
      { id: 'eq-6', name: 'Mavis 350 Shuttlecocks', category: 'Badminton', totalQty: 40, condition: 'New Pack', location: 'Indoor Store', notes: 'Nylon Shuttles' },
      { id: 'eq-7', name: 'Chess Wooden Sets', category: 'Indoor Games', totalQty: 8, condition: 'Good Condition', location: 'Indoor Hall', notes: 'Tournament Boards' }
    ];
  });

  const [equipmentLogs, setEquipmentLogs] = useState(() => {
    const saved = localStorage.getItem('aahwan_equipment_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'iss-101',
        equipmentId: 'eq-1',
        equipmentName: 'Cricket Tournament Bats',
        borrowerName: 'Swagat Parida',
        rollNo: '2201105012',
        branch: 'CSE',
        qty: 2,
        status: 'issued',
        issueDate: '2026-08-30 09:30 AM',
        returnDate: null,
        returnCondition: null,
        notes: 'Inter-branch practice session'
      },
      {
        id: 'iss-102',
        equipmentId: 'eq-3',
        equipmentName: 'Match Footballs (Nivia)',
        borrowerName: 'Priyanka Sahoo',
        rollNo: '2201105045',
        branch: 'EE',
        qty: 1,
        status: 'returned',
        issueDate: '2026-08-29 02:00 PM',
        returnDate: '2026-08-29 05:30 PM',
        returnCondition: 'Good Condition',
        notes: 'Girls Football semi-finals'
      }
    ];
  });

  // View Mode State: 'public' | 'admin-login' | 'admin-dashboard'
  const [viewMode, setViewMode] = useState(() => {
    const session = localStorage.getItem('aahwan_admin_session') || localStorage.getItem('AWAHAAN_admin_session');
    const savedView = localStorage.getItem('aahwan_view_mode');
    if (session === 'true') {
      return savedView === 'public' ? 'public' : 'admin-dashboard';
    }
    return savedView || 'public';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const session = localStorage.getItem('aahwan_admin_session') || localStorage.getItem('AWAHAAN_admin_session');
    return session === 'true';
  });

  // Keep admin session & viewMode in sync with localStorage on state changes
  useEffect(() => {
    if (isAdminLoggedIn) {
      localStorage.setItem('aahwan_admin_session', 'true');
      localStorage.setItem('AWAHAAN_admin_session', 'true');
    } else {
      localStorage.removeItem('aahwan_admin_session');
      localStorage.removeItem('AWAHAAN_admin_session');
    }
    localStorage.setItem('aahwan_view_mode', viewMode);
  }, [isAdminLoggedIn, viewMode]);

  const [showStudentRegistration, setShowStudentRegistration] = useState(false);

  // Cloud Sync Status Tracking
  const isCloudLoadedRef = useRef(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  // Manual & Programmatic save to Supabase site_settings
  const saveToCloud = async (customOverrides = {}) => {
    if (!supabase) {
      console.warn('Supabase client is not connected.');
      return { success: false, error: 'Supabase client is not configured' };
    }
    try {
      setCloudSyncStatus('syncing');
      const payload = {
        year: customOverrides.year !== undefined ? customOverrides.year : year,
        festivalName: customOverrides.festivalName !== undefined ? customOverrides.festivalName : festivalName,
        collegeName: customOverrides.collegeName !== undefined ? customOverrides.collegeName : collegeName,
        collegeLocation: customOverrides.collegeLocation !== undefined ? customOverrides.collegeLocation : collegeLocation,
        helplinePhone: customOverrides.helplinePhone !== undefined ? customOverrides.helplinePhone : helplinePhone,
        helplineEmail: customOverrides.helplineEmail !== undefined ? customOverrides.helplineEmail : helplineEmail,
        statSportsCount: customOverrides.statSportsCount !== undefined ? customOverrides.statSportsCount : statSportsCount,
        statAthletesCount: customOverrides.statAthletesCount !== undefined ? customOverrides.statAthletesCount : statAthletesCount,
        statStreamsCount: customOverrides.statStreamsCount !== undefined ? customOverrides.statStreamsCount : statStreamsCount,
        statDaysCount: customOverrides.statDaysCount !== undefined ? customOverrides.statDaysCount : statDaysCount,
        sports: customOverrides.sports !== undefined ? customOverrides.sports : sports,
        dignitaries: customOverrides.dignitaries !== undefined ? customOverrides.dignitaries : dignitaries,
        schedule: customOverrides.schedule !== undefined ? customOverrides.schedule : schedule,
        leaderboard: customOverrides.leaderboard !== undefined ? customOverrides.leaderboard : leaderboard,
        galleryPhotos: customOverrides.galleryPhotos !== undefined ? customOverrides.galleryPhotos : galleryPhotos,
        sportWinners: customOverrides.sportWinners !== undefined ? customOverrides.sportWinners : sportWinners,
        dailyMedals: customOverrides.dailyMedals !== undefined ? customOverrides.dailyMedals : dailyMedals,
        teamPointsRule: customOverrides.teamPointsRule !== undefined ? customOverrides.teamPointsRule : teamPointsRule,
        athleticsPointsRule: customOverrides.athleticsPointsRule !== undefined ? customOverrides.athleticsPointsRule : athleticsPointsRule,
        equipmentList: customOverrides.equipmentList !== undefined ? customOverrides.equipmentList : equipmentList,
        equipmentLogs: customOverrides.equipmentLogs !== undefined ? customOverrides.equipmentLogs : equipmentLogs
      };

      const { error } = await supabase.from('site_settings').upsert({
        id: 'global_config',
        config: payload,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.warn('Manual saveToCloud error:', error.message);
        setCloudSyncStatus('error');
        return { success: false, error: error.message };
      }

      setCloudSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString());
      return { success: true };
    } catch (err) {
      console.warn('saveToCloud exception:', err);
      setCloudSyncStatus('error');
      return { success: false, error: err.message };
    }
  };

  // Fetch global config & registrations from Supabase Cloud on mount
  useEffect(() => {
    if (!supabase) {
      isCloudLoadedRef.current = true;
      return;
    }

    async function loadCloudConfig() {
      try {
        setCloudSyncStatus('syncing');

        // 1. Fetch site_settings (master branding, sports, schedule, dignitaries, rules, inventory)
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'global_config')
          .single();

        if (!error && data?.config) {
          const cfg = data.config;
          if (cfg.year) { setYear(cfg.year); localStorage.setItem('aahwan_year', cfg.year); localStorage.setItem('AWAHAAN_year', cfg.year); }
          if (cfg.festivalName) { setFestivalName(cfg.festivalName); localStorage.setItem('aahwan_name', cfg.festivalName); localStorage.setItem('AWAHAAN_name', cfg.festivalName); }
          if (cfg.collegeName) { setCollegeName(cfg.collegeName); localStorage.setItem('aahwan_college', cfg.collegeName); localStorage.setItem('AWAHAAN_college', cfg.collegeName); }
          if (cfg.collegeLocation) { setCollegeLocation(cfg.collegeLocation); localStorage.setItem('aahwan_location', cfg.collegeLocation); localStorage.setItem('AWAHAAN_location', cfg.collegeLocation); }
          if (cfg.helplinePhone) { setHelplinePhone(cfg.helplinePhone); localStorage.setItem('aahwan_phone', cfg.helplinePhone); localStorage.setItem('AWAHAAN_phone', cfg.helplinePhone); }
          if (cfg.helplineEmail) { setHelplineEmail(cfg.helplineEmail); localStorage.setItem('aahwan_email', cfg.helplineEmail); localStorage.setItem('AWAHAAN_email', cfg.helplineEmail); }
          if (cfg.statSportsCount) { setStatSportsCount(cfg.statSportsCount); localStorage.setItem('aahwan_stat_sports', cfg.statSportsCount); localStorage.setItem('AWAHAAN_stat_sports', cfg.statSportsCount); }
          if (cfg.statAthletesCount) { setStatAthletesCount(cfg.statAthletesCount); localStorage.setItem('aahwan_stat_athletes', cfg.statAthletesCount); localStorage.setItem('AWAHAAN_stat_athletes', cfg.statAthletesCount); }
          if (cfg.statStreamsCount) { setStatStreamsCount(cfg.statStreamsCount); localStorage.setItem('aahwan_stat_streams', cfg.statStreamsCount); localStorage.setItem('AWAHAAN_stat_streams', cfg.statStreamsCount); }
          if (cfg.statDaysCount) { setStatDaysCount(cfg.statDaysCount); localStorage.setItem('aahwan_stat_days', cfg.statDaysCount); localStorage.setItem('AWAHAAN_stat_days', cfg.statDaysCount); }
          if (cfg.sports && Array.isArray(cfg.sports) && cfg.sports.length > 0) {
            setSports(cfg.sports);
            localStorage.setItem('aahwan_sports', JSON.stringify(cfg.sports));
            localStorage.setItem('AWAHAAN_sports', JSON.stringify(cfg.sports));
          }
          if (cfg.dignitaries) {
            const normalized = normalizeDignitariesStructure(cfg.dignitaries);
            setDignitaries(normalized);
            localStorage.setItem('aahwan_dignitaries', JSON.stringify(normalized));
            localStorage.setItem('AWAHAAN_dignitaries', JSON.stringify(normalized));
          }
          if (cfg.schedule) {
            setSchedule(cfg.schedule);
            localStorage.setItem('aahwan_schedule', JSON.stringify(cfg.schedule));
            localStorage.setItem('AWAHAAN_schedule', JSON.stringify(cfg.schedule));
          }
          if (cfg.leaderboard) {
            setLeaderboard(cfg.leaderboard);
            localStorage.setItem('aahwan_leaderboard', JSON.stringify(cfg.leaderboard));
            localStorage.setItem('AWAHAAN_leaderboard', JSON.stringify(cfg.leaderboard));
          }
          if (cfg.galleryPhotos) {
            setGalleryPhotos(cfg.galleryPhotos);
            localStorage.setItem('aahwan_gallery', JSON.stringify(cfg.galleryPhotos));
            localStorage.setItem('AWAHAAN_gallery', JSON.stringify(cfg.galleryPhotos));
          }
          if (cfg.sportWinners) {
            setSportWinners(cfg.sportWinners);
            localStorage.setItem('aahwan_sport_winners', JSON.stringify(cfg.sportWinners));
            localStorage.setItem('AWAHAAN_sport_winners', JSON.stringify(cfg.sportWinners));
          }
          if (cfg.dailyMedals) {
            setDailyMedals(cfg.dailyMedals);
            localStorage.setItem('aahwan_daily_medals', JSON.stringify(cfg.dailyMedals));
            localStorage.setItem('AWAHAAN_daily_medals', JSON.stringify(cfg.dailyMedals));
          }
          if (cfg.teamPointsRule) {
            setTeamPointsRule(cfg.teamPointsRule);
            localStorage.setItem('aahwan_team_points_rule', JSON.stringify(cfg.teamPointsRule));
            localStorage.setItem('AWAHAAN_team_points_rule', JSON.stringify(cfg.teamPointsRule));
          }
          if (cfg.athleticsPointsRule) {
            setAthleticsPointsRule(cfg.athleticsPointsRule);
            localStorage.setItem('aahwan_ath_points_rule', JSON.stringify(cfg.athleticsPointsRule));
            localStorage.setItem('AWAHAAN_ath_points_rule', JSON.stringify(cfg.athleticsPointsRule));
          }
          if (cfg.equipmentList && Array.isArray(cfg.equipmentList)) {
            setEquipmentList(cfg.equipmentList);
            localStorage.setItem('aahwan_equipment', JSON.stringify(cfg.equipmentList));
          }
          if (cfg.equipmentLogs && Array.isArray(cfg.equipmentLogs)) {
            setEquipmentLogs(cfg.equipmentLogs);
            localStorage.setItem('aahwan_equipment_logs', JSON.stringify(cfg.equipmentLogs));
          }
        }

        // 2. Fetch student registrations from Supabase registrations table
        const { data: cloudRegs, error: regError } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!regError && cloudRegs && cloudRegs.length > 0) {
          const mapped = cloudRegs.map(r => ({
            id: r.id,
            rollNo: r.roll_no,
            name: r.name,
            branch: r.branch,
            year: r.year,
            gender: r.gender,
            phone: r.phone,
            email: r.email,
            events: Array.isArray(r.events) ? r.events : (typeof r.events === 'string' ? JSON.parse(r.events) : []),
            timestamp: r.created_at
          }));
          setRegistrations(mapped);
          localStorage.setItem('aahwan_registrations', JSON.stringify(mapped));
          localStorage.setItem('AWAHAAN_registrations', JSON.stringify(mapped));
        }

        setCloudSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn('Cloud config load bypassed:', err);
        setCloudSyncStatus('error');
      } finally {
        isCloudLoadedRef.current = true;
      }
    }

    loadCloudConfig();

    // Subscribe to Realtime Cloud changes on site_settings
    const settingsChannel = supabase
      .channel('public:site_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.new && payload.new.config) {
          const cfg = payload.new.config;
          if (cfg.festivalName) {
            setFestivalName(cfg.festivalName);
            localStorage.setItem('aahwan_name', cfg.festivalName);
            localStorage.setItem('AWAHAAN_name', cfg.festivalName);
          }
          if (cfg.collegeName) {
            setCollegeName(cfg.collegeName);
            localStorage.setItem('aahwan_college', cfg.collegeName);
            localStorage.setItem('AWAHAAN_college', cfg.collegeName);
          }
          if (cfg.year) {
            setYear(cfg.year);
            localStorage.setItem('aahwan_year', cfg.year);
            localStorage.setItem('AWAHAAN_year', cfg.year);
          }
          if (cfg.collegeLocation) {
            setCollegeLocation(cfg.collegeLocation);
            localStorage.setItem('aahwan_location', cfg.collegeLocation);
            localStorage.setItem('AWAHAAN_location', cfg.collegeLocation);
          }
          if (cfg.helplinePhone) setHelplinePhone(cfg.helplinePhone);
          if (cfg.helplineEmail) setHelplineEmail(cfg.helplineEmail);
          if (cfg.statSportsCount) setStatSportsCount(cfg.statSportsCount);
          if (cfg.statAthletesCount) setStatAthletesCount(cfg.statAthletesCount);
          if (cfg.statStreamsCount) setStatStreamsCount(cfg.statStreamsCount);
          if (cfg.statDaysCount) setStatDaysCount(cfg.statDaysCount);
          if (cfg.sports && Array.isArray(cfg.sports)) setSports(cfg.sports);
          if (cfg.dignitaries) {
            const normalized = normalizeDignitariesStructure(cfg.dignitaries);
            setDignitaries(normalized);
            localStorage.setItem('aahwan_dignitaries', JSON.stringify(normalized));
            localStorage.setItem('AWAHAAN_dignitaries', JSON.stringify(normalized));
          }
          if (cfg.schedule) setSchedule(cfg.schedule);
          if (cfg.leaderboard) setLeaderboard(cfg.leaderboard);
          if (cfg.galleryPhotos) setGalleryPhotos(cfg.galleryPhotos);
          if (cfg.sportWinners) setSportWinners(cfg.sportWinners);
          if (cfg.dailyMedals) setDailyMedals(cfg.dailyMedals);
          if (cfg.teamPointsRule) setTeamPointsRule(cfg.teamPointsRule);
          if (cfg.athleticsPointsRule) setAthleticsPointsRule(cfg.athleticsPointsRule);
          if (cfg.equipmentList && Array.isArray(cfg.equipmentList)) setEquipmentList(cfg.equipmentList);
          if (cfg.equipmentLogs && Array.isArray(cfg.equipmentLogs)) setEquipmentLogs(cfg.equipmentLogs);
          setLastSyncedTime(new Date().toLocaleTimeString());
        }
      })
      .subscribe();

    // Subscribe to Realtime Cloud changes on registrations (instantly displays new students in Admin Panel)
    const registrationsChannel = supabase
      .channel('public:registrations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const r = payload.new;
          const incoming = {
            id: r.id,
            rollNo: r.roll_no,
            name: r.name,
            branch: r.branch,
            year: r.year,
            gender: r.gender,
            phone: r.phone,
            email: r.email,
            events: Array.isArray(r.events) ? r.events : (typeof r.events === 'string' ? JSON.parse(r.events) : []),
            timestamp: r.created_at
          };
          setRegistrations(prev => {
            if (prev.some(x => x.id === incoming.id || (x.rollNo === incoming.rollNo && x.name === incoming.name))) {
              return prev;
            }
            const updated = [incoming, ...prev];
            localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
            localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setRegistrations(prev => {
            const updated = prev.filter(r => r.id !== payload.old.id);
            localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
            localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(registrationsChannel);
    };
  }, []);

  // Sync to LocalStorage immediately and Cloud Database (Debounced to prevent flickering)
  useEffect(() => {
    localStorage.setItem('aahwan_year', year);
    localStorage.setItem('AWAHAAN_year', year);

    localStorage.setItem('aahwan_name', festivalName);
    localStorage.setItem('AWAHAAN_name', festivalName);

    localStorage.setItem('aahwan_college', collegeName);
    localStorage.setItem('AWAHAAN_college', collegeName);

    localStorage.setItem('aahwan_location', collegeLocation);
    localStorage.setItem('AWAHAAN_location', collegeLocation);

    localStorage.setItem('aahwan_phone', helplinePhone);
    localStorage.setItem('AWAHAAN_phone', helplinePhone);

    localStorage.setItem('aahwan_email', helplineEmail);
    localStorage.setItem('AWAHAAN_email', helplineEmail);

    localStorage.setItem('aahwan_stat_sports', statSportsCount);
    localStorage.setItem('AWAHAAN_stat_sports', statSportsCount);

    localStorage.setItem('aahwan_stat_athletes', statAthletesCount);
    localStorage.setItem('AWAHAAN_stat_athletes', statAthletesCount);

    localStorage.setItem('aahwan_stat_streams', statStreamsCount);
    localStorage.setItem('AWAHAAN_stat_streams', statStreamsCount);

    localStorage.setItem('aahwan_stat_days', statDaysCount);
    localStorage.setItem('AWAHAAN_stat_days', statDaysCount);

    localStorage.setItem('aahwan_team_points_rule', JSON.stringify(teamPointsRule));
    localStorage.setItem('AWAHAAN_team_points_rule', JSON.stringify(teamPointsRule));

    localStorage.setItem('aahwan_ath_points_rule', JSON.stringify(athleticsPointsRule));
    localStorage.setItem('AWAHAAN_ath_points_rule', JSON.stringify(athleticsPointsRule));

    localStorage.setItem('aahwan_sport_winners', JSON.stringify(sportWinners));
    localStorage.setItem('AWAHAAN_sport_winners', JSON.stringify(sportWinners));

    localStorage.setItem('aahwan_daily_medals', JSON.stringify(dailyMedals));
    localStorage.setItem('AWAHAAN_daily_medals', JSON.stringify(dailyMedals));

    localStorage.setItem('aahwan_dignitaries', JSON.stringify(dignitaries));
    localStorage.setItem('AWAHAAN_dignitaries', JSON.stringify(dignitaries));

    localStorage.setItem('aahwan_sports', JSON.stringify(sports));
    localStorage.setItem('AWAHAAN_sports', JSON.stringify(sports));

    localStorage.setItem('aahwan_schedule', JSON.stringify(schedule));
    localStorage.setItem('AWAHAAN_schedule', JSON.stringify(schedule));

    localStorage.setItem('aahwan_leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('AWAHAAN_leaderboard', JSON.stringify(leaderboard));

    localStorage.setItem('aahwan_gallery', JSON.stringify(galleryPhotos));
    localStorage.setItem('AWAHAAN_gallery', JSON.stringify(galleryPhotos));

    localStorage.setItem('aahwan_equipment', JSON.stringify(equipmentList));
    localStorage.setItem('aahwan_equipment_logs', JSON.stringify(equipmentLogs));

    localStorage.setItem('aahwan_registrations', JSON.stringify(registrations));
    localStorage.setItem('AWAHAAN_registrations', JSON.stringify(registrations));

    // Guard: Never overwrite Cloud on initial mount before cloud data has been loaded
    if (!isCloudLoadedRef.current || !supabase || !isAdminLoggedIn) return;

    const timer = setTimeout(() => {
      saveToCloud();
    }, 1200);

    return () => clearTimeout(timer);
  }, [year, festivalName, collegeName, collegeLocation, helplinePhone, helplineEmail, statSportsCount, statAthletesCount, statStreamsCount, statDaysCount, teamPointsRule, athleticsPointsRule, sportWinners, dailyMedals, dignitaries, sports, schedule, leaderboard, galleryPhotos, equipmentList, equipmentLogs, registrations, isAdminLoggedIn]);

  // Winner Assignments & Dynamic Auto-Calculation Engine for Standings
  const assignSportWinner = (sportId, winnerData) => {
    setSportWinners(prev => {
      const nextState = { ...prev, [sportId]: { ...(prev[sportId] || {}), ...winnerData } };
      localStorage.setItem('aahwan_sport_winners', JSON.stringify(nextState));
      return nextState;
    });
  };

  const updateSportCategory = (sportId, newCategory) => {
    setSports(prev => {
      const updated = prev.map(s => s.id === sportId ? { ...s, category: newCategory } : s);
      localStorage.setItem('aahwan_sports', JSON.stringify(updated));
      return updated;
    });
  };

  const getStandings = (dayFilter = 'overall') => {
    const branches = [
      { code: 'CSE', name: 'Computer Science & Engg' },
      { code: 'EE', name: 'Electrical Engineering' },
      { code: 'ME', name: 'Mechanical Engineering' },
      { code: 'CE', name: 'Civil Engineering' }
    ];

    return branches.map(b => {
      let athGold = 0, athSilver = 0, athBronze = 0;
      let teamGold = 0, teamSilver = 0, teamBronze = 0;

      sports.forEach(sport => {
        const winner = sportWinners[sport.id] || sportWinners[sport.title];
        if (!winner) return;

        // Extract day number (default 1)
        const eventDay = winner.day || parseInt((sport.time || '').replace(/[^0-9]/g, '')) || 1;
        if (dayFilter !== 'overall' && parseInt(dayFilter) !== parseInt(eventDay)) return;

        const isTeamSport = sport.category === 'team';

        if (isTeamSport) {
          if (winner.first === b.code) teamGold += 1;
          if (winner.second === b.code) teamSilver += 1;
          // Team Games: NO 3rd place points!
        } else {
          if (winner.first === b.code) athGold += 1;
          if (winner.second === b.code) athSilver += 1;
          if (winner.third === b.code) athBronze += 1;
        }
      });

      const totalGold = athGold + teamGold;
      const totalSilver = athSilver + teamSilver;
      const totalBronze = athBronze;

      // Athletics & Individual: 1st = 5 Pts, 2nd = 3 Pts, 3rd = 1 Pt
      const athPoints = (athGold * (athleticsPointsRule.gold || 5)) + (athSilver * (athleticsPointsRule.silver || 3)) + (athBronze * (athleticsPointsRule.bronze || 1));
      
      // Team Games: 1st = 8 Pts, 2nd = 5 Pts, 3rd = 0 Pts (No 3rd points!)
      const teamPoints = (teamGold * (teamPointsRule.gold || 8)) + (teamSilver * (teamPointsRule.silver || 5)) + (teamBronze * (teamPointsRule.bronze || 0));

      const totalPoints = athPoints + teamPoints;

      return {
        code: b.code,
        branchName: b.name,
        displayName: `${b.name} (${b.code})`,
        athGold, athSilver, athBronze,
        teamGold, teamSilver, teamBronze,
        totalGold, totalSilver, totalBronze,
        athPoints, teamPoints,
        totalPoints
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  // Points Rules & Daily Medals Handlers
  const updatePointsRule = (type, rules) => {
    if (type === 'team') {
      setTeamPointsRule(prev => ({ ...prev, ...rules }));
    } else {
      setAthleticsPointsRule(prev => ({ ...prev, ...rules }));
    }
  };

  const updateDailyBranchMedals = (dayNum, branchCode, updatedData) => {
    setDailyMedals(prev => {
      const currentDay = prev[dayNum] || [];
      const updatedDay = currentDay.map(b => b.code === branchCode ? { ...b, ...updatedData } : b);
      return { ...prev, [dayNum]: updatedDay };
    });
  };

  // Gallery Handlers
  const addGalleryPhoto = (newPhoto) => {
    const entry = { ...newPhoto, id: `gal-${Date.now()}` };
    setGalleryPhotos(prev => [entry, ...prev]);
  };

  const deleteGalleryPhoto = (id) => {
    setGalleryPhotos(prev => prev.filter(g => g.id !== id));
  };

  // Schedule Days Helper Handlers
  const addScheduleDay = () => {
    setSchedule(prev => {
      const dayNumbers = Object.keys(prev).map(Number);
      const nextDay = (dayNumbers.length > 0 ? Math.max(...dayNumbers) : 0) + 1;
      return {
        ...prev,
        [nextDay]: [
          {
            time: '09:00 AM',
            title: `Day ${nextDay} Championship Finals`,
            location: 'Main Stadium Arena',
            status: 'upcoming',
            statusLabel: 'Upcoming'
          }
        ]
      };
    });
  };

  const removeScheduleDay = (dayNum) => {
    setSchedule(prev => {
      const nextSched = { ...prev };
      delete nextSched[dayNum];
      return nextSched;
    });
  };

  const addFixture = (dayNum, fixture) => {
    setSchedule(prev => ({
      ...prev,
      [dayNum]: [...(prev[dayNum] || []), fixture]
    }));
  };

  const deleteFixture = (dayNum, index) => {
    setSchedule(prev => ({
      ...prev,
      [dayNum]: prev[dayNum].filter((_, i) => i !== index)
    }));
  };

  // Cryptographic one-way SHA-256 hash helper (Zero plaintext credentials stored in code)
  const hashCredential = async (text) => {
    if (!text) return '';
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Secure Admin Authentication Handler
  const loginAdmin = async (username = '', password = '') => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter both Admin ID and Password.' };
    }

    try {
      // 1. Optional environment variable check (.env / .env.local)
      const envUser = import.meta.env.VITE_ADMIN_USERNAME;
      const envPass = import.meta.env.VITE_ADMIN_PASSWORD;

      if (envUser && envPass) {
        if (cleanUser === envUser.trim().toLowerCase() && cleanPass === envPass.trim()) {
          setIsAdminLoggedIn(true);
          localStorage.setItem('aahwan_admin_session', 'true');
          localStorage.setItem('AWAHAAN_admin_session', 'true');
          localStorage.setItem('aahwan_view_mode', 'admin-dashboard');
          setViewMode('admin-dashboard');
          return { success: true };
        }
      }

      // 2. Cryptographic one-way SHA-256 hash verification
      // No plaintext credentials or passwords exist anywhere in source code or repository
      const userHash = await hashCredential(cleanUser);
      const passHash = await hashCredential(cleanPass);

      const VALID_ADMIN_USER_HASHES = [
        'c9175d3c371ecca5f647ec856810d0bb55cf731f029f65e5790a6226c85422c2'
      ];
      const VALID_ADMIN_PASS_HASHES = [
        '3ff98c1ca6530e20f69bc3057ca2e3f7339a69435655345bc0cde37263e4b19a'
      ];

      if (VALID_ADMIN_USER_HASHES.includes(userHash) && VALID_ADMIN_PASS_HASHES.includes(passHash)) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('aahwan_admin_session', 'true');
        localStorage.setItem('AWAHAAN_admin_session', 'true');
        localStorage.setItem('aahwan_view_mode', 'admin-dashboard');
        setViewMode('admin-dashboard');
        return { success: true };
      }

      return { 
        success: false, 
        message: 'Invalid Admin credentials. Access denied.' 
      };
    } catch (err) {
      return { 
        success: false, 
        message: 'Authentication service encountered an error. Please try again.' 
      };
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('aahwan_admin_session');
    localStorage.removeItem('AWAHAAN_admin_session');
    localStorage.removeItem('aahwan_view_mode');
    setViewMode('public');
  };

  // Student Registration Handlers (Persisted to both Supabase Cloud DB and LocalStorage)
  const addRegistration = (studentData) => {
    const newReg = {
      ...studentData,
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    setRegistrations(prev => {
      const updated = [newReg, ...prev];
      localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
      return updated;
    });

    // Instant cloud insert accessible to public student applicants without admin session
    if (supabase) {
      supabase.from('registrations').insert({
        id: newReg.id,
        roll_no: newReg.rollNo,
        name: newReg.name,
        branch: newReg.branch,
        year: newReg.year,
        gender: newReg.gender,
        phone: newReg.phone,
        email: newReg.email,
        events: newReg.events || [],
        created_at: newReg.timestamp
      }).then(({ error }) => {
        if (error) console.warn('Supabase registration insert notice:', error.message);
      }).catch(err => {
        console.warn('Supabase registration insert exception:', err);
      });
    }

    return newReg;
  };

  const deleteRegistration = (studentId) => {
    setRegistrations(prev => {
      const updated = prev.filter(r => r.id !== studentId);
      localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
      return updated;
    });

    if (supabase) {
      supabase.from('registrations').delete().eq('id', studentId).then(({ error }) => {
        if (error) console.warn('Supabase delete registration notice:', error.message);
      }).catch(err => {
        console.warn('Supabase delete registration exception:', err);
      });
    }
  };

  // Dignitaries CRUD Handlers
  const updateDignitary = (tier, index, updatedData) => {
    setDignitaries(prev => {
      const nextTier = [...(prev[tier] || [])];
      nextTier[index] = { ...nextTier[index], ...updatedData };
      return { ...prev, [tier]: nextTier };
    });
  };

  const addDignitary = (tier, newPerson) => {
    setDignitaries(prev => {
      const nextTier = [...(prev[tier] || []), newPerson];
      return { ...prev, [tier]: nextTier };
    });
  };

  const removeDignitary = (tier, index) => {
    setDignitaries(prev => {
      const nextTier = prev[tier].filter((_, i) => i !== index);
      return { ...prev, [tier]: nextTier };
    });
  };

  // Sports CRUD Handlers
  const addSport = (newSport) => {
    setSports(prev => [newSport, ...prev]);
  };

  const updateSport = (id, updatedData) => {
    setSports(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const deleteSport = (id) => {
    setSports(prev => prev.filter(s => s.id !== id));
  };

  // Equipment Inventory Handlers
  const addEquipment = (item) => {
    const newItem = { ...item, id: `eq-${Date.now()}` };
    setEquipmentList(prev => {
      const updated = [newItem, ...prev];
      localStorage.setItem('aahwan_equipment', JSON.stringify(updated));
      return updated;
    });
  };

  const updateEquipment = (id, updatedData) => {
    setEquipmentList(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updatedData } : e);
      localStorage.setItem('aahwan_equipment', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteEquipment = (id) => {
    setEquipmentList(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('aahwan_equipment', JSON.stringify(updated));
      return updated;
    });
  };

  const issueEquipment = (data) => {
    const now = new Date();
    const formattedNow = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newLog = {
      ...data,
      id: `iss-${Date.now().toString().slice(-4)}`,
      status: 'issued',
      issueDate: data.issueDate || formattedNow,
      issueTimestamp: data.issueTimestamp || now.toISOString(),
      expectedReturn: data.expectedReturn || '',
      expectedReturnTimestamp: data.expectedReturnTimestamp || '',
      borrowerPhone: data.borrowerPhone || '',
      purpose: data.purpose || 'General Sports Session',
      issueCondition: data.issueCondition || 'Good Condition',
      returnedCount: 0,
      returnDate: null,
      returnTimestamp: null,
      returnCondition: null,
      returnNotes: null
    };
    setEquipmentLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const returnEquipment = (logId, condition, notes, returnQty, customReturnDate) => {
    setEquipmentLogs(prev => {
      const now = new Date();
      const formattedNow = customReturnDate || (now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));

      const updated = prev.map(l => {
        if (l.id === logId) {
          const totalQtyIssued = Number(l.qty) || 1;
          const numReturned = Math.min(totalQtyIssued, Number(returnQty) || totalQtyIssued);
          const isPartial = numReturned < totalQtyIssued;

          if (isPartial) {
            return {
              ...l,
              qty: totalQtyIssued - numReturned,
              returnedCount: (Number(l.returnedCount) || 0) + numReturned,
              lastReturnDate: formattedNow,
              lastReturnTimestamp: now.toISOString(),
              returnCondition: condition,
              notes: `${l.notes || ''} [Returned ${numReturned} unit(s) on ${formattedNow}]`.trim()
            };
          } else {
            return {
              ...l,
              status: 'returned',
              returnedCount: (Number(l.returnedCount) || 0) + numReturned,
              returnDate: formattedNow,
              returnTimestamp: now.toISOString(),
              returnCondition: condition,
              returnNotes: notes || ''
            };
          }
        }
        return l;
      });
      localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteEquipmentLog = (logId) => {
    setEquipmentLogs(prev => {
      const updated = prev.filter(l => l.id !== logId);
      localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePhotoUpload = async (file, folder = 'dignitaries') => {
    return await uploadImageToSupabase(file, folder);
  };

  return (
    <AppContext.Provider value={{
      year, setYear,
      festivalName, setFestivalName,
      collegeName, setCollegeName,
      collegeLocation, setCollegeLocation,
      campusAddress, setCampusAddress,
      helplinePhone, setHelplinePhone,
      helplineEmail, setHelplineEmail,
      statSportsCount, setStatSportsCount,
      statAthletesCount, setStatAthletesCount,
      statStreamsCount, setStatStreamsCount,
      statDaysCount, setStatDaysCount,
      dignitaries, setDignitaries, updateDignitary, addDignitary, removeDignitary,
      sports, setSports, addSport, updateSport, deleteSport,
      schedule, setSchedule, addScheduleDay, removeScheduleDay, addFixture, deleteFixture,
      leaderboard, setLeaderboard,
      dailyMedals, setDailyMedals, updateDailyBranchMedals,
      teamPointsRule, setTeamPointsRule,
      athleticsPointsRule, setAthleticsPointsRule,
      updatePointsRule,
      sportWinners, setSportWinners, assignSportWinner, getStandings, updateSportCategory,
      galleryPhotos, addGalleryPhoto, deleteGalleryPhoto,
      registrations, addRegistration, deleteRegistration,
      equipmentList, addEquipment, updateEquipment, deleteEquipment,
      equipmentLogs, issueEquipment, returnEquipment, deleteEquipmentLog,
      viewMode, setViewMode,
      isAdminLoggedIn,
      showStudentRegistration, setShowStudentRegistration,
      loginAdmin, logoutAdmin,
      handlePhotoUpload,
      saveToCloud,
      cloudSyncStatus,
      lastSyncedTime
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
