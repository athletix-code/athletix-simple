// ═══════════════════════════════════════
//  MOTION GAMES — Moduł Reakcja (gra z levelami)
//  Akcelerometr + fallback klawiatura
// ═══════════════════════════════════════

var _motionMode='simple';
var _motionRunning=false, _motionAbort=false, _desktopFallback=false, _motionHandler=null;
var _motionBlockSwipeClose=false;
var _motionState={listening:false,ax:0,ay:0,az:0,baseline:{x:0,y:0,z:0},sensitivity:3,_keyPressed:null};
// Stan gry
var _gamePoints=0, _gameLives=3, _gameLevel=1, _gameCombo=0, _gameMaxCombo=0, _gameTotalTrials=0, _gameCorrect=0, _gameTimes=[], _gameBestLevel=0, _gameLastTime=0;
var _trialIdx=0, _trialTotal=0;
// Tryb Wzorce
var PATTERN_SYMBOLS=['🔴','🟢','🔵','🟡','🟣','🟠','⬜','⬛'];

// ── Osobowość trenera — cytaty i feedback ──
var BRIEFING_QUOTES=['Spokojnie, to tylko gra... w której oceniam Twój mózg. 🧠','Oddychaj. Skup się. I nie myśl o tym, że Cię oceniam.','Sprinterzy reagują w 120ms. Bez presji. 😏','Twoje palce są gotowe. Pytanie czy mózg nadąży.','Poprzednim razem poszło Ci... no, sam zobaczysz.','Pamiętaj: to trening. Błędy są OK. Brak prób — nie.','Za chwilę zaczniesz. Za godzinę będziesz chciał jeszcze raz.','Jestem tylko aplikacją, ale wierzę w Ciebie. Serio.','No to co, gotowy na kolejną dawkę adrenaliny?','Dziś pobijemy rekord. Albo przynajmniej spróbujemy.'];
var LEVEL_MOTIVATORS=['Wierzę w Ciebie. No... prawie na pewno.','Następny level to Twój. Weź go.','Gorzej już było. Teraz może być tylko lepiej. 😏','Skup się. Oddychaj. I nie myśl o poprzednich błędach.','Gdyby to było łatwe, każdy by to robił.','Twój mózg właśnie buduje nowe połączenia neuronalne. Dosłownie.','Za 10 sekund zapomnisz o tym tekście i będziesz w trybie walki.','Pamiętaj: postęp > perfekcja.','Ten level jest trudniejszy. Ale Ty też jesteś lepszy niż 5 minut temu.','Nic nie motywuje bardziej niż udowodnienie sobie że się da.','Ok, starczy tego coachingu. Dawaj. 🚀'];
var _COACH_FAST=['No dobra, przyznam — to było szybkie. Naprawdę szybkie. 🔥','Twój czas reakcji jest bliżej pilota myśliwca niż zwykłego śmiertelnika.','Okej, oficjalnie nie mam się już do czego przyczepić. Prawie.','Szybszy niż mój procesor. I nie mówię tego każdemu.'];
var _COACH_MID=['Solidnie! Nie jesteś sprinterem olimpijskim, ale kto jest? 😏','Dobre tempo. Mózg pracuje, mięśnie nadążają. Tak trzymaj.','Widzę postęp. Albo po prostu dobrze spałeś. Tak czy siak — brawo.','Niezły poziom. Jeszcze parę takich sesji i zacznę się bać.'];
var _COACH_OK=['Hej, jest potencjał! Tylko go trochę... obudzić. ☕','Nie jest źle. Naprawdę. Ale może jutro po kawie będzie lepiej?','Przeciętnie? Tak. Ale przeciętność to punkt wyjścia, nie wyrok.','Dobra wiadomość: jest dokąd się rozwijać. Zła: jest dokąd się rozwijać. 😄'];
var _COACH_SLOW=['Okej, chwila coachingu... Skup się bardziej. Koniec coachingu. 😎','Hmm, chyba ktoś myślami był gdzie indziej? Następny level — pełna koncentracja!','Sprinterzy reagują 5× szybciej? Dobra, liczyłeś na pochwałę. Ale muszę być szczery.','Nie martw się, Einstein też pewnie miałby kiepski czas reakcji. Prawdopodobnie.'];
var _COACH_ACC=[' Za dużo pomyłek. Ale hej — pomyłki to dowód na to że próbujesz.',' Trochę za dużo fałszywych alarmów. Cierpliwość, młody padawanie.',' Przeczytaj zasady jeszcze raz. Żartuję. A może nie. 🤔'];
var _COACH_COMBO=[' Combo x{N}! To nie przypadek — to flow state. 🧘',' Seria {N} z rzędu. Twój mózg wszedł w tryb turbo.',' {N} z rzędu — i to BEZ przerwy? Respect.'];
var _COACH_NERD=[' 🤓 Sygnał nerwowy podróżuje ~120 m/s. To ~430 km/h. <a href="https://backyardbrains.com/pages/the-science-of-your-reaction-time" target="_blank" style="color:#3b82f6;text-decoration:underline;">Więcej o neurofizjologii →</a>',' 🤓 Bodziec wzrokowy dociera do mózgu w ~20-40ms (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/" target="_blank" style="color:#3b82f6;text-decoration:underline;">Jain et al., 2015</a>). Reszta to przetwarzanie.',' 🤓 Badanie <a href="https://mindcrowd.org/reaction-time-as-a-measure-of-brain-health-mindcrowd-study-findings/" target="_blank" style="color:#3b82f6;text-decoration:underline;">MindCrowd</a>: czas reakcji pogarsza się o ~3-7ms na rok życia. Trening pomaga!',' 🤓 W sprincie próg falstartu to 100ms. <a href="https://worldathletics.org/news/news/iaaf-sprint-start-research-project-is-the-100" target="_blank" style="color:#3b82f6;text-decoration:underline;">Badania Komi (2009)</a> sugerują, że niektórzy reagują w 80ms.',' 🤓 Czas reakcji jest lepszy po rozgrzewce, kawie i dobrym śnie. Gorszy po jedzeniu i alkoholu.'];
var _COACH_JOKE=[' 😄 Suchar: Dlaczego akcelerometr nie chodzi na randki? Bo za szybko się przechyla.',' 😄 Co mówi trener do wolnego zawodnika? "Masz czas... ale nie za dużo."',' 😄 Koniec żartów. Chociaż... jeszcze jeden. Nie? Ok, wracamy do roboty.'];
function _pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function getCoachFeedback(avg,acc,combo,lv){
  var t=avg<250?_pick(_COACH_FAST):avg<350?_pick(_COACH_MID):avg<500?_pick(_COACH_OK):_pick(_COACH_SLOW);
  if(acc<70) t+=_pick(_COACH_ACC);
  if(combo>=5) t+=_pick(_COACH_COMBO).replace(/\{N\}/g,String(combo));
  if(Math.random()<0.2) t+=_pick(_COACH_NERD);
  if(Math.random()<0.1) t+=_pick(_COACH_JOKE);
  return t;
}
function getFinalFeedback(avg,maxLv){
  var t=maxLv>=10?'Level '+maxLv+'. Nie mam słów. A to rzadkość, bo zwykle gadam za dużo. 🏆':maxLv>=7?'Level '+maxLv+' — to już poważny wynik. Widzę w Tobie potencjał. Serio.':maxLv>=4?'Level '+maxLv+'. Solidna robota. Jeszcze trochę i zaczniesz mnie zaskakiwać.':'Level '+maxLv+'. Hej, każdy kiedyś zaczynał. Jutro będzie lepiej. Obiecuję. No... prawie.';
  t+='<br><br>';
  t+=avg<300?'Średni czas '+avg+'ms — Twój mózg działa jak dobrze naoliwiona maszyna. ⚡':avg<450?'Średnia '+avg+'ms — przyzwoicie! Regularny trening i zejdziesz poniżej 300.':'Średnia '+avg+'ms — jest nad czym pracować. Ale samo to że tu jesteś to już więcej niż większość robi.';
  if(_gamePoints<0) t+='<br><br>Bilans ujemny. Następnym razem cierpliwość! Lepiej nie reagować niż reagować źle. 😏';
  t+='<br><br>Wróć jutro. Twój mózg potrzebuje snu żeby skonsolidować to czego się dziś nauczył. Tak działa neuroplastyczność. 🧠';
  return t;
}
function _getBriefingRules(){
  var isTouch=(_motionInputMode==='touch'||_desktopFallback);
  var isDsk=_isDesktopDetected;
  if(_motionMode==='simple'){
    if(isDsk) return '• Czekaj na zielony sygnał<br>• Kliknij myszą lub naciśnij dowolny klawisz<br>• Im szybciej — tym więcej punktów<br>• Masz 3 życia — fałszywy start = tracisz jedno';
    if(isTouch) return '• Czekaj na zielony sygnał<br>• Tapnij w ekran jak najszybciej!<br>• Im szybciej — tym więcej punktów<br>• Masz 3 życia — fałszywy start = tracisz jedno';
    return '• Czekaj na zielony sygnał<br>• Przechyl telefon w dowolną stronę<br>• Trzymaj telefon w wyprostowanej ręce<br>• Masz 3 życia — fałszywy start = tracisz jedno';
  }
  if(_motionMode==='directions'){
    if(isDsk) return '• Pojawi się strzałka ← → ↑ ↓<br>• Użyj strzałek ← → ↑ ↓ na klawiaturze<br>• Liczy się szybkość I precyzja<br>• Zły kierunek = błąd';
    if(isTouch) return '• Pojawi się strzałka ← → ↑ ↓<br>• Przesuń palcem w kierunku strzałki (swipe)<br>• Liczy się szybkość I precyzja<br>• Zły kierunek = błąd';
    return '• Pojawi się strzałka ← → ↑ ↓<br>• Przechyl telefon W KIERUNKU strzałki<br>• Trzymaj telefon w wyprostowanej ręce<br>• Zły kierunek = błąd';
  }
  if(_motionMode==='gonogo'){
    if(isDsk) return '• 🟢 Zielone = kliknij lub naciśnij klawisz!<br>• 🔴 Czerwone = nie ruszaj się!<br>• Twój mózg będzie chciał zareagować na czerwone — nie daj się nabrać';
    if(isTouch) return '• 🟢 Zielone = tapnij w ekran!<br>• 🔴 Czerwone = NIE dotykaj ekranu!<br>• Twój mózg będzie chciał zareagować na czerwone — nie daj się nabrać';
    return '• 🟢 Zielone = przechyl telefon szybko!<br>• 🔴 Czerwone = STÓJ! Nie ruszaj się!<br>• Twój mózg będzie chciał zareagować na czerwone — nie daj się nabrać';
  }
  if(_motionMode==='pattern'){
    var adv='<br><br><span style="font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);">📐 NA WYŻSZYCH LEVELACH:</span><br>';
    if(isDsk) return '• Na górze ekranu widzisz WZORZEC — zapamiętaj go<br>• Na dole zmieniają się różne wzorce<br>• Gdy dolny pasuje do górnego → KLIKNIJ lub naciśnij SPACJĘ<br>• Gdy nie pasuje → NIE klikaj'+adv+'• Wzorzec na górze/dole → naciśnij STRZAŁKĘ ↑ lub ↓<br>• Wzorzec w rogu → odpowiednia STRZAŁKA<br>• Cel może się zmieniać — obserwuj górną kartę!';
    if(isTouch) return '• Na górze ekranu widzisz WZORZEC — zapamiętaj go<br>• Na dole zmieniają się różne wzorce<br>• Gdy dolny pasuje do górnego → TAPNIJ w ekran<br>• Gdy nie pasuje → NIE dotykaj ekranu'+adv+'• Wzorzec na górze/dole → PRZESUŃ PALCEM w górę lub w dół (swipe)<br>• Wzorzec w rogu → PRZESUŃ PALCEM w kierunku tego rogu<br>• Cel może się zmieniać — obserwuj górną kartę!';
    return '• Na górze ekranu widzisz WZORZEC — zapamiętaj go<br>• Na dole zmieniają się różne wzorce<br>• Gdy dolny pasuje do górnego → PRZECHYL TELEFON<br>• Gdy nie pasuje → STÓJ nieruchomo'+adv+'• Wzorzec na górze/dole → przechyl telefon W GÓRĘ lub W DÓŁ<br>• Wzorzec w rogu → przechyl W KIERUNKU tego rogu<br>• Cel może się zmieniać — obserwuj!';
  }
  return '';
}
function _getNextLevelHint(lv){
  var cur=_getLevelCfg(lv),nxt=_getLevelCfg(lv+1);
  var hints=[];
  if(_motionMode==='pattern'){
    var pc=_patCfg(lv),pn=_patCfg(lv+1);
    if(lv>12) return 'Od tego poziomu? Niespodzianka. Musisz tam dotrzeć żeby zobaczyć. 😏';
    if(pn.cols>pc.cols&&pn.cols===3) hints.push('📐 Siatka 3×3 — dziewięć pól! Nowy wymiar.');
    else if(pn.cols>pc.cols) hints.push('📐 Większa siatka! Więcej pól do obserwowania.');
    if(pn.tgtCh>0&&pc.tgtCh===0) hints.push('🔄 UWAGA! Cel będzie się zmieniał w trakcie levelu!');
    else if(pn.tgtCh>pc.tgtCh) hints.push('🔄 Cel zmienia się częściej!');
    if(pn.pos==='vertical'&&pc.pos==='center') hints.push('🧭 Wzorzec pojawi się na GÓRZE lub DOLE — reaguj kierunkowo!');
    if(pn.pos==='quad'&&pc.pos!=='quad') hints.push('🧭 Wzorzec w DOWOLNYM ROGU ekranu! Reaguj w jego kierunku!');
    if(pn.interval<pc.interval-200) hints.push('⏱️ Szybsze zmiany wzorców! Mniej czasu na decyzję.');
    if(pn.fake>pc.fake&&pn.fake>0) hints.push('⚠️ Więcej zmyłek — wzorce będą się różnić jednym symbolem!');
  } else {
    if(lv>12) return 'Witamy w elicie. Od teraz każdy level to walka. 🏆';
    if(nxt.fakeChance>0&&cur.fakeChance===0) hints.push('⚠️ Pojawią się fałszywe bodźce — nie daj się nabrać!');
    else if(nxt.fakeChance>cur.fakeChance) hints.push('⚠️ Więcej zmyłek!');
    if(nxt.window<cur.window) hints.push('Szybsze bodźce, krótszy czas na reakcję.');
    if(_movementThreshold(lv+1)>_movementThreshold(lv)+0.5) hints.push('💪 Potrzeba mocniejszego ruchu!');
    if(lv>=9) hints.push('Od teraz każdy level to walka.');
  }
  return hints.length?hints.join(' '):'Więcej prób, mniej czasu. Klasyka. 💪';
}
var _patternTarget=[], _patternInterval=null;

