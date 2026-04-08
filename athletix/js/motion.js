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
function _setupDesktop(){
  if(_desktopFallback) return; _desktopFallback=true;
  document.addEventListener('keydown',function(e){
    if(!_motionState.listening) return;
    if(e.key===' '||e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); _motionState._keyPressed=e.key; }
  });
}

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
function detectMovement(){ var dx=Math.abs(_motionState.ax-_motionState.baseline.x),dy=Math.abs(_motionState.ay-_motionState.baseline.y); var th=_movementThreshold(_gameLevel); return dx>th||dy>th; }
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
function startMotionGame(){
  requestMotionPermission(function(ok){
    if(!ok){ alert('Zezwól na czujniki ruchu.'); return; }
    _motionAbort=false; _motionRunning=true;
    _gamePoints=0; _gameLives=3; _gameLevel=1; _gameCombo=0; _gameMaxCombo=0; _gameTotalTrials=0; _gameCorrect=0; _gameTimes=[];
    el('settings').style.display='none'; el('motion-active').style.display='block';
    reqWL(); goFS();
    _motionHandler=onMotionData;
    if(!_desktopFallback) window.addEventListener('devicemotion',_motionHandler); else _setupDesktop();
    _motionCountdown(function(){
      el('motion-active').innerHTML=_mScreen('Kalibracja...','Trzymaj telefon nieruchomo','');
      calibrateMotion(function(){ _startLevel(_gameLevel); });
    });
  });
}
function stopMotion(){
  _motionAbort=true; _motionRunning=false;
  if(_motionHandler) window.removeEventListener('devicemotion',_motionHandler);
  el('motion-active').style.display='none'; el('settings').style.display='flex';
  relWL(); exitFS();
}

