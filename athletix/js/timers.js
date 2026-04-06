// ══ TEMPO ══
function mkChips(id,opts,init,onCls,setter,label){ var c=el(id),key=id.replace('c-',''); opts.forEach(function(v){ var b=document.createElement('button'); b.className='chip'+(v===init?' '+onCls:''); b.textContent=label?label(v):v; b.onclick=function(){ c.querySelectorAll('.chip').forEach(function(x){ x.className='chip'; }); b.className='chip '+onCls; customVals[key]=v; var cv=el('cv-'+key); if(cv) cv.textContent=key==='rp'?v:v+' s'; setter(v); }; c.appendChild(b); }); }
function applyCustom(key){
  var v=customVals[key]; var cls=key==='dn'?'on-red':key==='up'?'on-green':'on-blue';
  if(key==='dn'||key==='up'){ var c=el('c-'+key); if(c) c.querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===v?'chip '+cls:'chip'; }); }
  if(key==='dn'){ sDn=v; el('vl-dn').textContent=v+' s'; el('cv-dn').textContent=v+' s'; }
  else if(key==='up'){ sUp=v; el('vl-up').textContent=v+' s'; el('cv-up').textContent=v+' s'; }
  else if(key==='rp'){ sRp=v; var c2=el('c-rp'); if(c2) c2.querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===v?'chip on-blue':'chip'; }); el('vl-rp').textContent=v; el('cv-rp').textContent=v; }
  else if(key==='pa') el('vl-pa').textContent=v+' s';
  else if(key==='rs') el('vl-rs').textContent=v+' s';
  else if(key==='gr') el('vl-gr').textContent=v+' s';
}
function doAdj(key,d){ var limits={dn:[1,15],up:[1,15],rp:[1,50],pa:[0,5],rs:[0,10],gr:[1,15]}; var lim=limits[key]||[0,30]; customVals[key]=Math.max(lim[0],Math.min(lim[1],customVals[key]+d)); applyCustom(key); }
function startAdj(key,d){ doAdj(key,d); adjTimer=setTimeout(function(){ adjInterval=setInterval(function(){ doAdj(key,d); },110); },380); }
function stopAdj(){ clearTimeout(adjTimer); clearInterval(adjInterval); adjTimer=null; adjInterval=null; }
function adj(k,d){ var s=el('sl-'+k); if(s){ var v=Math.max(+s.min,Math.min(+s.max,+s.value+d)); s.value=v; syncV(k,v); } }
function syncV(k,v){ customVals[k]=parseInt(v); el('vl-'+k).textContent=v+' s'; }
function gs(){ return {dn:sDn,pa:customVals.pa,up:sUp,rs:customVals.rs,gr:customVals.gr,reps:sRp}; }
function setSnd(m){ snd=m; el('tb-off').classList.toggle('on',m==='off'); el('tb-met').classList.toggle('on',m==='met'); el('tb-voice').classList.toggle('on',m==='voice'); el('tb-int').classList.toggle('on',m==='int'); if(m!=='met') stopMetro(); }

mkChips('c-dn',[1,2,3,5,8],3,'on-red',function(v){ sDn=v; el('vl-dn').textContent=v+' s'; },function(v){ return v+'s'; });
mkChips('c-up',[1,2,3,5,8],2,'on-green',function(v){ sUp=v; el('vl-up').textContent=v+' s'; },function(v){ return v+'s'; });
mkChips('c-rp',[3,5,8,10,15,20],8,'on-blue',function(v){ sRp=v; el('vl-rp').textContent=v; },null);

// Tempo workout
var FEL=null;
function fe(){ if(!FEL) FEL=el('fill'); return FEL; }
function fReset(){ var x=fe(); x.style.transition='none'; x.style.top='auto'; x.style.bottom='auto'; x.style.height='0'; x.style.background='transparent'; }
function fDown(dur){ var x=fe(); x.style.transition='none'; x.style.top='0'; x.style.bottom='auto'; x.style.height='0'; x.style.background='var(--red-fill)'; x.offsetHeight; if(dur>0) x.style.transition='height '+dur+'s linear'; x.style.height='100%'; }
function fPause(){ var x=fe(); x.style.transition='background .12s'; x.style.top='0'; x.style.bottom='auto'; x.style.height='100%'; x.style.background='var(--amber-fill)'; }
function fUp(dur){ var x=fe(); x.style.transition='none'; x.style.top='auto'; x.style.bottom='0'; x.style.height='0'; x.style.background='var(--green-fill)'; x.offsetHeight; if(dur>0) x.style.transition='height '+dur+'s linear'; x.style.height='100%'; }
function fFade(){ var x=fe(); x.style.transition='height .5s ease'; x.style.height='0'; }
function setBadge(t,c){ var b=el('wo-badge'); b.textContent=t; b.style.borderColor=c; b.style.color=c; }
function setWPhase(n,c,s){ el('wo-phase-name').textContent=n; el('wo-phase-name').style.color=c; el('wo-phase-sub').textContent=s; }
function setWRep(n,tot,c){ el('rep-eyebrow').style.color=c; el('rep-number').textContent=n; el('rep-number').style.color=n==='—'?'rgba(255,255,255,.3)':'#fff'; el('rep-total').textContent='z '+tot; el('rep-total').style.color=c; }
function cntD(sec,color){ clearInterval(cntTick); var cd=el('wo-countdown'); cd.textContent=sec; cd.style.color=color; var r=sec; cntTick=setInterval(function(){ r--; if(r>0) cd.textContent=r; else clearInterval(cntTick); },1000); }
function sc(fn,d){ var t=setTimeout(fn,d); touts.push(t); }
function clrAll(){ touts.forEach(function(t){ clearTimeout(t); }); touts=[]; clearInterval(cntTick); }
function updateDots(ai){ el('wo-dots').querySelectorAll('.dot').forEach(function(d,i){ d.classList.toggle('done',i<ai); d.classList.toggle('active',i===ai); }); }

function startW(){
  var s=gs(); wSettings=s; active=true; wPaused=false; _renderUndoBar();
  el('pause-btn-w').textContent='⏸'; el('pause-btn-w').classList.remove('paused');
  var de=el('wo-dots'); de.innerHTML='';
  for(var i=0;i<s.reps;i++){ var d=document.createElement('div'); d.className='dot'; de.appendChild(d); }
  el('settings').style.display='none'; el('workout').style.display='block';
  fReset(); reqWL(); goFS(); startMetro(); run(s); saveLS();
}
function run(s){
  var t=0, m='rgba(255,255,255,.28)';
  sc(function(){ fReset(); setBadge('Przygotowanie','rgba(255,255,255,.25)'); setWPhase('Przygotuj się',m,'get ready'); setWRep('—',s.reps,m); cntD(s.gr,m); updateDots(-1); },t); t+=s.gr*1000;
  for(var rep=1;rep<=s.reps;rep++){
    (function(r){
      if(s.dn>0){ sc(function(){ fDown(s.dn); setBadge('Ekscentryka','var(--red)'); setWPhase('W DÓŁ','var(--red-text)','eccentric'); setWRep(r,s.reps,'var(--red-text)'); cntD(s.dn,'var(--red-text)'); updateDots(r-1); },t); t+=s.dn*1000; }
      if(s.pa>0){ sc(function(){ fPause(); setBadge('Pauza','var(--amber)'); setWPhase('PAUZA','var(--amber-text)','pause'); setWRep(r,s.reps,'var(--amber-text)'); cntD(s.pa,'var(--amber-text)'); },t); t+=s.pa*1000; }
      if(s.up>0){ sc(function(){ fUp(s.up); setBadge('Koncentryka','var(--green)'); setWPhase('W GÓRĘ','var(--green-text)','concentric'); setWRep(r,s.reps,'var(--green-text)'); cntD(s.up,'var(--green-text)'); },t); t+=s.up*1000; }
      if(r<s.reps&&s.rs>0){ sc(function(){ fFade(); setBadge('Odpoczynek','rgba(255,255,255,.2)'); setWPhase('ODPOCZYNEK',m,'rest'); setWRep(r,s.reps,m); cntD(s.rs,m); },t); t+=s.rs*1000; }
    })(rep);
  }
  sc(function(){ stopMetro(); clearInterval(cntTick); fFade(); setBadge('Koniec','var(--green)'); setWPhase('GOTOWE','var(--green-text)','completed'); el('wo-countdown').textContent=''; el('rep-number').textContent=s.reps; el('rep-number').style.color='var(--green-text)'; el('rep-eyebrow').style.color='var(--green-text)'; el('rep-total').textContent='z '+s.reps; el('rep-total').style.color='var(--green-text)'; updateDots(s.reps); launchConfetti(); speak('Brawo! Seria zakończona.'); sc(function(){ if(active) stopW(); },3500); },t);
}
function runFromRep(startRep,s){
  var t=0,m='rgba(255,255,255,.28)';
  for(var rep=startRep;rep<=s.reps;rep++){
    (function(r){
      if(s.dn>0){ sc(function(){ fDown(s.dn); setBadge('Ekscentryka','var(--red)'); setWPhase('W DÓŁ','var(--red-text)','eccentric'); setWRep(r,s.reps,'var(--red-text)'); cntD(s.dn,'var(--red-text)'); updateDots(r-1); },t); t+=s.dn*1000; }
      if(s.pa>0){ sc(function(){ fPause(); setBadge('Pauza','var(--amber)'); setWPhase('PAUZA','var(--amber-text)','pause'); setWRep(r,s.reps,'var(--amber-text)'); cntD(s.pa,'var(--amber-text)'); },t); t+=s.pa*1000; }
      if(s.up>0){ sc(function(){ fUp(s.up); setBadge('Koncentryka','var(--green)'); setWPhase('W GÓRĘ','var(--green-text)','concentric'); setWRep(r,s.reps,'var(--green-text)'); cntD(s.up,'var(--green-text)'); },t); t+=s.up*1000; }
      if(r<s.reps&&s.rs>0){ sc(function(){ fFade(); setBadge('Odpoczynek','rgba(255,255,255,.2)'); setWPhase('ODPOCZYNEK',m,'rest'); setWRep(r,s.reps,m); cntD(s.rs,m); },t); t+=s.rs*1000; }
    })(rep);
  }
  sc(function(){ stopMetro(); clearInterval(cntTick); fFade(); setBadge('Koniec','var(--green)'); setWPhase('GOTOWE','var(--green-text)','completed'); el('wo-countdown').textContent=''; el('rep-number').textContent=s.reps; el('rep-number').style.color='var(--green-text)'; el('rep-eyebrow').style.color='var(--green-text)'; el('rep-total').textContent='z '+s.reps; el('rep-total').style.color='var(--green-text)'; updateDots(s.reps); launchConfetti(); speak('Brawo! Seria zakończona.'); sc(function(){ if(active) stopW(); },3500); },t);
}
function stopW(){ active=false; clrAll(); stopMetro(); fReset(); el('settings').style.display='flex'; el('workout').style.display='none'; relWL(); exitFS(); _renderUndoBar(); }
function togglePauseW(){
  if(!active) return; var btn=el('pause-btn-w');
  if(!wPaused){ wPaused=true; var repN=parseInt(el('rep-number').textContent); wPauseRep=(isNaN(repN)||repN<1)?1:repN; if(!wSettings) wSettings=gs(); clrAll(); stopMetro(); btn.textContent='▶'; btn.classList.add('paused'); fPause(); setBadge('Pauza — kliknij ▶','var(--amber)'); setWPhase('PAUZA','var(--amber-text)','pauza'); el('wo-countdown').textContent='⏸'; el('wo-countdown').style.color='var(--amber-text)';
  } else { if(!wSettings||!wSettings.reps){ stopW(); return; } wPaused=false; btn.textContent='⏸'; btn.classList.remove('paused'); fReset(); startMetro(); runFromRep(wPauseRep,wSettings); }
}

