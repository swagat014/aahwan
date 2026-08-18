import React, { createContext, useContext, useState, useEffect } from 'react';
import { sportsData as initialSports } from '../data/sportsData';
import { scheduleData as initialSchedule, leaderboardData as initialLeaderboard, dignitariesData as initialDignitaries } from '../data/scheduleData';
import { uploadImageToSupabase } from '../lib/supabaseClient';

const AppContext = createContext();

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

  // Dynamic Data States
  const [dignitaries, setDignitaries] = useState(() => {
    const saved = localStorage.getItem('aahwan_dignitaries') || localStorage.getItem('AWAHAAN_dignitaries');
    return saved ? JSON.parse(saved) : initialDignitaries;
  });

  const [sports, setSports] = useState(() => {
    const saved = localStorage.getItem('aahwan_sports') || localStorage.getItem('AWAHAAN_sports');
    return saved ? JSON.parse(saved) : initialSports;
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
    const saved = localStorage.getItem('AWAHAAN_gallery');
    return saved ? JSON.parse(saved) : [
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

  // Sync to LocalStorage
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

    localStorage.setItem('aahwan_registrations', JSON.stringify(registrations));
    localStorage.setItem('AWAHAAN_registrations', JSON.stringify(registrations));
  }, [year, festivalName, collegeName, collegeLocation, helplinePhone, helplineEmail, statSportsCount, statAthletesCount, statStreamsCount, statDaysCount, teamPointsRule, athleticsPointsRule, sportWinners, dailyMedals, dignitaries, sports, schedule, leaderboard, galleryPhotos, registrations]);

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

  // Admin Login Handler with Trim & Flexible Credentials Matching
  const loginAdmin = (username = '', password = '') => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const validUsernames = ['adminaahwan', 'admin', 'aahwanadmin', 'admin@aahwan', 'gcekadmin'];
    const validPasswords = ['gcekaahwanadmin2009', 'gcekaahwanadmin', 'admin2009', 'gcek2009', 'gcekaahwan2009'];

    if (validUsernames.includes(cleanUser) && validPasswords.includes(cleanPass)) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('aahwan_admin_session', 'true');
      localStorage.setItem('AWAHAAN_admin_session', 'true');
      localStorage.setItem('aahwan_view_mode', 'admin-dashboard');
      setViewMode('admin-dashboard');
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin ID or Password. Default Admin ID is "adminaahwan" and Password is "gcekaahwanadmin2009".' };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('aahwan_admin_session');
    localStorage.removeItem('AWAHAAN_admin_session');
    localStorage.removeItem('aahwan_view_mode');
    setViewMode('public');
  };

  // Student Registration Handlers
  const addRegistration = (studentData) => {
    const newReg = {
      ...studentData,
      id: `reg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setRegistrations(prev => [newReg, ...prev]);
    return newReg;
  };

  const deleteRegistration = (studentId) => {
    setRegistrations(prev => prev.filter(r => r.id !== studentId));
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
      viewMode, setViewMode,
      isAdminLoggedIn,
      showStudentRegistration, setShowStudentRegistration,
      loginAdmin, logoutAdmin,
      handlePhotoUpload
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