// ── Postacie per level ──
var LEVEL_CHARACTERS=[
  {level:1,emoji:'🐣',name:'Pisklak',desc:'Dopiero się wykluwasz. Spokojnie, każdy kiedyś zaczynał.'},
  {level:2,emoji:'🐥',name:'Żółtodziób',desc:'Jeszcze niepewny, ale już ruszasz!'},
  {level:3,emoji:'🐱',name:'Kotek',desc:'Szybki jak kot... no, prawie.'},
  {level:4,emoji:'🐕',name:'Pies myśliwski',desc:'Instynkt się wyostrza. Dobra robota!'},
  {level:5,emoji:'🦊',name:'Lis',desc:'Sprytny i szybki. Nie dasz się nabrać.'},
  {level:6,emoji:'🐆',name:'Gepard',desc:'Zaczynasz łapać prawdziwe tempo!'},
  {level:7,emoji:'🦅',name:'Orzeł',desc:'Widzisz wszystko. Nic Ci nie umknie.'},
  {level:8,emoji:'🐺',name:'Wilk',desc:'Drapieżnik. Skupiony. Bezlitosny.'},
  {level:9,emoji:'🦈',name:'Rekin',desc:'Wyczuwasz bodźce zanim się pojawią.'},
  {level:10,emoji:'🐉',name:'Smok',desc:'Legendarny refleks. Niewielu tu dociera.'},
  {level:12,emoji:'⚡',name:'Błyskawica',desc:'Szybszy niż myśl. Dosłownie.'},
  {level:15,emoji:'🧠',name:'Neo',desc:'Widzisz Matrixa. Czas zwalnia dla Ciebie.'},
  {level:18,emoji:'👁️',name:'Wyrocznia',desc:'Reagujesz zanim cokolwiek się pojawi.'},
  {level:20,emoji:'🌌',name:'Kosmita',desc:'Twój czas reakcji łamie prawa fizyki.'},
  {level:25,emoji:'🏆',name:'G.O.A.T.',desc:'Greatest Of All Time. Koniec dyskusji.'}
];
function getLevelCharacter(lv){ var c=LEVEL_CHARACTERS[0]; for(var i=LEVEL_CHARACTERS.length-1;i>=0;i--){ if(lv>=LEVEL_CHARACTERS[i].level){ c=LEVEL_CHARACTERS[i]; break; } } return c; }

// ── Próg ruchu rosnący z levelem ──
function _movementThreshold(lv){ return Math.min(1.2+(lv-1)*0.3,6.0); }

// ── Punktowanie ──
function _calcPoints(ms){
  if(ms<150) return {pts:7,label:'NADLUDZKI!'};
  if(ms<250) return {pts:5,label:'BŁYSKAWICA!'};
  if(ms<350) return {pts:4,label:''};
  if(ms<450) return {pts:3,label:''};
  if(ms<600) return {pts:2,label:''};
  if(ms<800) return {pts:1,label:'Było blisko!'};
  return {pts:0,label:''};
}

// ── Poziomy ──
function _getLevelCfg(lv){
  return {
    level:lv,
    trials:Math.min(8+(lv-1)*2,20),
    delayMin:Math.max(1000,2000-(lv-1)*100),
    delayMax:Math.max(2000,4000-(lv-1)*150),
    window:Math.max(800,3000-(lv-1)*150),
    fakeChance:Math.min(0.4,Math.max(0,(lv-3)*0.05))
  };
}

// ── UI ustawień ──
function _setMotionMode(m){
  _motionMode=m;
  var map={simple:'simple',directions:'dirs',gonogo:'gonogo',pattern:'pattern'};
  ['simple','dirs','gonogo','pattern'].forEach(function(k){
    var b=el('mt-'+k); if(!b) return;
    var active=(map[m]===k);
    b.style.borderColor=active?'var(--accent)':'var(--border)';
    b.style.borderWidth=active?'2px':'1px';
  });
}