// ══ REACTIVE ══
var RC_COLORS=[{hex:'#ef4444'},{hex:'#f97316'},{hex:'#eab308'},{hex:'#15803d'},{hex:'#06b6d4'},{hex:'#3b82f6'},{hex:'#7e22ce'},{hex:'#ec4899'}];
var RC_ARROW_LAYOUT=[{sym:'↖'},{sym:'↑'},{sym:'↗'},{sym:'←'},{sym:'●'},{sym:'→'},{sym:'↙'},{sym:'↓'},{sym:'↘'}];
var ARROW_DEG={'↑':0,'↗':45,'→':90,'↘':135,'↓':180,'↙':225,'←':270,'↖':315,'●':0};
function arrowSVG(deg){ return '<svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg"><g transform="rotate('+deg+' 120 130)"><polygon points="120,8 232,148 162,148 162,252 78,252 78,148 8,148" fill="white"/></g></svg>'; }

var selColors=new Set(['#ef4444','#15803d','#3b82f6','#eab308']);
var selArrows=new Set(['↑','↓','←','→']);
var rcSubMode='colors', rcTimeMode='fixed';
var rcT={fixed:10,min:5,max:20,base:5,sess:-1};
var rcOpts={norepeat:false,base:false};
var rcLastPick=null;
var SESS_PRESETS=[{v:10,l:'10 s'},{v:15,l:'15 s'},{v:20,l:'20 s'},{v:30,l:'30 s'},{v:45,l:'45 s'},{v:60,l:'1 min'},{v:120,l:'2 min'},{v:180,l:'3 min'},{v:0,l:'Własny'}];
var sessCustVal=240;

(function(){
  var g=el('color-grid'); RC_COLORS.forEach(function(c){ var sw=document.createElement('div'); sw.className='color-swatch'+(selColors.has(c.hex)?' sel':''); sw.style.background=c.hex; sw.setAttribute('data-hex',c.hex); sw.onclick=function(){ if(selColors.has(c.hex)){ if(selColors.size>1){ selColors.delete(c.hex); sw.classList.remove('sel'); } } else{ selColors.add(c.hex); sw.classList.add('sel'); } queueSave(); }; g.appendChild(sw); });
  var ag=el('arrow-grid'); RC_ARROW_LAYOUT.forEach(function(a){ var btn=document.createElement('button'); var isCircle=a.sym==='●'; btn.className='arrow-sel-btn'+(selArrows.has(a.sym)?' sel':'')+(isCircle?' arrow-circle-btn':''); btn.textContent=a.sym; if(isCircle) btn.style.fontSize='28px'; btn.onclick=function(){ if(selArrows.has(a.sym)){ if(selArrows.size>1){ selArrows.delete(a.sym); btn.classList.remove('sel'); } } else{ selArrows.add(a.sym); btn.classList.add('sel'); } queueSave(); }; ag.appendChild(btn); });
  var sc2=el('sess-chips-wrap'); SESS_PRESETS.forEach(function(p){ var b=document.createElement('button'); b.className='sess-chip'+(p.v===-1?' on':''); b.textContent=p.l; b.onclick=function(){ sc2.querySelectorAll('.sess-chip').forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); if(p.v===0){ rcT.sess=-99; el('sess-custom-row').style.display='block'; } else { rcT.sess=p.v; el('sess-custom-row').style.display='none'; } }; sc2.appendChild(b); });
})();

function setRcSub(m){ rcSubMode=m; el('st-colors').classList.toggle('on',m==='colors'); el('st-arrows').classList.toggle('on',m==='arrows'); el('st-balance').classList.toggle('on',m==='balance'); el('rcp-colors').classList.toggle('show',m==='colors'); el('rcp-arrows').classList.toggle('show',m==='arrows'); el('rcp-balance').classList.toggle('show',m==='balance'); var ss=el('rc-stim-settings'); if(ss) ss.style.display=m==='balance'?'none':''; }
function setTimeMode(m){ rcTimeMode=m; el('tm-fixed').classList.toggle('on',m==='fixed'); el('tm-random').classList.toggle('on',m==='random'); el('tp-fixed').classList.toggle('show',m==='fixed'); el('tp-random').classList.toggle('show',m==='random'); }
function toggleOpt(key){ rcOpts[key]=!rcOpts[key]; el('tog-'+key).classList.toggle('on',rcOpts[key]); el('lbl-'+key).textContent=rcOpts[key]?'Wł':'Wył'; if(key==='base') el('base-time-row').classList.toggle('show',rcOpts[key]); }
function fmtT(v){ return (v/10).toFixed(1)+' s'; }
function rcDisp(){ el('rc-fixed-val').textContent=fmtT(rcT.fixed); el('rc-min-val').textContent=fmtT(rcT.min); el('rc-max-val').textContent=fmtT(rcT.max); el('rc-base-val').textContent=fmtT(rcT.base); }
function doRcAdj(k,d){
  if(k==='fixed') rcT.fixed=Math.max(1,Math.min(100,rcT.fixed+d));
  else if(k==='min') rcT.min=Math.max(1,Math.min(rcT.max-1,rcT.min+d));
  else if(k==='max') rcT.max=Math.max(rcT.min+1,Math.min(100,rcT.max+d));
  else if(k==='base') rcT.base=Math.max(1,Math.min(50,rcT.base+d));
  else if(k==='sess'){ sessCustVal=Math.max(30,Math.min(3600,sessCustVal+d*30)); rcT.sess=-99; var m=Math.floor(sessCustVal/60),s=sessCustVal%60; el('rc-sess-val').textContent=s===0?m+' min':m+':'+('0'+s).slice(-2); }
  rcDisp();
}
function startRcAdj(k,d){ doRcAdj(k,d); adjTimer=setTimeout(function(){ adjInterval=setInterval(function(){ doRcAdj(k,d); },110); },380); }

var rcTimeout=null,rcMetro=null,rcRunning=false,rcN=0,rcSessTimer=null,rcSessRem=0;
function rcDur(){ if(rcTimeMode==='fixed') return rcT.fixed*100; return Math.round(rcT.min*100+Math.random()*(rcT.max-rcT.min)*100); }
function fmtSess(s){ var m=Math.floor(s/60),ss=s%60; return m+':'+(ss<10?'0':'')+ss; }
function pickItem(){
  var arr=rcSubMode==='colors'?Array.from(selColors):Array.from(selArrows);
  if(rcSubMode==='arrows'&&rcOpts.base) arr=arr.filter(function(x){ return x!=='●'; });
  if(arr.length===0) arr=rcSubMode==='colors'?Array.from(selColors):Array.from(selArrows).filter(function(x){ return x!=='●'; });
  if(arr.length===1) return arr[0];
  if(rcOpts.norepeat&&rcLastPick){ var f=arr.filter(function(x){ return x!==rcLastPick; }); if(f.length>0) arr=f; }
  return arr[Math.floor(Math.random()*arr.length)];
}
function showBase(){
  if(!rcRunning) return; stopReactTimer(); el('rc-bg').style.background='#060606'; el('rc-counter').textContent='';
  if(rcSubMode==='arrows'&&selArrows.has('●')) el('rc-arrow-wrap').innerHTML='<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:min(60vw,60vh);height:min(60vw,60vh);opacity:.35;"><circle cx="100" cy="100" r="70" fill="white"/></svg>';
  else el('rc-arrow-wrap').innerHTML='<div class="rc-base-dot"></div>';
  var dur=rcT.base*100; var bar=el('rc-bar'); bar.style.transition='none'; bar.style.transform='scaleX(1)'; bar.offsetHeight;
  bar.style.transition='transform '+dur+'ms linear'; bar.style.transform='scaleX(0)'; rcTimeout=setTimeout(showStim,dur);
}
function showStim(){
  if(!rcRunning) return; rcN++; el('rc-counter').textContent='#'+rcN; rcLastPick=pickItem(); var dur=rcDur();
  if(rcSubMode==='colors'){ el('rc-bg').style.background=rcLastPick; el('rc-arrow-wrap').innerHTML=''; }
  else { el('rc-bg').style.background='#060606'; if(rcLastPick==='●') el('rc-arrow-wrap').innerHTML='<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:min(72vw,72vh);height:min(72vw,72vh);filter:drop-shadow(0 0 30px rgba(255,255,255,.25));"><circle cx="100" cy="100" r="70" fill="white"/></svg>'; else el('rc-arrow-wrap').innerHTML=arrowSVG(ARROW_DEG[rcLastPick]||0); }
  var bar=el('rc-bar'); bar.style.transition='none'; bar.style.transform='scaleX(1)'; bar.offsetHeight;
  bar.style.transition='transform '+dur+'ms linear'; bar.style.transform='scaleX(0)';
  startReactTimer(); rcTimeout=setTimeout(rcOpts.base?showBase:showStim,dur);
}
var rcStimStart=0,rcReactInt=null;
function startReactTimer(){ clearInterval(rcReactInt); rcStimStart=Date.now(); rcReactInt=setInterval(function(){ if(!rcRunning){ clearInterval(rcReactInt); return; } var t=((Date.now()-rcStimStart)/1000).toFixed(1); el('rc-counter').textContent='#'+rcN+'  ·  '+t+' s'; },100); }
function stopReactTimer(){ clearInterval(rcReactInt); rcReactInt=null; }

