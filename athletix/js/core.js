// ═══════════════════════════════════════════════════════
//  ATHLETIX SIMPLE — Full JS (identical timers, simple diary)
//  localStorage prefix: axs_ (instead of ax_)
//  Settings key: cts_v5 (instead of ct_v5)
// ═══════════════════════════════════════════════════════

// ── Fix iOS PWA viewport height ──
function _setAppHeight(){
  document.documentElement.style.setProperty('--app-h', window.innerHeight+'px');
}
_setAppHeight();
window.addEventListener('resize', _setAppHeight);
window.addEventListener('orientationchange', function(){ setTimeout(_setAppHeight,100); });

// ── SHARED ──
var snd='off', sDn=3, sUp=2, sRp=8;
var touts=[], cntTick=null, metInt=null, active=false;
var customVals={dn:3,up:2,rp:8,pa:1,rs:2,gr:5};
var adjTimer=null, adjInterval=null;
var actx=null;
var wSettings=null, wPaused=false, wPauseRep=1;
var intPaused=false;
var _currentTick=null, _nextTickAt=0, _resumeDelay=1000;
var _pausedCntVal=0, _pauseState=null, _pausedRingOffset=0;
var _emomElapsed=0, _stoperMode='down', _stoperUpSecs=0;
var _customRound=1, _customPhase='work', _customRemaining=0, _stoperRemaining=0;
var _ringColor='';
var _lockTimer=null;

function el(id){ return document.getElementById(id); }
function goToAthleteTests(){
  if(!_currentProfileId) return;
  loadCRM();
  var a=athletes.find(function(x){ return String(x.id)===String(_currentProfileId); });
  if(a) openTestHistory(a.name);
}
function goToAthleteSessions(){
  if(!_currentProfileId) return;
  loadCRM();
  var a=athletes.find(function(x){ return String(x.id)===String(_currentProfileId); });
  if(!a) return;
  // Close profile, go to athletes tab, expand this athlete
  el('athlete-profile-overlay').style.display='none';
  _expandedAthlete=a.name;
  setMode('athletes');
}
function scrollToSection(id){
  var s=document.getElementById(id); if(!s) return;
  var ov=document.getElementById('athlete-profile-overlay');
  if(ov&&ov.style.display==='block'){
    // Calculate position relative to scrollable container
    var container=ov;
    var rect=s.getBoundingClientRect();
    var ovRect=container.getBoundingClientRect();
    container.scrollTop+=rect.top-ovRect.top-70;
  } else {
    s.scrollIntoView({behavior:'smooth',block:'start'});
  }
}

// ── Audio ──
function ga(){ if(!actx) actx=new(window.AudioContext||window.webkitAudioContext)(); return actx; }
function beat(f,d){
  try{ var ctx=ga(); if(ctx.state==='suspended') ctx.resume();
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=f||880;
  g.gain.setValueAtTime(1.0,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(d||0.04));
  o.start();o.stop(ctx.currentTime+(d||0.04)+0.02);}catch(e){}
}
function beepDone(){ beat(1047,0.05); setTimeout(function(){ beat(1319,0.05); },100); setTimeout(function(){ beat(1568,0.12); },200); }
function beepMid(){ beat(800,0.06); }
var _beepTouts=[];
function _clearBeepTouts(){ _beepTouts.forEach(function(t){ clearTimeout(t); }); _beepTouts=[]; }
function schedIntBeeps(durMs){
  _clearBeepTouts(); if(!_intSndOn||snd==='off') return;
  [3,2,1].forEach(function(n){ var fireAt=durMs-n*1000;
    if(fireAt>100){ (function(num,at){ _beepTouts.push(setTimeout(function(){ if(!_intSndOn||snd==='off') return; beat(num===1?1400:1000,num===1?0.12:0.06); },at)); })(n,fireAt); }
  });
  if(snd==='int'&&durMs>=6000){ var hw=Math.floor(durMs/2); _beepTouts.push(setTimeout(function(){ if(_intSndOn) beepMid(); },hw)); }
}
function startMetro(){ stopMetro(); if(snd!=='met') return; var inInt=el('int-active').style.display==='block'; if(inInt&&!_intSndOn) return; beat(880,0.04); metInt=setInterval(function(){ var i2=el('int-active').style.display==='block'; if(i2&&!_intSndOn) return; beat(880,0.04); },1000); }
function stopMetro(){ clearInterval(metInt); metInt=null; }
function speak(text){ if(snd!=='voice'||!window.speechSynthesis) return; window.speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(text); u.lang='pl-PL'; u.rate=1.1; u.pitch=1.0; u.volume=1.0; window.speechSynthesis.speak(u); }

