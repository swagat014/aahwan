export const scheduleData = {
  1: [
    {
      time: '08:30 AM',
      title: 'Opening Ceremony & Athletic March Past',
      location: 'All Branches (CSE, EE, ME, CE) - Main Ground',
      status: 'completed',
      statusLabel: 'Completed'
    },
    {
      time: '09:30 AM',
      title: '100m Sprint Men & Women Prelims',
      location: 'Track Oval - Heats 1, 2, 3',
      status: 'live',
      statusLabel: 'LIVE NOW'
    },
    {
      time: '11:00 AM',
      title: 'Chess Blitz Round 1 to 4 (Boys & Girls)',
      location: 'GCEK Seminar Hall',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    },
    {
      time: '02:00 PM',
      title: 'Cricket Knockout Match: CSE vs Mechanical',
      location: 'Main Cricket Pitch',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    }
  ],
  2: [
    {
      time: '09:00 AM',
      title: 'Football Semi-Final 1: Electrical vs Civil (Boys)',
      location: 'GCEK Football Arena',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    },
    {
      time: '11:30 AM',
      title: 'Volleyball Semi-Finals (Boys & Girls)',
      location: 'Court 1 & Court 2',
      status: 'live',
      statusLabel: 'LIVE NOW',
      score: {
        set1: '25 - 21',
        set2: '19 - 25',
        set3: '14 - 10',
        type: 'sets',
        teamA: 'CSE',
        teamB: 'ME',
        scoreA: 'Set 1: 25 - 21',
        scoreB: 'Set 2: 19 - 25',
        status: 'live',
        summary: 'Set 3 In Progress',
        updatedAt: '16:56',
        statusLabel: 'LIVE NOW',
        statusNotes: 'Serving: CSE',
        currentServer: 'CSE'
      }
    },
    {
      time: '03:00 PM',
      title: 'Kabaddi League Matches (Boys & Girls)',
      location: 'Mat Arena',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    }
  ],
  3: [
    {
      time: '09:00 AM',
      title: 'Athletics Finals: 100m, 200m, Long Jump, High Jump',
      location: 'Main Athletic Ground',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    },
    {
      time: '02:30 PM',
      title: '4x400m Relay Race Grand Showdown (Boys & Girls)',
      location: 'Athletic Track',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    },
    {
      time: '05:00 PM',
      title: 'Valedictory Ceremony & Rolling Trophy Presentation',
      location: 'Main Stage - Chief Guest, Principal & DSW GCEK',
      status: 'upcoming',
      statusLabel: 'Upcoming'
    }
  ]
};

export const leaderboardData = [
  {
    rank: 1,
    branch: 'Computer Science & Engg (CSE)',
    code: 'CSE',
    gold: 8,
    silver: 4,
    bronze: 3,
    points: 85,
    icon: 'LaptopCode'
  },
  {
    rank: 2,
    branch: 'Electrical Engineering (EE)',
    code: 'EE',
    gold: 6,
    silver: 5,
    bronze: 4,
    points: 68,
    icon: 'Zap'
  },
  {
    rank: 3,
    branch: 'Mechanical Engineering (ME)',
    code: 'ME',
    gold: 4,
    silver: 6,
    bronze: 2,
    points: 54,
    icon: 'Cog'
  },
  {
    rank: 4,
    branch: 'Civil Engineering (CE)',
    code: 'CE',
    gold: 3,
    silver: 3,
    bronze: 5,
    points: 42,
    icon: 'Building'
  }
];

export const dignitariesData = {
  tier1: [
    {
      name: 'Dr. High-Esteem Principal',
      role: 'Principal & Chief Patron',
      dept: 'Principal, GCEK Kalahandi',
      image: '/assets/images/gcek_principal_vp_1786977233454.png',
      quote: 'Sports build character, discipline, and lifelong resilience. May AWAHAAN 2026 inspire every engineer at GCEK to strive for glory with unwavering integrity.'
    },
    {
      name: 'Dr. Dean Students Welfare',
      role: "Dean Students' Welfare (DSW)",
      dept: 'DSW, GCEK Kalahandi',
      image: '/assets/images/gcek_dsw_portrait_1786988485160.png',
      quote: 'Student welfare and athletic growth are central to our university mission. We empower student-athletes across track, field, and indoor disciplines.'
    }
  ],
  tier2: [
    {
      name: 'Prof. Sports Vice President',
      role: 'Vice President (VP Sports)',
      dept: 'VP, Sports Society GCEK',
      image: '/assets/images/gcek_principal_vp_1786977233454.png',
      quote: 'Overseeing sports infrastructure, tournament governance, and state-level athletic representations across all branches.'
    },
    {
      name: 'Dr. Faculty Sports Coordinator',
      role: 'Faculty Sports Coordinator',
      dept: 'Faculty In-Charge, Athletic Board',
      image: '/assets/images/cricket_football_action_1786976997763.png',
      quote: 'Managing event operations, technical referees, and safety protocols to deliver an exceptional athletic meet.'
    }
  ],
  tier3: [
    {
      name: 'Swagat Ranjan Choudhury',
      role: 'Sports Secretary',
      dept: 'Student Head, AAHWAN 2026',
      image: 'https://hxspfwjoxxmluhwqbsva.supabase.co/storage/v1/object/public/AWAHAAN/dignitaries/1788934187783-pn536un.jpg',
      quote: 'Leading the student athletic community of GCEK! Let us unite for victory and sportsmanship in AAHWAN 2026.'
    },
    {
      name: 'Student Coordinators & Conveners',
      role: 'Student Coordinators',
      dept: 'Branch Conveners (CSE, EE, ME, CE)',
      image: '/assets/images/indoor_team_sports_1786977084385.png',
      quote: 'Organizing branch selections, event logistics, and crowd enthusiasm across all track and field competitions.'
    }
  ]
};