// ══════════════════════════════════════
//  BALANCE MODE ENGINE
//  Self-contained module — easy to extract
// ══════════════════════════════════════
var balCfg={dir:'lr',speed:3,pattern:'constant',size:'m'};
var _balRAF=null, _balState=null;

var BAL_SPEED_MAP={1:1.0, 2:2.2, 3:4.0, 4:7.5, 5:13.0};
var BAL_SIZE_MAP={s:40, m:64, l:100, xl:160};

function setBalDir(d){
  balCfg.dir=d;
  ['lr','ud','2d','zoom','3d'].forEach(function(v){ el('bal-dir-'+v).classList.toggle('on',v===d); });
  queueSave();
}
function setBalSpeed(s){
  if(balCfg.pattern==='fullRandom'||balCfg.pattern==='randomSpeed') return;
  balCfg.speed=s;
  _syncBalSpeedBtns();
  queueSave();
}
function _syncBalSpeedBtns(){
  var locked=balCfg.pattern==='fullRandom'||balCfg.pattern==='randomSpeed';
  for(var i=1;i<=5;i++){
    var b=el('bal-spd-'+i);
    b.classList.toggle('on',locked||i===balCfg.speed);
    b.style.opacity=locked?'0.5':'';
    b.style.cursor=locked?'default':'pointer';
  }
}
function setBalPattern(p){
  balCfg.pattern=p;
  el('bal-pat-const').classList.toggle('on',p==='constant');
  el('bal-pat-ranspd').classList.toggle('on',p==='randomSpeed');
  el('bal-pat-randir').classList.toggle('on',p==='randomDir');
  el('bal-pat-full').classList.toggle('on',p==='fullRandom');
  _syncBalSpeedBtns();
  queueSave();
}
function setBalSize(s){
  balCfg.size=s;
  ['s','m','l','xl'].forEach(function(v){ el('bal-sz-'+v).classList.toggle('on',v===s); });
  queueSave();
}

function startBalance(){
  var existing=document.getElementById('bal-overlay');
  if(existing) existing.remove();

  var overlay=document.createElement('div');
  overlay.id='bal-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:310;pointer-events:none;overflow:hidden;';
  document.body.appendChild(overlay);

  var ballSize=BAL_SIZE_MAP[balCfg.size]||48;
  var ball=document.createElement('div');
  ball.id='bal-ball';
  ball.style.cssText='position:absolute;left:0;top:0;width:'+ballSize+'px;height:'+ballSize+'px;border-radius:50%;background:#fff;box-shadow:0 0 24px rgba(255,255,255,.6),0 0 80px rgba(255,255,255,.15);will-change:transform;';
  overlay.appendChild(ball);

  el('rc-arrow-wrap').innerHTML='';
  el('rc-bar').style.transform='scaleX(0)';

  var w=window.innerWidth, h=window.innerHeight;
  var baseSpeed=BAL_SPEED_MAP[balCfg.speed]||2.2;
  var speedScale=Math.min(w,h)/400;
  var dir=balCfg.dir;
  var pattern=balCfg.pattern;
  var hasMovement=dir!=='zoom'; // zoom=no XY movement, 3d/lr/ud/2d=yes
  var hasZoom=dir==='zoom'||dir==='3d';

  // ── XY movement state ──
  var x=w/2, y=h/2;
  var vx=0, vy=0;
  var currentSpeed=baseSpeed*speedScale;
  var moveDir=dir==='3d'?'2d':dir; // 3d uses 2d movement internally

  function _pickCardinal(s){
    var dirs=[[s,0],[-s,0],[0,s],[0,-s]];
    var pick=dirs[Math.floor(Math.random()*dirs.length)];
    vx=pick[0]; vy=pick[1];
  }
  function initVelocity(spd){
    var s=spd||currentSpeed;
    if(moveDir==='lr'){ vx=s*(Math.random()>0.5?1:-1); vy=0; }
    else if(moveDir==='ud'){ vx=0; vy=s*(Math.random()>0.5?1:-1); }
    else _pickCardinal(s); // 2d cardinal
  }
  function randomizeDirection(){
    var s=currentSpeed;
    if(moveDir==='lr') vx=s*(vx>0?-1:1);
    else if(moveDir==='ud') vy=s*(vy>0?-1:1);
    else _pickCardinal(s);
  }
  function randomizeSpeed(){
    var levels=[1.0,2.2,4.0,7.5,13.0];
    currentSpeed=levels[Math.floor(Math.random()*levels.length)]*speedScale;
    var mag=Math.sqrt(vx*vx+vy*vy);
    if(mag>0){ vx=(vx/mag)*currentSpeed; vy=(vy/mag)*currentSpeed; }
    else if(hasMovement) initVelocity(currentSpeed);
  }

  // ── Zoom state ──
  var ZOOM_MIN=0.1, ZOOM_MAX=6.0;
  var scale=1.0;
  var zoomSpeed=0.025*baseSpeed;
  var zoomDir=1;
  // For randomDir: target scale where ball reverses (creates varied pulsing)
  var zoomTarget=ZOOM_MAX;
  var nextChangeAt=0;

  function randomizeZoomSpeed(){
    var levels=[0.015,0.025,0.05,0.09,0.16];
    zoomSpeed=levels[Math.floor(Math.random()*levels.length)]*baseSpeed;
  }
  function randomizeZoomDir(){
    // Pick a random target — sometimes only small pulse, sometimes huge
    if(zoomDir>0){
      // Currently growing — pick a random max between current scale and ZOOM_MAX
      zoomTarget=scale+0.3+(ZOOM_MAX-scale)*Math.random();
    } else {
      // Currently shrinking — pick a random min between ZOOM_MIN and current scale
      zoomTarget=ZOOM_MIN+(scale-ZOOM_MIN)*Math.random();
    }
    // Also randomly flip direction sometimes
    if(Math.random()>0.5) zoomDir=-zoomDir;
    zoomTarget=zoomDir>0?Math.min(ZOOM_MAX,scale+0.5+Math.random()*(ZOOM_MAX-scale)):Math.max(ZOOM_MIN,scale-0.5-Math.random()*(scale-ZOOM_MIN));
  }

  function scheduleNextChange(){
    nextChangeAt=Date.now()+800+Math.random()*2700;
  }

  // Initialize
  if(hasMovement) initVelocity();
  if(pattern!=='constant') scheduleNextChange();

  _balState={x:x,y:y,ball:ball,ballSize:ballSize,currentSpeed:currentSpeed,
    dir:dir,moveDir:moveDir,pattern:pattern,nextChangeAt:nextChangeAt,
    hasMovement:hasMovement,hasZoom:hasZoom,scale:scale};

  function frame(){
    if(!rcRunning){ _balRAF=null; return; }
    var st=_balState; if(!st) return;
    var cw=window.innerWidth, ch=window.innerHeight;
    var margin=10;

    // ── Random changes ──
    var now=Date.now();
    if(st.pattern!=='constant'&&now>=st.nextChangeAt){
      if(st.pattern==='randomSpeed'){
        if(st.hasMovement) randomizeSpeed();
        if(st.hasZoom) randomizeZoomSpeed();
      } else if(st.pattern==='randomDir'){
        if(st.hasMovement) randomizeDirection();
        if(st.hasZoom) randomizeZoomDir();
      } else if(st.pattern==='fullRandom'){
        if(st.hasMovement){ randomizeDirection(); randomizeSpeed(); }
        if(st.hasZoom){ randomizeZoomDir(); randomizeZoomSpeed(); }
      }
      scheduleNextChange();
      st.nextChangeAt=nextChangeAt;
    }

    // ── XY movement ──
    if(st.hasMovement){
      st.x+=vx; st.y+=vy;
      var scaledHalf=st.ballSize*(st.hasZoom?st.scale:1)/2;
      if(st.x-scaledHalf<margin){ st.x=margin+scaledHalf; vx=Math.abs(vx); }
      if(st.x+scaledHalf>cw-margin){ st.x=cw-margin-scaledHalf; vx=-Math.abs(vx); }
      if(st.y-scaledHalf<margin){ st.y=margin+scaledHalf; vy=Math.abs(vy); }
      if(st.y+scaledHalf>ch-margin){ st.y=ch-margin-scaledHalf; vy=-Math.abs(vy); }
    } else {
      // Zoom only: keep centered
      st.x=cw/2; st.y=ch/2;
    }

    // ── Zoom ──
    if(st.hasZoom){
      st.scale+=zoomDir*zoomSpeed;
      // Bounce: in constant mode use full range, in random modes use zoomTarget
      if(st.pattern==='constant'){
        if(st.scale>=ZOOM_MAX){ st.scale=ZOOM_MAX; zoomDir=-1; }
        if(st.scale<=ZOOM_MIN){ st.scale=ZOOM_MIN; zoomDir=1; }
      } else {
        if(zoomDir>0&&st.scale>=zoomTarget){ st.scale=zoomTarget; zoomDir=-1; zoomTarget=Math.max(ZOOM_MIN,ZOOM_MIN+Math.random()*(st.scale-ZOOM_MIN)); }
        else if(zoomDir<0&&st.scale<=zoomTarget){ st.scale=zoomTarget; zoomDir=1; zoomTarget=Math.min(ZOOM_MAX,st.scale+0.5+Math.random()*(ZOOM_MAX-st.scale)); }
        if(st.scale>=ZOOM_MAX){ st.scale=ZOOM_MAX; zoomDir=-1; }
        if(st.scale<=ZOOM_MIN){ st.scale=ZOOM_MIN; zoomDir=1; }
      }
    }

    // ── Render ──
    var s=st.hasZoom?st.scale:1;
    var renderHalf=st.ballSize*s/2;
    st.ball.style.transform='translate('+(st.x-renderHalf)+'px,'+(st.y-renderHalf)+'px) scale('+s.toFixed(3)+')';
    st.ball.style.transformOrigin='0 0';

    _balRAF=requestAnimationFrame(frame);
  }
  _balRAF=requestAnimationFrame(frame);
}