// ── Mode Navigation ──
var _currentMode='tempo';
function setMode(m){
  _currentMode=m;
  ['tempo','reactive','interval','diary','athletes','plans','data','motion'].forEach(function(x){
    var btn=el('mt-'+x),tab=el('tab-'+x);
    if(btn) btn.classList.toggle('on',x===m);
    if(tab) tab.style.display=x===m?'block':'none';
  });
  var isInt=m==='interval';
  el('go-btn-main').style.display=(isInt||m==='diary'||m==='athletes'||m==='plans'||m==='data'||m==='motion')?'none':'block';
  el('go-btn-interval').classList.toggle('show',isInt);
  if(m==='athletes'){ loadCRM(); loadNotes(); renderAthleteList(); }
  if(m==='diary'){ loadCRM(); loadNotes(); populateAthleteSelect(); if(activeAthlete) syncFormToActiveAthlete(activeAthlete); if(!selectedDay) selectedDay=getDayKey(new Date()); renderCal(); renderDayDetail(selectedDay); }
  if(m==='plans'){ initPlansTab(); }
  if(m==='data'){ refreshDataStats(); refreshAutoBackupUI(); }
  if(m==='motion'){ loadCRM(); var ms=el('motion-athlete'); if(ms){ ms.innerHTML='<option value="">Bez zawodnika</option>'; athletes.forEach(function(a){ var o=document.createElement('option'); o.value=a.name; o.textContent=a.name; ms.appendChild(o); }); if(activeAthlete) ms.value=activeAthlete; } var mb=el('motion-bottom-bar'); if(mb) mb.style.display='block'; if(typeof _initMotionInputMode==='function') _initMotionInputMode(); }
  else { var mb2=el('motion-bottom-bar'); if(mb2) mb2.style.display='none'; }
  var gb=el('go-btn-main');
  if(m==='interval') gb.style.background='#c2410c'; else gb.style.background='var(--accent)';
}
function goMain_orig(){ if(_currentMode==='tempo') startW(); else if(_currentMode==='reactive') startRC(); else startInt(); }
function goMain(){ if(_currentMode==='interval') openPresession(); else goMain_orig(); }
function goFast(){ currentSession=null; startInt(); }

// ══ FINISH MESSAGES ══
var FINISH_MSGS=["Chyba dałeś z siebie wszystko 🔥","Ale był ogień!","Stary, ale jesteś dzikim 💪","Ktoś tu dziś szalał","To był level: kosmiczny","Twój ból jest czyimś marzeniem","I to jest właśnie sport","Czy ktoś wezwał pogotowie? Bo to było mordercze","Za tydzień nie będziesz tego pamiętał. Mięśnie — owszem.","Nie ma dyskusji — to był dobry trening.","Ból jest słabością opuszczającą ciało — Navy SEALs","To jest dopiero początek","Pain is temporary, glory is forever","Do. Or do not. There is no try — ty zrobiłeś/aś.","No cap, to było hard 💀","Bro się nie obijał fr fr","Sigma grindset aktywowany ✅","Main character energy przez cały czas","Endorfiny? Już jadą.","W tym momencie twoje mięśnie szukają adwokata","To nie był trening — to był egzamin","Każda seria to inwestycja.","Za rok podziękujesz sobie za dziś","Twoje mięśnie nie wiedzą jeszcze co je czeka jutro 😅","Mózg mówił stop. Ty mówiłeś/aś nie.","Nie każdy to robi. Ty zrobiłeś/aś.","Athletic animals only 🐺","To nie zmęczenie — to adaptacja","Lowkey dzikim jesteś","That was bussin fr 🔥","Grind never stops","Slay, honestly","Rent paid for today 💪","Mistrzostwo to nie wydarzenie. To nawyk.","Siła nie jest darem. Jest wyborem.","Kolejny trening, kolejna wersja siebie.","Postęp niewidoczny dziś — miażdżący za miesiąc.","Czy to był trening czy egzorcyzmy?","Kalorie? Uciekły. Wszystkie.","Protokół aktywowany: Bestia 🦁","Dzisiaj forma — jutro legenda","Just did it. Nike byłoby dumne.","Kobe mode: activated 🐍","Co nie zabija — wzmacnia.","Polak potrafi. Udowodniono dziś.","Koniec raportu. Status: ZMIAŻDŻONE 💥","Misja zakończona. Powrót do bazy.","GG. Idź zjeść coś porządnego 🍗"];
function getFinishMsg(){ return FINISH_MSGS[Math.floor(Math.random()*FINISH_MSGS.length)]; }