// ── Modal "Jak grać?" ──
function openMotionInfo(){
  var existing=document.getElementById('motion-info-modal'); if(existing) existing.remove();
  var modal=document.createElement('div'); modal.id='motion-info-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var h='<div style="max-width:420px;width:calc(100% - 32px);background-color:#1a1a1a !important;color:#f2f2f2 !important;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:20px;max-height:80vh;overflow-y:auto;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:900;color:#f2f2f2;">⚡ Reakcja — Jak grać?</div><button onclick="document.getElementById(\'motion-info-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:rgba(255,255,255,.5);width:32px;height:32px;">✕</button></div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">📱 Jak trzymać telefon</div>'
    +'<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:12px;">Trzymaj telefon w wyprostowanej ręce przed sobą. Ekran do siebie. Stój stabilnie — telefon musi być nieruchomy przed bodźcem. 🧍📱</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">🎯 Zasady gry</div>'
    +'<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:12px;">Czekaj na sygnał. Gdy kółko zmieni kolor na <strong style="color:#4ade80;">ZIELONE</strong> — przechyl telefon szybko! Im szybciej zareagujesz, tym więcej punktów.<br><br><strong>Kierunki:</strong> przechyl w stronę strzałki (← → ↑ ↓)<br><strong>Go/No-Go:</strong> reaguj TYLKO na zielone, IGNORUJ czerwone!</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">⚡ Punkty</div>'
    +'<div style="font-size:12px;color:#f2f2f2;line-height:1.8;margin-bottom:12px;">&lt;200ms = 5 pkt ⚡<br>&lt;300ms = 3 pkt<br>&lt;400ms = 2 pkt<br>&lt;500ms = 1 pkt<br>🔥 Combo 3+ szybkich = podwójne!<br>🔥 Combo 5+ = potrójne!<br>❌ Fałszywy start = -2 pkt<br>❌ Błąd Go/No-Go = -3 pkt</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">🏆 Poziomy</div>'
    +'<div style="font-size:12px;color:#f2f2f2;line-height:1.6;margin-bottom:14px;">Gra ma nieskończoną ilość poziomów. Każdy kolejny jest trudniejszy: szybsze bodźce, krótsze okno reakcji, fałszywe sygnały. Masz 3 życia — fałszywy start lub brak reakcji = stracone życie.</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:6px;margin-top:6px;">🏆 Postacie do odblokowania</div>'
    +'<div style="max-height:180px;overflow-y:auto;margin-bottom:12px;">'
    +(function(){ var athlete2=(el('motion-athlete')||{}).value||''; var prev2=_getMotionResults(athlete2); var maxLv2=0; prev2.forEach(function(r){ if(r.level>maxLv2) maxLv2=r.level; }); return LEVEL_CHARACTERS.map(function(c){ var unlocked=maxLv2>=c.level; var isCurrent=c===getLevelCharacter(maxLv2||1); return '<div style="display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.07);'+(isCurrent?'border-left:2px solid #3b82f6;padding-left:6px;':'')+(unlocked?'':'opacity:.4;')+'">'+'<span style="font-size:18px;">'+(unlocked?c.emoji:'❓')+'</span>'+'<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:#f2f2f2;">'+(unlocked?c.name:'???')+' <span style="font-size:9px;color:rgba(255,255,255,.18);">Lv.'+c.level+'</span></div>'+(unlocked?'<div style="font-size:10px;color:rgba(255,255,255,.35);">'+c.desc+'</div>':'')+'</div></div>'; }).join(''); })()
    +'</div>'
    +'<button onclick="var nd=document.getElementById(\'motion-nerd-section\');nd.style.display=nd.style.display===\'none\'?\'block\':\'none\';" style="font-size:11px;font-weight:700;color:rgba(255,255,255,.35);background:transparent;border:none;cursor:pointer;text-decoration:underline;padding:8px 0;width:100%;text-align:center;">🤓 Sekcja dla nerdów — jak to NAPRAWDĘ działa?</button>'
    +'<div id="motion-nerd-section" style="display:none;background:rgba(59,130,246,.04);border-radius:12px;padding:16px;margin-top:8px;font-size:12px;font-weight:500;line-height:1.7;color:#f2f2f2;">'
    // Akcelerometr
    +'<div style="font-size:13px;font-weight:800;margin-bottom:6px;">📱 AKCELEROMETR W TWOIM TELEFONIE</div>'
    +'<p style="margin-bottom:10px;">Twój telefon ma wbudowany czujnik MEMS (Micro-Electro-Mechanical System) — mikroskopijną strukturę krzemową, mniejszą niż ziarno ryżu. Mierzy przyspieszenie w trzech osiach (przód-tył, lewo-prawo, góra-dół) z częstotliwością około 60 pomiarów na sekundę.</p>'
    +'<p style="margin-bottom:10px;">Gdy przechylasz telefon, zmienia się rozkład siły grawitacji na osiach czujnika. Nasza aplikacja porównuje bieżące odczyty z Twoją pozycją wyjściową (kalibracja przed grą) i wykrywa ruch przekraczający ustalony próg. Im wyższy level, tym większy ruch jest wymagany — dlatego na wyższych poziomach nie wystarczy delikatne drgnięcie ręki.</p>'
    // Czas reakcji
    +'<div style="font-size:13px;font-weight:800;margin-top:16px;margin-bottom:6px;">⏱️ CZAS REAKCJI — CO MÓWI NAUKA?</div>'
    +'<p style="margin-bottom:10px;">Czas reakcji to przedział od pojawienia się bodźca do początku odpowiedzi ruchowej. Składa się z kilku etapów: odbiór bodźca przez narząd zmysłu, transmisja nerwowa do mózgu, przetwarzanie w korze mózgowej, wysłanie sygnału motorycznego i aktywacja mięśnia. Każdy z tych etapów zajmuje określony czas — i każdy podlega treningowi, zmęczeniu i wielu innym czynnikom.</p>'
    +'<p style="margin-bottom:10px;">Przyjmowane wartości średniego prostego czasu reakcji na bodziec wzrokowy to około 190-250 ms u młodych dorosłych (Welford, 1980; Jain et al., 2015). Na bodziec dźwiękowy reagujemy szybciej — około 140-160 ms — ponieważ sygnał słuchowy dociera do kory mózgowej w około 8-10 ms, podczas gdy sygnał wzrokowy potrzebuje 20-40 ms (Kemp et al., cytowani w Pain & Hibbs, 2007).</p>'
    +'<p style="margin-bottom:10px;">Warto jednak podkreślić: wartości te są przybliżone i różnią się znacząco między badaniami, populacjami i metodami pomiaru. Nasz pomiar akcelerometryczny dodaje własne opóźnienia (transmisja danych z czujnika, przetwarzanie w przeglądarce), więc czasy które widzisz w grze nie są bezpośrednio porównywalne z precyzyjnymi pomiarami laboratoryjnymi. Traktuj je jako wskaźnik RELATYWNY — śledzenie własnego postępu w czasie jest wartościowe, nawet jeśli bezwzględne wartości obarczone są pewnym marginesem błędu.</p>'
    // Sprinterzy
    +'<div style="font-size:13px;font-weight:800;margin-top:16px;margin-bottom:6px;">🏅 SPRINTERZY I REGUŁA 100 MS</div>'
    +'<p style="margin-bottom:10px;">World Athletics (dawniej IAAF) stosuje regułę, według której reakcja szybsza niż 100 ms po strzale startera jest uznawana za falstart. Założenie opiera się na przekonaniu, że ludzki mózg nie jest w stanie przetworzyć bodźca słuchowego i zainicjować odpowiedzi ruchowej w czasie krótszym niż 100 ms.</p>'
    +'<p style="margin-bottom:10px;">Jednak badanie zlecone przez IAAF (Komi, Ishikawa & Salmi, 2009) wykazało, że niektórzy sprinterzy potrafią generować siłę na blokach startowych w czasie poniżej 80 ms. Autorzy rekomendowali obniżenie progu do 80-85 ms. Osobno, Pain & Hibbs (2007) zmierzyli u jednego z dziewięciu badanych sprinterów średni czas reakcji 87 ms (SD = 4 ms), a latencje EMG poniżej 60 ms.</p>'
    +'<p style="margin-bottom:10px;">Z kolei analiza Brosnan, Hayes & Harrison (2017) danych z Mistrzostw Świata i Europy 1999-2014 (ponad 8500 startów) wykazała, że 95% zaobserwowanych czasów reakcji mieściło się powyżej 122 ms. Zaproponowali skorygowane progi: 115 ms dla mężczyzn i 119 ms dla kobiet.</p>'
    +'<p style="margin-bottom:10px;">Temat pozostaje otwarty — co doskonale pokazuje, że nawet pozornie prosta kwestia "ile wynosi minimalny czas reakcji" jest w nauce przedmiotem dyskusji.</p>'
    // Co wpływa
    +'<div style="font-size:13px;font-weight:800;margin-top:16px;margin-bottom:6px;">🧠 CO WPŁYWA NA CZAS REAKCJI?</div>'
    +'<p style="margin-bottom:10px;">Badania wskazują na wiele czynników modulujących czas reakcji. Jain i współpracownicy (2015) wymieniają między innymi: wiek, płeć, zmęczenie, poziom aktywności fizycznej, cykl oddechowy, typ osobowości i inteligencję. Badanie MindCrowd na dużej próbie populacyjnej wykazało degradację czasu reakcji o około 3-7 ms na rok życia.</p>'
    +'<p style="margin-bottom:10px;">Regularnie ćwiczący badani wykazywali krótsze czasy reakcji niż osoby prowadzące siedzący tryb życia (Jain et al., 2015). To sugeruje, że trening — w tym ćwiczenia takie jak ta gra — może mieć realny wpływ na szybkość przetwarzania. Pamiętaj jednak: na Twój wynik w danym momencie wpływa mnóstwo czynników — od jakości snu, przez nawodnienie, po to czy właśnie zjadłeś obiad. Pojedynczy pomiar to migawka, nie wyrok. Wartość jest w TRENOWANIU i śledzeniu trendu.</p>'
    // Normy
    +'<div style="font-size:13px;font-weight:800;margin-top:16px;margin-bottom:6px;">📊 ORIENTACYJNE NORMY</div>'
    +'<p style="margin-bottom:6px;font-size:11px;color:rgba(255,255,255,.35);">Prosty czas reakcji na bodziec wzrokowy, warunki laboratoryjne. Nasz pomiar akcelerometryczny będzie z natury wolniejszy.</p>'
    +'<div style="margin-bottom:10px;">• &lt; 200 ms — Wartości spotykane u elitarnych sportowców<br>'
    +'• 200-280 ms — Bardzo dobry, osoby aktywne fizycznie<br>'
    +'• 280-350 ms — Przeciętny wynik młodych dorosłych<br>'
    +'• 350-500 ms — Częsty przy zmęczeniu lub braku wprawy<br>'
    +'• &gt; 500 ms — Do poprawy, nie powód do niepokoju — powód do trenowania</div>'
    +'<div style="font-size:10px;color:rgba(255,255,255,.35);margin-bottom:10px;">(Na podstawie: Welford, 1980; Jain et al., 2015; dane MindCrowd)</div>'
    // Źródła
    +'<div style="font-size:13px;font-weight:800;margin-top:16px;margin-bottom:6px;">📚 ŹRÓDŁA</div>'
    +'<div style="font-size:10px;font-weight:500;color:rgba(255,255,255,.35);line-height:1.6;">'
    +'1. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/" target="_blank" style="color:#3b82f6;text-decoration:underline;">Jain A, Bansal R, Kumar A, Singh KD (2015)</a>. "A comparative study of visual and auditory reaction times..." Int J Appl Basic Med Res, 5(2):124-127.<br>'
    +'2. <a href="https://www.tandfonline.com/doi/abs/10.1080/02640410600718004" target="_blank" style="color:#3b82f6;text-decoration:underline;">Pain MTG, Hibbs A (2007)</a>. "Sprint starts and the minimum auditory reaction time." J Sports Sciences, 25(1):79-86.<br>'
    +'3. <a href="https://worldathletics.org/news/news/iaaf-sprint-start-research-project-is-the-100" target="_blank" style="color:#3b82f6;text-decoration:underline;">Komi PV, Ishikawa M, Salmi J (2009)</a>. "IAAF Sprint Start Research Project: Is the 100 ms limit still valid?" New Studies in Athletics, 24(1):37-47.<br>'
    +'4. <a href="https://www.academia.edu/26592344/Effects_of_false_start_disqualification_rules_on_response_times_of_elite_standard_sprinters" target="_blank" style="color:#3b82f6;text-decoration:underline;">Brosnan KC, Hayes K, Harrison AJ (2017)</a>. "Effects of false-start disqualification rules on response-times of elite-standard sprinters." J Sports Sciences, 35(10):929-935.<br>'
    +'5. Welford AT (1980). "Reaction Times." Academic Press, New York.<br>'
    +'6. <a href="https://mindcrowd.org/reaction-time-as-a-measure-of-brain-health-mindcrowd-study-findings/" target="_blank" style="color:#3b82f6;text-decoration:underline;">MindCrowd Study</a> — Arizona Alzheimer\'s Consortium.</div>'
    // Nota
    +'<div style="font-size:10px;font-style:italic;color:rgba(255,255,255,.35);border-top:1px solid rgba(255,255,255,.07);padding-top:10px;margin-top:12px;">⚠️ Opisy opierają się na recenzowanych publikacjach naukowych. Nasz pomiar akcelerometryczny nie jest równoważny pomiarom laboratoryjnym — służy do śledzenia własnego postępu. Część treści opracowana z wykorzystaniem narzędzi AI i zweryfikowana przez autorów.</div>'
    +'<div style="font-weight:800;color:#3b82f6;margin-top:14px;text-align:center;">⚡ Elevate Your Game — trenuj swój mózg tak jak trenujesz ciało!</div>'
    +'</div>'
    +'<button onclick="document.getElementById(\'motion-info-modal\').remove()" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:14px;font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;margin-top:10px;">Rozumiem! 💪</button></div>';
  var box=document.createElement('div'); box.innerHTML=h; modal.appendChild(box.firstChild);
  document.body.appendChild(modal);
}

// ── Modal "Wzorce — Jak grać?" ──
function openPatternInfo(){
  var existing=document.getElementById('pattern-info-modal'); if(existing) existing.remove();
  var modal=document.createElement('div'); modal.id='pattern-info-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var h='<div style="max-width:420px;width:calc(100% - 32px);background-color:#1a1a1a !important;color:#f2f2f2 !important;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:20px;max-height:80vh;overflow-y:auto;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:900;color:#f2f2f2;">🧩 Wzorce — Jak grać?</div><button onclick="document.getElementById(\'pattern-info-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:rgba(255,255,255,.5);width:32px;height:32px;">✕</button></div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">🎯 Zasady</div>'
    +'<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:12px;">Na górze ekranu widzisz <strong style="color:#3b82f6;">WZORZEC</strong> (cel) — zapamiętaj go.<br>Na dole zmieniają się różne wzorce.<br><br>Gdy dolny wzorzec <strong style="color:#4ade80;">PASUJE</strong> do górnego → reaguj!<br>Gdy <strong style="color:#f87171;">NIE PASUJE</strong> → nie ruszaj się.</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">⚡ Punkty i życia</div>'
    +'<div style="font-size:12px;color:#f2f2f2;line-height:1.8;margin-bottom:12px;">Szybka reakcja na pasujący wzorzec = punkty<br>Reakcja na niepasujący = utrata życia<br>Brak reakcji na pasujący = utrata życia<br>🔥 Combo za serie szybkich trafień!</div>'
    // Progresja
    +'<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin:12px 0;">'
    +'<div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#3b82f6;margin-bottom:10px;">📈 PROGRESJA POZIOMÓW</div>'
    +'<div style="font-size:12px;font-weight:500;color:rgba(255,255,255,.6);line-height:2;">'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Level 1-2: Dwa symbole, proste wzorce. Nauka mechaniki.</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Level 3-4: Cztery symbole (siatka 2×2). Więcej kolorów.</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Level 5-6: Cel może się ZMIENIAĆ w trakcie! Wzorzec na górze lub dole.</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Level 7-8: Wzorzec w DOWOLNYM rogu ekranu. Reaguj kierunkowo!</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Level 9-10: Siatka 3×3 — dziewięć pól! Więcej zmyłek.</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);">Level 11+: Chaos. Szybkie zmiany, zmyłki, ruchome pozycje.</div>'
    +'</div>'
    +'<div style="font-size:11px;font-style:italic;color:rgba(255,255,255,.35);margin-top:10px;">Każdy level jest trudniejszy — ale Ty też jesteś lepszy z każdą próbą. 💪</div>'
    +'</div>'
    +'<button onclick="document.getElementById(\'pattern-info-modal\').remove()" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:14px;font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;margin-top:10px;">Rozumiem! 💪</button></div>';
  var box=document.createElement('div'); box.innerHTML=h; modal.appendChild(box.firstChild);
  document.body.appendChild(modal);
}

// ── Permission + fallback ──
function requestMotionPermission(cb){
  if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){
    DeviceMotionEvent.requestPermission().then(function(r){ cb(r==='granted'); }).catch(function(){ cb(false); });
  } else if(typeof DeviceMotionEvent!=='undefined'){ cb(true); }
  else { _desktopFallback=true; _setupDesktop(); cb(true); }
}
function _setupDesktop(){ _desktopFallback=true; }

// ── Akcelerometr ──
function onMotionData(e){ var a=e.accelerationIncludingGravity; if(!a) return; _motionState.ax=a.x||0; _motionState.ay=a.y||0; _motionState.az=a.z||0; }
function calibrateMotion(cb){
  var samples=[]; var h=function(e){ var a=e.accelerationIncludingGravity; if(a) samples.push({x:a.x||0,y:a.y||0,z:a.z||0}); };
  window.addEventListener('devicemotion',h);
  setTimeout(function(){ window.removeEventListener('devicemotion',h);
    if(samples.length){ _motionState.baseline.x=samples.reduce(function(s,v){return s+v.x;},0)/samples.length; _motionState.baseline.y=samples.reduce(function(s,v){return s+v.y;},0)/samples.length; _motionState.baseline.z=samples.reduce(function(s,v){return s+v.z;},0)/samples.length; }
    cb();
  },1000);
}
function detectMovement(){
  if(_motionInputMode==='touch'||_desktopFallback) return !!_motionState._keyPressed;
  var dx=Math.abs(_motionState.ax-_motionState.baseline.x),dy=Math.abs(_motionState.ay-_motionState.baseline.y); var th=_movementThreshold(_gameLevel); return dx>th||dy>th;
}
function detectDirection(){ var dx=_motionState.ax-_motionState.baseline.x,dy=_motionState.ay-_motionState.baseline.y,th=2.0+(5-_motionState.sensitivity)*0.6; if(Math.abs(dx)>Math.abs(dy)){ if(dx>th) return 'left'; if(dx<-th) return 'right'; } else { if(dy>th) return 'up'; if(dy<-th) return 'down'; } return null; }