function stopBalance(){
  if(_balRAF){ cancelAnimationFrame(_balRAF); _balRAF=null; }
  _balState=null;
  var ov=document.getElementById('bal-overlay');
  if(ov) ov.remove();
}

// RC interval mode
var rcSessionMode='time';
var rcIntVals={work:20,rest:10,rounds:6};
var rcIntRunning=false,rcIntPhase='work',rcIntRound=0,rcIntTimer=null,rcIntTick=null;
function setRcSessionMode(mode){ rcSessionMode=mode; var isInt=mode==='int'; el('rcmode-time').style.borderColor=isInt?'var(--border2)':'var(--accent)'; el('rcmode-time').style.background=isInt?'var(--s2)':'var(--accent-bg)'; el('rcmode-time').style.color=isInt?'var(--muted)':'var(--accent)'; el('rcmode-int').style.borderColor=isInt?'var(--accent)':'var(--border2)'; el('rcmode-int').style.background=isInt?'var(--accent-bg)':'var(--s2)'; el('rcmode-int').style.color=isInt?'var(--accent)':'var(--muted)'; el('rc-sess-time-panel').style.display=isInt?'none':'block'; el('rc-sess-int-panel').style.display=isInt?'block':'none'; }
var _rcIntAdjTimer=null;
function startRcIntAdj(k,d){ function a(){ if(k==='work') rcIntVals.work=Math.max(5,Math.min(600,rcIntVals.work+5*d)); else if(k==='rest') rcIntVals.rest=Math.max(0,Math.min(300,rcIntVals.rest+5*d)); else if(k==='rounds') rcIntVals.rounds=Math.max(1,Math.min(99,rcIntVals.rounds+d)); updateRcIntDisp(); } a(); _rcIntAdjTimer=setTimeout(function(){ _rcIntAdjTimer=setInterval(a,100); },400); }
function rcIntStopAdj(){ clearTimeout(_rcIntAdjTimer); clearInterval(_rcIntAdjTimer); _rcIntAdjTimer=null; }
function updateRcIntDisp(){ el('rci-work-val').textContent=fmtSec(rcIntVals.work); el('rci-rest-val').textContent=rcIntVals.rest===0?'—':fmtSec(rcIntVals.rest); el('rci-rounds-val').textContent=rcIntVals.rounds; }
function startRcInterval(){ rcIntRunning=true; rcIntRound=0; el('rc-topbar-normal').style.display='none'; el('rc-int-hud').style.display='block'; _startRcIntPhase('work'); }
function _startRcIntPhase(phase){
  clearInterval(rcIntTick); rcIntTick=null; clearTimeout(rcTimeout); rcTimeout=null; if(!rcIntRunning) return;
  var isWork=phase==='work'; if(isWork) rcIntRound++; rcIntPhase=phase; var dur=isWork?rcIntVals.work:rcIntVals.rest; var circ=188.5;
  el('rc-int-phase-label').textContent=isWork?'PRACA':'PRZERWA'; el('rc-int-phase-label').style.color=isWork?'#86efac':'#fdba74';
  el('rc-int-round-label').textContent='Runda '+rcIntRound+' / '+rcIntVals.rounds; el('rc-int-cnt').textContent=dur+'s';
  var ring=el('rc-int-ring'); ring.style.transition='none'; ring.style.stroke=isWork?'#4ade80':'#fb923c'; ring.style.strokeDashoffset='0';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ ring.style.transition='stroke-dashoffset '+dur+'s linear, stroke .3s ease'; ring.style.strokeDashoffset=String(circ); }); });
  if(isWork){ el('rc-arrow-wrap').style.opacity='1'; el('rc-bg').style.background=rcSubMode==='balance'?'#060606':''; if(rcSubMode==='balance') startBalance(); else showStim(); } else { stopBalance(); el('rc-arrow-wrap').style.opacity='0'; el('rc-arrow-wrap').innerHTML=''; el('rc-bg').style.background='rgba(255,140,0,0.10)'; }
  var elapsed=0;
  rcIntTick=setInterval(function(){ if(!rcIntRunning){ clearInterval(rcIntTick); rcIntTick=null; return; } elapsed++; var rem=dur-elapsed; el('rc-int-cnt').textContent=Math.max(0,rem)+'s';
    if(elapsed>=dur){ clearInterval(rcIntTick); rcIntTick=null; clearTimeout(rcTimeout); rcTimeout=null; if(!rcIntRunning) return;
      if(isWork){ if(rcIntRound>=rcIntVals.rounds) _stopRcInterval(); else if(rcIntVals.rest>0) _startRcIntPhase('rest'); else _startRcIntPhase('work'); } else _startRcIntPhase('work'); }
  },1000);
}
function _stopRcInterval(){
  rcIntRunning=false; clearInterval(rcIntTick); rcIntTick=null; clearTimeout(rcTimeout); rcTimeout=null;
  var msg=getFinishMsg(); var isGenZ=/fr fr|bussin|built diff|no cap|slay|lowkey|lore|main char|grind|rent paid|crumbs|that was/i.test(msg);
  el('rc-arrow-wrap').innerHTML='<div style="text-align:center;padding:20px;"><div style="color:rgba(134,239,172,.9);font-size:13px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:14px;">Koniec sesji ✓</div><div style="font-size:clamp(22px,6vw,32px);font-weight:900;color:#fff;max-width:320px;margin:0 auto 12px;line-height:1.25;text-shadow:0 3px 18px rgba(0,0,0,.6);">'+msg+'</div>'+(isGenZ?'<div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-top:4px;padding:4px 12px;border:1px solid rgba(255,255,255,.15);border-radius:20px;display:inline-block;">jeśli nie rozumiesz — jesteś Bumarem 🧱</div>':'')+'</div>';
  el('rc-arrow-wrap').style.opacity='1'; el('rc-bg').style.background='#060606';
  el('rc-int-ring').style.transition='none'; el('rc-int-ring').style.stroke='rgba(134,239,172,.6)'; el('rc-int-ring').style.strokeDashoffset='0';
  el('rc-int-cnt').textContent='✓'; el('rc-int-phase-label').textContent='KONIEC'; el('rc-int-phase-label').style.color='#86efac';
  launchConfetti(); setTimeout(function(){ stopRC(); },3500);
}
function rcCountdown321(cb){ var n=3; el('rc-bg').style.background='#060606'; el('rc-arrow-wrap').innerHTML=''; el('rc-counter').textContent=''; function tick(){ el('rc-arrow-wrap').innerHTML='<div style="font-size:clamp(140px,38vw,220px);font-weight:900;color:rgba(255,255,255,.8);line-height:1;">'+n+'</div>'; n--; if(n>=0) rcTimeout=setTimeout(tick,900); else { el('rc-arrow-wrap').innerHTML=''; rcTimeout=setTimeout(cb,200); } } tick(); }
function _startRcSessTimer(){
  clearInterval(rcSessTimer);
  var stEl=el('rc-session-time');
  var effSess=rcT.sess===-99?sessCustVal:rcT.sess;
  if(effSess===-1||effSess<=0){
    rcSessRem=0; stEl.textContent='';
    rcSessTimer=setInterval(function(){ rcSessRem++; stEl.textContent=fmtSess(rcSessRem); },1000);
  } else {
    rcSessRem=effSess; stEl.textContent=fmtSess(rcSessRem);
    rcSessTimer=setInterval(function(){ rcSessRem--; stEl.textContent=fmtSess(rcSessRem); if(rcSessRem<=0){ clearInterval(rcSessTimer); stopRC(); } },1000);
  }
}
function startRC(){
  rcRunning=true; rcN=0; rcLastPick=null; _renderUndoBar(); el('settings').style.display='none'; el('rc-active').style.display='block'; reqWL(); goFS(); clearInterval(rcSessTimer);
  if(rcSessionMode==='int'){ el('rc-topbar-normal').style.display='none'; el('rc-int-hud').style.display='block'; el('rc-arrow-wrap').style.opacity='0'; rcIntRunning=true; rcIntRound=0; rcCountdown321(function(){ _startRcIntPhase('work'); });
  } else { el('rc-topbar-normal').style.display='flex'; el('rc-int-hud').style.display='none'; el('rc-arrow-wrap').style.opacity='1';
    if(rcSubMode==='balance'){ el('rc-bg').style.background='#060606'; el('rc-counter').textContent='BALANCE'; el('rc-bar').style.transform='scaleX(0)'; rcCountdown321(function(){ _startRcSessTimer(); startBalance(); }); }
    else rcCountdown321(function(){ _startRcSessTimer(); showStim(); }); }
  saveLS();
}
function stopRC(){ rcRunning=false; rcIntRunning=false; clearTimeout(rcTimeout); rcTimeout=null; clearInterval(rcMetro); clearInterval(rcSessTimer); clearInterval(rcIntTick); stopReactTimer(); stopBalance(); el('rc-active').style.display='none'; el('settings').style.display='flex'; el('rc-topbar-normal').style.display='flex'; el('rc-int-hud').style.display='none'; el('rc-arrow-wrap').style.opacity='1'; relWL(); exitFS(); _renderUndoBar(); }
updateRcIntDisp();

