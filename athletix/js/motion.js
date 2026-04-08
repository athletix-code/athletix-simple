// ═══════════════════════════════════════
//  MOTION GAMES — Moduł Reakcja
//  Akcelerometr + fallback klawiatura
// ═══════════════════════════════════════

var _motionMode='simple'; // simple, directions, gonogo
var _motionTrials=10;
var _motionRunning=false;
var _motionState={listening:false,ax:0,ay:0,az:0,baseline:{x:0,y:0,z:0},sensitivity:3,_keyPressed:null};
var _desktopFallback=false;
var _motionHandler=null;
var _motionAbort=false;

function _setMotionMode(m){
  _motionMode=m;
  ['simple','dirs','gonogo'].forEach(function(k){ var b=el('mt-'+k); if(b) b.className='chip'+(k==={simple:'simple',directions:'dirs',gonogo:'gonogo'}[m]?' on-blue':''); });
  el('mt-simple').className='chip'+(m==='simple'?' on-blue':'');
  el('mt-dirs').className='chip'+(m==='directions'?' on-blue':'');
  el('mt-gonogo').className='chip'+(m==='gonogo'?' on-blue':'');
}
function _setMotionTrials(n){
  _motionTrials=n;
  [5,10,15,20].forEach(function(v){ var b=el('mt-t'+v); if(b) b.className='chip'+(v===n?' on-blue':''); });
}

// ── Permission iOS ──
function requestMotionPermission(cb){
  if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){
    DeviceMotionEvent.requestPermission().then(function(r){ cb(r==='granted'); }).catch(function(){ cb(false); });
  } else if(typeof DeviceMotionEvent!=='undefined'){ cb(true); }
  else { _desktopFallback=true; setupDesktopFallback(); cb(true); }
}
function setupDesktopFallback(){
  if(_desktopFallback) return; _desktopFallback=true;
  document.addEventListener('keydown',function(e){
    if(!_motionState.listening) return;
    if(e.key===' '||e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'){
      e.preventDefault(); _motionState._keyPressed=e.key;
    }
  });
}

// ── Akcelerometr ──
function onMotionData(e){ var a=e.accelerationIncludingGravity; if(!a) return; _motionState.ax=a.x||0; _motionState.ay=a.y||0; _motionState.az=a.z||0; }
function calibrateMotion(cb){
  var samples=[];
  var h=function(e){ var a=e.accelerationIncludingGravity; if(a) samples.push({x:a.x||0,y:a.y||0,z:a.z||0}); };
  window.addEventListener('devicemotion',h);
  setTimeout(function(){
    window.removeEventListener('devicemotion',h);
    if(samples.length){ _motionState.baseline.x=samples.reduce(function(s,v){return s+v.x;},0)/samples.length; _motionState.baseline.y=samples.reduce(function(s,v){return s+v.y;},0)/samples.length; _motionState.baseline.z=samples.reduce(function(s,v){return s+v.z;},0)/samples.length; }
    cb();
  },1000);
}
function detectMovement(){
  var dx=Math.abs(_motionState.ax-_motionState.baseline.x);
  var dy=Math.abs(_motionState.ay-_motionState.baseline.y);
  var th=1.5+(5-_motionState.sensitivity)*0.8;
  return dx>th||dy>th;
}
function detectDirection(){
  var dx=_motionState.ax-_motionState.baseline.x;
  var dy=_motionState.ay-_motionState.baseline.y;
  var th=2.0+(5-_motionState.sensitivity)*0.6;
  if(Math.abs(dx)>Math.abs(dy)){ if(dx>th) return 'left'; if(dx<-th) return 'right'; }
  else { if(dy>th) return 'up'; if(dy<-th) return 'down'; }
  return null;
}