// ── Dźwięki ──
function _mBeep(f,d){ try{ var ctx=ga(); if(ctx.state==='suspended') ctx.resume(); var o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.6,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(d||0.04)); o.start(); o.stop(ctx.currentTime+(d||0.04)+0.02); }catch(e){} }
function _sndStim(){ _mBeep(800,0.08); }
function _sndGood(){ _mBeep(1200,0.05); }
function _sndBad(){ _mBeep(200,0.2); }
function _sndCombo(){ _mBeep(600,0.04); setTimeout(function(){_mBeep(800,0.04);},40); setTimeout(function(){_mBeep(1000,0.04);},80); }
function _sndLevelUp(){ [500,600,700,800,1000].forEach(function(f,i){ setTimeout(function(){_mBeep(f,0.06);},i*60); }); }
function _sndGameOver(){ _mBeep(400,0.1); setTimeout(function(){_mBeep(200,0.15);},100); }

// ── Start gry ──
// Input mode: 'motion' lub 'touch'
var _motionInputMode='motion';
var _isDesktopDetected=false;
function _isDesktop(){
  var hasTouch='ontouchstart' in window||navigator.maxTouchPoints>0;
  var hasMotion=typeof DeviceMotionEvent!=='undefined';
  var isLargeScreen=window.innerWidth>=1024;
  return isLargeScreen&&!hasTouch;
}
function _initMotionInputMode(){
  _isDesktopDetected=_isDesktop();
  if(_isDesktopDetected){
    _setMotionInput('touch');
    var mb=el('mi-motion');
    if(mb){ mb.style.opacity='0.4'; mb.style.pointerEvents='none'; }
    var hint=document.getElementById('motion-desktop-hint');
    if(!hint){
      var chipRow=mb?mb.parentElement:null;
      if(chipRow){
        hint=document.createElement('div'); hint.id='motion-desktop-hint';
        hint.style.cssText='font-size:10px;font-weight:600;color:var(--accent);margin-top:4px;';
        hint.textContent='💻 Wykryto komputer — tryb dotyku aktywny. Klikaj lub używaj klawiatury.';
        chipRow.parentElement.insertBefore(hint,chipRow.nextSibling);
      }
    }
  } else {
    var mb2=el('mi-motion');
    if(mb2){ mb2.style.opacity=''; mb2.style.pointerEvents=''; }
    var hint2=document.getElementById('motion-desktop-hint');
    if(hint2) hint2.remove();
  }
}
function _setMotionInput(m){
  if(_isDesktopDetected&&m==='motion') return;
  _motionInputMode=m;
  var mb=el('mi-motion'),mt=el('mi-touch');
  if(mb){ mb.className='chip'+(m==='motion'?' on-blue':''); }
  if(mt){ mt.className='chip'+(m==='touch'?' on-blue':''); }
}
// ── Unified input handling ──
var _swipeStart=null, _inputListeners=[], _lastMousePos=null;

function _isCloseBtn(e){ return e.target.id==='motion-close-x'||e.target.closest('#motion-close-x'); }

function _addInputListeners(){
  var ma=el('motion-active');
  var ls=[];

  // Keyboard — any key (except Escape)
  var onKey=function(e){
    if(!_motionState.listening) return;
    if(e.key==='Escape') return;
    e.preventDefault();
    // Arrows → direction keys, everything else → generic reaction
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown') _motionState._keyPressed=e.key;
    else _motionState._keyPressed=' ';
  };
  document.addEventListener('keydown',onKey);
  ls.push(['keydown',onKey,document]);

  // Mousedown — fast click reaction
  var onMouse=function(e){
    if(!_motionState.listening) return;
    if(_isCloseBtn(e)) return;
    if(e.target.closest('button')) return;
    _motionState._keyPressed=' ';
  };
  ma.addEventListener('mousedown',onMouse);
  ls.push(['mousedown',onMouse,ma]);

  // Mousemove — movement > 20px threshold, with direction for directions mode
  _lastMousePos=null;
  var onMove=function(e){
    if(!_motionState.listening) return;
    if(!_lastMousePos){ _lastMousePos={x:e.clientX,y:e.clientY}; return; }
    var dx=e.clientX-_lastMousePos.x, dy=e.clientY-_lastMousePos.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(dist>20){
      _lastMousePos={x:e.clientX,y:e.clientY};
      if(_motionMode==='directions'){
        if(Math.abs(dx)>Math.abs(dy)) _motionState._keyPressed=dx>0?'ArrowRight':'ArrowLeft';
        else _motionState._keyPressed=dy>0?'ArrowDown':'ArrowUp';
      } else {
        _motionState._keyPressed=' ';
      }
    }
  };
  ma.addEventListener('mousemove',onMove);
  ls.push(['mousemove',onMove,ma]);

  // Touch — swipe for directions, tap for others
  var onTouchStart=function(e){
    if(!_motionState.listening) return;
    if(_isCloseBtn(e)||e.target.closest('button')) return;
    _swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY,time:Date.now()};
  };
  var onTouchEnd=function(e){
    if(!_motionState.listening||!_swipeStart) return;
    if(_isCloseBtn(e)||e.target.closest('button')) return;
    var dx=e.changedTouches[0].clientX-_swipeStart.x;
    var dy=e.changedTouches[0].clientY-_swipeStart.y;
    var dt=Date.now()-_swipeStart.time;
    _swipeStart=null;
    if(dt>1000) return;
    var needDir=(_motionMode==='directions'||(_motionMode==='pattern'&&_patCfg(_gameLevel).pos==='quad'));
    if(needDir){
      if(Math.abs(dx)<30&&Math.abs(dy)<30) return;
      if(Math.abs(dx)>Math.abs(dy)) _motionState._keyPressed=dx>0?'ArrowRight':'ArrowLeft';
      else _motionState._keyPressed=dy>0?'ArrowDown':'ArrowUp';
    } else {
      _motionState._keyPressed=' ';
    }
  };
  ma.addEventListener('touchstart',onTouchStart,{passive:true});
  ma.addEventListener('touchend',onTouchEnd,{passive:true});
  ls.push(['touchstart',onTouchStart,ma]);
  ls.push(['touchend',onTouchEnd,ma]);

  _inputListeners=ls;
}

function _removeInputListeners(){
  _inputListeners.forEach(function(l){ l[2].removeEventListener(l[0],l[1]); });
  _inputListeners=[];
  _lastMousePos=null;
  _swipeStart=null;
}

function _spawnCloseX(){
  var old=document.getElementById('motion-close-x'); if(old) old.remove();
  var btn=document.createElement('div'); btn.id='motion-close-x';
  btn.textContent='\u2715';
  btn.style.cssText='position:fixed !important;top:14px !important;right:14px !important;z-index:99999 !important;width:48px !important;height:48px !important;border-radius:50% !important;background:rgba(255,255,255,0.15) !important;border:2px solid rgba(255,255,255,0.4) !important;color:#ffffff !important;font-size:22px !important;font-weight:700 !important;display:flex !important;align-items:center !important;justify-content:center !important;cursor:pointer !important;-webkit-tap-highlight-color:transparent !important;';
  btn.onclick=function(){ _confirmCloseMotion(); };
  btn.ontouchstart=function(e){ e.stopPropagation(); };
  document.body.appendChild(btn);
}
function _removeCloseX(){
  var btn=document.getElementById('motion-close-x'); if(btn) btn.remove();
}
function startMotionGame(){
  requestMotionPermission(function(ok){
    if(!ok&&_motionInputMode==='motion'){ _motionInputMode='touch'; }
    _motionAbort=false; _motionRunning=true;
    _motionBlockSwipeClose=(_motionInputMode==='touch'&&_motionMode==='directions');
    _gamePoints=0; _gameLives=3; _gameLevel=1; _gameCombo=0; _gameMaxCombo=0; _gameTotalTrials=0; _gameCorrect=0; _gameTimes=[]; _gameLastTime=0; _trialIdx=0; _trialTotal=0;
    el('settings').style.display='none'; el('motion-active').style.display='block';
    reqWL(); goFS();
    // Przycisk zamknij ✕ — na document.body, z-index 99999
    _spawnCloseX();
    // Input
    if(_motionInputMode==='motion'&&!_desktopFallback){
      _motionHandler=onMotionData; window.addEventListener('devicemotion',_motionHandler);
    }
    _addInputListeners();
    // Briefing → Countdown → Kalibracja/Start
    _showBriefing(function(){
      if(_motionInputMode==='touch'||_desktopFallback){
        _motionCountdown(function(){ _startLevel(_gameLevel); });
      } else {
        _motionCountdown(function(){
          el('motion-active').innerHTML=_mScreen('Kalibracja...','Trzymaj telefon nieruchomo','');
          calibrateMotion(function(){ _startLevel(_gameLevel); });
        });
      }
    });
  });
}
function stopMotion(){
  el('motion-active').style.overflow='hidden';
  _motionAbort=true; _motionRunning=false; _motionBlockSwipeClose=false;
  if(_motionHandler) window.removeEventListener('devicemotion',_motionHandler);
  _removeInputListeners();
  _removeCloseX();
  var cm=document.getElementById('motion-confirm-close'); if(cm) cm.remove();
  el('motion-active').style.display='none'; el('settings').style.display='flex';
  relWL(); exitFS();
}
function _confirmCloseMotion(){
  var existing=document.getElementById('motion-confirm-close'); if(existing) existing.remove();
  // Pauza gry
  _motionAbort=true;
  var ov=document.createElement('div'); ov.id='motion-confirm-close';
  ov.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:20px;';
  ov.innerHTML='<div style="max-width:300px;width:100%;background:#1a1a1a;border-radius:16px;padding:20px;text-align:center;">'
    +'<div style="font-size:16px;font-weight:800;color:#f2f2f2;margin-bottom:6px;">Zakończyć grę?</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:14px;">Twój postęp zostanie zapisany.</div>'
    +'<button id="mc-end" style="width:100%;padding:12px;background:#dc2626;color:#fff;border:none;border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zakończ</button>'
    +'<button id="mc-resume" style="width:100%;padding:12px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-top:6px;">Wracam do gry!</button></div>';
  document.body.appendChild(ov);
  document.getElementById('mc-end').onclick=function(){ ov.remove(); _motionAbort=false; _endGame(); _showSwipeTip(); };
  document.getElementById('mc-resume').onclick=function(){ ov.remove(); _motionAbort=false; _motionRunning=true; _motionCountdown(function(){ _startLevel(_gameLevel); }); };
}
function _showSwipeTip(){
  try{ if(localStorage.getItem('axs_motion_swipe_tip')) return; localStorage.setItem('axs_motion_swipe_tip','1'); }catch(e){}
  var tip=document.createElement('div');
  tip.style.cssText='position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;padding:8px 16px;border-radius:20px;z-index:30;transition:opacity .3s;';
  tip.textContent='💡 Tip: możesz też zamykać ściągając palcem w dół';
  document.body.appendChild(tip);
  setTimeout(function(){ tip.style.opacity='0'; setTimeout(function(){ tip.remove(); },300); },3000);
}
function _showBriefing(onReady){
  var ma=el('motion-active');
  var modeNames={simple:'⚡ Reakcja',directions:'🧭 Kierunki',gonogo:'👁 Go / No-Go',pattern:'🧩 Wzorce'};
  var modeName=modeNames[_motionMode]||'Gra';
  var rules=_getBriefingRules();
  var quote=_pick(BRIEFING_QUOTES);
  var ch=getLevelCharacter(_gameLevel);
  var isTouch=(_motionInputMode==='touch'||_desktopFallback);
  var inputHint=_isDesktopDetected?'💻 Klikaj lub używaj klawiatury':isTouch?'👆 Reaguj dotykiem ekranu':'📱 Reaguj ruchem telefonu';
  ma.style.background='#060606';
  ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;padding:0 28px;box-sizing:border-box;max-width:360px;">'
    +'<div style="font-size:40px;margin-bottom:4px;">'+ch.emoji+'</div>'
    +'<div style="font-size:18px;font-weight:900;color:#f2f2f2;letter-spacing:.04em;">'+modeName+'</div>'
    +'<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.4);margin-top:2px;">Level '+_gameLevel+' • '+ch.name+'</div>'
    +'<div style="margin-top:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 16px;text-align:left;">'
    +'<div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:8px;">ZASADY</div>'
    +'<div style="font-size:12px;font-weight:500;line-height:1.7;color:rgba(255,255,255,.7);">'+rules+'</div>'
    +'<div style="font-size:11px;font-weight:600;color:var(--accent);margin-top:6px;">'+inputHint+'</div></div>'
    +(_motionMode==='pattern'?_patScoringHtml(_gameLevel):_scoringHtml(_gameLevel))
    +'<div style="margin-top:14px;font-size:12px;font-weight:600;font-style:italic;color:rgba(255,255,255,.45);line-height:1.5;padding:0 8px;">\u201E'+quote+'\u201D</div>'
    +'<button id="briefing-go-btn" style="margin-top:20px;width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:15px;font-weight:900;cursor:pointer;letter-spacing:.04em;">DAWAJ! \uD83D\uDE80</button>'
    +'</div>';
  document.getElementById('briefing-go-btn').onclick=function(){ onReady(); };
}