// ══ INTERVAL TIMER ══
var intSubMode='emom';
var intVals={emom:10,work:30,rest:15,rounds:8,prep:5};
var INT_TIME_OPTS=[{v:5,l:'5 s'},{v:10,l:'10 s'},{v:15,l:'15 s'},{v:20,l:'20 s'},{v:25,l:'25 s'},{v:30,l:'30 s'},{v:35,l:'35 s'},{v:40,l:'40 s'},{v:45,l:'45 s'},{v:50,l:'50 s'},{v:55,l:'55 s'},{v:60,l:'1 min'},{v:75,l:'1:15'},{v:90,l:'1:30'},{v:105,l:'1:45'},{v:120,l:'2 min'},{v:150,l:'2:30'},{v:180,l:'3 min'},{v:240,l:'4 min'},{v:300,l:'5 min'},{v:360,l:'6 min'},{v:420,l:'7 min'},{v:480,l:'8 min'},{v:540,l:'9 min'},{v:600,l:'10 min'},{v:900,l:'15 min'},{v:1200,l:'20 min'},{v:1800,l:'30 min'},{v:3600,l:'60 min'}];
var WORK_CHIPS=[5,10,20,30,45,60], REST_CHIPS=[5,10,15,20,30,60];
function fmtSec(s){ if(s<60) return s+' s'; var m=Math.floor(s/60),r=s%60; return r===0?m+' min':m+':'+(r<10?'0':'')+r; }
function buildIntChips(id,opts,initVal,color,setter){ var c=el(id); opts.forEach(function(v){ var b=document.createElement('button'); b.className='chip'+(v===initVal?' on-'+color:''); b.textContent=fmtSec(v); b.onclick=function(){ c.querySelectorAll('.chip').forEach(function(x){ x.className='chip'; }); b.className='chip on-'+color; setter(v); }; c.appendChild(b); }); }
function buildSelect(id,initVal){ var s=el(id); INT_TIME_OPTS.forEach(function(o){ var opt=document.createElement('option'); opt.value=o.v; opt.textContent=o.l; if(o.v===initVal) opt.selected=true; s.appendChild(opt); }); }
function syncIntChips(id,v,color){ var c=el(id); c.querySelectorAll('.chip').forEach(function(ch){ ch.className=ch.textContent===fmtSec(v)?'chip on-'+color:'chip'; }); }
function selectIntTime(which,v){ v=parseInt(v); if(which==='work'){ intVals.work=v; el('vl-work').textContent=fmtSec(v); syncIntChips('c-work',v,'green'); } else{ intVals.rest=v; el('vl-rest-int').textContent=fmtSec(v); syncIntChips('c-rest-int',v,'red'); } }
buildIntChips('c-work',WORK_CHIPS,30,'green',function(v){ intVals.work=v; el('vl-work').textContent=fmtSec(v); el('sel-work').value=v; });
buildIntChips('c-rest-int',REST_CHIPS,15,'red',function(v){ intVals.rest=v; el('vl-rest-int').textContent=fmtSec(v); el('sel-rest').value=v; });
buildSelect('sel-work',30); buildSelect('sel-rest',15);
mkChips('c-emom',[5,8,10,12,15,20],10,'on-purple',function(v){ intVals.emom=v; el('vl-emom-min').textContent=v; el('cv-emom').textContent=v; },null);
mkChips('c-rounds',[3,5,8,10,15,20],8,'on-blue',function(v){ intVals.rounds=v; el('vl-rounds').textContent=v; el('cv-rounds').textContent=v; },null);
customVals['emom']=10; customVals['rounds']=8;

function doIntAdj(key,d){
  if(key==='emom'){ customVals.emom=Math.max(1,Math.min(60,customVals.emom+d)); intVals.emom=customVals.emom; el('vl-emom-min').textContent=customVals.emom; el('cv-emom').textContent=customVals.emom; el('c-emom').querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===customVals.emom?'chip on-purple':'chip'; }); }
  else if(key==='rounds'){ customVals.rounds=Math.max(1,Math.min(50,customVals.rounds+d)); intVals.rounds=customVals.rounds; el('vl-rounds').textContent=customVals.rounds; el('cv-rounds').textContent=customVals.rounds; el('c-rounds').querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===customVals.rounds?'chip on-blue':'chip'; }); }
  else if(key==='prep'){ customVals.prep=Math.max(0,Math.min(15,(customVals.prep||5)+d)); intVals.prep=customVals.prep; el('vl-int-prep').textContent=(customVals.prep===0?'Brak':customVals.prep+' s'); }
}
function startIntAdj(key,d){ doIntAdj(key,d); adjTimer=setTimeout(function(){ adjInterval=setInterval(function(){ doIntAdj(key,d); },110); },380); }
function setIntSub(m){ intSubMode=m; el('it-emom').classList.toggle('on',m==='emom'); el('it-custom').classList.toggle('on',m==='custom'); el('it-stoper').classList.toggle('on',m==='stoper'); el('itp-emom').classList.toggle('show',m==='emom'); el('itp-custom').classList.toggle('show',m==='custom'); el('itp-stoper').classList.toggle('show',m==='stoper'); }

var PRESETS={tabata:{work:20,rest:10,rounds:8},hiit4020:{work:10,rest:20,rounds:8},power3015:{work:6,rest:30,rounds:8}};
function applyPreset(key){
  var p=PRESETS[key]; if(!p) return; intVals.work=p.work; intVals.rest=p.rest; intVals.rounds=p.rounds;
  el('vl-work').textContent=fmtSec(p.work); el('sel-work').value=p.work; syncIntChips('c-work',p.work,'green');
  el('vl-rest-int').textContent=fmtSec(p.rest); el('sel-rest').value=p.rest; syncIntChips('c-rest-int',p.rest,'red');
  el('vl-rounds').textContent=p.rounds; el('cv-rounds').textContent=p.rounds; customVals.rounds=p.rounds;
  el('c-rounds').querySelectorAll('.chip').forEach(function(ch){ ch.className=ch.textContent==p.rounds?'chip on-blue':'chip'; });
  document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
  var ab=document.querySelector('.preset-btn[data-key="'+key+'"]'); if(ab) ab.classList.add('active');
}

// ── Custom interval presets (3 slots) ──
var CUSTOM_PRESETS_KEY='axs_int_presets';
var _customPresets=[null,null,null];
function loadCustomPresets(){ try{ var d=JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY)||'[]'); for(var i=0;i<3;i++) _customPresets[i]=d[i]||null; }catch(e){} }
function saveCustomPresets(){ try{ localStorage.setItem(CUSTOM_PRESETS_KEY,JSON.stringify(_customPresets)); }catch(e){} }
function renderCustomPresets(){
  loadCustomPresets();
  for(var i=0;i<3;i++){
    var p=_customPresets[i]; var nameEl=el('cpname-'+i); var valsEl=el('cpvals-'+i); var btn2=el('cpreset-'+i);
    if(!nameEl||!valsEl) continue;
    if(p){ nameEl.textContent=p.name; nameEl.style.color=''; valsEl.textContent=fmtSec(p.work)+' / '+fmtSec(p.rest)+' / '+p.rounds; }
    else { nameEl.textContent='+ Własny '+(i+1); nameEl.style.color='var(--dim)'; valsEl.textContent='— / — / —'; }
  }
}
function handleCustomPresetClick(idx){
  loadCustomPresets();
  if(_customPresets[idx]) applyCustomPreset(idx);
  else openCustomPreset(idx);
}
function applyCustomPreset(idx){
  var p=_customPresets[idx]; if(!p) return;
  intVals.work=p.work; intVals.rest=p.rest; intVals.rounds=p.rounds;
  el('vl-work').textContent=fmtSec(p.work); el('sel-work').value=p.work; syncIntChips('c-work',p.work,'green');
  el('vl-rest-int').textContent=fmtSec(p.rest); el('sel-rest').value=p.rest; syncIntChips('c-rest-int',p.rest,'red');
  el('vl-rounds').textContent=p.rounds; el('cv-rounds').textContent=p.rounds; customVals.rounds=p.rounds;
  el('c-rounds').querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===p.rounds?'chip on-blue':'chip'; });
  document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
  var btn2=el('cpreset-'+idx); if(btn2) btn2.classList.add('active');
  queueSave();
}
function openCustomPreset(idx){
  loadCustomPresets();
  var p=_customPresets[idx];
  var ov=_ensureOverlay();
  var workSec=p?p.work:20, restSec=p?p.rest:10, rds=p?p.rounds:8;
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:340px;width:100%;padding:20px 18px 22px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:14px;">'+(p?'✏️ Edytuj preset':'➕ Nowy preset')+' '+(idx+1)+'</div>'
    +'<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Nazwa</div>'
    +'<input id="cp-name" type="text" value="'+(p?p.name:'')+'" placeholder="np. Mój HIIT..." maxlength="20" style="width:100%;padding:9px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;box-sizing:border-box;"/></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">'
    +'<div><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Praca (s)</div>'
    +'<input id="cp-work" type="number" min="1" max="600" value="'+workSec+'" style="width:100%;padding:9px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;text-align:center;box-sizing:border-box;"/></div>'
    +'<div><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Przerwa (s)</div>'
    +'<input id="cp-rest" type="number" min="0" max="600" value="'+restSec+'" style="width:100%;padding:9px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;text-align:center;box-sizing:border-box;"/></div>'
    +'<div><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Rundy</div>'
    +'<input id="cp-rounds" type="number" min="1" max="99" value="'+rds+'" style="width:100%;padding:9px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;text-align:center;box-sizing:border-box;"/></div></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="cp-save" style="flex:1;padding:12px;background:#c2410c;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz</button>'
    +(p?'<button id="cp-del" style="padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;">🗑</button>':'')
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;">Anuluj</button>'
    +'</div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('cp-name').focus(); },50);
  document.getElementById('cp-save').onclick=function(){
    var name=(el('cp-name').value||'').trim()||('Własny '+(idx+1));
    var work=parseInt(el('cp-work').value)||20;
    var rest=parseInt(el('cp-rest').value)||10;
    var rounds=parseInt(el('cp-rounds').value)||8;
    _customPresets[idx]={name:name,work:work,rest:rest,rounds:rounds};
    saveCustomPresets(); ov.style.display='none'; renderCustomPresets(); applyCustomPreset(idx);
  };
  var delBtn=document.getElementById('cp-del');
  if(delBtn) delBtn.onclick=function(){ _customPresets[idx]=null; saveCustomPresets(); ov.style.display='none'; renderCustomPresets(); };
}
document.addEventListener('DOMContentLoaded',function(){ renderCustomPresets(); });

