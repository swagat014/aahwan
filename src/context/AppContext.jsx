import React, { createContext, useContext, useState, useEffect } from 'react';
import { sportsData as initialSports } from '../data/sportsData';
import { scheduleData as initialSchedule, leaderboardData as initialLeaderboard, dignitariesData as initialDignitaries } from '../data/scheduleData';
import { uploadImageToSupabase } from '../lib/supabaseClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Website General Settings State
  const [year, setYear] = useState(() => localStorage.getItem('aahwan_year') || '2026');
  const [festivalName, setFestivalName] = useState(() => localStorage.getItem('aahwan_name') || 'AAHWAN');
  const [collegeName, setCollegeName] = useState(() => localStorage.getItem('aahwan_college') || 'GOVERNMENT COLLEGE OF ENGINEERING');
  const [collegeLocation, setCollegeLocation] = useState(() => localStorage.getItem('aahwan_location') || 'KALAHANDI');
  const [campusAddress, setCampusAddress] = useState('Bhawanipatna, Kalahandi, Odisha - 766002');
  const [helplinePhone, setHelplinePhone] = useState(() => localStorage.getItem('aahwan_phone') || '+91 6765 220011');
  const [helplineEmail, setHelplineEmail] = useState(() => localStorage.getItem('aahwan_email') || 'sports@gcekbpatna.ac.in');

  // Home Page Counter Stats States
  const [statSportsCount, setStatSportsCount] = useState(() => localStorage.getItem('aahwan_stat_sports') || '20+');
  const [statAthletesCount, setStatAthletesCount] = useState(() => localStorage.getItem('aahwan_stat_athletes') || '800+');
  const [statStreamsCount, setStatStreamsCount] = useState(() => localStorage.getItem('aahwan_stat_streams') || '4');
  const [statDaysCount, setStatDaysCount] = useState(() => localStorage.getItem('aahwan_stat_days') || '3');

  // Dynamic Data States
  const [dignitaries, setDignitaries] = useState(() => {
    const saved = localStorage.getItem('aahwan_dignitaries');
    return saved ? JSON.parse(saved) : initialDignitaries;
  });

  const [sports, setSports] = useState(() => {
    const saved = localStorage.getItem('aahwan_sports');
    return saved ? JSON.parse(saved) : initialSports;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('aahwan_schedule');
    return saved ? JSON.parse(saved) : initialSchedule;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('aahwan_leaderboard');
    return saved ? JSON.parse(saved) : initialLeaderboard;
  });

  // Per-Day Medal Progression State
  const [dailyMedals, setDailyMedals] = useState(() => {
    const saved = localStorage.getItem('aahwan_daily_medals');
    return saved ? JSON.parse(saved) : {
      1: [
        { code: 'CSE', branch: 'CSE', gold: 3, silver: 1, bronze: 1 },
        { code: 'EE', branch: 'EE', gold: 2, silver: 2, bronze: 1 },
        { code: 'ME', branch: 'ME', gold: 1, silver: 2, bronze: 1 },
        { code: 'CE', branch: 'CE', gold: 1, silver: 0, bronze: 2 }
      ],
      2: [
        { code: 'CSE', branch: 'CSE', gold: 3, silver: 2, bronze: 1 },
        { code: 'EE', branch: 'EE', gold: 2, silver: 2, bronze: 2 },
        { code: 'ME', branch: 'ME', gold: 2, silver: 2, bronze: 1 },
        { code: 'CE', branch: 'CE', gold: 1, silver: 2, bronze: 2 }
      ],
      3: [
        { code: 'CSE', branch: 'CSE', gold: 2, silver: 1, bronze: 1 },
        { code: 'EE', branch: 'EE', gold: 2, silver: 1, bronze: 1 },
        { code: 'ME', branch: 'ME', gold: 1, silver: 2, bronze: 0 },
        { code: 'CE', branch: 'CE', gold: 1, silver: 1, bronze: 1 }
      ]
    };
  });

  // Photo Highlights Gallery State
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = localStorage.getItem('aahwan_gallery');
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
    const saved = localStorage.getItem('aahwan_registrations');
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
    const session = localStorage.getItem('aahwan_admin_session');
    return session === 'true' ? 'admin-dashboard' : 'public';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('aahwan_admin_session') === 'true';
  });

  const [showStudentRegistration, setShowStudentRegistration] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('aahwan_year', year);
    localStorage.setItem('aahwan_name', festivalName);
    localStorage.setItem('aahwan_college', collegeName);
    localStorage.setItem('aahwan_location', collegeLocation);
    localStorage.setItem('aahwan_phone', helplinePhone);
    localStorage.setItem('aahwan_email', helplineEmail);
    localStorage.setItem('aahwan_stat_sports', statSportsCount);
    localStorage.setItem('aahwan_stat_athletes', statAthletesCount);
    localStorage.setItem('aahwan_stat_streams', statStreamsCount);
    localStorage.setItem('aahwan_stat_days', statDaysCount);
    localStorage.setItem('aahwan_dignitaries', JSON.stringify(dignitaries));
    localStorage.setItem('aahwan_sports', JSON.stringify(sports));
    localStorage.setItem('aahwan_schedule', JSON.stringify(schedule));
    localStorage.setItem('aahwan_leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('aahwan_daily_medals', JSON.stringify(dailyMedals));
    localStorage.setItem('aahwan_gallery', JSON.stringify(galleryPhotos));
    localStorage.setItem('aahwan_registrations', JSON.stringify(registrations));
  }, [year, festivalName, collegeName, collegeLocation, dignitaries, sports, schedule, leaderboard, dailyMedals, galleryPhotos, registrations]);

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

  // Admin Login Handler
  const loginAdmin = (username, password) => {
    if (username === 'adminaahwan' && password === 'gcekaahwanadmin2009') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('aahwan_admin_session', 'true');
      setViewMode('admin-dashboard');
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin ID or Password. Please check credentials.' };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('aahwan_admin_session');
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
      dailyMedals, setDailyMedals,
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