function _motionCountdown(cb){
  var ma=el('motion-active'); var n=3;
  function tick(){ if(_motionAbort) return; ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:72px;font-weight:900;color:rgba(255,255,255,.8);">'+n+'</div>'; _mBeep(600,0.04); n--; if(n>=0) setTimeout(tick,800); else{ ma.innerHTML=''; setTimeout(cb,200); } } tick();
}

// ── Ekran helper ──
function _mScreen(title,sub,extra){ return '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.4);">'+title+'</div>'+(sub?'<div style="font-size:11px;color:rgba(255,255,255,.25);margin-top:4px;">'+sub+'</div>':'')+(extra||'')+'</div>'; }
function _mHUD(){
  var lives=''; for(var i=0;i<3;i++) lives+='<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+(i<_gameLives?'var(--red)':'rgba(255,255,255,.15)')+';margin-left:3px;"></span>';
  var comboHtml=_gameCombo>=3?'<div style="font-size:14px;font-weight:900;color:#f59e0b;animation:mBtnPulse 1s infinite;">🔥 x'+_gameCombo+' COMBO</div>':'';
  var ch=getLevelCharacter(_gameLevel);
  return '<div style="position:absolute;top:0;left:0;right:0;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:10;">'
    +'<div style="display:flex;align-items:center;gap:6px;"><span style="font-size:22px;font-weight:900;color:var(--accent);transition:transform .2s;" id="m-pts">⚡ '+_gamePoints+'</span></div>'
    +'<div style="text-align:center;">'+comboHtml+'</div>'
    +'<div style="display:flex;align-items:center;gap:6px;"><span style="font-size:14px;font-weight:800;color:#fbbf24;">'+ch.emoji+' Lv.'+_gameLevel+'</span>'+lives
    +'<button class="lock-btn" onclick="lockScreen()" style="margin-left:4px;">🔒</button></div></div>';
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
  if(_motionMode==='pattern'){ var pc2=_patCfg(lv); _patternTarget=_genPattern(pc2.count,pc2.syms); }
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
  var msg=_LEVEL_MSGS[Math.floor(Math.random()*_LEVEL_MSGS.length)];
  var moveHint=lv<4?'Delikatny ruch wystarczy 🤏':lv<7?'Ruszaj się zdecydowanie! 💪':lv<11?'Potrzeba mocnego ruchu! 🏋️':'Full power! Daj z siebie wszystko! 🔥';
  var ma=el('motion-active');
  ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;padding:0 24px;box-sizing:border-box;">'
    +'<div style="font-size:56px;margin-bottom:4px;">'+ch.emoji+'</div>'
    +'<div style="font-size:18px;font-weight:900;color:var(--green-text);margin-bottom:2px;">'+ch.name+'</div>'
    +'<div style="font-size:13px;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:8px;">'+ch.desc+'</div>'
    +'<div style="font-size:16px;font-weight:800;color:rgba(255,255,255,.6);margin-bottom:6px;">✅ LEVEL '+lv+' UKOŃCZONY!</div>'
    +'<div style="font-size:36px;font-weight:900;color:var(--accent);">⚡ '+_gamePoints+'</div>'
    +(lvBest?'<div style="font-size:12px;color:var(--green-text);margin-top:6px;">Najlepszy: '+lvBest+'ms</div>':'')
    +'<div style="font-size:12px;color:rgba(255,255,255,.3);margin-top:6px;">'+msg+'</div>'
    +'<div style="font-size:11px;color:rgba(255,255,255,.25);margin-top:4px;">'+moveHint+'</div>'
    +'<div style="margin-top:20px;display:flex;flex-direction:column;gap:8px;max-width:280px;margin-left:auto;margin-right:auto;">'
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
    +'<div style="font-size:40px;font-weight:900;color:var(--accent);margin-top:8px;">⚡ '+_gamePoints+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<div style="font-size:13px;font-weight:700;color:'+col+';">Śr.: '+avg+'ms</div>'
    +'<div style="font-size:13px;font-weight:700;color:var(--green-text);">Best: '+best+'ms</div>'
    +'<div style="font-size:13px;font-weight:700;color:#fb923c;">Combo: x'+_gameMaxCombo+'</div>'
    +'<div style="font-size:13px;font-weight:700;color:#fff;">Celność: '+acc+'%</div></div>'
    +(newCharUnlocked?'<div style="font-size:13px;font-weight:800;color:var(--accent);margin-top:10px;">🆕 Nowa postać: '+ch.emoji+' '+ch.name+'!</div>':'')
    +compareHtml
    +'<div style="margin-top:20px;display:flex;flex-direction:column;gap:8px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<button onclick="_motionRetry()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">🔄 Zagraj ponownie</button>'
    +'<button onclick="stopMotion()" style="width:100%;padding:12px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">🏠 Wróć</button></div></div>';

  // Zapis + ATP
  _saveMotionResult(athlete,avg,best,_gameLevel,acc,_gameMaxCombo);
  if(athlete&&typeof addPoints==='function'){
    var atpEarned=15+Math.max(0,(_gameLevel-3)*5);
    addPoints(athlete,'motion',atpEarned,'Reakcja Lv.'+_gameLevel+': '+avg+'ms');
    if(isNewRecord&&prevBestLv>0) addPoints(athlete,'motion_pr',20,'Nowy rekord: Level '+_gameLevel);
  }
  if(isNewRecord||_gamePoints>50) launchConfetti();
}

function _motionRetry(){ startMotionGame(); }

// ── Tryb Wzorce (progresywny) ──
function _patCfg(lv){
  if(lv<=2) return {cols:2,count:2,syms:['⬜','⬛'],showMs:2500,changeCel:999};
  if(lv<=4) return {cols:2,count:4,syms:['🔴','🟢','🔵'],showMs:2000,changeCel:999};
  if(lv<=6) return {cols:2,count:4,syms:['🔴','🟢','🔵','🟡'],showMs:1500,changeCel:999};
  if(lv<=8) return {cols:2,count:4,syms:['🔴','🟢','🔵','🟡','🟣'],showMs:1200,changeCel:4};
  if(lv<=10) return {cols:3,count:9,syms:['🔴','🟢','🔵','🟡','🟣','🟠'],showMs:1000,changeCel:3};
  return {cols:3,count:9,syms:PATTERN_SYMBOLS,showMs:Math.max(500,1000-(lv-10)*50),changeCel:2};
}
function _genPattern(cnt,syms){ cnt=cnt||4; syms=syms||PATTERN_SYMBOLS; var p=[]; for(var i=0;i<cnt;i++) p.push(syms[Math.floor(Math.random()*syms.length)]); return p; }
function _patternHtml(p,cols,fontSize){
  cols=cols||2; fontSize=fontSize||'32';
  return '<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:4px;">'+p.map(function(s){ return '<div style="font-size:'+fontSize+'px;display:flex;align-items:center;justify-content:center;line-height:1;">'+s+'</div>'; }).join('')+'</div>';
}
function _patternsMatch(a,b){ if(a.length!==b.length) return false; for(var i=0;i<a.length;i++) if(a[i]!==b[i]) return false; return true; }

function _runPatternLevel(idx,cfg,results,cb){
  if(_motionAbort||_gameLives<=0||idx>=cfg.trials){ cb(results); return; }
  var ma=el('motion-active');
  var pc=_patCfg(_gameLevel);
  // Zmiana celu na wyższych levelach
  if(pc.changeCel<999&&idx>0&&idx%pc.changeCel===0){ _patternTarget=_genPattern(pc.count,pc.syms);
    ma.innerHTML=_mHUD()+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-size:18px;font-weight:900;color:var(--accent);">🔄 NOWY CEL!</div>';
    setTimeout(function(){ _runPatternLevel(idx,cfg,results,cb); },800); return;
  }
  // Generuj bodziec
  var isMatch=Math.random()<0.2;
  var stim;
  if(isMatch){ stim=_patternTarget.slice(); }
  else {
    stim=_genPattern(pc.count,pc.syms);
    if(_gameLevel>=5&&Math.random()<0.3){ stim=_patternTarget.slice(); stim[Math.floor(Math.random()*pc.count)]=pc.syms[Math.floor(Math.random()*pc.syms.length)]; }
    if(_patternsMatch(stim,_patternTarget)) stim=_genPattern(pc.count,pc.syms);
  }
  var showTime=pc.showMs;
  _motionState.listening=false; _motionState._keyPressed=null;
  var stimTime=Date.now();
  var targetFs=pc.cols<=2?'28':'20'; var stimFs=pc.cols<=2?'40':'28';
  // Layout: górna połowa = CEL, dolna = BODZIEC
  ma.innerHTML=_mHUD()
    +'<div style="position:absolute;top:15%;left:50%;transform:translateX(-50%);text-align:center;z-index:5;">'
    +'<div style="font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">SZUKAJ</div>'
    +'<div style="width:70%;max-width:180px;margin:0 auto;border:3px solid var(--accent);border-radius:16px;padding:12px;background:rgba(59,130,246,.08);">'+_patternHtml(_patternTarget,pc.cols,targetFs)+'</div></div>'
    +'<div style="position:absolute;top:55%;left:50%;transform:translateX(-50%);text-align:center;z-index:5;">'
    +'<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:6px;">OBSERWUJ</div>'
    +'<div id="pat-stim-box" style="width:70%;max-width:200px;margin:0 auto;border:2px solid rgba(255,255,255,.15);border-radius:16px;padding:14px;">'+_patternHtml(stim,pc.cols,stimFs)+'</div></div>';
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
        _sndGood(); _mPtsAnim('+'+earned+' ⚡','var(--green-text)');
        results.push({time:t,correct:true,type:'pattern_hit'});
        // Flash oba boxy zielono
        var sb=document.getElementById('pat-stim-box'); if(sb) sb.style.borderColor='#4ade80';
        ma.style.background='rgba(74,222,128,.08)'; setTimeout(function(){ ma.style.background='#060606'; },300);
      } else {
        _gameLives--; _gameCombo=0; _gamePoints=Math.max(0,_gamePoints-2);
        _sndBad(); _mPtsAnim('-2 💥','var(--red-text)'); if(navigator.vibrate) navigator.vibrate(200);
        results.push({time:t,correct:false,type:'pattern_false'});
        ma.style.background='rgba(248,113,113,.08)'; setTimeout(function(){ ma.style.background='#060606'; },300);
      }
      setTimeout(function(){ _runPatternLevel(idx+1,cfg,results,cb); },1200);
    }
  },16);
  var rt=setTimeout(function(){
    clearInterval(rc); _motionState.listening=false; _gameTotalTrials++;
    if(!reacted){
      if(isMatch){ _gameLives--; _gameCombo=0; _gamePoints=Math.max(0,_gamePoints-1); _mPtsAnim('-1','var(--red-text)'); results.push({time:showTime,correct:false,type:'pattern_miss'}); ma.innerHTML=_mHUD()+_mCircle('wrong','<div style="font-size:20px;">Przegapiony cel!</div>',''); }
      else { _gameCorrect++; _gamePoints+=1; _mPtsAnim('+1 ✓','var(--green-text)'); results.push({time:0,correct:true,type:'pattern_ignore'}); _sndGood(); ma.innerHTML=_mHUD()+_mCircle('result','<div style="font-size:24px;color:var(--green-text);">✓</div>',''); }
    }
    setTimeout(function(){ _runPatternLevel(idx+1,cfg,results,cb); },1000);
  },showTime);
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