// Interval active
var intTimeout=null,intRunning=false,intMetro=null;
var _intSndOn=false;
function _syncIntSndButtons(){ var on=_intSndOn; var sb=el('int-snd-btn'); if(sb){ sb.textContent=on?'🔔':'🔕'; sb.style.opacity=on?'1':'0.45'; } var ss=el('int-snd-setting'); if(ss){ ss.innerHTML=on?'🔔 Włączony':'🔕 Wyciszony'; ss.style.opacity=on?'1':'0.65'; ss.style.borderColor=on?'var(--accent)':'var(--border2)'; } }
function toggleIntSnd(){ _intSndOn=!_intSndOn; _syncIntSndButtons(); }
function toggleIntSndSetting(){ _intSndOn=!_intSndOn; _syncIntSndButtons(); }

function setIntBg(color){ el('int-bg').style.background=color; }
function animRing(dur,color){ _ringColor=color||_ringColor; var ring=el('int-ring'); if(!ring) return; var circ=2*Math.PI*90; ring.style.stroke=color; ring.style.strokeDasharray=circ; ring.style.transition='none'; ring.style.strokeDashoffset='0'; ring.getBoundingClientRect(); ring.style.transition='stroke-dashoffset '+dur+'ms linear'; ring.style.strokeDashoffset=String(circ); }
function setIntDots(total,a2){ var p=el('int-prog'); p.innerHTML=''; for(var i=0;i<total;i++){ var d=document.createElement('div'); d.className='int-dot'+(i<a2?' done':i===a2?' active':''); p.appendChild(d); } }

function _scheduleTick(fn,ms){ ms=ms||1000; _currentTick=fn; _nextTickAt=Date.now()+ms; intTimeout=setTimeout(fn,ms); }
function _restartCntTick(r){ clearInterval(cntTick); function fmtCnt(s){ if(s<60) return s; var m=Math.floor(s/60),sec=s%60; return m+':'+(sec<10?'0':'')+sec; } var cntEl=el('int-cnt'); if(cntEl) cntEl.textContent=fmtCnt(r); cntTick=setInterval(function(){ r--; var e2=el('int-cnt'); if(e2&&r>0) e2.textContent=fmtCnt(r); else clearInterval(cntTick); },1000); }

