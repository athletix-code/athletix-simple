// ═══════════════════════════════════════
//  CONFIG - Single Source of Truth
//  AthletiX App - konfiguracja
// ═══════════════════════════════════════

var AX_CONFIG = {
  version: '1.5.0',
  build: 'simple',

  // BRANDING
  appName: 'AthletiX App',
  appShort: 'AX',
  companyName: 'Sigma AthletiX',
  slogan: 'Elevate Your Game ⚡',
  url: 'athletix-code.github.io/athletix-simple',
  contactEmail: 'kontakt@sigmaathletix.pl',
  brandRed: '#dc2626',

  // ATP SYSTEM
  atp: {
    perEntry: 10,
    perAttendance: 15,
    perTest: 15,
    perNote: 5,
    perMotionSession: 15,
    perMotionPR: 20,
    perQuizFirst: 10,
    perQuizImprove: 5,
    streakBonus: 10,
    streakType: 'weekly'
  },

  // RANGI
  ranks: [
    {name:'Nowicjusz',emoji:'🌱',threshold:0},
    {name:'Regularny',emoji:'🔄',threshold:100},
    {name:'Wojownik',emoji:'⚔️',threshold:500},
    {name:'Gladiator',emoji:'🛡️',threshold:1200},
    {name:'Wiking',emoji:'⚡',threshold:2500},
    {name:'Spartanin',emoji:'🔥',threshold:4500},
    {name:'Tytan',emoji:'💎',threshold:7500},
    {name:'Heros',emoji:'🦅',threshold:12000},
    {name:'Legenda',emoji:'👑',threshold:18000},
    {name:'Mistrz Olimpu',emoji:'🏛️',threshold:26000},
    {name:'Półbóg',emoji:'⭐',threshold:36000},
    {name:'Bóg Olimpu',emoji:'🌟',threshold:50000},
    {name:'Nieśmiertelny',emoji:'♾️',threshold:100000}
  ],

  // MOTION POSTACIE
  characters: [
    {name:'Pisklak',emoji:'🐣',level:1},
    {name:'Żółtodziób',emoji:'🐥',level:2},
    {name:'Kotek',emoji:'🐱',level:3},
    {name:'Szczeniak',emoji:'🐶',level:4},
    {name:'Lis',emoji:'🦊',level:5},
    {name:'Wilk',emoji:'🐺',level:6},
    {name:'Niedźwiedź',emoji:'🐻',level:7},
    {name:'Pantera',emoji:'🐆',level:8},
    {name:'Orzeł',emoji:'🦅',level:9},
    {name:'Lew',emoji:'🦁',level:10},
    {name:'Smok',emoji:'🐉',level:12},
    {name:'Feniks',emoji:'🔥',level:15},
    {name:'Tytan',emoji:'⚡',level:20},
    {name:'G.O.A.T.',emoji:'🐐',level:25}
  ],

  // STORAGE KEYS
  storageKeys: [
    'axs_athletes','axs_sessions','axs_groups','axs_tests','axs_notes',
    'axs_custom_tests','axs_packages','axs_int_presets','axs_custom_exercises',
    'axs_plans','axs_favorite_exercises','axs_gamification','axs_motion_results',
    'axs_quiz_results','cts_v5','ct_theme','axs_lang'
  ],

  // FEATURE FLAGS
  features: {
    motion: true,
    agility: true,
    quiz: true,
    share: true,
    supabaseSync: false,
    clientView: false,
    masterplan: false,
    akademia: false
  }
};
