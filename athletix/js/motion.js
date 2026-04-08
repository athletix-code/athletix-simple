// ═══════════════════════════════════════
//  MOTION GAMES — Moduł Reakcja (gra z levelami)
//  Akcelerometr + fallback klawiatura
// ═══════════════════════════════════════

var _motionMode='simple';
var _motionRunning=false, _motionAbort=false, _desktopFallback=false, _motionHandler=null;
var _motionState={listening:false,ax:0,ay:0,az:0,baseline:{x:0,y:0,z:0},sensitivity:3,_keyPressed:null};
// Stan gry
var _gamePoints=0, _gameLives=3, _gameLevel=1, _gameCombo=0, _gameMaxCombo=0, _gameTotalTrials=0, _gameCorrect=0, _gameTimes=[], _gameBestLevel=0;
// Tryb Wzorce
var PATTERN_SYMBOLS=['🔴','🟢','🔵','🟡','🟣','🟠','⬜','⬛'];
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
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var h='<div style="max-width:420px;width:calc(100% - 32px);background:var(--s1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:20px;max-height:80vh;overflow-y:auto;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:900;color:var(--text);">⚡ Reakcja — Jak grać?</div><button onclick="document.getElementById(\'motion-info-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:var(--muted);width:32px;height:32px;">✕</button></div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">📱 Jak trzymać telefon</div>'
    +'<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:12px;">Trzymaj telefon w wyprostowanej ręce przed sobą. Ekran do siebie. Stój stabilnie — telefon musi być nieruchomy przed bodźcem. 🧍📱</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">🎯 Zasady gry</div>'
    +'<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:12px;">Czekaj na sygnał. Gdy kółko zmieni kolor na <strong style="color:#4ade80;">ZIELONE</strong> — przechyl telefon szybko! Im szybciej zareagujesz, tym więcej punktów.<br><br><strong>Kierunki:</strong> przechyl w stronę strzałki (← → ↑ ↓)<br><strong>Go/No-Go:</strong> reaguj TYLKO na zielone, IGNORUJ czerwone!</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">⚡ Punkty</div>'
    +'<div style="font-size:12px;color:var(--text);line-height:1.8;margin-bottom:12px;">&lt;200ms = 5 pkt ⚡<br>&lt;300ms = 3 pkt<br>&lt;400ms = 2 pkt<br>&lt;500ms = 1 pkt<br>🔥 Combo 3+ szybkich = podwójne!<br>🔥 Combo 5+ = potrójne!<br>❌ Fałszywy start = -2 pkt<br>❌ Błąd Go/No-Go = -3 pkt</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">🏆 Poziomy</div>'
    +'<div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:14px;">Gra ma nieskończoną ilość poziomów. Każdy kolejny jest trudniejszy: szybsze bodźce, krótsze okno reakcji, fałszywe sygnały. Masz 3 życia — fałszywy start lub brak reakcji = stracone życie.</div>'
    // Postacie do odblokowania
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;margin-top:6px;">🏆 Postacie do odblokowania</div>'
    +'<div style="max-height:180px;overflow-y:auto;margin-bottom:12px;">'
    +(function(){ var athlete2=(el('motion-athlete')||{}).value||''; var prev2=_getMotionResults(athlete2); var maxLv2=0; prev2.forEach(function(r){ if(r.level>maxLv2) maxLv2=r.level; }); return LEVEL_CHARACTERS.map(function(c){ var unlocked=maxLv2>=c.level; var isCurrent=c===getLevelCharacter(maxLv2||1); return '<div style="display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid var(--border);'+(isCurrent?'border-left:2px solid var(--accent);padding-left:6px;':'')+(unlocked?'':'opacity:.4;')+'">'+'<span style="font-size:18px;">'+(unlocked?c.emoji:'❓')+'</span>'+'<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:var(--text);">'+(unlocked?c.name:'???')+' <span style="font-size:9px;color:var(--dim);">Lv.'+c.level+'</span></div>'+(unlocked?'<div style="font-size:10px;color:var(--muted);">'+c.desc+'</div>':'')+'</div></div>'; }).join(''); })()
    +'</div>'
    +'<button onclick="var nd=document.getElementById(\'motion-nerd-section\');nd.style.display=nd.style.display===\'none\'?\'block\':\'none\';" style="font-size:11px;font-weight:700;color:var(--muted);background:transparent;border:none;cursor:pointer;text-decoration:underline;padding:8px 0;width:100%;text-align:center;">🤓 Sekcja dla nerdów — jak to NAPRAWDĘ działa?</button>'
    +'<div id="motion-nerd-section" style="display:none;background:rgba(59,130,246,.04);border-radius:12px;padding:16px;margin-top:8px;font-size:12px;font-weight:500;line-height:1.7;color:var(--text);">'
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
    +'<p style="margin-bottom:6px;font-size:11px;color:var(--muted);">Prosty czas reakcji na bodziec wzrokowy, warunki laboratoryjne. Nasz pomiar akcelerometryczny będzie z natury wolniejszy.</p>'
    +'<div style="margin-bottom:10px;">• &lt; 200 ms — Wartości spotykane u elitarnych sportowców<br>'
    +'• 200-280 ms — Bardzo dobry, osoby aktywne fizycznie<br>'
    +'• 280-350 ms — Przeciętny wynik młodych dorosłych<br>'
    +'• 350-500 ms — Częsty przy zmęczeniu lub braku wprawy<br>'
    +'• &gt; 500 ms — Do poprawy, nie powód do niepokoju — powód do trenowania</div>'
    +'<div style="font-size:10px;color:var(--muted);margin-bottom:10px;">(Na podstawie: Welford, 1980; Jain et al., 2015; dane MindCrowd)</div>'
    // Źródła
    +'<div style="font-size:13px;font-weight:800;margin-top:16px;margin-bottom:6px;">📚 ŹRÓDŁA</div>'
    +'<div style="font-size:10px;font-weight:500;color:var(--muted);line-height:1.6;">'
    +'1. Jain A, Bansal R, Kumar A, Singh KD (2015). "A comparative study of visual and auditory reaction times..." Int J Appl Basic Med Res, 5(2):124-127. PMC4456887<br>'
    +'2. Pain MTG, Hibbs A (2007). "Sprint starts and the minimum auditory reaction time." J Sports Sciences, 25(1):79-86.<br>'
    +'3. Komi PV, Ishikawa M, Salmi J (2009). "IAAF Sprint Start Research Project: Is the 100 ms limit still valid?" New Studies in Athletics, 24(1):37-47.<br>'
    +'4. Brosnan KC, Hayes K, Harrison AJ (2017). "Effects of false-start disqualification rules on response-times of elite-standard sprinters." J Sports Sciences, 35(10):929-935.<br>'
    +'5. Welford AT (1980). "Reaction Times." Academic Press, New York.<br>'
    +'6. MindCrowd Study — Arizona Alzheimer\'s Consortium. mindcrowd.org</div>'
    // Nota
    +'<div style="font-size:10px;font-style:italic;color:var(--muted);border-top:1px solid var(--border);padding-top:10px;margin-top:12px;">⚠️ Opisy opierają się na recenzowanych publikacjach naukowych. Nasz pomiar akcelerometryczny nie jest równoważny pomiarom laboratoryjnym — służy do śledzenia własnego postępu. Część treści opracowana z wykorzystaniem narzędzi AI i zweryfikowana przez autorów.</div>'
    +'<div style="font-weight:800;color:var(--accent);margin-top:14px;text-align:center;">⚡ Elevate Your Game — trenuj swój mózg tak jak trenujesz ciało!</div>'
    +'</div>'
    +'<button onclick="document.getElementById(\'motion-info-modal\').remove()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;margin-top:10px;">Rozumiem! 💪</button></div>';
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
function _setMotionInput(m){
  _motionInputMode=m;
  var mb=el('mi-motion'),mt=el('mi-touch');
  if(mb){ mb.className='chip'+(m==='motion'?' on-blue':''); }
  if(mt){ mt.className='chip'+(m==='touch'?' on-blue':''); }
}
// Desktop/touch click handler
function _onMotionClick(e){
  if(!_motionState.listening) return;
  if(e.target.closest('.lock-btn,.pause-btn,button[onclick*="stop"],button[onclick*="Level"],button[onclick*="endGame"],button[onclick*="Retry"]')) return;
  _motionState._keyPressed=' ';
}
function _addInputListeners(){
  document.addEventListener('keydown',_onDesktopKey);
  el('motion-active').addEventListener('click',_onMotionClick);
  el('motion-active').addEventListener('touchstart',function _ts(e){
    if(!_motionState.listening) return;
    if(e.target.closest('button')) return;
    _motionState._keyPressed=' ';
  },{passive:true});
}
function _removeInputListeners(){
  document.removeEventListener('keydown',_onDesktopKey);
}
function _onDesktopKey(e){
  if(!_motionState.listening) return;
  if(e.key===' '||e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='Enter'){ e.preventDefault(); _motionState._keyPressed=e.key; }
}