function runIntPrep(prepSecs,cb){
  if(!prepSecs||prepSecs<=0){ cb(); return; } setIntBg('#060606'); var n=prepSecs;
  function tick(){ if(!intRunning) return; if(snd==='met'&&_intSndOn) beat(880,0.04);
    el('int-main').innerHTML='<div class="int-round-big" style="color:rgba(255,255,255,.3);">Przygotowanie</div><div class="int-round-num" style="color:rgba(255,255,255,.85);" id="int-cnt">'+n+'</div>';
    n--; if(n>=0) _scheduleTick(tick); else { _currentTick=null; intTimeout=setTimeout(cb,400); } } tick();
}
function startInt(){
  intRunning=true; _renderUndoBar(); var sb=el('int-snd-btn'); if(sb){ sb.textContent=_intSndOn?'🔔':'🔕'; sb.style.opacity=_intSndOn?'1':'0.45'; }
  el('settings').style.display='none'; el('int-active').style.display='block'; reqWL(); goFS();
  if(snd==='met'){ beat(880,0.04); intMetro=setInterval(function(){ if(_intSndOn) beat(880,0.04); },1000); }
  var prep=intVals.prep||0;
  if(intSubMode==='emom') runIntPrep(prep,runEMOM);
  else if(intSubMode==='stoper') runIntPrep(prep,_stoperMode==='up'?(function(){ _stoperUpSecs=0; return runStoperUp; }()):runStoper);
  else runIntPrep(prep,runCustomInt); saveLS();
}
function runEMOM(startElapsed){
  var totalMin=intVals.emom,totalSecs=totalMin*60; var elapsed=startElapsed||_emomElapsed||0; if(!startElapsed) _emomElapsed=0; setIntBg('#060606');
  function tick(){ if(!intRunning) return; var minNum=Math.floor(elapsed/60)+1; var secInMin=elapsed%60; var secsLeft=60-secInMin;
    if(secInMin===0&&elapsed>0&&_intSndOn) beat(1200,0.08); if(secInMin===0&&_intSndOn&&snd!=='off') schedIntBeeps(secsLeft*1000);
    el('int-main').innerHTML='<div class="int-round-big" style="color:rgba(255,255,255,.3);">Minuta</div><div style="display:flex;align-items:baseline;justify-content:center;gap:10px;"><div class="emom-minute">'+minNum+'</div><div class="emom-of">/ '+totalMin+'</div></div><div class="emom-secs">'+('0'+Math.floor(secsLeft/60)).slice(-2)+':'+(secsLeft%60<10?'0':'')+secsLeft%60+'</div>';
    if(secInMin===0) animRing(60000,'rgba(251,191,36,.85)');
    elapsed++; _emomElapsed=elapsed; if(elapsed>totalSecs){ finishInt(); return; } _scheduleTick(tick); } tick();
}
function runCustomInt(startRound,startPhase,startRemaining){
  var work=intVals.work,rest=intVals.rest,rounds=intVals.rounds; var currentRound=startRound||1,phase=startPhase||'work'; if(!startRound) setIntDots(rounds,0);
  function doPhase(overrideRemaining){
    if(!intRunning) return; if(currentRound>rounds){ finishInt(); return; }
    if(_intSndOn&&snd!=='off') beat(phase==='work'?1100:650,0.08); schedIntBeeps((phase==='work'?work:rest)*1000); setIntDots(rounds,currentRound-1);
    var dur=(overrideRemaining?overrideRemaining:(phase==='work'?work:rest))*1000; overrideRemaining=null;
    var bgColor=phase==='work'?'#0a2e18':'#0a1a2e'; var ringColor=phase==='work'?'rgba(134,239,172,.9)':'rgba(147,197,253,.9)';
    var phaseColor=phase==='work'?'var(--green-text)':'#1d4ed8'; var phaseLabel=phase==='work'?'PRACA':'PRZERWA';
    setIntBg(bgColor); animRing(dur,ringColor);
    var remaining=phase==='work'?work:rest;
    el('int-main').innerHTML='<div class="int-round-big" style="color:'+phaseColor+';opacity:.7;">Runda</div><div style="display:flex;align-items:baseline;justify-content:center;gap:10px;"><div class="int-round-num" style="color:'+phaseColor+';">'+currentRound+'</div><div class="int-round-of">/ '+rounds+'</div></div><div class="int-phase-label" style="color:'+phaseColor+';">'+phaseLabel+'</div><div class="int-big" id="int-cnt" style="color:'+phaseColor+';">'+(remaining<60?remaining:Math.floor(remaining/60)+':'+(remaining%60<10?'0':'')+remaining%60)+'</div><div class="int-sub">'+(phase==='work'?'work':'rest')+'</div>';
    clearInterval(cntTick); var r=remaining; _customRound=currentRound; _customPhase=phase; _customRemaining=r;
    function fmtCnt(s){ if(s<60) return s; var m=Math.floor(s/60),sec=s%60; return m+':'+(sec<10?'0':'')+sec; }
    el('int-cnt')&&(el('int-cnt').textContent=fmtCnt(r));
    cntTick=setInterval(function(){ if(intPaused) return; r--; _customRemaining=r; var e2=el('int-cnt'); if(e2&&r>0) e2.textContent=fmtCnt(r); else clearInterval(cntTick); },1000);
    var phaseEndFn=function(){ if(!intRunning) return;
      if(phase==='work'){ showIntervalData(currentRound,function(){ if(currentRound>=rounds){ currentRound++; doPhase(); return; } if(rest>0){ phase='rest'; doPhase(); } else{ currentRound++; phase='work'; doPhase(); } }); }
      else { currentRound++; phase='work'; doPhase(); }
    };
    _currentTick=phaseEndFn; _nextTickAt=Date.now()+dur; intTimeout=setTimeout(phaseEndFn,dur);
  } doPhase();
}
// Stoper
var stoperSecs=30; var STOPER_PRESETS=[10,15,20,30,45,60];
(function(){ var c=el('c-stoper'); STOPER_PRESETS.forEach(function(v){ var b=document.createElement('button'); b.className='chip'+(v===stoperSecs?' on-purple':''); b.textContent=v<60?v+'s':v/60+'min'; b.onclick=function(){ c.querySelectorAll('.chip').forEach(function(x){ x.className='chip'; }); b.className='chip on-purple'; stoperSecs=v; el('vl-stoper').textContent=fmtSec(v); syncStoperDropdowns(); }; c.appendChild(b); });
  var sm=el('sel-stoper-min'); for(var m=0;m<60;m++){ var o=document.createElement('option'); o.value=m; o.textContent=m+' min'; sm.appendChild(o); }
  var ss=el('sel-stoper-sec'); for(var s=0;s<60;s++){ var o2=document.createElement('option'); o2.value=s; o2.textContent=s<10?'0'+s+' s':s+' s'; ss.appendChild(o2); } ss.value=30;
})();
function syncStoperDropdowns(){ el('sel-stoper-min').value=Math.floor(stoperSecs/60); el('sel-stoper-sec').value=stoperSecs%60; }
function updateStoperTime(){ var m=parseInt(el('sel-stoper-min').value)||0; var s=parseInt(el('sel-stoper-sec').value)||0; stoperSecs=m*60+s; if(stoperSecs<1) stoperSecs=1; el('vl-stoper').textContent=fmtSec(stoperSecs); el('c-stoper').querySelectorAll('.chip').forEach(function(ch){ var match=(parseInt(ch.textContent)===stoperSecs)||(ch.textContent===fmtSec(stoperSecs)); ch.className=match?'chip on-purple':'chip'; }); }
syncStoperDropdowns();
function setStoperMode(mode){ _stoperMode=mode; el('stoper-mode-down').classList.toggle('on',mode==='down'); el('stoper-mode-up').classList.toggle('on',mode==='up'); el('stoper-down-config').style.display=mode==='down'?'block':'none'; el('stoper-up-config').style.display=mode==='up'?'block':'none'; }
function runStoper(startRemaining){
  var total=stoperSecs,remaining=startRemaining!=null?startRemaining:total; setIntBg('#0a0a1a'); animRing(remaining*1000,'rgba(168,85,247,.85)'); schedIntBeeps(remaining*1000);
  function tick(){ if(!intRunning) return;
    el('int-main').innerHTML='<div class="int-round-big" style="color:var(--purple-text);opacity:.7;">Stoper</div><div class="int-big" id="int-cnt" style="color:var(--purple-text);">'+(remaining<60?remaining:(Math.floor(remaining/60)+':'+(remaining%60<10?'0':'')+remaining%60))+'</div><div class="int-sub">'+fmtSec(total)+'</div>';
    remaining--; _stoperRemaining=remaining; if(remaining<0){ finishStoper(); return; } _scheduleTick(tick); } tick();
}
function runStoperUp(){
  setIntBg('#0a0a1a'); var ring=el('int-ring'); if(ring){ ring.style.stroke='rgba(168,85,247,.3)'; ring.style.strokeDashoffset='0'; } clearInterval(cntTick);
  function fmtUp(s){ var m=Math.floor(s/60); var sec=s%60; return m?m+':'+(sec<10?'0':'')+sec:String(s); }
  el('int-main').innerHTML='<div class="int-round-big" style="color:var(--purple-text);opacity:.7;">Stoper ⬆</div><div class="int-big" style="color:var(--purple-text);">'+fmtUp(_stoperUpSecs)+'</div><div class="int-sub">Naciśnij Stop kiedy chcesz</div>';
  cntTick=setInterval(function(){ if(!intRunning||intPaused){ clearInterval(cntTick); return; } _stoperUpSecs++;
    el('int-main').innerHTML='<div class="int-round-big" style="color:var(--purple-text);opacity:.7;">Stoper ⬆</div><div class="int-big" style="color:var(--purple-text);">'+fmtUp(_stoperUpSecs)+'</div><div class="int-sub">Naciśnij Stop kiedy chcesz</div>';
  },1000);
}
function stopStoperUp(){
  if(!intRunning) return; intRunning=false; clearInterval(cntTick); var elapsed=_stoperUpSecs; var endTime=Date.now(); window._intervalEndTime=endTime;
  if(_intSndOn&&(snd==='int'||snd==='met')) beepDone(); var ring=el('int-ring'); if(ring) ring.style.stroke='rgba(168,85,247,.6)'; launchConfetti();
  var savedStoperSecs=stoperSecs; stoperSecs=elapsed; var msg=getFinishMsg(); var isGenZ=/fr fr|bussin|built diff|no cap|slay|lowkey|lore|main char|grind|rent paid|crumbs|that was/i.test(msg);
  if(currentSession){ currentSession.params=currentSession.params||{}; currentSession.params.duration=elapsed; currentSession.endDate=new Date().toISOString();
    _currentIntervalNum=1; el('d-power').value=''; el('d-speed').value=''; el('d-dist').value=''; el('d-hr').value='';
    el('data-sheet-title').textContent='Dane stopera — '+fmtSec(elapsed)+' (w górę)'; el('interval-data-modal').classList.add('show');
    _dataCallback=function(){ stopInt(); showHRDrop(endTime); stoperSecs=savedStoperSecs; };
  } else { el('int-main').innerHTML='<div style="color:rgba(168,85,247,.9);font-size:14px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:12px;">Czas: '+fmtSec(elapsed)+'</div><div style="font-size:clamp(22px,6vw,34px);font-weight:900;color:#ffffff;text-align:center;max-width:340px;margin:0 auto 14px;line-height:1.25;">'+msg+'</div>'; setTimeout(function(){ stopInt(); stoperSecs=savedStoperSecs; },5000); }
}
function finishStoper(){
  var endTime=Date.now(); clearInterval(cntTick); _clearBeepTouts(); setIntBg('#060606'); if(_intSndOn&&(snd==='int'||snd==='met')) beepDone();
  var ring=el('int-ring'); if(ring){ ring.style.transition='none'; ring.style.strokeDashoffset='0'; ring.style.stroke='rgba(168,85,247,.6)'; } launchConfetti();
  var msg=getFinishMsg();
  if(currentSession){ currentSession.endDate=new Date().toISOString(); _currentIntervalNum=1; el('d-power').value=''; el('d-speed').value=''; el('d-dist').value=''; el('d-hr').value='';
    el('data-sheet-title').textContent='Dane stopera — '+fmtSec(stoperSecs); el('interval-data-modal').classList.add('show');
    _dataCallback=function(){ stopInt(); showHRDrop(endTime); };
  } else { el('int-main').innerHTML='<div style="color:rgba(168,85,247,.9);font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px;">Koniec stopera ✓</div><div style="font-size:clamp(18px,5vw,26px);font-weight:900;color:#ffffff;text-align:center;max-width:320px;margin:0 auto;line-height:1.3;">'+msg+'</div>'; setTimeout(function(){ if(intRunning) stopInt(); },5000); }
}
function finishInt(){
  var intEndTime=Date.now(); window._intervalEndTime=intEndTime; clearInterval(cntTick); setIntBg('#060606');
  if(_intSndOn&&(snd==='int'||snd==='met')) beepDone();
  var ring=el('int-ring'); if(ring){ ring.style.transition='none'; ring.style.strokeDashoffset='0'; ring.style.stroke='rgba(134,239,172,.6)'; }
  var msg=getFinishMsg(); var isGenZ=/fr fr|bussin|built diff|no cap|slay|lowkey|lore|main char|grind|rent paid|crumbs|that was/i.test(msg);
  el('int-main').innerHTML='<div style="color:rgba(134,239,172,.9);font-size:14px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:16px;">Koniec sesji ✓</div><div style="font-size:clamp(22px,6vw,34px);font-weight:900;color:#ffffff;text-align:center;max-width:340px;margin:0 auto 14px;line-height:1.25;">'+msg+'</div>'+(isGenZ?'<div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:6px;padding:4px 14px;border:1px solid rgba(255,255,255,.15);border-radius:20px;display:inline-block;">jeśli nie rozumiesz — jesteś Bumarem 🧱</div>':'');
  launchConfetti();
  if(currentSession){ currentSession.endDate=new Date().toISOString(); setTimeout(function(){ stopInt(); showHRDrop(intEndTime); },2400); }
  else setTimeout(function(){ if(intRunning) stopInt(); },3600);
}
function stopInt(){
  intRunning=false; intPaused=false; clearTimeout(intTimeout); intTimeout=null; clearInterval(intMetro); clearInterval(cntTick); _clearBeepTouts();
  _currentTick=null; _nextTickAt=0; var pauseOv=el('pause-overlay'); if(pauseOv) pauseOv.style.display='none';
  var btn=el('pause-btn-i'); if(btn){ btn.textContent='⏸'; btn.classList.remove('paused'); }
  el('int-active').style.display='none'; el('settings').style.display='flex'; relWL(); exitFS(); saveLS(); _renderUndoBar();
}
function togglePauseInt(){
  if(!intRunning) return; var btn=el('pause-btn-i'); var pauseOv=el('pause-overlay');
  if(!intPaused){
    // ── PAUSE ──
    intPaused=true;
    if(intSubMode==='stoper'&&_stoperMode==='up'){ clearInterval(cntTick); cntTick=null; _pausedCntVal=_stoperUpSecs; }
    else {
      _resumeDelay=(_nextTickAt>0)?Math.max(50,_nextTickAt-Date.now()):1000;
      // Save counter value for non-EMOM modes
      var cntEl=el('int-cnt');
      if(cntEl){
        var dispTxt=cntEl.textContent.trim();
        if(dispTxt.indexOf(':')>=0){ var pp=dispTxt.split(':'); _pausedCntVal=parseInt(pp[0])*60+parseInt(pp[1]); }
        else _pausedCntVal=parseInt(dispTxt)||0;
      }
      clearTimeout(intTimeout); intTimeout=null;
    }
    clearInterval(cntTick); cntTick=null; _clearBeepTouts(); stopMetro();
    // Freeze ring
    var ring=el('int-ring');
    if(ring){ var cs=window.getComputedStyle(ring); _pausedRingOffset=parseFloat(cs.strokeDashoffset)||0; ring.style.transition='none'; ring.style.strokeDashoffset=String(_pausedRingOffset); }
    if(pauseOv) pauseOv.style.display='flex'; btn.textContent='▶'; btn.classList.add('paused');
  } else {
    // ── RESUME ──
    intPaused=false; if(pauseOv) pauseOv.style.display='none'; btn.textContent='⏸'; btn.classList.remove('paused');
    if(intSubMode==='stoper'&&_stoperMode==='up'){
      _stoperUpSecs=_pausedCntVal; runStoperUp();
    } else if(intSubMode==='emom'&&_currentTick){
      // EMOM: restart tick + fresh ring animation for remaining time in minute
      _nextTickAt=Date.now()+_resumeDelay;
      intTimeout=setTimeout(_currentTick,_resumeDelay);
      var emomSecsLeft=60-(_emomElapsed%60);
      if(emomSecsLeft>0) animRing(emomSecsLeft*1000,'rgba(251,191,36,.85)');
    } else if(_currentTick){
      // Custom/Stoper countdown: restart counter + ring
      _restartCntTick(_pausedCntVal);
      _nextTickAt=Date.now()+_resumeDelay;
      intTimeout=setTimeout(_currentTick,_resumeDelay);
      (function(delay,frozenOffset){
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          var ring=el('int-ring'); if(!ring) return;
          var circ=2*Math.PI*90;
          ring.style.transition='none'; ring.style.strokeDasharray=String(circ);
          ring.style.strokeDashoffset=String(frozenOffset); ring.getBoundingClientRect();
          ring.style.transition='stroke-dashoffset '+delay+'ms linear';
          ring.style.strokeDashoffset=String(circ);
        }); });
      })(_resumeDelay,_pausedRingOffset);
    }
  }
}


