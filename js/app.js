/**
 * AAHWAN 2026 - Government College of Engineering Kalahandi (GCEK)
 * Interactive Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initSportsFilter();
  initScheduleTabs();
  initModalHandlers();
  initGalleryLightbox();
  initStatsCounter();
});

/* 1. Navbar Scroll Effect */
function initNavbarScroll() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* 2. Sports Category Filtering */
function initSportsFilter() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const sportCards = document.querySelectorAll('.sport-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.getAttribute('data-filter');

      sportCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* 3. Schedule Day Tabs */
function initScheduleTabs() {
  const dayBtns = document.querySelectorAll('.schedule-day-btn');
  const scheduleLists = document.querySelectorAll('.schedule-day-content');

  dayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dayBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetDay = btn.getAttribute('data-day');

      scheduleLists.forEach(list => {
        if (list.getAttribute('id') === `day-${targetDay}`) {
          list.style.display = 'flex';
        } else {
          list.style.display = 'none';
        }
      });
    });
  });
}

/* 4. Sport Details & Rulebook Modal System */
const sportsData = {
  '100m-sprint': {
    title: '100m & 200m Sprint Athletics',
    category: 'Track Event',
    venue: 'GCEK Main Athletic Track',
    time: 'Day 1 - 09:00 AM',
    coordinator: 'Dr. Faculty Coordinator & Student Secretary',
    desc: 'The ultimate test of speed and power. Student sprinters from CSE, EE, ME, and CE compete in heats and finals on the pristine track.',
    rules: [
      'Each branch can register up to 3 male and 3 female athletes.',
      'Athletes must wear standard running spikes or athletic shoes.',
      'False starts result in immediate warning/disqualification as per IAAF standards.',
      'Final placement determined by electronic photo-finish timing.'
    ]
  },
  'relay-4x100': {
    title: '4 x 100m Inter-Branch Relay',
    category: 'Track Event',
    venue: 'GCEK Athletic Oval',
    time: 'Day 3 - 04:00 PM',
    coordinator: 'Athletic Board Convener',
    desc: 'High-voltage team sprint relay. Precision baton handovers between 4 sprinters representing their respective engineering departments.',
    rules: [
      'Strict 20-meter baton exchange zone enforcement.',
      'Dropping the baton requires the runner to pick it up without interfering with other lanes.',
      'Standard 4 legs with pre-declared baton order.'
    ]
  },
  'javelin-shotput': {
    title: 'Field Events: Javelin & Shot Put',
    category: 'Field Event',
    venue: 'GCEK Field Sector B',
    time: 'Day 1 & 2 - 11:30 AM',
    coordinator: 'Field Event Convener',
    desc: 'Strength, technique, and distance. High-intensity throwing events for men and women categories.',
    rules: [
      '3 trial attempts per athlete; top 6 qualify for final 3 attempts.',
      'Foul line crossing invalidates the throw.',
      'Standard weight specifications: Javelin (800g/600g), Shot Put (7.26kg/4kg).'
    ]
  },
  'cricket-t20': {
    title: 'GCEK Inter-Branch Cricket Cup',
    category: 'Team Sport',
    venue: 'GCEK Main Cricket Ground',
    time: 'Day 1 to 3 - Knockout Format',
    coordinator: 'Cricket Conveners (Student & Faculty)',
    desc: 'The premiere 10-over / T20 cricket tournament featuring fierce rivalry between CSE, EE, ME, and Civil branches.',
    rules: [
      '10 overs per side for prelims, 15 overs for Grand Finals.',
      'Maximum 2 overs per bowler in 10-over matches.',
      'Free hit awarded for all front-foot no balls.',
      'Super Over in case of a tie.'
    ]
  },
  'football-league': {
    title: 'GCEK Football Champions Trophy',
    category: 'Team Sport',
    venue: 'GCEK Football Arena',
    time: 'Day 2 & 3',
    coordinator: 'Football Convener',
    desc: '11 vs 11 tactical football championship filled with thunderous strikes and spectacular saves.',
    rules: [
      '30-minute halves with a 10-minute halftime break.',
      'Up to 5 substitutions permitted per match.',
      'Direct penalty shootout if tied at full-time during knockout stages.'
    ]
  },
  'volleyball-clash': {
    title: 'Hard-Court Volleyball Tournament',
    category: 'Team Sport',
    venue: 'GCEK Outdoor Volleyball Court',
    time: 'Day 1 & 2',
    coordinator: 'Volleyball Convener',
    desc: 'Power spikes, quick blocks, and high energy rallies on the floodlit hard courts.',
    rules: [
      'Best of 3 sets for preliminary matches; Best of 5 for Finals.',
      'Rally point system scoring up to 25 points per set (2 point lead required).',
      'Net touches and centerline foot violations strictly penalized.'
    ]
  },
  'kabaddi-league': {
    title: 'Pro-Style Kabaddi Championship',
    category: 'Team Sport',
    venue: 'GCEK Mat & Clay Raider Arena',
    time: 'Day 2 - 03:00 PM',
    coordinator: 'Kabaddi Convener',
    desc: 'Traditional high-intensity raider clash. Speed, agility, and defensive tackles.',
    rules: [
      '20-minute halves (10 mins each half for women).',
      '30-second raid clock with Do-or-Die raid enforcement.',
      'Super Tackle yields 2 points for defense.'
    ]
  },
  'kho-kho-championship': {
    title: 'Kho-Kho Speed & Dodge Tournament',
    category: 'Team Sport',
    venue: 'GCEK Kho-Kho Court',
    time: 'Day 1 - 02:00 PM',
    coordinator: 'Kho-Kho Student Secretary',
    desc: 'Electrifying tactical chase and dodge team event requiring supreme stamina and alertness.',
    rules: [
      '2 innings per team; 9 minutes per inning.',
      'Strict single-direction pursuit by chaser.',
      'Clean tap and "Kho" call required during position exchanges.'
    ]
  },
  'table-tennis': {
    title: 'Table Tennis Championship',
    category: 'Indoor Sport',
    venue: 'GCEK Indoor Sports Complex',
    time: 'Day 1 & 2',
    coordinator: 'TT Convener',
    desc: 'Fast-paced table tennis singles and doubles tournament with high spin and fast counter-attacks.',
    rules: [
      '11 points per game; Best of 5 games.',
      'Service rotates every 2 points.',
      'International ITTF standard tables and 40mm+ balls.'
    ]
  },
  'chess-championship': {
    title: 'GCEK Grandmaster Chess Blitz',
    category: 'Mind Sport',
    venue: 'GCEK Central Library Seminar Hall',
    time: 'Day 1 - 10:00 AM',
    coordinator: 'Chess Club Head',
    desc: 'Strategic battle of minds. Rapid & Blitz Swiss system tournament.',
    rules: [
      'FIDE rules apply; 10 mins + 5 sec increment time control.',
      'Touch-move rule strictly enforced.',
      'Tie-breakers decided by Buchholz system.'
    ]
  }
};