function startMotionGame(){
  requestMotionPermission(function(ok){
    if(!ok&&_motionInputMode==='motion'){ _motionInputMode='touch'; }
    _motionAbort=false; _motionRunning=true;
    _gamePoints=0; _gameLives=3; _gameLevel=1; _gameCombo=0; _gameMaxCombo=0; _gameTotalTrials=0; _gameCorrect=0; _gameTimes=[];
    el('settings').style.display='none'; el('motion-active').style.display='block';
    reqWL(); goFS();
    // Przycisk zamknij ✕
    var closeBtn=document.createElement('button'); closeBtn.id='motion-close-btn';
    closeBtn.style.cssText='position:fixed;top:12px;right:12px;z-index:20;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.5);font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;';
    closeBtn.textContent='✕'; closeBtn.onclick=_confirmCloseMotion;
    el('motion-active').appendChild(closeBtn);
    // Input
    if(_motionInputMode==='motion'&&!_desktopFallback){
      _motionHandler=onMotionData; window.addEventListener('devicemotion',_motionHandler);
    }
    _addInputListeners();
    // Kalibracja lub od razu
    if(_motionInputMode==='touch'||_desktopFallback){
      _motionCountdown(function(){ _startLevel(_gameLevel); });
    } else {
      _motionCountdown(function(){
        el('motion-active').innerHTML=_mScreen('Kalibracja...','Trzymaj telefon nieruchomo','');
        var cb2=document.getElementById('motion-close-btn'); if(!cb2){ cb2=closeBtn.cloneNode(true); cb2.onclick=_confirmCloseMotion; el('motion-active').appendChild(cb2); }
        calibrateMotion(function(){ _startLevel(_gameLevel); });
      });
    }
  });
}
function stopMotion(){
  _motionAbort=true; _motionRunning=false;
  if(_motionHandler) window.removeEventListener('devicemotion',_motionHandler);
  _removeInputListeners();
  var cb=document.getElementById('motion-close-btn'); if(cb) cb.remove();
  var cm=document.getElementById('motion-confirm-close'); if(cm) cm.remove();
  el('motion-active').style.display='none'; el('settings').style.display='flex';
  relWL(); exitFS();
}
function _confirmCloseMotion(){
  var existing=document.getElementById('motion-confirm-close'); if(existing) existing.remove();
  var ov=document.createElement('div'); ov.id='motion-confirm-close';
  ov.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:20px;';
  ov.innerHTML='<div style="max-width:300px;width:100%;background:#1a1a1a;border-radius:16px;padding:20px;text-align:center;">'
    +'<div style="font-size:16px;font-weight:800;color:#f2f2f2;margin-bottom:6px;">Zakończyć grę?</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:14px;">Twój postęp zostanie zapisany.</div>'
    +'<button id="mc-end" style="width:100%;padding:12px;background:var(--red);color:#fff;border:none;border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zakończ</button>'
    +'<button id="mc-resume" style="width:100%;padding:12px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-top:6px;">Wracam do gry!</button></div>';
  document.body.appendChild(ov);
  document.getElementById('mc-end').onclick=function(){ ov.remove(); _endGame(); _showSwipeTip(); };
  document.getElementById('mc-resume').onclick=function(){ ov.remove(); };
}
function _showSwipeTip(){
  try{ if(localStorage.getItem('axs_motion_swipe_tip_shown')) return; localStorage.setItem('axs_motion_swipe_tip_shown','1'); }catch(e){}
  var tip=document.createElement('div');
  tip.style.cssText='position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;padding:8px 16px;border-radius:20px;z-index:30;transition:opacity .3s;';
  tip.textContent='💡 Tip: możesz też zamykać ściągając palcem w dół';
  document.body.appendChild(tip);
  setTimeout(function(){ tip.style.opacity='0'; setTimeout(function(){ tip.remove(); },300); },3000);
}