// ══ PRE-SESSION ══
var EXERCISES=['Bieg','RowErg Concept2','AirBike Assault','AirBike Rogue','SkiErg Concept2'];
var psAthlete=null,psExercise=null,currentSession=null;
function openPresession(){
  loadCRM(); psAthlete=null; psExercise=null; el('ps-custom-name').value=''; el('ps-custom-exercise').value='';
  var pa=el('ps-athletes'); pa.innerHTML='';
  athletes.forEach(function(a){ var b=document.createElement('button'); b.className='athlete-select-chip'; b.textContent=a.name; b.onclick=function(){ pa.querySelectorAll('.athlete-select-chip').forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); psAthlete=a.name; el('ps-custom-name').value=''; }; pa.appendChild(b); });
  var pe=el('ps-exercises'); pe.innerHTML='';
  EXERCISES.forEach(function(ex){ var b=document.createElement('button'); b.className='exercise-chip'; b.textContent=ex; b.onclick=function(){ pe.querySelectorAll('.exercise-chip').forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); psExercise=ex; el('ps-custom-exercise').value=''; }; pe.appendChild(b); });
  el('presession-modal').classList.add('show');
}
function confirmPresession(){
  var name=psAthlete||(el('ps-custom-name').value.trim())||'Nieznany'; var exercise=psExercise||(el('ps-custom-exercise').value.trim())||'Brak'; var label='';
  if(intSubMode==='emom') label='EMOM '+intVals.emom+'min'+(exercise!=='Brak'?' — '+exercise:'');
  else if(intSubMode==='stoper') label='Stoper '+fmtSec(stoperSecs)+(exercise!=='Brak'?' — '+exercise:'');
  else label='Interwał '+intVals.rounds+'×'+fmtSec(intVals.work)+'/'+fmtSec(intVals.rest)+(exercise!=='Brak'?' — '+exercise:'');
  currentSession={id:Date.now(),date:new Date().toISOString(),athlete:name,exercise:exercise,label:label,mode:intSubMode,params:Object.assign(JSON.parse(JSON.stringify(intVals)),intSubMode==='stoper'?{duration:stoperSecs}:{}),intervals:[],_lastRound:0};
  el('presession-modal').classList.remove('show'); startInt();
}
function skipPresession(){ currentSession=null; el('presession-modal').classList.remove('show'); startInt(); }

// ══ INTERVAL DATA ENTRY ══
var _dataCallback=null,_currentIntervalNum=0,_elapsedInterval=null;
function showIntervalData(roundNum,cb){ if(!currentSession){ cb(); return; } cb(); _currentIntervalNum=roundNum; el('d-power').value=''; el('d-speed').value=''; el('d-dist').value=''; el('d-hr').value=''; el('data-sheet-title').textContent='Dane interwału #'+roundNum+' (podczas przerwy)'; _dataCallback=null; el('interval-data-modal').classList.add('show'); }
function saveIntervalData(){ if(_elapsedInterval){ clearInterval(_elapsedInterval); _elapsedInterval=null; }
  if(currentSession){ currentSession.intervals.push({round:_currentIntervalNum,power:el('d-power').value||null,speed:el('d-speed').value||null,dist:el('d-dist').value||null,hr:el('d-hr').value||null}); currentSession._lastRound=_currentIntervalNum; }
  el('interval-data-modal').classList.remove('show'); if(_dataCallback){ var cb=_dataCallback; _dataCallback=null; cb(); }
}
function skipIntervalData(){ if(_elapsedInterval){ clearInterval(_elapsedInterval); _elapsedInterval=null; } el('interval-data-modal').classList.remove('show'); if(_dataCallback){ var cb=_dataCallback; _dataCallback=null; cb(); } }

// ══ HR DROP ══
var _hrDropEndTime=0,_hrDropTick=null,_hrDropTO=[],_hrNextMeasure=90;
function _hrClearAll(){ clearInterval(_hrDropTick); _hrDropTick=null; _hrDropTO.forEach(function(t){ clearTimeout(t); }); _hrDropTO=[]; }
function showHRDrop(endTime){ _hrClearAll(); _hrDropEndTime=endTime; _hrNextMeasure=90; el('hrdrop-modal').classList.add('show'); _hrRenderQuestion(); }
function _hrRenderQuestion(){ var fmt=function(s){ var m=Math.floor(s/60),sec=s%60; return (m>0?m+':':'')+(sec<10&&m>0?'0':'')+sec+'s'; };
  el('hrdrop-card').innerHTML='<div class="hrdrop-title">Czas od zakończenia</div><div class="hrdrop-timer" id="hr-q-timer">'+fmt(Math.round((Date.now()-_hrDropEndTime)/1000))+'</div><div class="hrdrop-sub" style="margin-top:4px;">Mierzyć spadek tętna?</div><button class="hrdrop-yes" onclick="startHRDrop()">Tak — mierzę</button><button class="hrdrop-no" onclick="closeHRDrop()">Nie, dziękuję</button>';
  _hrDropTick=setInterval(function(){ var t=document.getElementById('hr-q-timer'); if(!t){ clearInterval(_hrDropTick); return; } var fmt2=function(s){ var m=Math.floor(s/60),sec=s%60; return (m>0?m+':':'')+(sec<10&&m>0?'0':'')+sec+'s'; }; t.textContent=fmt2(Math.round((Date.now()-_hrDropEndTime)/1000)); },500);
}
function startHRDrop(){ _hrClearAll(); var ms30=Math.max(0,30000-(Date.now()-_hrDropEndTime)); var ms60=Math.max(0,60000-(Date.now()-_hrDropEndTime)); _hrDropTO.push(setTimeout(function(){ _hrShowInput(30); },ms30)); _hrDropTO.push(setTimeout(function(){ _hrShowInput(60); },ms60)); _hrRenderRunning(); }
function _hrRenderRunning(){ var elapsed=Math.round((Date.now()-_hrDropEndTime)/1000); var fmt=function(s){ var m=Math.floor(s/60),sec=s%60; return (m>0?m+':':'')+(sec<10&&m>0?'0':'')+sec+'s'; };
  el('hrdrop-card').innerHTML='<div class="hrdrop-title" style="margin-bottom:4px;">Czas od zakończenia</div><div class="hrdrop-timer" id="hr-running-wrap">'+fmt(elapsed)+'</div><div style="font-size:11px;color:var(--dim);margin-bottom:12px;">Pomiar automatycznie przy 30s i 60s</div><div id="hr-input-wrap"></div><div id="hr-close-wrap" style="margin-top:14px;"><button class="hrdrop-no" onclick="closeHRDrop()">Zakończ pomiar</button></div>';
  _hrDropTick=setInterval(function(){ var e2=document.getElementById('hr-running-wrap'); if(!e2){ clearInterval(_hrDropTick); return; } var s=Math.round((Date.now()-_hrDropEndTime)/1000); var m=Math.floor(s/60),sec=s%60; e2.textContent=(m>0?m+':':'')+(sec<10&&m>0?'0':'')+sec+'s'; },500);
}
function _hrShowInput(sec){ if(!el('hrdrop-modal').classList.contains('show')) return; if(navigator.vibrate) navigator.vibrate([300,100,300]); var wrap=document.getElementById('hr-input-wrap'); if(!wrap) return; var id='hr-val-'+sec;
  wrap.innerHTML='<div class="hrdrop-prompt">Tętno po '+sec+'s (bpm)</div><input class="hrdrop-input" id="'+id+'" type="number" inputmode="numeric" placeholder="bpm"/><br><button class="hrdrop-save" onclick="_hrSave('+sec+')">Zapisz '+sec+'s</button>';
  setTimeout(function(){ var i=document.getElementById(id); if(i) i.focus(); },150);
}
function _hrSave(sec){ var val=(document.getElementById('hr-val-'+sec)?document.getElementById('hr-val-'+sec).value:'')||'';
  if(currentSession){ var ivs=currentSession.intervals; if(ivs&&ivs.length>0){ var last=ivs[ivs.length-1]; if(!last.hrDrop) last.hrDrop={}; last.hrDrop[sec+'s']=val; } else { if(!currentSession.hrDrop) currentSession.hrDrop={}; currentSession.hrDrop[sec+'s']=val; } }
  var wrap=document.getElementById('hr-input-wrap'); if(wrap) wrap.innerHTML='<div style="color:var(--green-text);font-weight:700;font-size:13px;margin-bottom:6px;">✓ Zapisano '+sec+'s: '+val+' bpm</div>';
  if(sec>=60) _hrDropTO.push(setTimeout(function(){ closeHRDrop(); },1200));
}
function closeHRDrop(){ _hrClearAll(); document.getElementById('hrdrop-modal').classList.remove('show');
  if(currentSession){ currentSession.endDate=new Date().toISOString(); sessions.unshift(currentSession); if(sessions.length>200) sessions=sessions.slice(0,200); saveSessions(); currentSession=null; }
}

// ══ HISTORY ══
function openHistory(){ loadCRM(); renderHistory(); el('history-overlay').style.display='block'; }
function closeHistory(){ el('history-overlay').style.display='none'; }
function renderHistory(){
  var c=el('hist-content'); if(!sessions.length){ c.innerHTML='<div class="hist-empty">Brak sesji z zapisem.</div>'; return; }
  c.innerHTML=''; sessions.slice(0,30).forEach(function(s){ var d=document.createElement('div'); d.className='hist-session';
    var dt=new Date(s.date).toLocaleDateString('pl-PL',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
    d.innerHTML='<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><div class="hist-label">'+(s.athlete||'—')+'</div><div class="hist-date">'+dt+'</div></div><div style="font-size:12px;color:var(--muted);">'+(s.label||s.mode||'')+'</div>';
    c.appendChild(d);
  });
}

