// ═══════════════════════════════════════
//  I18N - Internacjonalizacja
//  Single Source of Truth dla tekstów UI
// ═══════════════════════════════════════

var AX_LANG = {
  current: 'pl',

  strings: {
    pl: {
      // NAV
      nav_session:'Sesja', nav_vault:'Skarbiec', nav_motion:'Motion', nav_profile:'Profil',
      nav_tempo:'Tempo', nav_reactive:'Reactive', nav_intervals:'Interwały',
      nav_athletes:'Zawodnicy', nav_plans:'Plany', nav_data:'Dane',

      // COMMON
      btn_start:'ROZPOCZNIJ', btn_save:'Zapisz', btn_cancel:'Anuluj', btn_close:'Zamknij',
      btn_back:'Wróć', btn_next:'Dalej', btn_share:'Udostępnij wynik', btn_download:'Pobierz PNG',
      btn_logout:'Wyloguj', btn_retry:'Zagraj ponownie', btn_understand:'Rozumiem! 💪',

      // VAULT
      vault_deposit:'DEPOZYT', vault_treasury:'SKARBIEC', vault_entries:'WEJŚĆ', vault_rate:'STAWKA',
      vault_topup:'+ Doładuj', vault_entry:'- Wejście', vault_cancel:'Odwołanie',
      vault_confirm_title:'Odbić wejście?', vault_confirm_btn:'Tak, odbij wejście',
      vault_confirmed:'Wejście odebrane',

      // ATP
      atp_points:'Punkty ATP', atp_rank:'Ranga', atp_how:'Jak to działa?',

      // MOTION
      motion_module_reaction:'Czas Reakcji', motion_module_agility:'Agility',
      motion_game_reaction:'Reakcja', motion_game_directions:'Kierunki',
      motion_game_gonogo:'Go/No-Go', motion_game_patterns:'Wzorce',
      motion_game_search:'Wyszukiwanie', motion_game_sniper:'Snajper',
      motion_game_agility:'Agility Dash',
      motion_points:'PUNKTY', motion_level:'POZIOM', motion_lives:'ŻYCIA',
      motion_last:'OSTATNI', motion_avg:'ŚREDNIA', motion_best:'NAJLEPSZY',
      motion_combo:'COMBO', motion_accuracy:'CELNOŚĆ', motion_round:'Runda',
      motion_gameover:'KONIEC GRY', motion_newrecord:'NOWY REKORD!',
      motion_ready:'DAWAJ! 🚀', motion_wait:'Czekaj...', motion_react:'REAGUJ!',
      motion_wrong_dir:'Zły kierunek!', motion_false_start:'Za wcześnie!',
      motion_no_reaction:'Brak reakcji', motion_timeout:'Czas minął!',

      // QUIZ
      quiz_title:'Czy jesteś Reaktywnym Nerdem?',
      quiz_subtitle:'4 levele po 5 pytań. Minimum 3/5 żeby przejść dalej.',
      quiz_start:'Zaczynamy! 🚀', quiz_next:'Następne pytanie >',
      quiz_finish:'Zakończ quiz', quiz_result:'Wynik', quiz_retry:'Spróbuj ponownie',
      quiz_correct:'Poprawnie!', quiz_wrong:'Źle!',
      quiz_show_level:'Pokaż wynik levelu >', quiz_show_final:'Pokaż wynik końcowy',
      quiz_read_nerd:'Przeczytaj sekcję nerdową',

      // SHARE
      share_title:'Udostępnij wynik', share_format_story:'Story 9:16', share_format_post:'Post 1:1',
      share_color:'KOLOR', share_text_label:'TEKST NA GRAFICE', share_generate:'Generuj podgląd',
      share_photo:'Dodaj zdjęcie', share_remove_photo:'Usuń',

      // PROFILE
      profile_this_week:'TEN TYDZIEŃ', profile_this_month:'TEN MIESIĄC',
      profile_this_year:'TEN ROK', profile_last:'OSTATNIA',
      profile_full_stats:'Pełne statystyki',

      // NERD
      nerd_section:'Sekcja dla nerdów',
      nerd_subtitle:'Jak to NAPRAWDĘ działa? Nauka, fakty, źródła.',
      nerd_challenge_title:'Mądrzejszy od naszego nerda?',
      nerd_challenge_offer:'Znajdź błąd merytoryczny, potwierdź go źródłem - dostaniesz miesiąc bezpłatnego korzystania z AthletiX App.',
      nerd_challenge_cta:'Challenge\'uj siebie i nas. Rozwijajmy się wspólnie. 🧠',

      // BRAND
      brand_slogan:'Elevate Your Game ⚡',
      brand_name:'AthletiX App',
      brand_team:'MY ATHLETIX TEAM'
    },

    en: {
      nav_session:'Session', nav_vault:'Vault', nav_motion:'Motion', nav_profile:'Profile',
      nav_tempo:'Tempo', nav_reactive:'Reactive', nav_intervals:'Intervals',
      nav_athletes:'Athletes', nav_plans:'Plans', nav_data:'Data',

      btn_start:'START', btn_save:'Save', btn_cancel:'Cancel', btn_close:'Close',
      btn_back:'Back', btn_next:'Next', btn_share:'Share result', btn_download:'Download PNG',
      btn_logout:'Log out', btn_retry:'Play again', btn_understand:'Got it! 💪',

      vault_deposit:'DEPOSIT', vault_treasury:'VAULT', vault_entries:'ENTRIES', vault_rate:'RATE',
      vault_topup:'+ Top up', vault_entry:'- Entry', vault_cancel:'Cancellation',
      vault_confirm_title:'Confirm entry?', vault_confirm_btn:'Yes, confirm',
      vault_confirmed:'Entry confirmed',

      atp_points:'ATP Points', atp_rank:'Rank', atp_how:'How does it work?',

      motion_module_reaction:'Reaction Time', motion_module_agility:'Agility',
      motion_game_reaction:'Reaction', motion_game_directions:'Directions',
      motion_game_gonogo:'Go/No-Go', motion_game_patterns:'Patterns',
      motion_game_search:'Search', motion_game_sniper:'Sniper',
      motion_game_agility:'Agility Dash',
      motion_points:'POINTS', motion_level:'LEVEL', motion_lives:'LIVES',
      motion_last:'LAST', motion_avg:'AVERAGE', motion_best:'BEST',
      motion_combo:'COMBO', motion_accuracy:'ACCURACY', motion_round:'Round',
      motion_gameover:'GAME OVER', motion_newrecord:'NEW RECORD!',
      motion_ready:'GO! 🚀', motion_wait:'Wait...', motion_react:'REACT!',
      motion_wrong_dir:'Wrong direction!', motion_false_start:'Too early!',
      motion_no_reaction:'No reaction', motion_timeout:'Time\'s up!',

      quiz_title:'Are you a Reactive Nerd?',
      quiz_subtitle:'4 levels, 5 questions each. Min 3/5 to pass.',
      quiz_start:'Let\'s go! 🚀', quiz_next:'Next question >',
      quiz_finish:'Finish quiz', quiz_result:'Result', quiz_retry:'Try again',
      quiz_correct:'Correct!', quiz_wrong:'Wrong!',
      quiz_show_level:'Show level result >', quiz_show_final:'Show final result',
      quiz_read_nerd:'Read the nerd section',

      share_title:'Share result', share_format_story:'Story 9:16', share_format_post:'Post 1:1',
      share_color:'COLOR', share_text_label:'TEXT ON IMAGE', share_generate:'Generate preview',
      share_photo:'Add photo', share_remove_photo:'Remove',

      profile_this_week:'THIS WEEK', profile_this_month:'THIS MONTH',
      profile_this_year:'THIS YEAR', profile_last:'LAST',
      profile_full_stats:'Full stats',

      nerd_section:'Nerd section',
      nerd_subtitle:'How it REALLY works? Science, facts, sources.',
      nerd_challenge_title:'Smarter than our nerd?',
      nerd_challenge_offer:'Find a factual error, back it with a source - get a free month of AthletiX App.',
      nerd_challenge_cta:'Challenge yourself and us. Let\'s grow together. 🧠',

      brand_slogan:'Elevate Your Game ⚡',
      brand_name:'AthletiX App',
      brand_team:'MY ATHLETIX TEAM'
    }
  },

  t: function(key) {
    var lang = this.strings[this.current] || this.strings.pl;
    return lang[key] || this.strings.pl[key] || key;
  },

  setLang: function(code) {
    this.current = code;
    try { localStorage.setItem('axs_lang', code); } catch(e) {}
  },

  init: function() {
    try { this.current = localStorage.getItem('axs_lang') || 'pl'; } catch(e) { this.current = 'pl'; }
  }
};

AX_LANG.init();
