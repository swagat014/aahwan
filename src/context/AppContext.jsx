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

function getDeletedRegIds() {
  try {
    const saved = localStorage.getItem('aahwan_deleted_reg_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (e) {
    return new Set();
  }
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

/**
 * Normalizes Equipment Item structure ensuring both camelCase (totalQty) and snake_case (total_qty)
 * exist and numeric fields are always valid numbers.
 */
export function normalizeEquipmentItem(item) {
  if (!item || typeof item !== 'object') return null;
  const totalQty = Number(item.totalQty ?? item.total_qty ?? item.qty ?? 0);
  return {
    id: String(item.id || `eq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
    name: String(item.name || '').trim(),
    category: String(item.category || 'General').trim(),
    totalQty: totalQty,
    total_qty: totalQty,
    condition: String(item.condition || 'Good Condition'),
    location: String(item.location || 'Main Sports Store'),
    notes: String(item.notes || ''),
    created_at: item.created_at || new Date().toISOString()
  };
}

/**
 * Normalizes Equipment Log structure ensuring complete property coverage for both
 * camelCase and snake_case database rows.
 */
export function normalizeEquipmentLog(log) {
  if (!log || typeof log !== 'object') return null;
  const qty = Number(log.qty ?? 1);
  const returnedCount = Number(log.returnedCount ?? log.returned_count ?? 0);
  const equipmentId = String(log.equipmentId ?? log.equipment_id ?? '');
  const equipmentName = String(log.equipmentName ?? log.equipment_name ?? '');
  const borrowerName = String(log.borrowerName ?? log.borrower_name ?? '');
  const rollNo = String(log.rollNo ?? log.roll_no ?? '');
  const borrowerPhone = String(log.borrowerPhone ?? log.borrower_phone ?? '');
  const issueDate = String(log.issueDate ?? log.issue_date ?? '');
  const issueTimestamp = log.issueTimestamp ?? log.issue_timestamp ?? null;
  const expectedReturn = String(log.expectedReturn ?? log.expected_return ?? '');
  const expectedReturnTimestamp = log.expectedReturnTimestamp ?? log.expected_return_timestamp ?? null;
  const returnDate = log.returnDate ?? log.return_date ?? null;
  const returnTimestamp = log.returnTimestamp ?? log.return_timestamp ?? null;
  const returnCondition = log.returnCondition ?? log.return_condition ?? null;
  const returnNotes = log.returnNotes ?? log.return_notes ?? null;
  const issueCondition = log.issueCondition ?? log.issue_condition ?? 'Good Condition';
  const purpose = log.purpose ?? 'Practice Match & Training';

  return {
    id: String(log.id || `iss-${Date.now().toString().slice(-6)}`),
    equipmentId,
    equipment_id: equipmentId,
    equipmentName,
    equipment_name: equipmentName,
    category: String(log.category || 'General'),
    borrowerName,
    borrower_name: borrowerName,
    rollNo,
    roll_no: rollNo,
    branch: String(log.branch || 'CSE'),
    borrowerPhone,
    borrower_phone: borrowerPhone,
    qty,
    status: String(log.status || 'issued'),
    issueDate,
    issue_date: issueDate,
    issueTimestamp,
    issue_timestamp: issueTimestamp,
    expectedReturn,
    expected_return: expectedReturn,
    expectedReturnTimestamp,
    expected_return_timestamp: expectedReturnTimestamp,
    returnedCount,
    returned_count: returnedCount,
    returnDate,
    return_date: returnDate,
    returnTimestamp,
    return_timestamp: returnTimestamp,
    returnCondition,
    return_condition: returnCondition,
    returnNotes,
    return_notes: returnNotes,
    issueCondition,
    issue_condition: issueCondition,
    purpose,
    notes: String(log.notes || ''),
    created_at: log.created_at || new Date().toISOString()
  };
}

/**
 * Robust winner resolver that matches across sport.id, sport.title,
 * and canonical prefixes (e.g. 'athletics-100m' <-> 'sport-100m' <-> '100m Sprint').
 */
export function findSportWinner(sportWinners = {}, sport) {
  if (!sport || !sportWinners) return null;
  const sId = String(sport.id || '').toLowerCase().trim();
  const sTitle = String(sport.title || '').toLowerCase().trim();

  // 1. Direct match by id
  if (sport.id && sportWinners[sport.id]) return sportWinners[sport.id];
  // 2. Direct match by title
  if (sport.title && sportWinners[sport.title]) return sportWinners[sport.title];

  // 3. Normalization aliases
  const strippedId = sId.replace(/^(athletics|team|sport)-/, '');
  const slugTitle = sTitle.replace(/[^a-z0-9]/g, '');

  for (const [key, value] of Object.entries(sportWinners)) {
    if (!value || typeof value !== 'object') continue;
    const k = key.toLowerCase().trim();
    const strippedKey = k.replace(/^(athletics|team|sport)-/, '');

    if (k === sId || k === sTitle) return value;
    if (strippedKey && strippedId && strippedKey === strippedId) return value;
    if (strippedKey && sTitle.includes(strippedKey)) return value;
    if (strippedId && k.includes(strippedId)) return value;
    if (slugTitle && k.replace(/[^a-z0-9]/g, '') === slugTitle) return value;
  }
  return null;
}

/**
 * Robust parsing helper for sport disciplines.
 * Handles arrays, JSON strings, comma-delimited strings, or single values without crashing.
 */
export function safeParseEvents(events) {
  if (Array.isArray(events)) return events.filter(Boolean);
  if (!events) return [];
  if (typeof events === 'string') {
    const trimmed = events.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {
        // Fallback to delimiter split below
      }
    }
    return trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return [];
}

export const DEFAULT_TEAM_SQUAD_SIZES = {
  'Volleyball Championship': 12,
  'Badminton Championship': 12,
  'Kabaddi League': 12,
  'Kho-Kho Tournament': 12,
  'Football Champions Cup': 16,
  'Cricket Tournament': 16,
  'Tug of War Championship': 12,
  'Table Tennis Championship': 4,
  'Chess Rapid & Blitz Tournament': 4,
  '4 x 400m Relay Race': 4
};

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

  // Admin Configurable Team Squad Sizes ({ [sportTitle]: numberOfPlayers })
  const [teamSquadSizes, setTeamSquadSizes] = useState(() => {
    const saved = localStorage.getItem('aahwan_team_squad_sizes') || localStorage.getItem('AWAHAAN_team_squad_sizes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_TEAM_SQUAD_SIZES, ...parsed };
      } catch (e) {
        console.warn('Failed to parse team squad sizes:', e);
      }
    }
    return DEFAULT_TEAM_SQUAD_SIZES;
  });

  const updateTeamSquadSize = (sportTitle, size) => {
    const num = Math.max(1, Math.min(32, parseInt(size, 10) || 1));
    setTeamSquadSizes(prev => {
      const next = { ...prev, [sportTitle]: num };
      localStorage.setItem('aahwan_team_squad_sizes', JSON.stringify(next));
      localStorage.setItem('AWAHAAN_team_squad_sizes', JSON.stringify(next));
      saveToCloud({ teamSquadSizes: next });
      return next;
    });
  };

  // Per-Sport Winner Assignments State ({ [sportId]: { day: 1|2|3, first: 'CSE', second: 'EE', third: 'ME' } })
  const [sportWinners, setSportWinners] = useState(() => {
    const saved = localStorage.getItem('aahwan_sport_winners') || localStorage.getItem('AWAHAAN_sport_winners');
    return saved ? JSON.parse(saved) : {
      'athletics-100m': { day: 1, first: 'CSE', second: 'EE', third: 'ME' },
      'sport-100m': { day: 1, first: 'CSE', second: 'EE', third: 'ME' },
      'athletics-200m': { day: 1, first: 'EE', second: 'CSE', third: 'CE' },
      'sport-200m': { day: 1, first: 'EE', second: 'CSE', third: 'CE' },
      'athletics-400m': { day: 1, first: 'CSE', second: 'ME', third: 'EE' },
      'sport-400m': { day: 1, first: 'CSE', second: 'ME', third: 'EE' },
      'athletics-longjump': { day: 1, first: 'ME', second: 'CSE', third: 'CE' },
      'sport-longjump': { day: 1, first: 'ME', second: 'CSE', third: 'CE' },
      'team-cricket': { day: 1, first: 'CSE', second: 'ME', third: '' }, // Team: 1st=8/7, 2nd=5
      'sport-cricket': { day: 1, first: 'CSE', second: 'ME', third: '' },
      'team-football': { day: 2, first: 'EE', second: 'CE', third: '' },  // Team: 1st=8/7, 2nd=5
      'sport-football': { day: 2, first: 'EE', second: 'CE', third: '' },
      'team-volleyball': { day: 2, first: 'CSE', second: 'EE', third: '' },// Team: 1st=8/7, 2nd=5
      'sport-volleyball': { day: 2, first: 'CSE', second: 'EE', third: '' },
      'team-kabaddi': { day: 2, first: 'ME', second: 'CSE', third: '' },   // Team: 1st=8/7, 2nd=5
      'sport-kabaddi': { day: 2, first: 'ME', second: 'CSE', third: '' },
      'athletics-chess': { day: 2, first: 'CSE', second: 'EE', third: 'ME' },
      'sport-chess': { day: 2, first: 'CSE', second: 'EE', third: 'ME' },
      'athletics-badminton': { day: 3, first: 'EE', second: 'CSE', third: 'CE' },
      'sport-badminton': { day: 3, first: 'EE', second: 'CSE', third: 'CE' },
      'team-relay': { day: 3, first: 'CSE', second: 'ME', third: '' },     // Team: 1st=8/7, 2nd=5
      'sport-relay': { day: 3, first: 'CSE', second: 'ME', third: '' }
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

  // Direct Branch Points & Medals Override State ({ [branchCode]: { totalPoints, athGold, athSilver, athBronze, teamGold, teamSilver, isManual } })
  const [branchPointsOverride, setBranchPointsOverride] = useState(() => {
    const saved = localStorage.getItem('aahwan_branch_points') || localStorage.getItem('AWAHAAN_branch_points');
    return saved ? JSON.parse(saved) : {};
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

  // Student Registrations State (Loads from cache or empty array, then synchronizes live with Supabase)
  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem('aahwan_registrations') || localStorage.getItem('AWAHAAN_registrations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Failed to parse cached registrations:', e);
      }
    }
    return [];
  });

  // Equipment Inventory & Issue/Return Register State
  const [equipmentList, setEquipmentList] = useState(() => {
    const saved = localStorage.getItem('aahwan_equipment');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(normalizeEquipmentItem).filter(Boolean);
      } catch (e) {
        console.warn('Failed to parse cached equipment:', e);
      }
    }
    return [
      { id: 'eq-1', name: 'Cricket Tournament Bats', category: 'Cricket', totalQty: 12, condition: 'Good Condition', location: 'Main Sports Store', notes: 'SS English Willow' },
      { id: 'eq-2', name: 'Cricket Leather Balls', category: 'Cricket', totalQty: 30, condition: 'New Pack', location: 'Store Box 2', notes: 'SG Red Leather' },
      { id: 'eq-3', name: 'Match Footballs (Nivia)', category: 'Football', totalQty: 15, condition: 'Good Condition', location: 'Main Sports Store', notes: 'Size 5 Match Balls' },
      { id: 'eq-4', name: 'Volleyballs (Mikasa)', category: 'Volleyball', totalQty: 10, condition: 'Good Condition', location: 'Store Box 1', notes: 'Tournament Approved' },
      { id: 'eq-5', name: 'Badminton Rackets', category: 'Badminton', totalQty: 16, condition: 'Good Condition', location: 'Indoor Store', notes: 'Yonex Graphite' },
      { id: 'eq-6', name: 'Mavis 350 Shuttlecocks', category: 'Badminton', totalQty: 40, condition: 'New Pack', location: 'Indoor Store', notes: 'Nylon Shuttles' },
      { id: 'eq-7', name: 'Chess Wooden Sets', category: 'Indoor Games', totalQty: 8, condition: 'Good Condition', location: 'Indoor Hall', notes: 'Tournament Boards' }
    ].map(normalizeEquipmentItem);
  });

  const [equipmentLogs, setEquipmentLogs] = useState(() => {
    const saved = localStorage.getItem('aahwan_equipment_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(normalizeEquipmentLog).filter(Boolean);
      } catch (e) {
        console.warn('Failed to parse cached equipment logs:', e);
      }
    }
    return [
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
    ].map(normalizeEquipmentLog);
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
  const isApplyingCloudUpdateRef = useRef(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  // Manual & Programmatic save to Supabase site_settings
  const saveToCloud = async (customOverrides = {}) => {
    if (!supabase) {
      console.warn('Supabase client is not connected.');
      return { success: false, error: 'Supabase client is not configured' };
    }
    // Safety Guard: Only block automatic background writes before cloud state is ready, never block explicit admin saves
    if (!isCloudLoadedRef.current && Object.keys(customOverrides).length === 0) {
      console.warn('Save blocked: initial cloud data still loading.');
      return { success: false, error: 'Initial database sync in progress' };
    }
    isCloudLoadedRef.current = true;
    try {
      setCloudSyncStatus('syncing');

      // 1. Fetch latest site_settings first to prevent overwriting concurrently updated fields
      let existingConfig = {};
      try {
        const { data: currentSettings } = await supabase
          .from('site_settings')
          .select('config')
          .eq('id', 'global_config')
          .single();
        if (currentSettings?.config) {
          existingConfig = currentSettings.config;
        }
      } catch (fetchErr) {
        console.warn('Could not read existing config prior to save:', fetchErr);
      }

      const payload = {
        ...existingConfig,
        year: customOverrides.year !== undefined ? customOverrides.year : (existingConfig.year || year),
        festivalName: customOverrides.festivalName !== undefined ? customOverrides.festivalName : (existingConfig.festivalName || festivalName),
        collegeName: customOverrides.collegeName !== undefined ? customOverrides.collegeName : (existingConfig.collegeName || collegeName),
        collegeLocation: customOverrides.collegeLocation !== undefined ? customOverrides.collegeLocation : (existingConfig.collegeLocation || collegeLocation),
        helplinePhone: customOverrides.helplinePhone !== undefined ? customOverrides.helplinePhone : (existingConfig.helplinePhone || helplinePhone),
        helplineEmail: customOverrides.helplineEmail !== undefined ? customOverrides.helplineEmail : (existingConfig.helplineEmail || helplineEmail),
        statSportsCount: customOverrides.statSportsCount !== undefined ? customOverrides.statSportsCount : (existingConfig.statSportsCount || statSportsCount),
        statAthletesCount: customOverrides.statAthletesCount !== undefined ? customOverrides.statAthletesCount : (existingConfig.statAthletesCount || statAthletesCount),
        statStreamsCount: customOverrides.statStreamsCount !== undefined ? customOverrides.statStreamsCount : (existingConfig.statStreamsCount || statStreamsCount),
        statDaysCount: customOverrides.statDaysCount !== undefined ? customOverrides.statDaysCount : (existingConfig.statDaysCount || statDaysCount),
        sports: customOverrides.sports !== undefined ? customOverrides.sports : (existingConfig.sports || sports),
        dignitaries: customOverrides.dignitaries !== undefined ? customOverrides.dignitaries : (existingConfig.dignitaries || dignitaries),
        schedule: customOverrides.schedule !== undefined ? customOverrides.schedule : (existingConfig.schedule || schedule),
        leaderboard: customOverrides.leaderboard !== undefined ? customOverrides.leaderboard : (existingConfig.leaderboard || leaderboard),
        galleryPhotos: customOverrides.galleryPhotos !== undefined ? customOverrides.galleryPhotos : (existingConfig.galleryPhotos || galleryPhotos),
        sportWinners: customOverrides.sportWinners !== undefined ? customOverrides.sportWinners : (existingConfig.sportWinners || sportWinners),
        dailyMedals: customOverrides.dailyMedals !== undefined ? customOverrides.dailyMedals : (existingConfig.dailyMedals || dailyMedals),
        teamPointsRule: customOverrides.teamPointsRule !== undefined ? customOverrides.teamPointsRule : (existingConfig.teamPointsRule || teamPointsRule),
        athleticsPointsRule: customOverrides.athleticsPointsRule !== undefined ? customOverrides.athleticsPointsRule : (existingConfig.athleticsPointsRule || athleticsPointsRule),
        branchPointsOverride: customOverrides.branchPointsOverride !== undefined ? customOverrides.branchPointsOverride : (existingConfig.branchPointsOverride || branchPointsOverride),
        equipmentList: customOverrides.equipmentList !== undefined ? customOverrides.equipmentList : (existingConfig.equipmentList || equipmentList),
        equipmentLogs: customOverrides.equipmentLogs !== undefined ? customOverrides.equipmentLogs : (existingConfig.equipmentLogs || equipmentLogs),
        registrations: customOverrides.registrations !== undefined ? customOverrides.registrations : (existingConfig.registrations || registrations),
        teamSquadSizes: customOverrides.teamSquadSizes !== undefined ? customOverrides.teamSquadSizes : (existingConfig.teamSquadSizes || teamSquadSizes)
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

  // Fetch global config & registrations from Supabase Cloud on mount & on demand
  const loadCloudConfig = async () => {
    if (!supabase) {
      isCloudLoadedRef.current = true;
      return;
    }

    try {
      setCloudSyncStatus('syncing');
      isApplyingCloudUpdateRef.current = true;

      // 1. Fetch site_settings (master branding, sports, schedule, dignitaries, rules, inventory)
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'global_config')
        .single();

      let cloudConfig = null;
      if (!error && data?.config) {
        cloudConfig = data.config;
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
        if (cfg.branchPointsOverride && typeof cfg.branchPointsOverride === 'object') {
          setBranchPointsOverride(cfg.branchPointsOverride);
          localStorage.setItem('aahwan_branch_points', JSON.stringify(cfg.branchPointsOverride));
          localStorage.setItem('AWAHAAN_branch_points', JSON.stringify(cfg.branchPointsOverride));
        }
        if (cfg.equipmentList && Array.isArray(cfg.equipmentList)) {
          const normalized = cfg.equipmentList.map(normalizeEquipmentItem).filter(Boolean);
          setEquipmentList(normalized);
          localStorage.setItem('aahwan_equipment', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment', JSON.stringify(normalized));
        }
        if (cfg.equipmentLogs && Array.isArray(cfg.equipmentLogs)) {
          const normalized = cfg.equipmentLogs.map(normalizeEquipmentLog).filter(Boolean);
          setEquipmentLogs(normalized);
          localStorage.setItem('aahwan_equipment_logs', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(normalized));
        }
        if (cfg.teamSquadSizes && typeof cfg.teamSquadSizes === 'object') {
          const mergedSizes = { ...DEFAULT_TEAM_SQUAD_SIZES, ...cfg.teamSquadSizes };
          setTeamSquadSizes(mergedSizes);
          localStorage.setItem('aahwan_team_squad_sizes', JSON.stringify(mergedSizes));
          localStorage.setItem('AWAHAAN_team_squad_sizes', JSON.stringify(mergedSizes));
        }
      }

      // 2. Fetch student registrations from Supabase registrations table
      const { data: cloudRegs, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      const deletedSet = getDeletedRegIds();

      let parsedCloudRegs = [];
      if (!regError && Array.isArray(cloudRegs)) {
        parsedCloudRegs = cloudRegs
          .filter(r => r && !deletedSet.has(r.id) && !deletedSet.has(r.roll_no))
          .map(r => {
            const rawEvents = safeParseEvents(r.events);
            const rosterMarker = rawEvents.find(e => typeof e === 'string' && e.startsWith('TEAM_ROSTER:'));
            let teamPlayers = [];
            if (rosterMarker) {
              try {
                teamPlayers = JSON.parse(rosterMarker.slice(12));
              } catch (err) {
                console.warn('Failed to parse team roster:', err);
              }
            }
            const displayEvents = rawEvents.filter(e => typeof e === 'string' && !e.startsWith('TEAM_ROSTER:'));
            const isTeam = teamPlayers.length > 0;

            return {
              id: r.id,
              rollNo: r.roll_no || '',
              name: r.name || '',
              branch: r.branch || 'General',
              year: r.year || '1st Year',
              gender: r.gender || 'Boys Division',
              phone: r.phone || '',
              email: r.email || '',
              events: displayEvents,
              registrationType: isTeam ? 'team' : 'individual',
              captainName: isTeam ? r.name : '',
              captainPhone: isTeam ? r.phone : '',
              captainRollNo: isTeam ? r.roll_no : '',
              teamSport: isTeam ? displayEvents[0] || '' : '',
              teamPlayers,
              timestamp: r.created_at || new Date().toISOString()
            };
          });
      }

      // Check fallback from site_settings config.registrations (filtering out any deleted ones)
      let combinedRegs = parsedCloudRegs;
      if (cloudConfig?.registrations && Array.isArray(cloudConfig.registrations)) {
        const cleanedSiteRegs = cloudConfig.registrations.filter(r => {
          if (!r) return false;
          if (deletedSet.has(r.id)) return false;
          const rRoll = r.rollNo || r.roll_no;
          if (rRoll && deletedSet.has(rRoll)) return false;
          return true;
        });

        if (parsedCloudRegs.length === 0 && regError) {
          // Only fallback to site_settings if registrations table failed to load
          combinedRegs = cleanedSiteRegs;
        } else {
          // Merge any non-deleted registrations not yet in registrations table
          const existingIds = new Set(parsedCloudRegs.map(r => r.id));
          const existingRolls = new Set(parsedCloudRegs.map(r => r.rollNo || r.roll_no).filter(Boolean));
          const additions = cleanedSiteRegs.filter(r => 
            r && r.id && !existingIds.has(r.id) && 
            !(r.rollNo && existingRolls.has(r.rollNo))
          );
          if (additions.length > 0) {
            combinedRegs = [...parsedCloudRegs, ...additions];
          }
        }
      }

      if (combinedRegs.length > 0 || !regError) {
        setRegistrations(combinedRegs);
        localStorage.setItem('aahwan_registrations', JSON.stringify(combinedRegs));
        localStorage.setItem('AWAHAAN_registrations', JSON.stringify(combinedRegs));
      }

      // 3. Fetch equipment inventory directly from Supabase 'equipment' table (with fallback to site_settings)
      try {
        const { data: equipRows, error: equipErr } = await supabase
          .from('equipment')
          .select('*')
          .order('name', { ascending: true });

        if (!equipErr && Array.isArray(equipRows) && equipRows.length > 0) {
          const normalized = equipRows.map(normalizeEquipmentItem).filter(Boolean);
          setEquipmentList(normalized);
          localStorage.setItem('aahwan_equipment', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment', JSON.stringify(normalized));
        } else if (cloudConfig?.equipmentList && Array.isArray(cloudConfig.equipmentList)) {
          const normalized = cloudConfig.equipmentList.map(normalizeEquipmentItem).filter(Boolean);
          setEquipmentList(normalized);
          localStorage.setItem('aahwan_equipment', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment', JSON.stringify(normalized));
        }
      } catch (e) {
        if (cloudConfig?.equipmentList && Array.isArray(cloudConfig.equipmentList)) {
          const normalized = cloudConfig.equipmentList.map(normalizeEquipmentItem).filter(Boolean);
          setEquipmentList(normalized);
          localStorage.setItem('aahwan_equipment', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment', JSON.stringify(normalized));
        }
      }

      // 4. Fetch equipment issue/return logs directly from Supabase 'equipment_logs' table (with fallback to site_settings)
      try {
        const { data: logRows, error: logErr } = await supabase
          .from('equipment_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!logErr && Array.isArray(logRows) && logRows.length > 0) {
          const normalized = logRows.map(normalizeEquipmentLog).filter(Boolean);
          setEquipmentLogs(normalized);
          localStorage.setItem('aahwan_equipment_logs', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(normalized));
        } else if (cloudConfig?.equipmentLogs && Array.isArray(cloudConfig.equipmentLogs)) {
          const normalized = cloudConfig.equipmentLogs.map(normalizeEquipmentLog).filter(Boolean);
          setEquipmentLogs(normalized);
          localStorage.setItem('aahwan_equipment_logs', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(normalized));
        }
      } catch (e) {
        if (cloudConfig?.equipmentLogs && Array.isArray(cloudConfig.equipmentLogs)) {
          const normalized = cloudConfig.equipmentLogs.map(normalizeEquipmentLog).filter(Boolean);
          setEquipmentLogs(normalized);
          localStorage.setItem('aahwan_equipment_logs', JSON.stringify(normalized));
          localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(normalized));
        }
      }

      setCloudSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Cloud config load bypassed:', err);
      setCloudSyncStatus('error');
    } finally {
      isCloudLoadedRef.current = true;
      setTimeout(() => {
        isApplyingCloudUpdateRef.current = false;
      }, 100);
    }
  };

  // Mount Effect: load cloud data and establish realtime listeners
  useEffect(() => {
    loadCloudConfig();

    // Subscribe to Realtime Cloud changes on site_settings
    const settingsChannel = supabase
      .channel('public:site_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.new && payload.new.config) {
          isApplyingCloudUpdateRef.current = true;
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
          if (cfg.branchPointsOverride && typeof cfg.branchPointsOverride === 'object') {
            setBranchPointsOverride(cfg.branchPointsOverride);
            localStorage.setItem('aahwan_branch_points', JSON.stringify(cfg.branchPointsOverride));
            localStorage.setItem('AWAHAAN_branch_points', JSON.stringify(cfg.branchPointsOverride));
          }
          if (cfg.equipmentList && Array.isArray(cfg.equipmentList)) {
            const normalized = cfg.equipmentList.map(normalizeEquipmentItem).filter(Boolean);
            setEquipmentList(normalized);
            localStorage.setItem('aahwan_equipment', JSON.stringify(normalized));
            localStorage.setItem('AWAHAAN_equipment', JSON.stringify(normalized));
          }
          if (cfg.equipmentLogs && Array.isArray(cfg.equipmentLogs)) {
            const normalized = cfg.equipmentLogs.map(normalizeEquipmentLog).filter(Boolean);
            setEquipmentLogs(normalized);
            localStorage.setItem('aahwan_equipment_logs', JSON.stringify(normalized));
            localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(normalized));
          }
          if (cfg.teamSquadSizes && typeof cfg.teamSquadSizes === 'object') {
            const mergedSizes = { ...DEFAULT_TEAM_SQUAD_SIZES, ...cfg.teamSquadSizes };
            setTeamSquadSizes(mergedSizes);
            localStorage.setItem('aahwan_team_squad_sizes', JSON.stringify(mergedSizes));
            localStorage.setItem('AWAHAAN_team_squad_sizes', JSON.stringify(mergedSizes));
          }
          setLastSyncedTime(new Date().toLocaleTimeString());
          setTimeout(() => {
            isApplyingCloudUpdateRef.current = false;
          }, 100);
        }
      })
      .subscribe();

    // Subscribe to Realtime Cloud changes on registrations (instantly displays new students in Admin Panel on all devices)
    const registrationsChannel = supabase
      .channel('public:registrations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, (payload) => {
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
          const r = payload.new;
          const rawEvents = safeParseEvents(r.events);
          const rosterMarker = rawEvents.find(e => typeof e === 'string' && e.startsWith('TEAM_ROSTER:'));
          let teamPlayers = [];
          if (rosterMarker) {
            try {
              teamPlayers = JSON.parse(rosterMarker.slice(12));
            } catch (err) {
              console.warn('Failed to parse team roster:', err);
            }
          }
          const displayEvents = rawEvents.filter(e => typeof e === 'string' && !e.startsWith('TEAM_ROSTER:'));
          const isTeam = teamPlayers.length > 0;

          const incoming = {
            id: r.id,
            rollNo: r.roll_no || '',
            name: r.name || '',
            branch: r.branch || 'General',
            year: r.year || '1st Year',
            gender: r.gender || 'Boys Division',
            phone: r.phone || '',
            email: r.email || '',
            events: displayEvents,
            registrationType: isTeam ? 'team' : 'individual',
            captainName: isTeam ? r.name : '',
            captainPhone: isTeam ? r.phone : '',
            captainRollNo: isTeam ? r.roll_no : '',
            teamSport: isTeam ? displayEvents[0] || '' : '',
            teamPlayers,
            timestamp: r.created_at || new Date().toISOString()
          };
          setRegistrations(prev => {
            const filtered = prev.filter(x => x.id !== incoming.id);
            const updated = [incoming, ...filtered];
            localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
            localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const deletedId = payload.old.id;
          const deletedRoll = payload.old.roll_no;
          setRegistrations(prev => {
            const updated = prev.filter(r => {
              if (deletedId && r.id === deletedId) return false;
              if (deletedRoll && (r.rollNo === deletedRoll || r.roll_no === deletedRoll)) return false;
              return true;
            });
            localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
            localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .subscribe();

    // Subscribe to Realtime Cloud changes on dedicated equipment table
    const equipmentChannel = supabase
      .channel('public:equipment')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, (payload) => {
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
          const item = normalizeEquipmentItem(payload.new);
          if (item) {
            setEquipmentList(prev => {
              const exists = prev.some(e => e.id === item.id);
              const updated = exists ? prev.map(e => e.id === item.id ? item : e) : [item, ...prev];
              localStorage.setItem('aahwan_equipment', JSON.stringify(updated));
              localStorage.setItem('AWAHAAN_equipment', JSON.stringify(updated));
              return updated;
            });
          }
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const deletedId = payload.old.id;
          if (deletedId) {
            setEquipmentList(prev => {
              const updated = prev.filter(e => e.id !== deletedId);
              localStorage.setItem('aahwan_equipment', JSON.stringify(updated));
              localStorage.setItem('AWAHAAN_equipment', JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      .subscribe();

    // Subscribe to Realtime Cloud changes on dedicated equipment_logs table
    const equipmentLogsChannel = supabase
      .channel('public:equipment_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_logs' }, (payload) => {
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
          const log = normalizeEquipmentLog(payload.new);
          if (log) {
            setEquipmentLogs(prev => {
              const exists = prev.some(l => l.id === log.id);
              const updated = exists ? prev.map(l => l.id === log.id ? log : l) : [log, ...prev];
              localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updated));
              localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(updated));
              return updated;
            });
          }
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const deletedId = payload.old.id;
          if (deletedId) {
            setEquipmentLogs(prev => {
              const updated = prev.filter(l => l.id !== deletedId);
              localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updated));
              localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      .subscribe();

    // Automatic Sync on Tab Visibility Change / Window Focus (Keeps mobile and tabs always up to date)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadCloudConfig();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(equipmentChannel);
      supabase.removeChannel(equipmentLogsChannel);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
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

    // Guard: Never echo back changes that were applied from incoming Cloud updates
    if (isApplyingCloudUpdateRef.current) {
      isApplyingCloudUpdateRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveToCloud();
    }, 1500);

    return () => clearTimeout(timer);
  }, [year, festivalName, collegeName, collegeLocation, helplinePhone, helplineEmail, statSportsCount, statAthletesCount, statStreamsCount, statDaysCount, teamPointsRule, athleticsPointsRule, sportWinners, dailyMedals, dignitaries, sports, schedule, leaderboard, galleryPhotos, equipmentList, equipmentLogs]);

  // Winner Assignments & Dynamic Auto-Calculation Engine for Standings
  const assignSportWinner = (sportId, winnerData) => {
    setSportWinners(prev => {
      const sport = sports.find(s => s.id === sportId || s.title === sportId);
      const nextState = { ...prev, [sportId]: { ...(prev[sportId] || {}), ...winnerData } };

      // Also sync to alias keys so any lookup resolves immediately
      if (sport) {
        if (sport.id) nextState[sport.id] = { ...(nextState[sport.id] || {}), ...winnerData };
        if (sport.title) nextState[sport.title] = { ...(nextState[sport.title] || {}), ...winnerData };
        const stripped = (sport.id || '').replace(/^(athletics|team|sport)-/, '');
        if (stripped) {
          nextState[`sport-${stripped}`] = { ...(nextState[`sport-${stripped}`] || {}), ...winnerData };
          nextState[`athletics-${stripped}`] = { ...(nextState[`athletics-${stripped}`] || {}), ...winnerData };
          nextState[`team-${stripped}`] = { ...(nextState[`team-${stripped}`] || {}), ...winnerData };
        }
      }

      localStorage.setItem('aahwan_sport_winners', JSON.stringify(nextState));
      localStorage.setItem('AWAHAAN_sport_winners', JSON.stringify(nextState));
      saveToCloud({ sportWinners: nextState });
      return nextState;
    });
  };

  const updateSportCategory = (sportId, newCategory) => {
    setSports(prev => {
      const updated = prev.map(s => s.id === sportId ? { ...s, category: newCategory } : s);
      localStorage.setItem('aahwan_sports', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_sports', JSON.stringify(updated));
      saveToCloud({ sports: updated });
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

    const teamGoldPts = Number(teamPointsRule?.gold ?? 8);
    const teamSilverPts = Number(teamPointsRule?.silver ?? 5);
    const teamBronzePts = Number(teamPointsRule?.bronze ?? 0);
    const athGoldPts = Number(athleticsPointsRule?.gold ?? 5);
    const athSilverPts = Number(athleticsPointsRule?.silver ?? 3);
    const athBronzePts = Number(athleticsPointsRule?.bronze ?? 1);

    return branches.map(b => {
      let athGold = 0, athSilver = 0, athBronze = 0;
      let teamGold = 0, teamSilver = 0, teamBronze = 0;

      sports.forEach(sport => {
        const winner = findSportWinner(sportWinners, sport);
        if (!winner) return;

        // Extract day number (default 1)
        const eventDay = winner.day || parseInt((sport.time || '').replace(/[^0-9]/g, '')) || 1;
        if (dayFilter !== 'overall' && parseInt(dayFilter) !== parseInt(eventDay)) return;

        const isTeamSport = sport.category === 'team';

        if (isTeamSport) {
          if (winner.first === b.code) teamGold += 1;
          if (winner.second === b.code) teamSilver += 1;
          if (winner.third === b.code) teamBronze += 1;
        } else {
          if (winner.first === b.code) athGold += 1;
          if (winner.second === b.code) athSilver += 1;
          if (winner.third === b.code) athBronze += 1;
        }
      });

      let totalGold = athGold + teamGold;
      let totalSilver = athSilver + teamSilver;
      let totalBronze = athBronze + teamBronze;

      // Athletics & Individual points
      let athPoints = (athGold * athGoldPts) + (athSilver * athSilverPts) + (athBronze * athBronzePts);
      
      // Team Games points (e.g. 1st=8 or 7 Pts, 2nd=5 Pts)
      let teamPoints = (teamGold * teamGoldPts) + (teamSilver * teamSilverPts) + (teamBronze * teamBronzePts);

      let totalPoints = athPoints + teamPoints;

      // Check if admin has set a manual points/medals override for this branch
      const manual = branchPointsOverride[b.code];
      const isManual = Boolean(manual && manual.isManual);
      if (isManual && (dayFilter === 'overall' || manual.applyAllDays)) {
        if (manual.totalPoints !== undefined && manual.totalPoints !== null && manual.totalPoints !== '') {
          totalPoints = Number(manual.totalPoints);
        }
        if (manual.athGold !== undefined && manual.athGold !== '') athGold = Number(manual.athGold);
        if (manual.athSilver !== undefined && manual.athSilver !== '') athSilver = Number(manual.athSilver);
        if (manual.athBronze !== undefined && manual.athBronze !== '') athBronze = Number(manual.athBronze);
        if (manual.teamGold !== undefined && manual.teamGold !== '') teamGold = Number(manual.teamGold);
        if (manual.teamSilver !== undefined && manual.teamSilver !== '') teamSilver = Number(manual.teamSilver);
        if (manual.athPoints !== undefined && manual.athPoints !== '') athPoints = Number(manual.athPoints);
        if (manual.teamPoints !== undefined && manual.teamPoints !== '') teamPoints = Number(manual.teamPoints);
        totalGold = athGold + teamGold;
        totalSilver = athSilver + teamSilver;
        totalBronze = athBronze;
      }

      return {
        code: b.code,
        branchName: b.name,
        displayName: `${b.name} (${b.code})`,
        athGold, athSilver, athBronze,
        teamGold, teamSilver, teamBronze,
        totalGold, totalSilver, totalBronze,
        athPoints, teamPoints,
        totalPoints,
        isManual
      };
    }).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalGold !== a.totalGold) return b.totalGold - a.totalGold;
      return b.totalSilver - a.totalSilver;
    });
  };

  // Direct Branch Scores CRUD Handlers (Admin direct point updates that sync instantly)
  const updateBranchScore = (branchCode, scoreData) => {
    setBranchPointsOverride(prev => {
      const next = {
        ...prev,
        [branchCode]: { ...(prev[branchCode] || {}), ...scoreData, isManual: true }
      };
      localStorage.setItem('aahwan_branch_points', JSON.stringify(next));
      localStorage.setItem('AWAHAAN_branch_points', JSON.stringify(next));
      saveToCloud({ branchPointsOverride: next });
      return next;
    });
  };

  const resetBranchScore = (branchCode) => {
    setBranchPointsOverride(prev => {
      const next = { ...prev };
      delete next[branchCode];
      localStorage.setItem('aahwan_branch_points', JSON.stringify(next));
      localStorage.setItem('AWAHAAN_branch_points', JSON.stringify(next));
      saveToCloud({ branchPointsOverride: next });
      return next;
    });
  };

  const resetAllBranchScores = () => {
    setBranchPointsOverride({});
    localStorage.removeItem('aahwan_branch_points');
    localStorage.removeItem('AWAHAAN_branch_points');
    saveToCloud({ branchPointsOverride: {} });
  };

  const setAllPointsToZero = () => {
    const zeroScores = {
      CSE: { totalPoints: 0, athGold: 0, athSilver: 0, athBronze: 0, teamGold: 0, teamSilver: 0, isManual: true },
      EE: { totalPoints: 0, athGold: 0, athSilver: 0, athBronze: 0, teamGold: 0, teamSilver: 0, isManual: true },
      ME: { totalPoints: 0, athGold: 0, athSilver: 0, athBronze: 0, teamGold: 0, teamSilver: 0, isManual: true },
      CE: { totalPoints: 0, athGold: 0, athSilver: 0, athBronze: 0, teamGold: 0, teamSilver: 0, isManual: true }
    };
    setBranchPointsOverride(zeroScores);
    localStorage.setItem('aahwan_branch_points', JSON.stringify(zeroScores));
    localStorage.setItem('AWAHAAN_branch_points', JSON.stringify(zeroScores));
    saveToCloud({ branchPointsOverride: zeroScores });
  };

  // Points Rules & Daily Medals Handlers
  const updatePointsRule = (type, rules) => {
    if (type === 'team') {
      setTeamPointsRule(prev => {
        const next = { ...prev, ...rules };
        localStorage.setItem('aahwan_team_points_rule', JSON.stringify(next));
        localStorage.setItem('AWAHAAN_team_points_rule', JSON.stringify(next));
        saveToCloud({ teamPointsRule: next });
        return next;
      });
    } else {
      setAthleticsPointsRule(prev => {
        const next = { ...prev, ...rules };
        localStorage.setItem('aahwan_ath_points_rule', JSON.stringify(next));
        localStorage.setItem('AWAHAAN_ath_points_rule', JSON.stringify(next));
        saveToCloud({ athleticsPointsRule: next });
        return next;
      });
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
          loadCloudConfig();
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

        // Immediately fetch freshest data from Supabase so this device is 100% in sync
        loadCloudConfig();

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
  const addRegistration = async (studentData) => {
    const regId = studentData.id || `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const rollNo = (studentData.rollNo || '').trim().toUpperCase();
    const name = (studentData.name || '').trim();
    const branch = studentData.branch || 'General';
    const yearVal = studentData.year || '1st Year';
    const gender = studentData.gender || 'Boys Division';
    const phone = (studentData.phone || '').trim();
    // Safety: Ensure email is never null or undefined to satisfy PostgreSQL NOT NULL constraint
    const email = (studentData.email || '').trim() || `${(rollNo || 'athlete').toLowerCase()}@gcekbpatna.ac.in`;
    const events = safeParseEvents(studentData.events);
    const timestamp = studentData.timestamp || new Date().toISOString();

    const isTeam = studentData.registrationType === 'team' || Boolean(studentData.teamPlayers && studentData.teamPlayers.length > 0);
    const teamSport = studentData.teamSport || (events.length > 0 ? events[0] : '');
    const teamPlayers = studentData.teamPlayers || [];

    if (!rollNo || !name || !phone) {
      throw new Error(isTeam ? 'Captain Name, Roll Number, and WhatsApp Phone are required.' : 'Name, Roll Number, and WhatsApp Phone are required.');
    }
    if (!isTeam && events.length === 0) {
      throw new Error('Please select at least one sports discipline to register.');
    }
    if (isTeam && !teamSport) {
      throw new Error('Please select a team sport discipline.');
    }

    // Prepare events array for Supabase public.registrations JSONB column
    let dbEvents = events;
    if (isTeam) {
      dbEvents = [teamSport];
      if (teamPlayers.length > 0) {
        dbEvents.push(`TEAM_ROSTER:${JSON.stringify(teamPlayers)}`);
      }
    }

    const newReg = {
      id: regId,
      rollNo,
      name,
      branch,
      year: yearVal,
      gender,
      phone,
      email,
      events: isTeam ? [teamSport] : events,
      registrationType: isTeam ? 'team' : 'individual',
      captainName: isTeam ? name : '',
      captainPhone: isTeam ? phone : '',
      captainRollNo: isTeam ? rollNo : '',
      teamSport: isTeam ? teamSport : '',
      teamPlayers: isTeam ? teamPlayers : [],
      timestamp
    };

    // 1. Guaranteed Direct Insert to Supabase public.registrations
    if (!supabase) {
      throw new Error('Database client is not available. Please check network connection.');
    }

    const { data: dbData, error: dbError } = await supabase.from('registrations').upsert({
      id: regId,
      roll_no: rollNo,
      name,
      branch,
      year: yearVal,
      gender,
      phone,
      email,
      events: dbEvents,
      created_at: timestamp
    }).select();

    if (dbError) {
      console.error('Supabase registration insert error:', dbError);
      throw new Error(dbError.message || 'Database rejected registration record.');
    }

    console.log('✅ Registration successfully saved to Supabase Cloud DB:', regId, dbData);

    // 2. Dual-Persist to site_settings config.registrations backup
    try {
      const { data: currentSettings } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
      if (currentSettings?.config) {
        const existingList = Array.isArray(currentSettings.config.registrations) ? currentSettings.config.registrations : [];
        const updatedList = [newReg, ...existingList.filter(r => r.id !== regId && !(r.rollNo === rollNo && r.name === name))];
        await supabase.from('site_settings').update({
          config: { ...currentSettings.config, registrations: updatedList },
          updated_at: new Date().toISOString()
        }).eq('id', 'global_config');
      }
    } catch (backupErr) {
      console.warn('Backup sync to site_settings config caught:', backupErr);
    }

    // 3. Optimistically update local state & localStorage
    setRegistrations(prev => {
      const filtered = prev.filter(r => r.id !== regId && !(r.rollNo === rollNo && r.name === name));
      const updated = [newReg, ...filtered];
      localStorage.setItem('aahwan_registrations', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_registrations', JSON.stringify(updated));
      return updated;
    });

    return newReg;
  };

  const deleteRegistration = async (studentOrId, optRollNo = '', optName = '') => {
    const studentId = typeof studentOrId === 'object' ? (studentOrId?.id || '') : String(studentOrId || '').trim();
    const studentRollNo = typeof studentOrId === 'object' 
      ? String(studentOrId?.rollNo || studentOrId?.roll_no || studentOrId?.captainRollNo || '').trim() 
      : String(optRollNo || '').trim();
    const studentName = typeof studentOrId === 'object' 
      ? String(studentOrId?.name || studentOrId?.captainName || '').trim() 
      : String(optName || '').trim();

    if (!studentId && !studentRollNo && !studentName) {
      console.warn('deleteRegistration: no identifier provided');
      return { success: false, error: 'No identifier provided' };
    }

    // 1. Mark in persistent deleted IDs set so background polling never re-adds it
    try {
      const deletedSet = getDeletedRegIds();
      if (studentId) deletedSet.add(studentId);
      if (studentRollNo) deletedSet.add(studentRollNo);
      if (studentName && studentRollNo) deletedSet.add(`${studentName}::${studentRollNo}`);
      localStorage.setItem('aahwan_deleted_reg_ids', JSON.stringify(Array.from(deletedSet)));
    } catch (e) {
      console.warn('Failed to cache deleted registration:', e);
    }

    // 2. Immediately update local state and localStorage
    let nextRegs = [];
    setRegistrations(prev => {
      nextRegs = prev.filter(r => {
        if (studentId && r.id === studentId) return false;
        if (studentRollNo && (r.rollNo === studentRollNo || r.roll_no === studentRollNo || r.captainRollNo === studentRollNo)) return false;
        if (studentName && studentRollNo && (r.name === studentName || r.captainName === studentName) && (r.rollNo === studentRollNo || r.roll_no === studentRollNo)) return false;
        return true;
      });
      localStorage.setItem('aahwan_registrations', JSON.stringify(nextRegs));
      localStorage.setItem('AWAHAAN_registrations', JSON.stringify(nextRegs));
      return nextRegs;
    });

    // 3. Synchronize deletion to Supabase Cloud
    if (supabase) {
      try {
        if (studentId) {
          const { error: idErr } = await supabase.from('registrations').delete().eq('id', studentId);
          if (idErr) console.warn('Supabase delete by id error:', idErr.message);
        }
        if (studentRollNo) {
          const { error: rollErr } = await supabase.from('registrations').delete().eq('roll_no', studentRollNo);
          if (rollErr) console.warn('Supabase delete by roll_no error:', rollErr.message);
        }

        // Atomically update site_settings.config.registrations
        const { data: currentSettings } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
        if (currentSettings?.config) {
          const existingList = Array.isArray(currentSettings.config.registrations) ? currentSettings.config.registrations : [];
          const purgedList = existingList.filter(r => {
            if (studentId && r.id === studentId) return false;
            if (studentRollNo && (r.rollNo === studentRollNo || r.roll_no === studentRollNo || r.captainRollNo === studentRollNo)) return false;
            if (studentName && studentRollNo && (r.name === studentName || r.captainName === studentName)) return false;
            return true;
          });

          await supabase.from('site_settings').upsert({
            id: 'global_config',
            config: { ...currentSettings.config, registrations: purgedList },
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Supabase delete registration exception:', err);
      }
    }

    return { success: true };
  };

  const bulkDeleteRegistrations = async (studentsOrIds = []) => {
    if (!studentsOrIds || studentsOrIds.length === 0) return { success: true };

    const targets = studentsOrIds.map(item => {
      if (typeof item === 'object') {
        return {
          id: item.id || '',
          rollNo: item.rollNo || item.roll_no || item.captainRollNo || '',
          name: item.name || item.captainName || ''
        };
      }
      return { id: String(item).trim(), rollNo: '', name: '' };
    });

    const targetIds = new Set(targets.map(t => t.id).filter(Boolean));
    const targetRolls = new Set(targets.map(t => t.rollNo).filter(Boolean));

    // Cache in persistent deleted IDs set
    try {
      const deletedSet = getDeletedRegIds();
      targetIds.forEach(id => deletedSet.add(id));
      targetRolls.forEach(roll => deletedSet.add(roll));
      localStorage.setItem('aahwan_deleted_reg_ids', JSON.stringify(Array.from(deletedSet)));
    } catch (e) {
      console.warn('Failed to cache bulk deleted ids:', e);
    }

    // Filter local state
    let nextRegs = [];
    setRegistrations(prev => {
      nextRegs = prev.filter(r => {
        if (r.id && targetIds.has(r.id)) return false;
        const rRoll = r.rollNo || r.roll_no || r.captainRollNo;
        if (rRoll && targetRolls.has(rRoll)) return false;
        return true;
      });
      localStorage.setItem('aahwan_registrations', JSON.stringify(nextRegs));
      localStorage.setItem('AWAHAAN_registrations', JSON.stringify(nextRegs));
      return nextRegs;
    });

    // Delete in Supabase
    if (supabase) {
      try {
        if (targetIds.size > 0) {
          await supabase.from('registrations').delete().in('id', Array.from(targetIds));
        }
        if (targetRolls.size > 0) {
          await supabase.from('registrations').delete().in('roll_no', Array.from(targetRolls));
        }

        const { data: currentSettings } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
        if (currentSettings?.config) {
          const existingList = Array.isArray(currentSettings.config.registrations) ? currentSettings.config.registrations : [];
          const purgedList = existingList.filter(r => {
            if (r.id && targetIds.has(r.id)) return false;
            const rRoll = r.rollNo || r.roll_no || r.captainRollNo;
            if (rRoll && targetRolls.has(rRoll)) return false;
            return true;
          });

          await supabase.from('site_settings').upsert({
            id: 'global_config',
            config: { ...currentSettings.config, registrations: purgedList },
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Supabase bulk delete exception:', err);
      }
    }

    return { success: true };
  };

  // Dignitaries CRUD Handlers (Synchronizes tiers and legacy aliases, saves to localStorage and Cloud immediately)
  const updateDignitary = (tier, index, updatedData) => {
    setDignitaries(prev => {
      const targetTier = tier === 'leadership' ? 'tier1' : tier === 'patrons' ? 'tier2' : tier === 'coordinators' ? 'tier3' : tier;
      const nextTier = [...(prev[targetTier] || [])];
      nextTier[index] = { ...nextTier[index], ...updatedData };
      const nextState = { ...prev, [targetTier]: nextTier };

      if (targetTier === 'tier1') { nextState.tier1 = nextTier; nextState.leadership = nextTier; }
      else if (targetTier === 'tier2') { nextState.tier2 = nextTier; nextState.patrons = nextTier; }
      else if (targetTier === 'tier3') { nextState.tier3 = nextTier; nextState.coordinators = nextTier; }

      localStorage.setItem('aahwan_dignitaries', JSON.stringify(nextState));
      localStorage.setItem('AWAHAAN_dignitaries', JSON.stringify(nextState));
      saveToCloud({ dignitaries: nextState });
      return nextState;
    });
  };

  const addDignitary = (tier, newPerson) => {
    setDignitaries(prev => {
      const targetTier = tier === 'leadership' ? 'tier1' : tier === 'patrons' ? 'tier2' : tier === 'coordinators' ? 'tier3' : tier;
      const nextTier = [...(prev[targetTier] || []), newPerson];
      const nextState = { ...prev, [targetTier]: nextTier };

      if (targetTier === 'tier1') { nextState.tier1 = nextTier; nextState.leadership = nextTier; }
      else if (targetTier === 'tier2') { nextState.tier2 = nextTier; nextState.patrons = nextTier; }
      else if (targetTier === 'tier3') { nextState.tier3 = nextTier; nextState.coordinators = nextTier; }

      localStorage.setItem('aahwan_dignitaries', JSON.stringify(nextState));
      localStorage.setItem('AWAHAAN_dignitaries', JSON.stringify(nextState));
      saveToCloud({ dignitaries: nextState });
      return nextState;
    });
  };

  const removeDignitary = (tier, index) => {
    setDignitaries(prev => {
      const targetTier = tier === 'leadership' ? 'tier1' : tier === 'patrons' ? 'tier2' : tier === 'coordinators' ? 'tier3' : tier;
      const nextTier = (prev[targetTier] || []).filter((_, i) => i !== index);
      const nextState = { ...prev, [targetTier]: nextTier };

      if (targetTier === 'tier1') { nextState.tier1 = nextTier; nextState.leadership = nextTier; }
      else if (targetTier === 'tier2') { nextState.tier2 = nextTier; nextState.patrons = nextTier; }
      else if (targetTier === 'tier3') { nextState.tier3 = nextTier; nextState.coordinators = nextTier; }

      localStorage.setItem('aahwan_dignitaries', JSON.stringify(nextState));
      localStorage.setItem('AWAHAAN_dignitaries', JSON.stringify(nextState));
      saveToCloud({ dignitaries: nextState });
      return nextState;
    });
  };

  // Sports CRUD Handlers
  const addSport = (newSport) => {
    setSports(prev => {
      const updated = [newSport, ...prev];
      localStorage.setItem('aahwan_sports', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_sports', JSON.stringify(updated));
      saveToCloud({ sports: updated });
      return updated;
    });
  };

  const updateSport = (id, updatedData) => {
    setSports(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updatedData } : s);
      localStorage.setItem('aahwan_sports', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_sports', JSON.stringify(updated));
      saveToCloud({ sports: updated });
      return updated;
    });
  };

  const deleteSport = (id) => {
    setSports(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('aahwan_sports', JSON.stringify(updated));
      localStorage.setItem('AWAHAAN_sports', JSON.stringify(updated));
      saveToCloud({ sports: updated });
      return updated;
    });
  };

  // Equipment Inventory Handlers (Dual-Engine: Supabase Dedicated Tables + Global Settings Sync)
  const addEquipment = async (item) => {
    const totalQty = Number(item.totalQty ?? item.total_qty ?? item.qty ?? 1);
    const newItem = normalizeEquipmentItem({
      ...item,
      id: item.id || `eq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: (item.name || '').trim(),
      category: item.category || 'General',
      totalQty: totalQty,
      total_qty: totalQty,
      condition: item.condition || 'Good Condition',
      location: item.location || 'Main Sports Store',
      notes: item.notes || '',
      created_at: new Date().toISOString()
    });

    let updatedList = [];
    setEquipmentList(prev => {
      updatedList = [newItem, ...prev.filter(e => e.id !== newItem.id)];
      localStorage.setItem('aahwan_equipment', JSON.stringify(updatedList));
      localStorage.setItem('AWAHAAN_equipment', JSON.stringify(updatedList));
      return updatedList;
    });

    // 1. Direct write to Supabase dedicated 'equipment' table (if created)
    if (supabase) {
      try {
        const { error: tblErr } = await supabase.from('equipment').upsert({
          id: newItem.id,
          name: newItem.name,
          category: newItem.category,
          total_qty: newItem.totalQty,
          condition: newItem.condition,
          location: newItem.location,
          notes: newItem.notes,
          created_at: newItem.created_at
        });
        if (tblErr) console.warn('Supabase equipment table notice:', tblErr.message);
      } catch (err) {
        console.warn('Supabase equipment table exception:', err);
      }
    }

    // 2. Dual-save to site_settings config for redundancy & backwards compatibility
    try {
      await saveToCloud({ equipmentList: updatedList });
    } catch (e) {
      console.warn('saveToCloud equipmentList error:', e);
    }

    return { success: true, item: newItem };
  };

  const updateEquipment = async (id, updatedData) => {
    let updatedList = [];
    let updatedItem = null;
    setEquipmentList(prev => {
      updatedList = prev.map(e => {
        if (e.id === id) {
          const merged = normalizeEquipmentItem({ ...e, ...updatedData });
          updatedItem = merged;
          return merged;
        }
        return e;
      });
      localStorage.setItem('aahwan_equipment', JSON.stringify(updatedList));
      localStorage.setItem('AWAHAAN_equipment', JSON.stringify(updatedList));
      return updatedList;
    });

    // 1. Direct write to Supabase dedicated 'equipment' table
    if (supabase && updatedItem) {
      try {
        const { error: tblErr } = await supabase.from('equipment').upsert({
          id: updatedItem.id,
          name: updatedItem.name,
          category: updatedItem.category,
          total_qty: updatedItem.totalQty,
          condition: updatedItem.condition,
          location: updatedItem.location,
          notes: updatedItem.notes
        });
        if (tblErr) console.warn('Supabase equipment table update notice:', tblErr.message);
      } catch (err) {
        console.warn('Supabase equipment table update exception:', err);
      }
    }

    // 2. Dual-save to site_settings config
    try {
      await saveToCloud({ equipmentList: updatedList });
    } catch (e) {
      console.warn('saveToCloud equipmentList error:', e);
    }

    return { success: true, item: updatedItem };
  };

  const deleteEquipment = async (id) => {
    let updatedList = [];
    setEquipmentList(prev => {
      updatedList = prev.filter(e => e.id !== id);
      localStorage.setItem('aahwan_equipment', JSON.stringify(updatedList));
      localStorage.setItem('AWAHAAN_equipment', JSON.stringify(updatedList));
      return updatedList;
    });

    // 1. Direct delete from Supabase dedicated 'equipment' table
    if (supabase) {
      try {
        const { error: tblErr } = await supabase.from('equipment').delete().eq('id', id);
        if (tblErr) console.warn('Supabase equipment table delete notice:', tblErr.message);
      } catch (err) {
        console.warn('Supabase equipment table delete exception:', err);
      }
    }

    // 2. Dual-save to site_settings config
    try {
      await saveToCloud({ equipmentList: updatedList });
    } catch (e) {
      console.warn('saveToCloud equipmentList error:', e);
    }

    return { success: true };
  };

  const issueEquipment = async (data) => {
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

    const newLog = normalizeEquipmentLog({
      ...data,
      id: data.id || `iss-${Date.now().toString().slice(-6)}`,
      status: 'issued',
      qty: Number(data.qty) || 1,
      issueDate: data.issueDate || formattedNow,
      issueTimestamp: data.issueTimestamp || now.toISOString(),
      expectedReturn: data.expectedReturn || '',
      expectedReturnTimestamp: data.expectedReturnTimestamp || null,
      borrowerPhone: data.borrowerPhone || '',
      purpose: data.purpose || 'Practice Match & Training',
      issueCondition: data.issueCondition || 'Good Condition',
      returnedCount: 0,
      returnDate: null,
      returnTimestamp: null,
      returnCondition: null,
      notes: data.notes || '',
      created_at: new Date().toISOString()
    });

    let updatedLogs = [];
    setEquipmentLogs(prev => {
      updatedLogs = [newLog, ...prev.filter(l => l.id !== newLog.id)];
      localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });

    // 1. Direct write to Supabase dedicated 'equipment_logs' table
    if (supabase) {
      try {
        const dbLog = {
          id: newLog.id,
          equipment_id: newLog.equipmentId,
          equipment_name: newLog.equipmentName,
          category: newLog.category,
          borrower_name: newLog.borrowerName,
          roll_no: newLog.rollNo,
          branch: newLog.branch,
          borrower_phone: newLog.borrowerPhone,
          qty: newLog.qty,
          status: newLog.status,
          issue_date: newLog.issueDate,
          issue_timestamp: newLog.issueTimestamp,
          expected_return: newLog.expectedReturn,
          expected_return_timestamp: newLog.expectedReturnTimestamp || null,
          returned_count: 0,
          return_date: null,
          return_timestamp: null,
          return_condition: null,
          notes: newLog.notes || '',
          created_at: newLog.created_at
        };
        const { error: tblErr } = await supabase.from('equipment_logs').upsert(dbLog);
        if (tblErr) console.warn('Supabase equipment_logs table notice:', tblErr.message);
      } catch (err) {
        console.warn('Supabase equipment_logs table exception:', err);
      }
    }

    // 2. Dual-save to site_settings config
    try {
      await saveToCloud({ equipmentLogs: updatedLogs });
    } catch (e) {
      console.warn('saveToCloud equipmentLogs error:', e);
    }

    return { success: true, log: newLog };
  };

  const returnEquipment = async (logId, condition, notes, returnQty, customReturnDate) => {
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

    let updatedLogs = [];
    let modifiedLog = null;
    setEquipmentLogs(prev => {
      updatedLogs = prev.map(l => {
        if (l.id === logId) {
          const totalQtyIssued = Number(l.qty) || 1;
          const numReturned = Math.min(totalQtyIssued, Number(returnQty) || totalQtyIssued);
          const isPartial = numReturned < totalQtyIssued;

          let updated;
          if (isPartial) {
            updated = normalizeEquipmentLog({
              ...l,
              qty: totalQtyIssued - numReturned,
              returnedCount: (Number(l.returnedCount) || 0) + numReturned,
              lastReturnDate: formattedNow,
              lastReturnTimestamp: now.toISOString(),
              returnCondition: condition,
              notes: `${l.notes || ''} [Returned ${numReturned} unit(s) on ${formattedNow}]`.trim()
            });
          } else {
            updated = normalizeEquipmentLog({
              ...l,
              status: 'returned',
              returnedCount: (Number(l.returnedCount) || 0) + numReturned,
              returnDate: formattedNow,
              returnTimestamp: now.toISOString(),
              returnCondition: condition,
              notes: notes || l.notes || ''
            });
          }
          modifiedLog = updated;
          return updated;
        }
        return l;
      });
      localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });

    // 1. Direct write to Supabase dedicated 'equipment_logs' table
    if (supabase && modifiedLog) {
      try {
        const dbLog = {
          id: modifiedLog.id,
          equipment_id: modifiedLog.equipmentId,
          equipment_name: modifiedLog.equipmentName,
          category: modifiedLog.category,
          borrower_name: modifiedLog.borrowerName,
          roll_no: modifiedLog.rollNo,
          branch: modifiedLog.branch,
          borrower_phone: modifiedLog.borrowerPhone,
          qty: modifiedLog.qty,
          status: modifiedLog.status,
          issue_date: modifiedLog.issueDate,
          issue_timestamp: modifiedLog.issueTimestamp,
          expected_return: modifiedLog.expectedReturn,
          expected_return_timestamp: modifiedLog.expectedReturnTimestamp || null,
          returned_count: modifiedLog.returnedCount,
          return_date: modifiedLog.returnDate,
          return_timestamp: modifiedLog.returnTimestamp,
          return_condition: modifiedLog.returnCondition,
          notes: modifiedLog.notes || ''
        };
        const { error: tblErr } = await supabase.from('equipment_logs').upsert(dbLog);
        if (tblErr) console.warn('Supabase equipment_logs return notice:', tblErr.message);
      } catch (err) {
        console.warn('Supabase equipment_logs return exception:', err);
      }
    }

    // 2. Dual-save to site_settings config
    try {
      await saveToCloud({ equipmentLogs: updatedLogs });
    } catch (e) {
      console.warn('saveToCloud equipmentLogs error:', e);
    }

    return { success: true, log: modifiedLog };
  };

  const deleteEquipmentLog = async (logId) => {
    let updatedLogs = [];
    setEquipmentLogs(prev => {
      updatedLogs = prev.filter(l => l.id !== logId);
      localStorage.setItem('aahwan_equipment_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('AWAHAAN_equipment_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });

    // 1. Direct delete from Supabase dedicated 'equipment_logs' table
    if (supabase) {
      try {
        const { error: tblErr } = await supabase.from('equipment_logs').delete().eq('id', logId);
        if (tblErr) console.warn('Supabase equipment_logs delete notice:', tblErr.message);
      } catch (err) {
        console.warn('Supabase equipment_logs delete exception:', err);
      }
    }

    // 2. Dual-save to site_settings config
    try {
      await saveToCloud({ equipmentLogs: updatedLogs });
    } catch (e) {
      console.warn('saveToCloud equipmentLogs error:', e);
    }

    return { success: true };
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
      teamSquadSizes, setTeamSquadSizes, updateTeamSquadSize, DEFAULT_TEAM_SQUAD_SIZES,
      branchPointsOverride, updateBranchScore, resetBranchScore, resetAllBranchScores, setAllPointsToZero,
      sportWinners, setSportWinners, assignSportWinner, getStandings, findSportWinner, updateSportCategory,
      galleryPhotos, addGalleryPhoto, deleteGalleryPhoto,
      registrations, addRegistration, deleteRegistration, bulkDeleteRegistrations,
      equipmentList, addEquipment, updateEquipment, deleteEquipment,
      equipmentLogs, issueEquipment, returnEquipment, deleteEquipmentLog,
      viewMode, setViewMode,
      isAdminLoggedIn,
      showStudentRegistration, setShowStudentRegistration,
      loginAdmin, logoutAdmin,
      handlePhotoUpload,
      saveToCloud,
      loadCloudConfig,
      refreshCloudData: loadCloudConfig,
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