function _motionCountdown(cb){
  var ma=el('motion-active'); var n=3;
  function tick(){ if(_motionAbort) return; ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:72px;font-weight:900;color:rgba(255,255,255,.8);">'+n+'</div>'; _mBeep(600,0.04); n--; if(n>=0) setTimeout(tick,800); else{ ma.innerHTML=''; setTimeout(cb,200); } } tick();
}

// ── Ekran helper ──
function _mScreen(title,sub,extra){ return '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.4);">'+title+'</div>'+(sub?'<div style="font-size:11px;color:rgba(255,255,255,.25);margin-top:4px;">'+sub+'</div>':'')+(extra||'')+'</div>'; }
function _mHUD(){
  var ch=getLevelCharacter(_gameLevel);
  var comboHtml=_gameCombo>=3?'<div style="position:fixed;top:100px;left:50%;transform:translateX(-50%);z-index:16;font-size:14px;font-weight:900;color:#f59e0b;background:rgba(245,158,11,.1);padding:4px 14px;border-radius:20px;animation:mBtnPulse .6s infinite;">🔥 x'+_gameCombo+' COMBO</div>':'';
  var hasData=_gameTimes.length>0;
  var lastMs=_gameLastTime;
  var validTimes=_gameTimes.filter(function(t){ return t<3000; });
  var avgMs=validTimes.length?Math.round(validTimes.reduce(function(a,b){return a+b;},0)/validTimes.length):0;
  var bestMs=_gameTimes.length?Math.min.apply(null,_gameTimes):0;
  function _tc(ms){ return ms<250?'#4ade80':ms<400?'#3b82f6':ms<600?'#d97706':'#dc2626'; }
  var isWide=window.innerWidth>=768;
  var tPad=isWide?'8px 6px':'4px 4px';
  var tValFs=isWide?'18px':'14px';
  var tUnitFs=isWide?'10px':'9px';
  var tLblFs=isWide?'8px':'6px';
  var tileBase='background:rgba(255,255,255,.05);border-radius:10px;padding:'+tPad+';text-align:center;flex:1;';
  var lastTile=tileBase+'border:1px solid rgba(59,130,246,.3);';
  var avgTile=tileBase+'border:1px solid rgba(168,85,247,.3);';
  var bestTile=tileBase+'border:2px solid rgba(234,179,8,.5);box-shadow:0 0 12px rgba(234,179,8,.15);';
  var bestValFs=isWide?'20px':'16px';
  var labelS='font-size:'+tLblFs+';font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-top:2px;';
  var tilesHtml='<div style="position:fixed;top:56px;left:50%;transform:translateX(-50%);width:calc(100% - 80px);max-width:340px;display:flex;gap:6px;z-index:15;">'
    +'<div style="'+lastTile+'" id="m-tile-last"><div style="font-size:'+tValFs+';font-weight:800;color:'+(hasData?_tc(lastMs):'rgba(255,255,255,.25)')+';transition:transform .2s;" id="m-last-val">'+(hasData?lastMs+'<span style="font-size:'+tUnitFs+';font-weight:700;"> ms</span>':'\u2014')+'</div><div style="'+labelS+'">OSTATNI</div></div>'
    +'<div style="'+avgTile+'"><div style="font-size:'+tValFs+';font-weight:800;color:'+(hasData?_tc(avgMs):'rgba(255,255,255,.25)')+';">'+(hasData?avgMs+'<span style="font-size:'+tUnitFs+';font-weight:700;"> ms</span>':'\u2014')+'</div><div style="'+labelS+'">ŚREDNIA</div></div>'
    +'<div style="'+bestTile+'"><div style="font-size:'+bestValFs+';font-weight:800;color:'+(hasData?'#4ade80':'rgba(255,255,255,.25)')+';">'+(hasData?bestMs+'<span style="font-size:'+tUnitFs+';font-weight:700;"> ms</span>':'\u2014')+'</div><div style="'+labelS+'">NAJLEPSZY</div></div>'
    +'</div>';
  var hudLbl='font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);';
  return '<div style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:16;display:flex;align-items:center;gap:12px;background:rgba(6,6,6,.85);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.08);max-width:340px;">'
    +'<div style="text-align:center;"><div style="font-size:16px;font-weight:900;color:'+(_gamePoints<0?'#f87171':'var(--accent)')+';transition:transform .2s,color .3s;" id="m-pts">⚡ '+_gamePoints+'</div><div style="'+hudLbl+'">PUNKTY</div></div>'
    +'<span style="font-size:13px;font-weight:800;color:rgba(255,255,255,.6);background:rgba(255,255,255,.08);padding:3px 10px;border-radius:10px;">'+ch.emoji+' Lv.'+_gameLevel+'</span>'
    +'<div style="text-align:center;"><div style="font-size:14px;font-weight:800;color:#f87171;transition:transform .2s;" id="m-lives">❤️ '+_gameLives+'</div><div style="'+hudLbl+'">ŻYCIA</div></div>'
    +'</div>'
    +tilesHtml+comboHtml
    +(_trialTotal>0?_mProgressBar(_trialIdx,_trialTotal):'');
}
function _flashLives(){
  var lv=document.getElementById('m-lives'); if(!lv) return;
  lv.style.color='#ff0000'; lv.style.transform='scale(1.3)';
  setTimeout(function(){ lv.style.color='#f87171'; lv.style.transform='scale(1)'; },300);
}
function _mTimeAnim(ms){
  var col=ms<250?'#4ade80':ms<400?'#3b82f6':ms<600?'#d97706':'#dc2626';
  var d=document.createElement('div'); d.style.cssText='position:fixed;top:55%;left:50%;transform:translate(-50%,0);font-size:24px;font-weight:900;color:'+col+';z-index:20;pointer-events:none;opacity:0;transition:opacity .1s;text-shadow:0 0 12px '+col+'40;';
  d.textContent=ms+' ms'; document.getElementById('motion-active').appendChild(d);
  requestAnimationFrame(function(){ d.style.opacity='1'; });
  setTimeout(function(){ d.style.transition='opacity .3s'; d.style.opacity='0'; },700);
  setTimeout(function(){ d.remove(); },1100);
}
function _mPtsAnim(text,color){
  var d=document.createElement('div'); d.style.cssText='position:fixed;top:45%;left:50%;transform:translate(-50%,0);font-size:28px;font-weight:900;color:'+color+';z-index:20;pointer-events:none;transition:all .6s ease-out;opacity:1;';
  d.textContent=text; document.getElementById('motion-active').appendChild(d);
  requestAnimationFrame(function(){ d.style.transform='translate(-50%,-60px)'; d.style.opacity='0'; });
  setTimeout(function(){ d.remove(); },700);
}

// ── Kółko centralne ──
function _mCircle(state,content,subtext){
  var colors={wait:'rgba(255,255,255,.1)',go:'#4ade80',nogo:'#f87171',result:'rgba(255,255,255,.08)',wrong:'#f87171'};
  var borderC=colors[state]||'rgba(255,255,255,.1)';
  var bg=state==='go'?'#4ade80':state==='nogo'?'#f87171':'transparent';
  var shadow=state==='go'?'0 0 40px rgba(74,222,128,.3)':state==='nogo'?'0 0 40px rgba(248,113,113,.3)':'none';
  return '<div style="position:absolute;top:calc(50% + 30px);left:50%;transform:translate(-50%,-50%);text-align:center;">'
    +'<div style="width:160px;height:160px;border-radius:50%;border:3px solid '+borderC+';background:'+bg+';display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:'+shadow+';'+(state==='go'||state==='nogo'?'animation:mPulse .15s ease-out;':'')+'"><div style="color:#fff;">'+content+'</div></div>'
    +(subtext?'<div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.5);margin-top:10px;">'+subtext+'</div>':'')+'</div>';
}

// ── Level start ──
function _startLevel(lv){
  if(_motionAbort) return;
  _gameLevel=lv;
  var cfg=_getLevelCfg(lv);
  // Generuj cel dla trybu Wzorce
  if(_motionMode==='pattern'){ var pc2=_patCfg(lv); _patternTarget=_genPattern(pc2.count,_getPatSyms(pc2.nCol)); _patTgtChangeCount=0; }
  if(_motionMode==='pattern'){ _runPatternLevel(0,cfg,[],function(trialResults){ if(_motionAbort) return; if(_gameLives<=0){ _showGameOver(); return; } _showLevelComplete(lv,trialResults); }); return; }
  _runTrial(0,cfg,[],function(trialResults){
    if(_motionAbort) return;
    if(_gameLives<=0){ _showGameOver(); return; }
    _showLevelComplete(lv,trialResults);
  });
}

// ── Pojedyncza próba ──
function _runTrial(idx,cfg,trialResults,cb){
  if(_motionAbort||_gameLives<=0){ cb(trialResults); return; }
  if(idx>=cfg.trials){ cb(trialResults); return; }
  _trialIdx=idx; _trialTotal=cfg.trials;
  var ma=el('motion-active');
  var isFake=Math.random()<cfg.fakeChance;
  var isGoNoGo=_motionMode==='gonogo';
  var isNoGo=isGoNoGo&&Math.random()<0.3;

  // Faza oczekiwania
  ma.innerHTML=_mHUD()+_mCircle('wait','<div style="font-size:24px;color:rgba(255,255,255,.3);">···</div>','Czekaj...');
  _motionState.listening=false; _motionState._keyPressed=null;
  var delay=cfg.delayMin+Math.random()*(cfg.delayMax-cfg.delayMin);
  var falseStart=false;
  _motionState.listening=true; _lastMousePos=null;
  var wc=setInterval(function(){ if(detectMovement()||_motionState._keyPressed){ falseStart=true; _motionState._keyPressed=null; } },50);

  setTimeout(function(){
    clearInterval(wc); _motionState.listening=false;
    if(_motionAbort) return;
    if(falseStart){
      _gameLives--; setTimeout(_flashLives,50); _gamePoints-=2; _gameCombo=0;
      _sndBad(); if(navigator.vibrate) navigator.vibrate(200);
      _mPtsAnim('-2 💥','var(--red-text)');
      ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:48px;">✕</div>','Za wcześnie!');
      _gameTotalTrials++;
      setTimeout(function(){ if(_gameLives<=0){ cb(trialResults); return; } _runTrial(idx,cfg,trialResults,cb); },1500);
      return;
    }

    // Faza bodźca
    var stimTime=Date.now();
    if(isFake){
      // Fałszywy bodziec — nie reaguj
      ma.innerHTML=_mHUD()+_mCircle('nogo','<div style="font-size:48px;">⛔</div>','NIE reaguj!');
      _sndBad();
      _motionState.listening=true; _motionState._keyPressed=null; _lastMousePos=null;
      var fakeReacted=false;
      var fc=setInterval(function(){ if(detectMovement()||_motionState._keyPressed){ fakeReacted=true; _motionState._keyPressed=null; } },50);
      setTimeout(function(){
        clearInterval(fc); _motionState.listening=false;
        _gameTotalTrials++;
        if(fakeReacted){ _gameLives--; setTimeout(_flashLives,50); _gamePoints-=3; _gameCombo=0; _mPtsAnim('-3 💥','var(--red-text)'); _sndBad(); ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:32px;">Fałszywy alarm!</div>',''); }
        else { _gameCorrect++; _mPtsAnim('✓','var(--green-text)'); ma.innerHTML=_mHUD()+_mCircle('result','<div style="font-size:24px;font-weight:700;color:var(--green-text);">✓ Dobrze!</div>',''); _sndGood(); }
        trialResults.push({time:0,correct:!fakeReacted,type:'fake'});
        setTimeout(function(){ _runTrial(idx+1,cfg,trialResults,cb); },1200);
      },1200);
      return;
    }

    // Normalny bodziec
    var dirTarget=null;
    if(_motionMode==='directions'){
      var dirs=['left','right','up','down']; dirTarget=dirs[Math.floor(Math.random()*4)];
      var arrows={left:'←',right:'→',up:'↑',down:'↓'};
      ma.innerHTML=_mHUD()+_mCircle('go','<div style="font-size:60px;font-weight:900;">'+arrows[dirTarget]+'</div>','');
    } else if(isNoGo){
      ma.innerHTML=_mHUD()+_mCircle('nogo','','STÓJ!');
      _motionState.listening=true; _motionState._keyPressed=null; _lastMousePos=null;
      var nogoReacted=false;
      var nc=setInterval(function(){ if(detectMovement()||_motionState._keyPressed){ nogoReacted=true; _motionState._keyPressed=null; } },16);
      setTimeout(function(){
        clearInterval(nc); _motionState.listening=false; _gameTotalTrials++;
        if(nogoReacted){ _gameLives--; setTimeout(_flashLives,50); _gamePoints-=3; _gameCombo=0; _mPtsAnim('-3 💥','var(--red-text)'); _sndBad(); ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:24px;">Fałszywy alarm!</div>',''); }
        else { _gameCorrect++; _mPtsAnim('✓','var(--green-text)'); _sndGood(); ma.innerHTML=_mHUD()+_mCircle('result','<div style="font-size:24px;font-weight:700;color:var(--green-text);">✓</div>',''); }
        trialResults.push({time:0,correct:!nogoReacted,type:'nogo'});
        setTimeout(function(){ _runTrial(idx+1,cfg,trialResults,cb); },1200);
      },1500);
      return;
    } else {
      ma.innerHTML=_mHUD()+_mCircle('go','','REAGUJ!');
    }
    _sndStim();
    _motionState.listening=true; _motionState._keyPressed=null; _lastMousePos=null;
    var rc=setInterval(function(){
      if(_motionAbort){ clearInterval(rc); return; }
      var moved=false;
      if(_motionMode==='directions'){
        var dir;
        var kp=_motionState._keyPressed;
        if(kp) dir={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[kp]||null;
        if(!dir&&_motionInputMode==='motion'&&!_desktopFallback) dir=detectDirection();
        if(dir){ moved=true; _motionState._keyPressed=null; var correct=dir===dirTarget; _finishTrial(clearInterval,rc,rt,stimTime,correct,correct?null:'wrong_dir',trialResults,idx,cfg,cb); return; }
      } else {
        if(detectMovement()||_motionState._keyPressed){ moved=true; _motionState._keyPressed=null; _finishTrial(clearInterval,rc,rt,stimTime,true,null,trialResults,idx,cfg,cb); return; }
      }
    },16);
    var rt=setTimeout(function(){
      clearInterval(rc); _motionState.listening=false; _motionState._keyPressed=null;
      _gameLives--; setTimeout(_flashLives,50); _gamePoints-=1; _gameCombo=0; _gameTotalTrials++;
      _mPtsAnim('-1','var(--red-text)');
      ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:20px;">Brak reakcji</div>','');
      trialResults.push({time:cfg.window,correct:false,type:'timeout'});
      setTimeout(function(){ if(_gameLives<=0){ cb(trialResults); return; } _runTrial(idx+1,cfg,trialResults,cb); },1200);
    },cfg.window);
  },delay);
}

function _finishTrial(clearFn,rc,rt,stimTime,correct,errType,trialResults,idx,cfg,cb){
  clearFn(rc); clearTimeout(rt); _motionState.listening=false; _motionState._keyPressed=null;
  var t=Date.now()-stimTime; _gameTotalTrials++;
  if(correct){
    _gameCorrect++; _gameTimes.push(t); _gameLastTime=t;
    var sc=_calcPoints(t); var pts=sc.pts;
    _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
    var mult=_gameCombo>=10?4:_gameCombo>=5?3:_gameCombo>=3?2:1;
    var earned=pts*mult; _gamePoints+=earned;
    if(mult>1){ _sndCombo(); _mPtsAnim('+'+earned+' ⚡ x'+_gameCombo,'#fb923c'); }
    else if(earned>0){ _sndGood(); _mPtsAnim('+'+earned+' ⚡'+(sc.label?' '+sc.label:''),'var(--green-text)'); }
    else { _sndGood(); }
    // Animacja czasu pod punktami
    _mTimeAnim(t);
    var col=t<250?'var(--green-text)':t<400?'var(--accent)':t<600?'var(--amber-text)':'var(--red-text)';
    var ma=el('motion-active');
    // Flash tła
    if(t<350) ma.style.background='rgba(74,222,128,.1)'; else if(t<500) ma.style.background='rgba(59,130,246,.08)';
    setTimeout(function(){ ma.style.background='#060606'; },200);
    ma.innerHTML=_mHUD()+_mCircle('result','<div style="font-size:32px;font-weight:900;color:'+col+';">'+t+'ms</div>','');
    var pe=document.getElementById('m-pts'); if(pe){ pe.style.transform='scale(1.3)'; setTimeout(function(){ pe.style.transform='scale(1)'; },200); }
    var lv=document.getElementById('m-last-val'); if(lv){ lv.style.transform='scale(1.15)'; setTimeout(function(){ lv.style.transform='scale(1)'; },200); }
  } else {
    _gameLives--; setTimeout(_flashLives,50); _gameCombo=0;
    _gamePoints-=(errType==='wrong_dir'?2:1);
    _sndBad(); if(navigator.vibrate) navigator.vibrate(200);
    _mPtsAnim(errType==='wrong_dir'?'-2 ✕':'- 💥','var(--red-text)');
    var ma=el('motion-active');
    ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:32px;">✕</div>',errType==='wrong_dir'?'Zły kierunek!':'');
  }
  trialResults.push({time:t,correct:correct,type:correct?'hit':'miss'});
  setTimeout(function(){ if(_gameLives<=0){ cb(trialResults); return; } _runTrial(idx+1,cfg,trialResults,cb); },1200);
}

// ── Level complete ──
var _LEVEL_MSGS=["Niezły refleks! 🔥","Maszyna! ⚡","Nie do zatrzymania!","Jak błyskawica! ⚡","Level up! Idziesz jak burza!","Twój mózg się dopiero rozgrzewa...","Spokojnie, to dopiero rozgrzewka 😏","Za szybki jesteś! 🏎️","Następny level będzie ciekawszy...","Czujesz to? To adrenalina! 💉"];
function _showLevelComplete(lv,trialResults){
  _sndLevelUp();
  var ch=getLevelCharacter(lv); var nextCh=getLevelCharacter(lv+1);
  var lvTimes=trialResults.filter(function(r){ return r.correct&&r.time>0; }).map(function(r){ return r.time; });
  var lvBest=lvTimes.length?Math.min.apply(null,lvTimes):0;
  var lvAvg=lvTimes.length?Math.round(lvTimes.reduce(function(a,b){return a+b;},0)/lvTimes.length):0;
  var lvCorrect=trialResults.filter(function(r){return r.correct;}).length;
  var lvTotal=trialResults.length;
  var lvAcc=lvTotal?Math.round(lvCorrect/lvTotal*100):0;
  // Max combo w tym levelu
  var lvCombo=0,curC=0; trialResults.forEach(function(r){ if(r.correct&&r.time>0&&r.time<350){ curC++; if(curC>lvCombo) lvCombo=curC; } else curC=0; });
  var msg=_LEVEL_MSGS[Math.floor(Math.random()*_LEVEL_MSGS.length)];
  var moveHint=lv<4?'Delikatny ruch wystarczy 🤏':lv<7?'Ruszaj się zdecydowanie! 💪':lv<11?'Potrzeba mocnego ruchu! 🏋️':'Full power! Daj z siebie wszystko! 🔥';
  var avgCol=lvAvg<250?'#4ade80':lvAvg<400?'#3b82f6':lvAvg<600?'#d97706':'#dc2626';
  var accCol=lvAcc>90?'#4ade80':lvAcc>70?'#3b82f6':'#d97706';
  var tileS='background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px;text-align:center;';
  var ma=el('motion-active');
  ma.style.overflow='auto';
  ma.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;"><div style="text-align:center;width:100%;max-width:360px;">'
    +'<div style="font-size:48px;margin-bottom:4px;">'+ch.emoji+'</div>'
    +'<div style="font-size:20px;font-weight:900;color:#f2f2f2;margin-bottom:2px;">'+ch.name+'</div>'
    +'<div style="font-size:13px;font-weight:500;color:rgba(255,255,255,.65);margin-bottom:8px;">'+ch.desc+'</div>'
    +'<div style="font-size:14px;font-weight:800;color:rgba(255,255,255,.6);margin-bottom:4px;">✅ LEVEL '+lv+' UKOŃCZONY!</div>'
    +'<div style="font-size:18px;font-weight:800;color:var(--accent);">⚡ '+_gamePoints+' punktów</div>'
    // Kafelki statystyk levelu — grid 2×2
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px auto 10px;max-width:300px;">'
    +'<div style="'+tileS+'"><div style="font-size:20px;font-weight:900;color:'+avgCol+';">'+lvAvg+'ms</div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:4px;">Średni czas</div><div style="font-size:9px;font-weight:500;color:rgba(255,255,255,.4);margin-top:2px;">średnia reakcja w tym levelu</div></div>'
    +'<div style="'+tileS+'"><div style="font-size:20px;font-weight:900;color:#4ade80;">'+lvBest+'ms</div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:4px;">Najlepszy</div><div style="font-size:9px;font-weight:500;color:rgba(255,255,255,.4);margin-top:2px;">Twój najszybszy moment</div></div>'
    +'<div style="'+tileS+'"><div style="font-size:20px;font-weight:900;color:'+accCol+';">'+lvAcc+'%</div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:4px;">Celność</div><div style="font-size:9px;font-weight:500;color:rgba(255,255,255,.4);margin-top:2px;">poprawne / wszystkie</div></div>'
    +'<div style="'+tileS+'"><div style="font-size:20px;font-weight:900;color:#f59e0b;">x'+lvCombo+'</div><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:4px;">Max combo</div><div style="font-size:9px;font-weight:500;color:rgba(255,255,255,.4);margin-top:2px;">reakcji z rzędu &lt; 350ms</div></div>'
    +'</div>'
    // Feedback trenera
    +'<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px;margin:10px auto;max-width:300px;"><span style="font-size:16px;">🎙️</span> <span style="font-size:12px;font-weight:500;color:rgba(255,255,255,.6);line-height:1.6;font-style:italic;">'+getCoachFeedback(lvAvg,lvAcc,lvCombo,lv)+'</span></div>'
    // Info o następnym levelu
    +'<div style="border:1px dashed rgba(255,255,255,.12);border-radius:10px;padding:10px;margin:8px auto;max-width:300px;"><div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.5);margin-bottom:4px;">📢 CO CIĘ CZEKA:</div><div style="font-size:12px;font-weight:500;color:rgba(255,255,255,.55);line-height:1.5;">'+_getNextLevelHint(lv)+'</div>'
    +(_motionMode==='pattern'?_patScoringCompare(lv,lv+1):_stdScoringCompare(lv,lv+1))
    +'<div style="font-size:10px;font-style:italic;color:rgba(255,255,255,.3);margin-top:4px;">'+_pick(['Dasz radę. Pewnie.','Twój mózg jest gotowy. Chyba.','Skupienie to klucz. 🔑','Oddychaj i działaj.','Level wyżej = Ty lepszy.','Gdyby było łatwe, każdy by to robił.'])+'</div></div>'
    +'<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<button onclick="_nextLevel()" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:15px;font-weight:900;cursor:pointer;animation:mBtnPulse 1.5s infinite;">🚀 LEVEL '+(lv+1)+' → '+nextCh.emoji+' '+nextCh.name+'</button>'
    +'<button onclick="_endGame()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.5);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">🏁 Zakończ grę</button></div></div></div>';
}
function _nextLevel(){
  el('motion-active').style.overflow='hidden';
  _motionCountdown(function(){ _startLevel(_gameLevel+1); });
}

// ── Game Over / End ──
function _endGame(){ _removeCloseX(); _showGameOver(); }
function _showGameOver(){
  _motionRunning=false;
  if(_motionHandler) window.removeEventListener('devicemotion',_motionHandler);
  var isOver=_gameLives<=0;
  if(isOver) _sndGameOver(); else _sndLevelUp();
  var avg=_gameTimes.length?Math.round(_gameTimes.reduce(function(a,b){return a+b;},0)/_gameTimes.length):0;
  var best=_gameTimes.length?Math.min.apply(null,_gameTimes):0;
  var acc=_gameTotalTrials?Math.round(_gameCorrect/_gameTotalTrials*100):0;
  var col=avg<250?'var(--green-text)':avg<400?'var(--accent)':avg<600?'var(--amber-text)':'var(--red-text)';

  // Sprawdź PR levelu
  var athlete=(el('motion-athlete')||{}).value||'';
  var prevResults=_getMotionResults(athlete);
  var prevBestLv=0; prevResults.forEach(function(r){ if(r.mode===_motionMode&&r.level>prevBestLv) prevBestLv=r.level; });
  var isNewRecord=_gameLevel>prevBestLv;
  var compareHtml='';
  if(isNewRecord&&prevBestLv>0) compareHtml='<div style="font-size:14px;font-weight:800;color:var(--green-text);margin-top:8px;">↑ Nowy rekord levelu! (było: '+prevBestLv+')</div>';
  else if(prevBestLv>0) compareHtml='<div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:8px;">Rekord: Level '+prevBestLv+'</div>';

  var ch=getLevelCharacter(_gameLevel);
  // Sprawdź czy nowa postać
  var prevCh=prevBestLv>0?getLevelCharacter(prevBestLv):null;
  var newCharUnlocked=isNewRecord&&(!prevCh||ch.emoji!==prevCh.emoji);

  var ma=el('motion-active'); ma.style.background='#060606'; ma.style.overflow='auto';
  ma.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;"><div style="text-align:center;width:100%;max-width:360px;">'
    +'<div style="font-size:36px;margin-bottom:2px;">'+ch.emoji+'</div>'
    +'<div style="font-size:20px;font-weight:900;color:'+(isOver?'var(--red-text)':'var(--green-text)')+';">'+(isOver?'GAME OVER':'KONIEC GRY')+'</div>'
    +'<div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);margin-top:1px;">'+ch.name+' • Level '+_gameLevel+'</div>'
    +'<div style="font-size:32px;font-weight:900;color:'+(_gamePoints<0?'#f87171':'var(--accent)')+';margin-top:4px;">⚡ '+_gamePoints+'</div>'
    +(newCharUnlocked?'<div style="font-size:12px;font-weight:800;color:var(--accent);margin-top:4px;">🆕 '+ch.emoji+' '+ch.name+' odblokowany!</div>':'')
    +compareHtml
    +_mResultTiles(avg,best,acc)
    +'<div style="margin-top:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px;max-width:320px;margin-left:auto;margin-right:auto;text-align:left;">'
    +'<div style="font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:4px;">TRENER MÓWI</div>'
    +'<div style="font-size:11px;font-weight:500;line-height:1.5;color:rgba(255,255,255,.6);">'+getFinalFeedback(avg,_gameLevel)+'</div></div>'
    +'<div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<button onclick="_motionRetry()" style="width:100%;padding:10px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">🔄 Zagraj ponownie</button>'
    +'<button onclick="stopMotion()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">🏠 Wróć</button>'
    +(!athlete?'<div style="font-size:9px;color:rgba(255,255,255,.35);margin-top:4px;">Wybierz zawodnika żeby zapisywać wyniki i zdobywać ATP</div>':'')
    +'</div></div></div>';

  // Zapis + ATP (tylko z zawodnikiem)
  if(athlete) _saveMotionResult(athlete,avg,best,_gameLevel,acc,_gameMaxCombo);
  if(athlete&&typeof addPoints==='function'){
    var atpEarned=15+Math.max(0,(_gameLevel-3)*5);
    addPoints(athlete,'motion',atpEarned,'Reakcja Lv.'+_gameLevel+': '+avg+'ms');
    if(isNewRecord&&prevBestLv>0) addPoints(athlete,'motion_pr',20,'Nowy rekord: Level '+_gameLevel);
  }
  if(isNewRecord||_gamePoints>50) launchConfetti();
}

function _mResultTiles(avg,best,acc){
  var worst=_gameTimes.length?Math.max.apply(null,_gameTimes):0;
  var stdDev=0; if(_gameTimes.length>1){ var mean=avg; stdDev=Math.round(Math.sqrt(_gameTimes.reduce(function(s,t){return s+(t-mean)*(t-mean);},0)/(_gameTimes.length-1))); }
  var avgCol=avg<250?'#4ade80':avg<400?'#3b82f6':avg<600?'#d97706':'#dc2626';
  var accCol=acc>90?'#4ade80':acc>70?'#3b82f6':'#d97706';
  var ts='background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px;text-align:center;cursor:pointer;';
  var descs={avg:'Średni czas reakcji. Niższy = szybszy mózg.',best:'Najszybsza reakcja — Twój potencjał.',worst:'Najwolniejsza reakcja — moment utraty skupienia.',acc:'Poprawne reakcje / wszystkie. 100% = perfekcja.',combo:'Seria szybkich reakcji (<350ms). ×2 przy 3+, ×3 przy 5+.',sd:'Powtarzalność reakcji. Niskie = stabilny czas.'};
  function tile(icon,val,unit,label,color,key,sub){
    return '<div style="'+ts+'" onclick="var d=this.querySelector(\'.td\');if(d)d.style.display=d.style.display===\'none\'?\'block\':\'none\'">'
      +'<div style="font-size:16px;">'+icon+'</div>'
      +'<div style="font-size:24px;font-weight:900;color:'+color+';margin:2px 0;">'+val+'<span style="font-size:12px;font-weight:700;"> '+unit+'</span></div>'
      +'<div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);">'+label+'</div>'
      +(sub?'<div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:1px;">'+sub+'</div>':'')
      +'<div class="td" style="display:none;font-size:10px;font-weight:500;line-height:1.4;color:rgba(255,255,255,.5);padding:6px 0 2px;border-top:1px solid rgba(255,255,255,.06);margin-top:4px;">'+descs[key]+'</div>'
      +'</div>';
  }
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;max-width:320px;margin-left:auto;margin-right:auto;">'
    +tile('⚡',avg,'ms','Średni czas',avgCol,'avg','')
    +tile('🏆',best,'ms','Najlepszy','#4ade80','best','')
    +tile('📊',worst,'ms','Najgorszy','rgba(255,255,255,.5)','worst','')
    +tile('🎯',acc,'%','Celność',accCol,'acc','')
    +tile('🔥','x'+_gameMaxCombo,'','Najdłuższe combo','#f59e0b','combo','reakcji z rzędu < 350ms')
    +tile('📈','±'+stdDev,'ms','Odchylenie','rgba(255,255,255,.5)','sd','im niższe tym lepiej')
    +'</div>';
}
function _motionRetry(){ startMotionGame(); }

// ── Punktowanie — progi per tryb ──
var _STD_THRESHOLDS=[
  {maxLevel:2,t5:200,t4:300,t3:400,t2:600,t1:800},
  {maxLevel:5,t5:250,t4:350,t3:450,t2:650,t1:900},
  {maxLevel:99,t5:200,t4:300,t3:400,t2:550,t1:800}
];
function _getStdThresholds(lv){
  for(var i=0;i<_STD_THRESHOLDS.length;i++){ if(lv<=_STD_THRESHOLDS[i].maxLevel) return _STD_THRESHOLDS[i]; }
  return _STD_THRESHOLDS[_STD_THRESHOLDS.length-1];
}
function _scoringHtml(lv){
  var t=_getStdThresholds(lv);
  return '<div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px;margin:10px 0;">'
    +'<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#3b82f6;margin-bottom:4px;">⚡ PUNKTY W TYM LEVELU</div>'
    +'<div style="font-size:11px;font-weight:500;color:rgba(255,255,255,.5);line-height:1.6;">'
    +'&lt;'+t.t5+'ms = 5 pkt ⚡ | &lt;'+t.t4+'ms = 4 | &lt;'+t.t3+'ms = 3 | &lt;'+t.t2+'ms = 2 | &lt;'+t.t1+'ms = 1<br>'
    +'Fałszywy start: -2 pkt + ❤️ | Brak reakcji: -1 pkt + ❤️</div></div>';
}
function _mProgressBar(idx,total){
  var pct=Math.round((idx+1)/total*100);
  var isWide=window.innerWidth>=768;
  var h=isWide?'8px':'6px';
  return '<div style="position:fixed;bottom:16px;left:16px;right:16px;z-index:10;display:flex;align-items:center;gap:8px;'+(isWide?'max-width:600px;margin:0 auto;':'')+'">'
    +'<div style="flex:1;height:'+h+';background:rgba(255,255,255,.08);border-radius:3px;"><div style="width:'+pct+'%;height:'+h+';background:var(--accent);border-radius:3px;transition:width .3s;"></div></div>'
    +'<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);white-space:nowrap;">'+(idx+1)+'/'+total+'</div></div>';
}

// ── Punktowanie Wzorce — skalowanie z levelem ──
var _PAT_THRESHOLDS=[
  {maxLevel:2,t5:300,t3:500,t2:800,t1:1200},
  {maxLevel:4,t5:400,t3:600,t2:900,t1:1400},
  {maxLevel:6,t5:500,t3:700,t2:1000,t1:1600},
  {maxLevel:8,t5:600,t3:800,t2:1100,t1:1800},
  {maxLevel:99,t5:700,t3:900,t2:1200,t1:2000}
];
function _getPatThresholds(lv){
  for(var i=0;i<_PAT_THRESHOLDS.length;i++){ if(lv<=_PAT_THRESHOLDS[i].maxLevel) return _PAT_THRESHOLDS[i]; }
  return _PAT_THRESHOLDS[_PAT_THRESHOLDS.length-1];
}
function getPatternPoints(ms,lv){
  var t=_getPatThresholds(lv);
  if(ms<t.t5) return 5;
  if(ms<t.t3) return 3;
  if(ms<t.t2) return 2;
  return 1;
}
function _patScoringHtml(lv){
  var t=_getPatThresholds(lv);
  var ctx=['Proste wzorce — liczy się szybkość!','Proste wzorce — liczy się szybkość!','Więcej symboli — masz trochę więcej czasu.','Więcej symboli — masz trochę więcej czasu.','Zmieniający się cel wymaga skupienia — progi łagodniejsze.','Zmieniający się cel wymaga skupienia — progi łagodniejsze.','Kierunkowe reagowanie = dodatkowe wyzwanie — progi dostosowane.','Kierunkowe reagowanie = dodatkowe wyzwanie — progi dostosowane.'];
  var ctxTxt=lv<=8?(ctx[lv-1]||''):'Złożone wzorce — więcej czasu na decyzję. Ale nie za dużo. 😏';
  return '<div style="background:rgba(255,255,255,.03);border-radius:8px;padding:8px 10px;margin-top:6px;">'
    +'<div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#3b82f6;margin-bottom:4px;">⚡ PUNKTY</div>'
    +'<div style="font-size:10px;font-weight:500;color:rgba(255,255,255,.45);line-height:1.6;">'
    +'&lt; '+t.t5+'ms = 5 pkt ⚡ | &lt; '+t.t3+'ms = 3 pkt | &lt; '+t.t2+'ms = 2 pkt | &lt; '+t.t1+'ms = 1 pkt<br>'
    +'Poprawne zignorowanie: +1 pkt<br>'
    +'Fałszywy alarm: -2 pkt + ❤️ | Przeoczony: -1 pkt + ❤️</div>'
    +'<div style="font-size:9px;font-style:italic;color:rgba(255,255,255,.3);margin-top:4px;">'+ctxTxt+'</div></div>';
}

function _stdScoringCompare(curLv,nxtLv){
  var cur=_getStdThresholds(curLv),nxt=_getStdThresholds(nxtLv);
  if(cur.t5===nxt.t5) return '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;">⚡ Progi punktów bez zmian. Szybciej i trudniej! 😏</div>';
  return '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;">⚡ Nowe progi: &lt;'+nxt.t5+'ms=5pkt | &lt;'+nxt.t4+'ms=4 | &lt;'+nxt.t3+'ms=3 | &lt;'+nxt.t2+'ms=2 | &lt;'+nxt.t1+'ms=1</div>';
}
function _patScoringCompare(curLv,nxtLv){
  var cur=_getPatThresholds(curLv),nxt=_getPatThresholds(nxtLv);
  if(cur.t5===nxt.t5) return '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;">⚡ Progi punktów bez zmian. Ale wzorce trudniejsze! 😏</div>';
  return '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;">⚡ Nowe progi: &lt;'+nxt.t5+'ms=5pkt | &lt;'+nxt.t3+'ms=3pkt | &lt;'+nxt.t2+'ms=2pkt | &lt;'+nxt.t1+'ms=1pkt</div>';
}

// ── Tryb Wzorce (przebudowa) ──
var PAT_COLORS=['🔴','🟢','🔵','🟡','🟣','🟠','⚪','⚫'];
function _patCfg(lv){
  var presets=[
    {grid:'1x2',cols:2,count:2,nCol:2,interval:2500,fake:0,total:12,tgtCh:0,pos:'center'},
    {grid:'1x2',cols:2,count:2,nCol:3,interval:2200,fake:0,total:14,tgtCh:0,pos:'center'},
    {grid:'2x2',cols:2,count:4,nCol:3,interval:2000,fake:0,total:16,tgtCh:0,pos:'center'},
    {grid:'2x2',cols:2,count:4,nCol:4,interval:1800,fake:0.1,total:18,tgtCh:0,pos:'center'},
    {grid:'2x2',cols:2,count:4,nCol:4,interval:1500,fake:0.15,total:20,tgtCh:1,pos:'vertical'},
    {grid:'2x2',cols:2,count:4,nCol:5,interval:1300,fake:0.2,total:22,tgtCh:2,pos:'vertical'},
    {grid:'2x2',cols:2,count:4,nCol:5,interval:1200,fake:0.2,total:24,tgtCh:2,pos:'quad'},
    {grid:'2x2',cols:2,count:4,nCol:6,interval:1000,fake:0.25,total:26,tgtCh:3,pos:'quad'},
    {grid:'3x3',cols:3,count:9,nCol:5,interval:1200,fake:0.2,total:24,tgtCh:2,pos:'quad'},
    {grid:'3x3',cols:3,count:9,nCol:6,interval:1000,fake:0.3,total:28,tgtCh:3,pos:'quad'}
  ];
  if(lv<=presets.length) return presets[lv-1];
  return {grid:'3x3',cols:3,count:9,nCol:Math.min(8,5+Math.floor(lv/3)),interval:Math.max(600,1000-lv*30),fake:Math.min(0.4,0.2+lv*0.02),total:Math.min(40,24+lv*2),tgtCh:Math.min(5,2+Math.floor(lv/2)),pos:'quad'};
}
function _getPatSyms(n){ return PAT_COLORS.slice(0,n); }
function _genPattern(cnt,syms){ cnt=cnt||4; syms=syms||PAT_COLORS; var p=[]; for(var i=0;i<cnt;i++) p.push(syms[Math.floor(Math.random()*syms.length)]); return p; }
function _patHtml(p,cols,fs){
  fs=fs||(cols<=2?'48':'24'); if(cols<=2&&p.length<=2) fs='48';
  return '<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:8px;place-items:center;">'+p.map(function(s){ return '<div style="font-size:'+fs+'px;line-height:1;">'+s+'</div>'; }).join('')+'</div>';
}
function _patternsMatch(a,b){ if(!a||!b||a.length!==b.length) return false; for(var i=0;i<a.length;i++) if(a[i]!==b[i]) return false; return true; }
// Pozycje bodźca
var _PAT_POS={center:{t:'55%',l:'50%',tr:'translate(-50%,-50%)'},top:{t:'22%',l:'50%',tr:'translate(-50%,0)'},bottom:{t:'72%',l:'50%',tr:'translate(-50%,0)'},'top-left':{t:'22%',l:'12%',tr:'none'},'top-right':{t:'22%',l:'',r:'12%',tr:'none'},'bottom-left':{t:'68%',l:'12%',tr:'none'},'bottom-right':{t:'68%',l:'',r:'12%',tr:'none'}};
function _pickPatPos(posMode){
  if(posMode==='center') return 'center';
  if(posMode==='vertical'){ var o=['center','top','bottom']; return o[Math.floor(Math.random()*o.length)]; }
  var q=['center','top-left','top-right','bottom-left','bottom-right']; return q[Math.floor(Math.random()*q.length)];
}
function _patPosStyle(pos){
  var p=_PAT_POS[pos]||_PAT_POS.center;
  var s='position:absolute;top:'+p.t+';'; if(p.l) s+='left:'+p.l+';'; if(p.r) s+='right:'+p.r+';';
  s+='transform:'+p.tr+';'; return s+'z-index:5;text-align:center;width:min(65%,280px);transition:all .3s ease;';
}

var _patTgtChangeCount=0;
function _runPatternLevel(idx,cfg,results,cb){
  if(_motionAbort||_gameLives<=0){ cb(results); return; }
  var pc=_patCfg(_gameLevel); var syms=_getPatSyms(pc.nCol);
  if(idx>=pc.total){ cb(results); return; }
  _trialIdx=idx; _trialTotal=pc.total;
  var ma=el('motion-active');
  // Zmiana celu
  if(pc.tgtCh>0&&idx>0&&_patTgtChangeCount<pc.tgtCh&&idx%(Math.floor(pc.total/pc.tgtCh))===0){
    _patTgtChangeCount++; _patternTarget=_genPattern(pc.count,syms);
    _mBeep(400,0.05); setTimeout(function(){_mBeep(600,0.05);},50); setTimeout(function(){_mBeep(800,0.05);},100);
    ma.innerHTML=_mHUD()+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;background:rgba(0,0,0,.5);padding:16px 24px;border-radius:16px;"><div style="font-size:20px;font-weight:900;color:var(--amber-text);">🔄 NOWY CEL!</div></div>';
    setTimeout(function(){ _runPatternLevel(idx,cfg,results,cb); },1200); return;
  }
  // Generuj bodziec — gwarantuj minMatches
  var matchesLeft=Math.max(0,(pc.total>=4?Math.floor(pc.total*0.2):3)-(results.filter(function(r){return r.type==='pattern_hit'||r.type==='pattern_miss';}).length));
  var remaining=pc.total-idx;
  var forceMatch=matchesLeft>=remaining;
  var isMatch=forceMatch||(Math.random()<0.22);
  var stim;
  if(isMatch){ stim=_patternTarget.slice(); }
  else {
    stim=_genPattern(pc.count,syms);
    if(pc.fake>0&&Math.random()<pc.fake){ stim=_patternTarget.slice(); stim[Math.floor(Math.random()*pc.count)]=syms[Math.floor(Math.random()*syms.length)]; }
    if(_patternsMatch(stim,_patternTarget)) stim=_genPattern(pc.count,syms);
  }
  var stimPos=_pickPatPos(pc.pos);
  var isSmall=window.innerHeight<600;
  var boxPad=isSmall?'10px':'16px';
  var tFs=pc.cols<=2?(pc.count<=2?(isSmall?'36':'48'):(isSmall?'28':'36')):(isSmall?'18':'24');
  var sFs=tFs;
  _motionState.listening=false; _motionState._keyPressed=null;
  var stimTime=Date.now();
  // Render — kontener z padding-top dla HUD safe zone
  var boxMaxH='max-height:calc((100vh - 230px) / 2 - 20px);overflow:hidden;';
  ma.innerHTML=_mHUD()
    +'<div style="position:absolute;inset:0;padding-top:115px;padding-bottom:40px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:'+(stimPos==='center'?'center':'flex-start')+';gap:16px;">'
    // CEL — zawsze u góry
    +'<div style="text-align:center;width:min(65%,280px);z-index:5;flex-shrink:0;">'
    +'<div style="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">🎯 SZUKAJ</div>'
    +'<div id="pat-target-box" style="border:2px solid var(--accent);border-radius:16px;padding:'+boxPad+';background:rgba(59,130,246,.06);box-shadow:0 0 24px rgba(59,130,246,.15);'+boxMaxH+'">'+_patHtml(_patternTarget,pc.cols,tFs)+'</div></div>'
    // BODZIEC
    +(stimPos==='center'
      // Center: pod celem w kolumnie
      ?'<div style="text-align:center;width:min(65%,280px);z-index:5;flex-shrink:0;">'
      +'<div style="font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;">👀 OBSERWUJ</div>'
      +'<div id="pat-stim-box" style="border:2px solid rgba(255,255,255,.12);border-radius:16px;padding:'+boxPad+';background:rgba(255,255,255,.03);box-shadow:0 0 15px rgba(255,255,255,.05);transition:border-color .2s,box-shadow .2s;'+boxMaxH+'">'+_patHtml(stim,pc.cols,sFs)+'</div></div>'
      // Quad/vertical: absolutnie pozycjonowany
      :'</div><div style="'+_patPosStyle(stimPos)+'">'
      +'<div style="font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;">👀 OBSERWUJ</div>'
      +'<div id="pat-stim-box" style="border:2px solid rgba(255,255,255,.12);border-radius:16px;padding:'+boxPad+';background:rgba(255,255,255,.03);box-shadow:0 0 15px rgba(255,255,255,.05);transition:border-color .2s,box-shadow .2s;'+boxMaxH+'">'+_patHtml(stim,pc.cols,sFs)+'</div>'
    )
    +'</div>';
  _sndStim();
  _motionState.listening=true; _motionState._keyPressed=null; _lastMousePos=null;
  var reacted=false;
  var rc=setInterval(function(){
    if(_motionAbort){ clearInterval(rc); return; }
    if(detectMovement()||_motionState._keyPressed){
      clearInterval(rc); clearTimeout(rt); _motionState.listening=false; _motionState._keyPressed=null;
      reacted=true; var t=Date.now()-stimTime; _gameTotalTrials++;
      if(isMatch){
        _gameCorrect++; _gameTimes.push(t); _gameLastTime=t;
        var pts=getPatternPoints(t,_gameLevel); var mult=_gameCombo>=10?4:_gameCombo>=5?3:_gameCombo>=3?2:1;
        _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
        var earned=pts*mult; _gamePoints+=earned;
        _sndGood(); _mPtsAnim('✓ +'+earned+' ⚡','var(--green-text)');
        results.push({time:t,correct:true,type:'pattern_hit'});
        var sb=document.getElementById('pat-stim-box'); if(sb){ sb.style.borderColor='#4ade80'; sb.style.boxShadow='0 0 30px rgba(74,222,128,.3)'; }
        var tb=document.getElementById('pat-target-box'); if(tb){ tb.style.borderColor='#4ade80'; }
        ma.style.background='rgba(74,222,128,.06)'; setTimeout(function(){ ma.style.background='#060606'; },300);
      } else {
        _gameLives--; setTimeout(_flashLives,50); _gameCombo=0; _gamePoints-=2;
        _sndBad(); if(navigator.vibrate) navigator.vibrate(200);
        // Jasny komunikat o błędzie
        var errMsg=document.createElement('div'); errMsg.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:20;pointer-events:none;opacity:0;transition:opacity .1s;';
        errMsg.innerHTML='<div style="font-size:18px;font-weight:900;color:#f87171;">✕ ZMYŁKA! -2 pkt</div><div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px;">To nie ten wzorzec!</div><div style="font-size:11px;font-weight:700;color:#f87171;margin-top:4px;">❤️ -1 życie!</div>';
        ma.appendChild(errMsg); requestAnimationFrame(function(){ errMsg.style.opacity='1'; });
        setTimeout(function(){ errMsg.style.transition='opacity .3s'; errMsg.style.opacity='0'; setTimeout(function(){ errMsg.remove(); },300); },1000);
        // Flash punktów na czerwono
        var pe=document.getElementById('m-pts'); if(pe){ pe.style.color='#f87171'; setTimeout(function(){ pe.style.color=_gamePoints<0?'#f87171':'var(--accent)'; },300); }
        results.push({time:t,correct:false,type:'pattern_false'});
        var sb2=document.getElementById('pat-stim-box'); if(sb2){ sb2.style.borderColor='#f87171'; sb2.style.boxShadow='0 0 20px rgba(248,113,113,.3)'; }
        ma.style.background='rgba(248,113,113,.06)'; setTimeout(function(){ ma.style.background='#060606'; },300);
      }
      setTimeout(function(){ _runPatternLevel(idx+1,cfg,results,cb); },1100);
    }
  },16);
  var rt=setTimeout(function(){
    clearInterval(rc); _motionState.listening=false; _gameTotalTrials++;
    if(!reacted){
      if(isMatch){ _gameLives--; setTimeout(_flashLives,50); _gameCombo=0; _gamePoints-=1; _mPtsAnim('MISS -1','var(--red-text)'); _sndBad(); results.push({time:pc.interval,correct:false,type:'pattern_miss'});
        var sb3=document.getElementById('pat-stim-box'); if(sb3) sb3.style.borderColor='#f87171';
      } else { _gameCorrect++; _gamePoints+=1; results.push({time:0,correct:true,type:'pattern_ignore'});
        // Subtelna animacja za poprawne zignorowanie
        var ck=document.createElement('div'); ck.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;font-weight:700;color:#4ade80;z-index:20;pointer-events:none;opacity:0;transition:opacity .2s;';
        ck.textContent='✓'; el('motion-active').appendChild(ck);
        requestAnimationFrame(function(){ ck.style.opacity='1'; });
        setTimeout(function(){ ck.style.opacity='0'; setTimeout(function(){ ck.remove(); },200); },300);
      }
    }
    setTimeout(function(){ _runPatternLevel(idx+1,cfg,results,cb); },800);
  },pc.interval);
}

// ── Zapis wyników ──
function _getMotionResults(athlete){ try{ var d=JSON.parse(localStorage.getItem('axs_motion_results')||'{}'); return (d[athlete]&&d[athlete].reaction)||[]; }catch(e){ return []; } }
function _saveMotionResult(athlete,avg,best,level,acc,combo){
  if(!athlete) return;
  try{ var d=JSON.parse(localStorage.getItem('axs_motion_results')||'{}');
    if(!d[athlete]) d[athlete]={reaction:[],stability:[],agility:[],dynamics:[],coordination:[],symmetry:[]};
    d[athlete].reaction.push({date:new Date().toISOString(),mode:_motionMode,level:level,avgTime:avg,bestTime:best,accuracy:acc,comboMax:combo,totalPoints:_gamePoints});
    if(d[athlete].reaction.length>50) d[athlete].reaction=d[athlete].reaction.slice(-50);
    localStorage.setItem('axs_motion_results',JSON.stringify(d));
  }catch(e){}
}
