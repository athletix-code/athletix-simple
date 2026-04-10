// ═══════════════════════════════════════
//  SNIPER - Cel. Mierz. Strzelaj.
// ═══════════════════════════════════════

var _snViewX=0,_snViewY=0,_snTargets=[],_snRound=0,_snCfg=null,_snStart=0,_snMissStreak=0;
var _snDragStart=null,_snListeners=[],_snActive=false,_snTimerInt=null,_snTout=null,_snMoveInt=null;

function _sniperCfg(lv){
  var cfgs=[
    {size:50,count:1,rounds:6,arena:1.5,timeout:8,red:0,gold:false,white:false,move:false,dist:0.3},
    {size:50,count:1,rounds:7,arena:1.5,timeout:8,red:0,gold:false,white:false,move:false,dist:0.5},
    {size:40,count:1,rounds:8,arena:2,timeout:8,red:0,gold:false,white:false,move:false,dist:0.7},
    {size:40,count:1,rounds:8,arena:2,timeout:6,red:0.3,gold:false,white:false,move:false,dist:0.7},
    {size:40,count:2,rounds:9,arena:2,timeout:6,red:0.2,gold:false,white:false,move:false,dist:0.8},
    {size:35,count:2,rounds:9,arena:2,timeout:6,red:0.2,gold:true,white:false,move:false,dist:0.8},
    {size:35,count:2,rounds:10,arena:2.5,timeout:5,red:0.25,gold:true,white:false,move:true,dist:0.9},
    {size:30,count:2,rounds:10,arena:2.5,timeout:5,red:0.3,gold:true,white:true,move:true,dist:1},
    {size:30,count:3,rounds:10,arena:2.5,timeout:4,red:0.3,gold:true,white:true,move:true,dist:1},
    {size:28,count:3,rounds:12,arena:2.5,timeout:4,red:0.4,gold:true,white:true,move:true,dist:1}
  ];
  return lv<=cfgs.length?cfgs[lv-1]:cfgs[cfgs.length-1];
}
function _sniperPts(sec,lv){
  if(lv<=3){ if(sec<1) return 5; if(sec<2) return 4; if(sec<3) return 3; if(sec<5) return 2; return 1; }
  if(lv<=6){ if(sec<0.8) return 5; if(sec<1.5) return 4; if(sec<2.5) return 3; if(sec<4) return 2; return 1; }
  if(sec<0.6) return 5; if(sec<1.2) return 4; if(sec<2) return 3; if(sec<3) return 2; return 1;
}
function _sndShot(){ try{ var ctx=ga(); var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth'; o.frequency.value=150; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.4,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.05); o.start(); o.stop(ctx.currentTime+0.06); }catch(e){} }
function _sndHit(){ _mBeep(800,0.03); }

// ── Gesture lock ──
function _lockGestures(){ document.body.style.overscrollBehavior='none'; document.body.style.touchAction='none'; }
function _unlockGestures(){ document.body.style.overscrollBehavior=''; document.body.style.touchAction=''; }

// ── Particles ──
function _spawnParticles(x,y,color,container){
  for(var i=0;i<10;i++){
    var p=document.createElement('div'), sz=3+Math.random()*4, dx=(Math.random()-0.5)*120, dy=(Math.random()-0.5)*120;
    p.style.cssText='position:fixed;left:'+(x-sz/2)+'px;top:'+(y-sz/2)+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+color+';pointer-events:none;z-index:30;transition:all 0.4s ease-out;opacity:1;';
    container.appendChild(p);
    requestAnimationFrame(function(){ p.style.transform='translate('+dx+'px,'+dy+'px) scale(0.3)'; p.style.opacity='0'; });
    setTimeout(function(){ p.remove(); },400);
  }
}
function _showHitmarker(container){
  var hm=document.createElement('div');
  hm.style.cssText='position:fixed;top:calc(50% - 12px);left:calc(50% - 12px);width:24px;height:24px;pointer-events:none;z-index:31;transition:all 0.2s;transform:scale(0.8);';
  hm.innerHTML='<svg width="24" height="24"><line x1="4" y1="4" x2="10" y2="10" stroke="#fff" stroke-width="2"/><line x1="14" y1="4" x2="20" y2="10" stroke="#fff" stroke-width="2"/><line x1="4" y1="14" x2="10" y2="20" stroke="#fff" stroke-width="2"/><line x1="14" y1="14" x2="20" y2="20" stroke="#fff" stroke-width="2"/></svg>';
  container.appendChild(hm);
  requestAnimationFrame(function(){ hm.style.transform='scale(1.2)'; hm.style.opacity='0'; });
  setTimeout(function(){ hm.remove(); },200);
  _sndHit();
}

// ── Kill Feed ──
var _killFeedItems=[];
function _addKillFeed(text,color){
  var ma=el('motion-active');
  var kf=document.createElement('div');
  kf.style.cssText='position:fixed;top:'+(100+_killFeedItems.length*22)+'px;right:-200px;z-index:25;font-size:10px;font-weight:700;color:'+color+';background:rgba(0,0,0,0.5);padding:3px 10px;border-radius:10px;transition:right 0.3s,opacity 0.3s;white-space:nowrap;';
  kf.textContent=text; ma.appendChild(kf);
  _killFeedItems.push(kf);
  if(_killFeedItems.length>3){ _killFeedItems.shift().remove(); }
  requestAnimationFrame(function(){ kf.style.right='10px'; });
  setTimeout(function(){ kf.style.opacity='0'; setTimeout(function(){ kf.remove(); var idx=_killFeedItems.indexOf(kf); if(idx>-1) _killFeedItems.splice(idx,1); },300); },2000);
}

// ── Cleanup ──
function _cleanSniper(){
  _snActive=false; _unlockGestures();
  if(_snTimerInt){ clearInterval(_snTimerInt); _snTimerInt=null; }
  if(_snTout){ clearTimeout(_snTout); _snTout=null; }
  if(_snMoveInt){ clearInterval(_snMoveInt); _snMoveInt=null; }
  var ma=el('motion-active');
  _snListeners.forEach(function(l){ ma.removeEventListener(l[0],l[1]); });
  _snListeners=[]; _killFeedItems=[];
}

// ── Start ──
function _startSniperLevel(lv){
  if(_motionAbort) return;
  _gameLevel=lv; _snCfg=_sniperCfg(lv); _snRound=0; _snMissStreak=0; _killFeedItems=[];
  _snViewX=0; _snViewY=0; _snActive=true; _lockGestures();
  _runSniperRound(lv,0,[]);
}

function _runSniperRound(lv,round,results){
  _cleanSniper(); _snActive=true; _lockGestures();
  if(_motionAbort||_gameLives<=0){ _cleanSniper(); _showGameOver(); return; }
  var cfg=_snCfg;
  if(round>=cfg.rounds){ _cleanSniper(); _showLevelComplete(lv,results); return; }
  _trialIdx=round; _trialTotal=cfg.rounds;
  var ma=el('motion-active'); ma.style.overflow='hidden'; ma.style.touchAction='none';
  var W=window.innerWidth, H=window.innerHeight;
  var arenaW=Math.round(W*cfg.arena), arenaH=Math.round(H*cfg.arena);
  var extraW=(arenaW-W)/2, extraH=(arenaH-H)/2;
  _snViewX=Math.max(-extraW,Math.min(extraW,_snViewX));
  _snViewY=Math.max(-extraH,Math.min(extraH,_snViewY));
  // Generate targets within reachable area
  _snTargets=[];
  for(var i=0;i<cfg.count;i++){
    var type='green';
    if(cfg.white&&Math.random()<0.15) type='white';
    else if(cfg.gold&&Math.random()<0.2) type='gold';
    else if(Math.random()<cfg.red) type='red';
    var sz=type==='gold'?25:type==='white'?20:cfg.size;
    var margin=sz+20;
    var tx=(Math.random()-0.5)*Math.max(0,(extraW*2-margin*2))*cfg.dist;
    var ty=(Math.random()-0.5)*Math.max(0,(extraH*2-margin*2))*cfg.dist;
    _snTargets.push({type:type,x:tx,y:ty,size:sz,alive:true,vx:cfg.move?(Math.random()-0.5)*40:0,vy:cfg.move?(Math.random()-0.5)*40:0});
  }
  _snStart=Date.now();
  // Render arena
  var arena='<div id="sn-arena" style="position:absolute;width:'+arenaW+'px;height:'+arenaH+'px;left:50%;top:50%;transform:translate(calc(-50% + '+_snViewX+'px),calc(-50% + '+_snViewY+'px));touch-action:none;background:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px);">';
  var acx=arenaW/2, acy=arenaH/2;
  _snTargets.forEach(function(t,i){
    if(!t.alive) return;
    var colors={green:'#4ade80',red:'#f87171',gold:'#eab308',white:'rgba(255,255,255,0.5)'};
    var c=colors[t.type];
    var glow=t.type==='gold'?'0 0 15px rgba(234,179,8,0.4)':t.type==='white'?'0 0 6px rgba(255,255,255,0.15)':'0 0 12px '+c+'50';
    var inner=t.type==='red'?'<div style="font-size:'+(t.size*0.5)+'px;font-weight:800;color:#f87171;">✕</div>':t.type==='gold'?'<div style="font-size:'+(t.size*0.4)+'px;font-weight:800;color:#eab308;">★</div>':'<div style="width:'+(t.size*0.2)+'px;height:'+(t.size*0.2)+'px;border-radius:50%;background:'+c+';"></div>';
    arena+='<div class="sn-target" data-idx="'+i+'" style="position:absolute;left:'+(acx+t.x-t.size/2)+'px;top:'+(acy+t.y-t.size/2)+'px;width:'+t.size+'px;height:'+t.size+'px;border-radius:50%;border:3px solid '+c+';background:rgba('+(_snRgb(c))+',0.1);display:flex;align-items:center;justify-content:center;box-shadow:'+glow+';transition:transform 0.2s,opacity 0.2s;">'+inner+'</div>';
  });
  arena+='</div>';
  // Crosshair
  var xh='<div id="sn-crosshair" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;pointer-events:none;z-index:20;">'
    +'<div style="position:absolute;inset:0;border:1.5px solid rgba(255,255,255,0.4);border-radius:50%;"></div>'
    +'<div style="position:absolute;top:50%;left:50%;width:3px;height:3px;background:#3b82f6;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 8px rgba(59,130,246,0.3);"></div>'
    +'<div style="position:absolute;top:8px;left:50%;width:1.5px;height:16px;background:rgba(255,255,255,0.5);transform:translateX(-50%);"></div>'
    +'<div style="position:absolute;bottom:8px;left:50%;width:1.5px;height:16px;background:rgba(255,255,255,0.5);transform:translateX(-50%);"></div>'
    +'<div style="position:absolute;left:8px;top:50%;width:16px;height:1.5px;background:rgba(255,255,255,0.5);transform:translateY(-50%);"></div>'
    +'<div style="position:absolute;right:8px;top:50%;width:16px;height:1.5px;background:rgba(255,255,255,0.5);transform:translateY(-50%);"></div></div>';
  // Timer + shoot button
  var timer='<div id="sn-timer" style="position:fixed;bottom:170px;left:50%;transform:translateX(-50%);z-index:15;font-size:24px;font-weight:900;color:rgba(255,255,255,0.6);">0.0s</div>';
  var shootBtn='<div id="sn-shoot" style="position:fixed;bottom:60px;left:50%;transform:translateX(-50%);z-index:25;width:100px;height:100px;border-radius:50%;background:rgba(220,38,38,0.15);border:3px solid rgba(220,38,38,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 0.1s;"><div style="width:32px;height:32px;border:3px solid rgba(255,255,255,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;"><div style="width:6px;height:6px;background:rgba(255,255,255,0.6);border-radius:50%;"></div></div></div>';
  ma.innerHTML=_mHUD()+arena+xh+timer+shootBtn;
  // Timer interval
  _snTimerInt=setInterval(function(){
    var te=document.getElementById('sn-timer'); if(!te){ clearInterval(_snTimerInt); return; }
    var sec=(Date.now()-_snStart)/1000;
    te.textContent=sec.toFixed(1)+'s';
    te.style.color=sec<2?'#4ade80':sec<4?'#3b82f6':sec<6?'#d97706':'#f87171';
  },100);
  // Timeout
  _snTout=setTimeout(function(){
    _mPtsAnim('⏱️ Czas!','#d97706');
    results.push({time:cfg.timeout,correct:false,type:'timeout'});
    setTimeout(function(){ _runSniperRound(lv,round+1,results); },600);
  },cfg.timeout*1000);
  // Moving targets
  _snMoveInt=cfg.move?setInterval(function(){
    _snTargets.forEach(function(t){
      if(!t.alive) return;
      t.x+=t.vx*0.05; t.y+=t.vy*0.05;
      var maxD=Math.min(extraW,extraH)-t.size;
      if(Math.abs(t.x)>maxD) t.vx*=-1;
      if(Math.abs(t.y)>maxD) t.vy*=-1;
    });
    var tgts=ma.querySelectorAll('.sn-target');
    tgts.forEach(function(el2){
      var idx=parseInt(el2.dataset.idx); var t=_snTargets[idx]; if(!t||!t.alive) return;
      el2.style.left=(arenaW/2+t.x-t.size/2)+'px'; el2.style.top=(arenaH/2+t.y-t.size/2)+'px';
    });
  },50):null;

  // ── INPUT: drag to aim, button to shoot ──
  _snDragStart=null;
  var onTouchStart=function(e){
    if(e.target.closest('#motion-close-x,#sn-shoot')) return;
    e.preventDefault();
    var pt=e.touches[0];
    _snDragStart={x:pt.clientX,y:pt.clientY,vx:_snViewX,vy:_snViewY};
  };
  var onTouchMove=function(e){
    e.preventDefault(); // BLOCK all browser gestures
    if(!_snDragStart) return;
    var pt=e.touches[0];
    _snViewX=_snDragStart.vx+(pt.clientX-_snDragStart.x);
    _snViewY=_snDragStart.vy+(pt.clientY-_snDragStart.y);
    _snViewX=Math.max(-extraW,Math.min(extraW,_snViewX));
    _snViewY=Math.max(-extraH,Math.min(extraH,_snViewY));
    var ar=document.getElementById('sn-arena');
    if(ar) ar.style.transform='translate(calc(-50% + '+_snViewX+'px),calc(-50% + '+_snViewY+'px))';
  };
  var onTouchEnd=function(e){ _snDragStart=null; };
  var onMouseDown=function(e){
    if(e.target.closest('#motion-close-x,#sn-shoot')) return;
    if(e.button===2){ e.preventDefault(); _doSniperShoot(ma,W,H,arenaW,arenaH,lv,round,results,cfg); return; }
    _snDragStart={x:e.clientX,y:e.clientY,vx:_snViewX,vy:_snViewY};
  };
  var onMouseMove=function(e){
    if(!_snDragStart) return;
    _snViewX=_snDragStart.vx+(e.clientX-_snDragStart.x);
    _snViewY=_snDragStart.vy+(e.clientY-_snDragStart.y);
    _snViewX=Math.max(-extraW,Math.min(extraW,_snViewX));
    _snViewY=Math.max(-extraH,Math.min(extraH,_snViewY));
    var ar=document.getElementById('sn-arena');
    if(ar) ar.style.transform='translate(calc(-50% + '+_snViewX+'px),calc(-50% + '+_snViewY+'px))';
  };
  var onMouseUp=function(){ _snDragStart=null; };
  var onContext=function(e){ e.preventDefault(); };
  var onKey=function(e){
    if(e.key===' '||e.key==='Enter'){ e.preventDefault(); _doSniperShoot(ma,W,H,arenaW,arenaH,lv,round,results,cfg); }
    if(e.key==='ArrowLeft') _snViewX=Math.max(-extraW,_snViewX-8);
    if(e.key==='ArrowRight') _snViewX=Math.min(extraW,_snViewX+8);
    if(e.key==='ArrowUp') _snViewY=Math.max(-extraH,_snViewY-8);
    if(e.key==='ArrowDown') _snViewY=Math.min(extraH,_snViewY+8);
    var ar=document.getElementById('sn-arena');
    if(ar) ar.style.transform='translate(calc(-50% + '+_snViewX+'px),calc(-50% + '+_snViewY+'px))';
  };
  // Shoot button
  var shootEl=document.getElementById('sn-shoot');
  var onShootBtn=function(e){
    e.preventDefault(); e.stopPropagation();
    shootEl.style.background='rgba(220,38,38,0.4)'; shootEl.style.transform='translateX(-50%) scale(0.92)'; shootEl.style.borderColor='#dc2626';
    setTimeout(function(){ shootEl.style.background='rgba(220,38,38,0.15)'; shootEl.style.transform='translateX(-50%) scale(1)'; shootEl.style.borderColor='rgba(220,38,38,0.4)'; },100);
    _doSniperShoot(ma,W,H,arenaW,arenaH,lv,round,results,cfg);
  };
  if(shootEl){ shootEl.addEventListener('touchstart',onShootBtn,{passive:false}); shootEl.addEventListener('click',onShootBtn); }

  ma.addEventListener('touchstart',onTouchStart,{passive:false});
  ma.addEventListener('touchmove',onTouchMove,{passive:false});
  ma.addEventListener('touchend',onTouchEnd);
  ma.addEventListener('mousedown',onMouseDown);
  ma.addEventListener('mousemove',onMouseMove);
  ma.addEventListener('mouseup',onMouseUp);
  ma.addEventListener('contextmenu',onContext);
  document.addEventListener('keydown',onKey);
  _snListeners=[['touchstart',onTouchStart],['touchmove',onTouchMove],['touchend',onTouchEnd],['mousedown',onMouseDown],['mousemove',onMouseMove],['mouseup',onMouseUp],['contextmenu',onContext]];
  _snListeners._keyFn=onKey;
  _snListeners._shootFn=onShootBtn;
}

function _doSniperShoot(ma,W,H,arenaW,arenaH,lv,round,results,cfg){
  _sndShot();
  var xh=document.getElementById('sn-crosshair');
  if(xh){ xh.style.transition='transform 0.1s'; xh.style.transform='translate(-50%,-50%) scale(0.92)'; setTimeout(function(){ xh.style.transform='translate(-50%,-50%) scale(1)'; },100); }
  // Check hit
  var screenCX=W/2, screenCY=H/2;
  var hit=null;
  _snTargets.forEach(function(t,idx){
    if(!t.alive) return;
    var tScreenX=t.x+_snViewX+W/2;
    var tScreenY=t.y+_snViewY+H/2;
    var d=Math.sqrt(Math.pow(tScreenX-screenCX,2)+Math.pow(tScreenY-screenCY,2));
    if(d<t.size/2+16&&!hit) hit={idx:idx,t:t,sx:tScreenX,sy:tScreenY};
  });
  if(hit){
    hit.t.alive=false;
    var tEl=ma.querySelector('.sn-target[data-idx="'+hit.idx+'"]');
    if(hit.t.type==='red'){
      _gameLives--; setTimeout(_flashLives,50); _gamePoints-=2; _snMissStreak=0;
      ma.style.background='rgba(248,113,113,0.15)'; setTimeout(function(){ ma.style.background='#060606'; },200);
      _mPtsAnim('✕ -2 pkt','#f87171'); _addKillFeed('✕ FAŁSZYWKA -2','#f87171');
      if(tEl){ tEl.style.transform='scale(1.3)'; tEl.style.opacity='0'; }
      if(navigator.vibrate) navigator.vibrate(200);
      results.push({time:0,correct:false,type:'red'});
    } else {
      var sec=(Date.now()-_snStart)/1000;
      var pts=_sniperPts(sec,lv);
      var mult=hit.t.type==='gold'?2:hit.t.type==='white'?3:1;
      pts*=mult;
      _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
      var comboMult=_gameCombo>=10?4:_gameCombo>=5?3:_gameCombo>=3?2:1;
      var earned=pts*comboMult; _gamePoints+=earned; _gameCorrect++; _snMissStreak=0;
      _gameTimes.push(Math.round(sec*1000)); _gameLastTime=Math.round(sec*1000); _gameTotalTrials++;
      _showHitmarker(ma); _spawnParticles(hit.sx,hit.sy,hit.t.type==='gold'?'#eab308':hit.t.type==='white'?'#fff':'#4ade80',ma);
      if(tEl){ tEl.style.transform='scale(0)'; tEl.style.opacity='0'; }
      var label=hit.t.type==='white'?'💀 HEADSHOT':hit.t.type==='gold'?'★ BONUS':'🎯';
      _mPtsAnim('+'+earned+' ⚡','var(--green-text)'); _addKillFeed(label+' +'+earned+' ('+sec.toFixed(1)+'s)',hit.t.type==='white'?'#fff':hit.t.type==='gold'?'#eab308':'#4ade80');
      results.push({time:sec,correct:true,type:'hit'});
      if(_gameCombo>=10){ var u=document.createElement('div'); u.style.cssText='position:fixed;top:45%;left:50%;transform:translateX(-50%);font-size:18px;font-weight:900;color:#eab308;z-index:30;pointer-events:none;transition:opacity 0.5s;'; u.textContent='🔥 UNSTOPPABLE'; ma.appendChild(u); setTimeout(function(){ u.style.opacity='0'; setTimeout(function(){u.remove();},500); },1000); }
    }
    var pe=document.getElementById('m-pts'); if(pe){ pe.textContent='⚡ '+_gamePoints; pe.style.color=_gamePoints<0?'#f87171':'var(--accent)'; }
    var allDone=_snTargets.every(function(t2){ return !t2.alive||t2.type==='red'; });
    if(allDone){
      setTimeout(function(){ _runSniperRound(lv,round+1,results); },600);
      return;
    }
  } else {
    _gamePoints-=1; _gameCombo=0; _snMissStreak++;
    _mPtsAnim('-1 pudło','#f87171'); _addKillFeed('✕ PUDŁO -1','#f87171');
    var xh2=document.getElementById('sn-crosshair');
    if(xh2&&xh2.firstChild){ xh2.firstChild.style.borderColor='#f87171'; setTimeout(function(){ if(xh2.firstChild) xh2.firstChild.style.borderColor='rgba(255,255,255,0.4)'; },150); }
    if(_snMissStreak>=3){ _gameLives--; setTimeout(_flashLives,50); _snMissStreak=0; _mPtsAnim('❤️ -1','#f87171'); }
    var pe2=document.getElementById('m-pts'); if(pe2){ pe2.textContent='⚡ '+_gamePoints; pe2.style.color=_gamePoints<0?'#f87171':'var(--accent)'; }
    results.push({time:0,correct:false,type:'miss'});
  }
  if(_gameLives<=0){ setTimeout(function(){ _cleanSniper(); _showGameOver(); },500); }
}

function _cleanSnListeners(ma){
  _snListeners.forEach(function(l){ ma.removeEventListener(l[0],l[1]); });
  if(_snListeners._keyFn) document.removeEventListener('keydown',_snListeners._keyFn);
  _snListeners=[];
}
function _snRgb(hex){
  if(hex.indexOf('rgba')===0) return '255,255,255';
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}

// ── Info ──
function openSniperInfo(){
  var body=''
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">📋 ZASADY</div>'
    +'<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:12px;">Celuj przesuwając widok. Naciśnij przycisk STRZAŁ gdy cel jest pod celownikiem.<br><br>'
    +'🟢 Zielony - strzelaj!<br>🔴 Czerwony - NIE strzelaj! -2 pkt + ❤️<br>🟡 Złoty - bonus! Podwójne punkty.<br>⚪ Biały (headshot) - potrójne punkty.</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">⚡ PUNKTY</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.8;margin-bottom:12px;">&lt; 1s = 5 pkt | &lt; 2s = 4 | &lt; 3s = 3 | &lt; 5s = 2 | &lt; 8s = 1<br>Pudło: -1 pkt | 3 pudła z rzędu: -1 ❤️</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">📈 PROGRESJA</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;">Lv.1-3: Duże cele, dużo czasu<br>Lv.4-5: Czerwone fałszywki<br>Lv.6-7: Złote bonusy, ruchome cele<br>Lv.8+: Headshoty, wiele celów, chaos</div>'
    +'<div style="background:rgba(59,130,246,.04);border-radius:10px;padding:10px;margin-top:12px;"><div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.4);">🧠 Ciekawi Cię nauka za tym? Sprawdź sekcję nerdową w opisie modułu ⚡ Czas Reakcji!</div></div>';
  _motionModalWrap('sniper-info-modal','🎯 Snajper - Jak grać?',body);
}