// ── Start ──
function startMotionGame(){
  requestMotionPermission(function(ok){
    if(!ok) return;
    _motionAbort=false; _motionRunning=true;
    el('settings').style.display='none';
    el('motion-active').style.display='block';
    reqWL(); goFS();
    // Nasłuchuj akcelerometru
    _motionHandler=onMotionData;
    if(!_desktopFallback) window.addEventListener('devicemotion',_motionHandler);
    else setupDesktopFallback();
    // Countdown 3-2-1
    _motionCountdown(function(){
      // Kalibracja 1s
      el('motion-active').innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.4);">Kalibracja...</div><div style="font-size:11px;color:rgba(255,255,255,.25);margin-top:4px;">Trzymaj telefon nieruchomo</div></div>';
      calibrateMotion(function(){
        if(_motionMode==='simple') _runSimple(0,_motionTrials,[],_onMotionDone);
        else if(_motionMode==='directions') _runDirections(0,_motionTrials,[],_onMotionDone);
        else _runGoNoGo(0,_motionTrials,[],_onMotionDone);
      });
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
  function tick(){ if(_motionAbort) return;
    ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:72px;font-weight:900;color:rgba(255,255,255,.8);">'+n+'</div>';
    n--; if(n>=0) setTimeout(tick,800); else { ma.innerHTML=''; setTimeout(cb,200); }
  } tick();
}

// ── Tryb Prosty ──
function _runSimple(idx,total,results,cb){
  if(_motionAbort||idx>=total){ cb(results); return; }
  var ma=el('motion-active');
  // Faza oczekiwania
  ma.innerHTML=_motionHUD('⚡ Reakcja — Prosty',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:24px;font-weight:700;color:rgba(255,255,255,.3);">Czekaj...</div></div>';
  _motionState.listening=false; _motionState._keyPressed=null;
  var delay=1000+Math.random()*3000;
  var falseStart=false;
  _motionState.listening=true;
  var wc=setInterval(function(){ if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){ falseStart=true; _motionState._keyPressed=null; } },50);
  setTimeout(function(){
    clearInterval(wc); _motionState.listening=false;
    if(_motionAbort) return;
    if(falseStart){ ma.innerHTML=_motionHUD('⚡ Reakcja — Prosty',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--red-text);">Za wcześnie!</div></div>'; setTimeout(function(){ _runSimple(idx,total,results,cb); },1500); return; }
    // Bodziec
    var stim=Date.now();
    ma.style.background='#4ade80';
    ma.innerHTML=_motionHUD('⚡ Reakcja — Prosty',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:32px;font-weight:900;color:#fff;">REAGUJ!</div></div>';
    beat(1200,0.06);
    _motionState.listening=true; _motionState._keyPressed=null;
    var rc=setInterval(function(){
      if(_motionAbort){ clearInterval(rc); return; }
      if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){
        clearInterval(rc); clearTimeout(rt); _motionState.listening=false; _motionState._keyPressed=null;
        var t=Date.now()-stim; results.push({time:t,correct:true});
        ma.style.background='#060606';
        var col=t<250?'var(--green-text)':t<400?'var(--accent)':t<600?'var(--amber-text)':'var(--red-text)';
        ma.innerHTML=_motionHUD('⚡ Reakcja — Prosty',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:56px;font-weight:900;color:'+col+';">'+t+' ms</div><div style="font-size:14px;color:rgba(255,255,255,.4);margin-top:8px;">Próba '+(idx+1)+'/'+total+'</div></div>';
        beat(800,0.04);
        setTimeout(function(){ _runSimple(idx+1,total,results,cb); },1500);
      }
    },16);
    var rt=setTimeout(function(){ clearInterval(rc); _motionState.listening=false; results.push({time:3000,correct:false}); ma.style.background='#060606'; ma.innerHTML=_motionHUD('⚡ Reakcja — Prosty',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--red-text);">Brak reakcji</div></div>'; setTimeout(function(){ _runSimple(idx+1,total,results,cb); },1500); },3000);
  },delay);
}

// ── Tryb Kierunki ──
var _DIRS=['left','right','up','down'];
var _DIR_ARROWS={left:'←',right:'→',up:'↑',down:'↓'};
var _DIR_KEYS={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'};
function _runDirections(idx,total,results,cb){
  if(_motionAbort||idx>=total){ cb(results); return; }
  var ma=el('motion-active');
  var target=_DIRS[Math.floor(Math.random()*4)];
  ma.style.background='#060606';
  ma.innerHTML=_motionHUD('⚡ Reakcja — Kierunki',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:24px;font-weight:700;color:rgba(255,255,255,.3);">Czekaj...</div></div>';
  _motionState.listening=false; _motionState._keyPressed=null;
  var delay=1000+Math.random()*2500;
  setTimeout(function(){
    if(_motionAbort) return;
    var stim=Date.now();
    ma.innerHTML=_motionHUD('⚡ Reakcja — Kierunki',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:80px;font-weight:900;color:#fff;">'+_DIR_ARROWS[target]+'</div></div>';
    beat(1200,0.06);
    _motionState.listening=true; _motionState._keyPressed=null;
    var rc=setInterval(function(){
      if(_motionAbort){ clearInterval(rc); return; }
      var dir=_desktopFallback?(_motionState._keyPressed?{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[_motionState._keyPressed]:null):detectDirection();
      if(dir){
        clearInterval(rc); clearTimeout(rt); _motionState.listening=false; _motionState._keyPressed=null;
        var t=Date.now()-stim; var correct=dir===target;
        results.push({time:t,correct:correct,target:target,response:dir});
        ma.style.background=correct?'rgba(74,222,128,.15)':'rgba(248,113,113,.15)';
        ma.innerHTML=_motionHUD('⚡ Reakcja — Kierunki',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:48px;font-weight:900;color:'+(correct?'var(--green-text)':'var(--red-text)')+';">'+(correct?t+' ms':'✕')+'</div></div>';
        beat(correct?800:400,0.04);
        setTimeout(function(){ ma.style.background='#060606'; _runDirections(idx+1,total,results,cb); },1500);
      }
    },16);
    var rt=setTimeout(function(){ clearInterval(rc); _motionState.listening=false; results.push({time:3000,correct:false,target:target,response:null}); ma.style.background='#060606'; setTimeout(function(){ _runDirections(idx+1,total,results,cb); },1500); },3000);
  },delay);
}

// ── Tryb Go/No-Go ──
function _runGoNoGo(idx,total,results,cb){
  if(_motionAbort||idx>=total){ cb(results); return; }
  var ma=el('motion-active');
  var isGo=Math.random()<0.7; // 70% go, 30% no-go
  ma.style.background='#060606';
  ma.innerHTML=_motionHUD('⚡ Reakcja — Go/No-Go',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:24px;font-weight:700;color:rgba(255,255,255,.3);">Czekaj...</div></div>';
  _motionState.listening=false; _motionState._keyPressed=null;
  var delay=1000+Math.random()*2500;
  setTimeout(function(){
    if(_motionAbort) return;
    var stim=Date.now();
    var color=isGo?'#4ade80':'#f87171';
    ma.innerHTML=_motionHUD('⚡ Reakcja — Go/No-Go',idx,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="width:120px;height:120px;border-radius:50%;background:'+color+';margin:0 auto;"></div><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.5);margin-top:12px;">'+(isGo?'REAGUJ':'CZEKAJ')+'</div></div>';
    beat(isGo?1200:600,0.06);
    _motionState.listening=true; _motionState._keyPressed=null;
    var responded=false;
    var rc=setInterval(function(){
      if(_motionAbort){ clearInterval(rc); return; }
      if(detectMovement()||(_desktopFallback&&_motionState._keyPressed)){
        clearInterval(rc); clearTimeout(rt); _motionState.listening=false; _motionState._keyPressed=null;
        responded=true; var t=Date.now()-stim;
        if(isGo){ results.push({time:t,type:'go',correct:true}); ma.innerHTML=_motionHUD('⚡ Go/No-Go',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-size:48px;font-weight:900;color:var(--green-text);">'+t+' ms</div>'; }
        else { results.push({time:t,type:'nogo',correct:false}); ma.innerHTML=_motionHUD('⚡ Go/No-Go',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:32px;font-weight:900;color:var(--red-text);">Fałszywy alarm!</div><div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:6px;">Nie reaguj na czerwone</div></div>'; }
        setTimeout(function(){ ma.style.background='#060606'; _runGoNoGo(idx+1,total,results,cb); },1500);
      }
    },16);
    var rt=setTimeout(function(){
      clearInterval(rc); _motionState.listening=false;
      if(!responded){
        if(isGo){ results.push({time:3000,type:'go',correct:false}); ma.innerHTML=_motionHUD('⚡ Go/No-Go',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-size:24px;font-weight:700;color:var(--red-text);">Za wolno!</div>'; }
        else { results.push({time:0,type:'nogo',correct:true}); ma.innerHTML=_motionHUD('⚡ Go/No-Go',idx+1,total)+'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-size:24px;font-weight:700;color:var(--green-text);">✓ Dobrze!</div>'; }
      }
      setTimeout(function(){ ma.style.background='#060606'; _runGoNoGo(idx+1,total,results,cb); },1500);
    },isGo?3000:1500);
  },delay);
}

// ── HUD ──
function _motionHUD(title,done,total){
  var pct=total?Math.round(done/total*100):0;
  return '<div style="position:absolute;top:0;left:0;right:0;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:10;">'
    +'<button class="pause-btn" onclick="stopMotion()">Stop</button>'
    +'<span style="font-size:12px;font-weight:700;color:rgba(255,255,255,.4);">'+title+'</span>'
    +'<button class="lock-btn" onclick="lockScreen()">🔒</button></div>'
    +'<div style="position:absolute;bottom:16px;left:16px;right:16px;z-index:10;text-align:center;">'
    +'<div style="font-size:10px;color:rgba(255,255,255,.3);margin-bottom:4px;">'+done+'/'+total+'</div>'
    +'<div style="width:100%;height:4px;background:rgba(255,255,255,.1);border-radius:2px;"><div style="width:'+pct+'%;height:4px;background:var(--accent);border-radius:2px;transition:width .3s;"></div></div></div>';
}

// ── Ekran wyników ──
function _onMotionDone(results){
  _motionRunning=false;
  if(_motionHandler) window.removeEventListener('devicemotion',_motionHandler);
  var ma=el('motion-active'); ma.style.background='#060606';
  var correct=results.filter(function(r){ return r.correct; });
  var times=correct.map(function(r){ return r.time; }).filter(function(t){ return t<3000; });
  var avg=times.length?Math.round(times.reduce(function(a,b){return a+b;},0)/times.length):0;
  var best=times.length?Math.min.apply(null,times):0;
  var worst=times.length?Math.max.apply(null,times):0;
  var accuracy=results.length?Math.round(correct.length/results.length*100):0;
  var stdDev=0; if(times.length>1){ var mean=avg; stdDev=Math.round(Math.sqrt(times.reduce(function(s,t){ return s+(t-mean)*(t-mean); },0)/(times.length-1))); }
  var col=avg<250?'var(--green-text)':avg<400?'var(--accent)':avg<600?'var(--amber-text)':'var(--red-text)';

  // Sprawdź PR
  var athlete=(el('motion-athlete')||{}).value||'';
  var prevResults=_getMotionResults(athlete);
  var prevBest=null;
  prevResults.forEach(function(r){ if(r.mode===_motionMode&&r.avgTime&&(!prevBest||r.avgTime<prevBest)) prevBest=r.avgTime; });
  var isPR=prevBest&&avg<prevBest&&avg>0;
  var compareHtml='';
  if(isPR) compareHtml='<div style="font-size:13px;font-weight:700;color:var(--green-text);margin-top:8px;">↑ Nowy rekord! (było: '+prevBest+'ms)</div>';
  else if(prevBest) compareHtml='<div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:8px;">Poprzedni: '+prevBest+'ms</div>';
  else compareHtml='<div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:8px;">Pierwszy test!</div>';

  ma.innerHTML='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;padding:0 24px;box-sizing:border-box;">'
    +'<div style="font-size:14px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:8px;">⚡ Wynik</div>'
    +'<div style="font-size:56px;font-weight:900;color:'+col+';">'+avg+' ms</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<div style="font-size:13px;font-weight:700;color:var(--green-text);">Najlepszy: '+best+'ms</div>'
    +'<div style="font-size:13px;font-weight:700;color:var(--red-text);">Najgorszy: '+worst+'ms</div>'
    +'<div style="font-size:13px;font-weight:700;color:#fff;">Poprawnych: '+accuracy+'%</div>'
    +'<div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.5);">±'+stdDev+'ms</div></div>'
    +compareHtml
    +'<div style="margin-top:24px;display:flex;flex-direction:column;gap:8px;max-width:280px;margin-left:auto;margin-right:auto;">'
    +'<button onclick="_motionRetry()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">🔄 Powtórz</button>'
    +'<button onclick="stopMotion()" style="width:100%;padding:12px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">🏠 Zamknij</button></div></div>';

  // Zapis wyników
  _saveMotionResult(athlete,avg,best,worst,accuracy,stdDev,times);
  // ATP
  if(athlete&&typeof addPoints==='function'){
    addPoints(athlete,'motion',10,'Reakcja: '+avg+'ms');
    if(isPR) addPoints(athlete,'motion_pr',20,'Nowy rekord reakcji: '+avg+'ms');
  }
  if(isPR||avg<350) launchConfetti();
}

function _motionRetry(){ startMotionGame(); }

// ── Zapis wyników ──
function _getMotionResults(athlete){
  try{ var d=JSON.parse(localStorage.getItem('axs_motion_results')||'{}'); return (d[athlete]&&d[athlete].reaction)||[]; }catch(e){ return []; }
}
function _saveMotionResult(athlete,avg,best,worst,accuracy,stdDev,times){
  if(!athlete) return;
  try{
    var d=JSON.parse(localStorage.getItem('axs_motion_results')||'{}');
    if(!d[athlete]) d[athlete]={reaction:[],stability:[],agility:[],dynamics:[],coordination:[],symmetry:[]};
    d[athlete].reaction.push({date:new Date().toISOString(),mode:_motionMode,avgTime:avg,bestTime:best,worstTime:worst,accuracy:accuracy,trials:_motionTrials,stdDev:stdDev});
    if(d[athlete].reaction.length>50) d[athlete].reaction=d[athlete].reaction.slice(-50);
    localStorage.setItem('axs_motion_results',JSON.stringify(d));
  }catch(e){}
}