function _motionCountdown(cb){
  var ma=el('motion-active'); var n=3;
  function tick(){ if(_motionAbort) return; ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:72px;font-weight:900;color:rgba(255,255,255,.8);">'+n+'</div>'; _mBeep(600,0.04); n--; if(n>=0) setTimeout(tick,800); else{ ma.innerHTML=''; setTimeout(cb,200); } } tick();
}

// ── Ekran helper ──
function _mScreen(title,sub,extra){ return '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.4);">'+title+'</div>'+(sub?'<div style="font-size:11px;color:rgba(255,255,255,.25);margin-top:4px;">'+sub+'</div>':'')+(extra||'')+'</div>'; }
function _mHUD(){
  var lives=''; for(var i=0;i<3;i++) lives+='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+(i<_gameLives?'var(--red)':'rgba(255,255,255,.15)')+';margin-left:3px;"></span>';
  var ch=getLevelCharacter(_gameLevel);
  var comboHtml=_gameCombo>=3?'<div style="position:absolute;top:50px;left:50%;transform:translateX(-50%);z-index:11;font-size:14px;font-weight:900;color:#f59e0b;background:rgba(245,158,11,.1);padding:4px 14px;border-radius:20px;animation:mBtnPulse .6s infinite;">🔥 x'+_gameCombo+' COMBO</div>':'';
  var avgMs=_gameTimes.length?Math.round(_gameTimes.reduce(function(a,b){return a+b;},0)/_gameTimes.length):0;
  var prMs=_gameTimes.length?Math.min.apply(null,_gameTimes):0;
  var statsHtml=_gameTimes.length?'<div style="position:absolute;top:44px;left:16px;z-index:10;display:flex;gap:10px;"><span style="font-size:10px;font-weight:600;color:rgba(255,255,255,.5);">Śr: '+avgMs+'ms</span><span style="font-size:10px;font-weight:600;color:rgba(255,255,255,.5);">PR: '+prMs+'ms</span></div>':'';
  return '<div style="position:absolute;top:0;left:0;right:0;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;z-index:10;background:linear-gradient(to bottom,rgba(6,6,6,.9),transparent);height:42px;">'
    +'<span style="font-size:20px;font-weight:900;color:var(--accent);transition:transform .2s;" id="m-pts">⚡ '+_gamePoints+'</span>'
    +'<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,.6);background:rgba(255,255,255,.08);padding:3px 10px;border-radius:12px;">'+ch.emoji+' Lv.'+_gameLevel+'</span>'
    +'<div style="display:flex;align-items:center;gap:4px;">'+lives+'<button class="lock-btn" onclick="lockScreen()" style="margin-left:4px;font-size:12px;">🔒</button></div></div>'
    +statsHtml+comboHtml;
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
  return '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">'
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
  var ma=el('motion-active');
  var isFake=Math.random()<cfg.fakeChance;
  var isGoNoGo=_motionMode==='gonogo';
  var isNoGo=isGoNoGo&&Math.random()<0.3;

  // Faza oczekiwania
  ma.innerHTML=_mHUD()+_mCircle('wait','<div style="font-size:24px;color:rgba(255,255,255,.3);">···</div>','Czekaj...');
  _motionState.listening=false; _motionState._keyPressed=null;
  var delay=cfg.delayMin+Math.random()*(cfg.delayMax-cfg.delayMin);
  var falseStart=false;
  _motionState.listening=true;
  var wc=setInterval(function(){ if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){ falseStart=true; _motionState._keyPressed=null; } },50);

  setTimeout(function(){
    clearInterval(wc); _motionState.listening=false;
    if(_motionAbort) return;
    if(falseStart){
      _gameLives--; _gamePoints=Math.max(0,_gamePoints-2); _gameCombo=0;
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
      _motionState.listening=true; _motionState._keyPressed=null;
      var fakeReacted=false;
      var fc=setInterval(function(){ if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){ fakeReacted=true; _motionState._keyPressed=null; } },50);
      setTimeout(function(){
        clearInterval(fc); _motionState.listening=false;
        _gameTotalTrials++;
        if(fakeReacted){ _gameLives--; _gamePoints=Math.max(0,_gamePoints-3); _gameCombo=0; _mPtsAnim('-3 💥','var(--red-text)'); _sndBad(); ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:32px;">Fałszywy alarm!</div>',''); }
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
      _motionState.listening=true; _motionState._keyPressed=null;
      var nogoReacted=false;
      var nc=setInterval(function(){ if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){ nogoReacted=true; _motionState._keyPressed=null; } },16);
      setTimeout(function(){
        clearInterval(nc); _motionState.listening=false; _gameTotalTrials++;
        if(nogoReacted){ _gameLives--; _gamePoints=Math.max(0,_gamePoints-3); _gameCombo=0; _mPtsAnim('-3 💥','var(--red-text)'); _sndBad(); ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:24px;">Fałszywy alarm!</div>',''); }
        else { _gameCorrect++; _mPtsAnim('✓','var(--green-text)'); _sndGood(); ma.innerHTML=_mHUD()+_mCircle('result','<div style="font-size:24px;font-weight:700;color:var(--green-text);">✓</div>',''); }
        trialResults.push({time:0,correct:!nogoReacted,type:'nogo'});
        setTimeout(function(){ _runTrial(idx+1,cfg,trialResults,cb); },1200);
      },1500);
      return;
    } else {
      ma.innerHTML=_mHUD()+_mCircle('go','','REAGUJ!');
    }
    _sndStim();
    _motionState.listening=true; _motionState._keyPressed=null;
    var rc=setInterval(function(){
      if(_motionAbort){ clearInterval(rc); return; }
      var moved=false;
      if(_motionMode==='directions'){
        var dir=_desktopFallback?(_motionState._keyPressed?{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[_motionState._keyPressed]:null):detectDirection();
        if(dir){ moved=true; var correct=dir===dirTarget; _finishTrial(clearInterval,rc,rt,stimTime,correct,correct?null:'wrong_dir',trialResults,idx,cfg,cb); return; }
      } else {
        if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){ moved=true; _finishTrial(clearInterval,rc,rt,stimTime,true,null,trialResults,idx,cfg,cb); return; }
      }
    },16);
    var rt=setTimeout(function(){
      clearInterval(rc); _motionState.listening=false; _motionState._keyPressed=null;
      _gameLives--; _gamePoints=Math.max(0,_gamePoints-1); _gameCombo=0; _gameTotalTrials++;
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
    _gameCorrect++; _gameTimes.push(t);
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
  } else {
    _gameLives--; _gameCombo=0;
    _gamePoints=Math.max(0,_gamePoints-(errType==='wrong_dir'?2:1));
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
  ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;padding:0 20px;box-sizing:border-box;">'
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
    +'<div style="font-size:13px;font-weight:600;font-style:italic;color:rgba(255,255,255,.55);margin-bottom:2px;">'+msg+'</div>'
    +'<div style="font-size:10px;color:rgba(255,255,255,.3);">'+moveHint+'</div>'
    +'<div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<button onclick="_nextLevel()" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:15px;font-weight:900;cursor:pointer;animation:mBtnPulse 1.5s infinite;">🚀 LEVEL '+(lv+1)+' → '+nextCh.emoji+' '+nextCh.name+'</button>'
    +'<button onclick="_endGame()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.5);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">🏁 Zakończ grę</button></div></div>';
}
function _nextLevel(){
  _motionCountdown(function(){ _startLevel(_gameLevel+1); });
}

// ── Game Over / End ──
function _endGame(){ _showGameOver(); }
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

  var ma=el('motion-active'); ma.style.background='#060606';
  ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;padding:0 24px;box-sizing:border-box;">'
    +'<div style="font-size:48px;margin-bottom:4px;">'+ch.emoji+'</div>'
    +'<div style="font-size:22px;font-weight:900;color:'+(isOver?'var(--red-text)':'var(--green-text)')+';">'+(isOver?'GAME OVER':'KONIEC GRY')+'</div>'
    +'<div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.5);margin-top:2px;">'+ch.name+' • Level '+_gameLevel+'</div>'
    +'<div style="font-size:36px;font-weight:900;color:var(--accent);margin-top:6px;">⚡ '+_gamePoints+'</div>'
    +(newCharUnlocked?'<div style="font-size:13px;font-weight:800;color:var(--accent);margin-top:6px;">🆕 '+ch.emoji+' '+ch.name+' odblokowany!</div>':'')
    +compareHtml
    // Kafelki wyników
    +_mResultTiles(avg,best,acc)
    +'<div style="margin-top:20px;display:flex;flex-direction:column;gap:8px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<button onclick="_motionRetry()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">🔄 Zagraj ponownie</button>'
    +'<button onclick="stopMotion()" style="width:100%;padding:12px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">🏠 Wróć</button>'
    +(!athlete?'<div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:8px;">Wybierz zawodnika żeby zapisywać wyniki i zdobywać ATP</div>':'')
    +'</div></div>';

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
  var ts='background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px;text-align:center;cursor:pointer;';
  var descs={avg:'Średni czas Twojej reakcji na bodźce w tej sesji. Niższy = szybszy mózg. Regularny trening poprawia tę wartość.',best:'Twoja najszybsza reakcja w tej sesji. Pokazuje Twój potencjał gdy jesteś w pełni skupiony.',worst:'Najwolniejsza reakcja. Może wskazywać na chwilową utratę skupienia lub zmęczenie.',acc:'Procent poprawnych reakcji. Uwzględnia fałszywe starty i brak reakcji. 100% = perfekcja.',combo:'Najdłuższa seria szybkich reakcji z rzędu (<350ms). Combo daje mnożnik punktów: ×2 przy 3+, ×3 przy 5+, ×4 przy 10+.',sd:'Odchylenie standardowe — mierzy POWTARZALNOŚĆ Twoich reakcji. Niskie = stabilny czas. Wysokie = duże wahania.'};
  function tile(icon,val,unit,label,color,key,sub){
    return '<div style="'+ts+'" onclick="var d=this.querySelector(\'.td\');if(d)d.style.display=d.style.display===\'none\'?\'block\':\'none\'">'
      +'<div style="font-size:20px;">'+icon+'</div>'
      +'<div style="font-size:28px;font-weight:900;color:'+color+';margin:4px 0;">'+val+'<span style="font-size:14px;font-weight:700;"> '+unit+'</span></div>'
      +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);">'+label+'</div>'
      +(sub?'<div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:2px;">'+sub+'</div>':'')
      +'<div class="td" style="display:none;font-size:11px;font-weight:500;line-height:1.5;color:rgba(255,255,255,.5);padding:8px 0 4px;border-top:1px solid rgba(255,255,255,.06);margin-top:6px;">'+descs[key]+'</div>'
      +'</div>';
  }
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;max-width:320px;margin-left:auto;margin-right:auto;">'
    +tile('⚡',avg,'ms','Średni czas',avgCol,'avg','')
    +tile('🏆',best,'ms','Najlepszy','#4ade80','best','')
    +tile('📊',worst,'ms','Najgorszy','rgba(255,255,255,.5)','worst','')
    +tile('🎯',acc,'%','Celność',accCol,'acc','')
    +tile('🔥','x'+_gameMaxCombo,'','Najdłuższe combo','#f59e0b','combo','reakcji z rzędu < 350ms')
    +tile('📈','±'+stdDev,'ms','Odchylenie','rgba(255,255,255,.5)','sd','im niższe tym lepiej')
    +'</div>';
}
function _motionRetry(){ startMotionGame(); }

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
var _PAT_POS={center:{t:'50%',l:'50%',tr:'translate(-50%,-50%)'},top:{t:'18%',l:'50%',tr:'translate(-50%,0)'},bottom:{t:'72%',l:'50%',tr:'translate(-50%,0)'},'top-left':{t:'18%',l:'12%',tr:'none'},'top-right':{t:'18%',l:'',r:'12%',tr:'none'},'bottom-left':{t:'68%',l:'12%',tr:'none'},'bottom-right':{t:'68%',l:'',r:'12%',tr:'none'}};
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
  var tFs=pc.cols<=2?(pc.count<=2?'48':'36'):'24';
  var sFs=pc.cols<=2?(pc.count<=2?'48':'36'):'24';
  _motionState.listening=false; _motionState._keyPressed=null;
  var stimTime=Date.now();
  // Render
  ma.innerHTML=_mHUD()
    // CEL — zawsze u góry centered
    +'<div style="position:absolute;top:10%;left:50%;transform:translateX(-50%);text-align:center;width:min(65%,280px);z-index:5;">'
    +'<div style="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">🎯 SZUKAJ</div>'
    +'<div id="pat-target-box" style="border:2px solid var(--accent);border-radius:16px;padding:16px;background:rgba(59,130,246,.06);box-shadow:0 0 24px rgba(59,130,246,.15);">'+_patHtml(_patternTarget,pc.cols,tFs)+'</div></div>'
    // BODZIEC — pozycja zależy od levelu
    +'<div style="'+_patPosStyle(stimPos)+'">'
    +'<div style="font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;">👀 OBSERWUJ</div>'
    +'<div id="pat-stim-box" style="border:2px solid rgba(255,255,255,.12);border-radius:16px;padding:16px;background:rgba(255,255,255,.03);box-shadow:0 0 15px rgba(255,255,255,.05);transition:border-color .2s,box-shadow .2s;">'+_patHtml(stim,pc.cols,sFs)+'</div></div>'
    // Progress bar
    +'<div style="position:absolute;bottom:16px;left:16px;right:16px;z-index:10;text-align:center;">'
    +'<div style="font-size:10px;color:rgba(255,255,255,.3);margin-bottom:4px;">'+(idx+1)+'/'+pc.total+'</div>'
    +'<div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;"><div style="width:'+Math.round((idx+1)/pc.total*100)+'%;height:4px;background:var(--accent);border-radius:2px;transition:width .3s;"></div></div></div>';
  _sndStim();
  _motionState.listening=true; _motionState._keyPressed=null;
  var reacted=false;
  var rc=setInterval(function(){
    if(_motionAbort){ clearInterval(rc); return; }
    if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){
      clearInterval(rc); clearTimeout(rt); _motionState.listening=false; _motionState._keyPressed=null;
      reacted=true; var t=Date.now()-stimTime; _gameTotalTrials++;
      if(isMatch){
        _gameCorrect++; _gameTimes.push(t);
        var sc=_calcPoints(t); var mult=_gameCombo>=10?4:_gameCombo>=5?3:_gameCombo>=3?2:1;
        _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
        var earned=sc.pts*mult; _gamePoints+=earned;
        _sndGood(); _mPtsAnim('✓ +'+earned+' ⚡','var(--green-text)');
        results.push({time:t,correct:true,type:'pattern_hit'});
        var sb=document.getElementById('pat-stim-box'); if(sb){ sb.style.borderColor='#4ade80'; sb.style.boxShadow='0 0 30px rgba(74,222,128,.3)'; }
        var tb=document.getElementById('pat-target-box'); if(tb){ tb.style.borderColor='#4ade80'; }
        ma.style.background='rgba(74,222,128,.06)'; setTimeout(function(){ ma.style.background='#060606'; },300);
      } else {
        _gameLives--; _gameCombo=0; _gamePoints=Math.max(0,_gamePoints-2);
        _sndBad(); _mPtsAnim('✕ -2','var(--red-text)'); if(navigator.vibrate) navigator.vibrate(200);
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
      if(isMatch){ _gameLives--; _gameCombo=0; _gamePoints=Math.max(0,_gamePoints-1); _mPtsAnim('MISS -1','var(--red-text)'); _sndBad(); results.push({time:pc.interval,correct:false,type:'pattern_miss'});
        var sb3=document.getElementById('pat-stim-box'); if(sb3) sb3.style.borderColor='#f87171';
      } else { _gameCorrect++; _gamePoints+=1; _mPtsAnim('+1 ✓','var(--green-text)'); results.push({time:0,correct:true,type:'pattern_ignore'}); _sndGood(); }
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