function initModalHandlers() {
  const modalBackdrop = document.getElementById('sportsModal');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modalBackdrop || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });
}

function openSportModal(sportId) {
  const data = sportsData[sportId];
  if (!data) return;

  const modalBackdrop = document.getElementById('sportsModal');
  document.getElementById('modalCategory').textContent = data.category;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalVenue').textContent = data.venue;
  document.getElementById('modalTime').textContent = data.time;
  document.getElementById('modalDesc').textContent = data.desc;

  const rulesList = document.getElementById('modalRulesList');
  rulesList.innerHTML = '';
  data.rules.forEach(rule => {
    const li = document.createElement('li');
    li.textContent = rule;
    rulesList.appendChild(li);
  });

  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modalBackdrop = document.getElementById('sportsModal');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

/* 5. Photo Gallery Lightbox */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('h4')?.textContent || 'AAHWAN Highlight';
      
      if (img) {
        const lightboxModal = document.createElement('div');
        lightboxModal.className = 'modal-backdrop active';
        lightboxModal.style.zIndex = '3000';
        lightboxModal.innerHTML = `
          <div style="position:relative; max-width:90%; max-height:90vh; text-align:center;">
            <button onclick="this.parentElement.parentElement.remove(); document.body.style.overflow='auto';" 
                    style="position:absolute; top:-40px; right:0; background:white; border:none; width:36px; height:36px; border-radius:50%; font-weight:bold; cursor:pointer;">✕</button>
            <img src="${img.src}" alt="${title}" style="max-width:100%; max-height:80vh; border-radius:16px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
            <p style="color:white; margin-top:1rem; font-family:var(--font-heading); font-size:1.2rem; font-weight:700;">${title}</p>
          </div>
        `;
        document.body.appendChild(lightboxModal);
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

/* 6. Stats Animated Counter */
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-item h3');
  let animated = false;

  window.addEventListener('scroll', () => {
    const heroSec = document.querySelector('.hero');
    if (!heroSec || animated) return;

    const rect = heroSec.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      animated = true;
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target') || '0', 10);
        let count = 0;
        const speed = target / 30;
        const updateCount = () => {
          count += speed;
          if (count < target) {
            stat.textContent = Math.ceil(count) + '+';
            setTimeout(updateCount, 40);
          } else {
            stat.textContent = target + '+';
          }
        };
        updateCount();
      });
    }
  });
}