// ══ CONFETTI ══
function launchConfetti(){
  var cv=document.createElement('canvas'); cv.style.cssText='position:fixed;inset:0;z-index:4000;pointer-events:none;width:100%;height:100%;';
  cv.width=window.innerWidth; cv.height=window.innerHeight; document.body.appendChild(cv); var ctx=cv.getContext('2d');
  var colors=['#3b82f6','#15803d','#eab308','#f97316','#7e22ce','#ec4899','#ffffff','#86efac','#fca5a5','#ef4444'];
  var parts=[]; for(var i=0;i<160;i++) parts.push({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*0.5,w:6+Math.random()*8,h:3+Math.random()*5,color:colors[Math.floor(Math.random()*colors.length)],vx:(Math.random()-.5)*6,vy:2+Math.random()*4,rot:Math.random()*360,rotV:(Math.random()-.5)*8,alpha:1});
  var start=Date.now(),dur=3400;
  function frame(){ ctx.clearRect(0,0,cv.width,cv.height); var prog=Math.min(1,(Date.now()-start)/dur);
    parts.forEach(function(p){ p.x+=p.vx;p.y+=p.vy;p.vy+=0.09;p.rot+=p.rotV;p.alpha=Math.max(0,1-Math.pow(prog,2)*1.5); ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore(); });
    if(prog<1) requestAnimationFrame(frame); else cv.remove(); } requestAnimationFrame(frame);
}

// ══ WAKE LOCK & FULLSCREEN ══
var wl=null;
function reqWL(){ try{ if('wakeLock' in navigator) navigator.wakeLock.request('screen').then(function(w){ wl=w; }); }catch(e){} }
function relWL(){ try{ if(wl){ wl.release(); wl=null; } }catch(e){} }
document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&(active||intRunning||rcRunning)) reqWL(); });
function goFS(){ try{ var d=document.documentElement; (d.requestFullscreen||d.webkitRequestFullscreen||d.mozRequestFullscreen||function(){}).call(d); }catch(e){} }
function exitFS(){ try{ if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document); } }catch(e){} }

// ══ THEME ══
function toggleTheme(){ var html=document.documentElement; var isDark=html.getAttribute('data-theme')==='dark'; html.setAttribute('data-theme',isDark?'light':'dark'); el('theme-btn').textContent=isDark?'🌑':'☀️'; try{ localStorage.setItem('ct_theme',isDark?'light':'dark'); }catch(e){} }
(function(){ var t=localStorage.getItem('ct_theme'); if(t&&t!=='dark'){ document.documentElement.setAttribute('data-theme','light'); el('theme-btn').textContent='🌑'; } })();

// ══ LOCK SCREEN ══
function lockScreen(){ var ov=el('lock-overlay'); el('lock-bar-fill').style.transition='none'; el('lock-bar-fill').style.transform='scaleX(0)'; el('lock-bar-text').textContent='🔒  Przytrzymaj aby odblokować'; ov.style.opacity='0'; ov.style.display='block'; ov.offsetHeight; ov.style.opacity='1'; }
function unlockScreen(){ el('lock-bar-text').textContent='🔓  Odblokowano'; setTimeout(function(){ var ov=el('lock-overlay'); ov.style.opacity='0'; setTimeout(function(){ ov.style.display='none'; ov.style.opacity='1'; el('lock-bar-fill').style.transition='none'; el('lock-bar-fill').style.transform='scaleX(0)'; el('lock-bar-text').textContent='🔒  Przytrzymaj aby odblokować'; },300); },400); }
function _startFill(){ el('lock-bar-fill').style.transition='transform 1.5s linear'; el('lock-bar-fill').style.transform='scaleX(1)'; _lockTimer=setTimeout(unlockScreen,1500); }
function _cancelFill(){ clearTimeout(_lockTimer); _lockTimer=null; if(el('lock-bar-text').textContent.indexOf('Odblokowano')===-1){ el('lock-bar-fill').style.transition='transform .2s ease'; el('lock-bar-fill').style.transform='scaleX(0)'; } }
var lb=el('lock-bar');
lb.addEventListener('touchstart',function(e){ e.stopPropagation(); _startFill(); },{passive:true});
lb.addEventListener('touchend',function(e){ e.stopPropagation(); _cancelFill(); },{passive:true});
lb.addEventListener('touchcancel',function(){ _cancelFill(); },{passive:true});
lb.addEventListener('mousedown',_startFill); lb.addEventListener('mouseup',_cancelFill); lb.addEventListener('mouseleave',_cancelFill);

// ══ SWIPE DOWN = STOP ══
var _tsY=0,_tsX=0;
document.addEventListener('touchstart',function(e){ _tsY=e.touches[0].clientY; _tsX=e.touches[0].clientX; },{passive:true});
document.addEventListener('touchend',function(e){ var dy=e.changedTouches[0].clientY-_tsY; var dx=Math.abs(e.changedTouches[0].clientX-_tsX); if(dy>90&&dx<60){ if(el('workout').style.display==='block') stopW(); else if(el('rc-active').style.display==='block') stopRC(); else if(el('int-active').style.display==='block') stopInt(); else if(el('motion-active').style.display==='block'&&typeof stopMotion==='function'&&!_motionBlockSwipeClose) stopMotion(); } },{passive:true});

