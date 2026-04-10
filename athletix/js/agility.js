// ═══════════════════════════════════════
//  AGILITY DASH - Unikaj przeszkód ruszając się
// ═══════════════════════════════════════

var _agCal={x:0,y:0,z:0},_agLane=1,_agState='stand',_agObstacles=[],_agActive=false;
var _agInt=null,_agSpawnInt=null,_agRound=0,_agTotal=0,_agResults=[],_agCoins=0;
var _agCooldown=0,_agLastMove=0;
var _agBuf={x:[0,0,0],y:[0,0,0],z:[0,0,0],i:0}; // rolling average buffer

function _agCfg(lv){
  var cfgs=[
    {interval:4000,speed:4000,count:8,types:['barrier'],coins:false,narrow:true},
    {interval:3500,speed:3500,count:10,types:['barrier'],coins:true,narrow:true},
    {interval:3000,speed:3000,count:10,types:['barrier','beam'],coins:true,narrow:true},
    {interval:2500,speed:2500,count:12,types:['barrier','beam'],coins:true},
    {interval:2200,speed:2200,count:12,types:['barrier','beam','pit'],coins:true},
    {interval:1800,speed:1300,count:16,types:['barrier','beam','pit'],coins:true},
    {interval:1500,speed:1200,count:16,types:['barrier','beam','pit','combo'],coins:true},
    {interval:1300,speed:1100,count:18,types:['barrier','beam','pit','combo'],coins:true},
    {interval:1200,speed:1000,count:18,types:['barrier','beam','pit','combo'],coins:true},
    {interval:1000,speed:900,count:20,types:['barrier','beam','pit','combo'],coins:true}
  ];
  return lv<=cfgs.length?cfgs[lv-1]:cfgs[cfgs.length-1];
}

// ── Kalibracja ──
function _calibrateAgility(cb){
  var ma=el('motion-active'); ma.style.overflow='hidden';
  _lockGestures();
  requestMotionPermission(function(ok){
    if(!ok){ _unlockGestures(); alert('Akcelerometr niedostępny'); return; }
    var handler=function(e){ var a=e.accelerationIncludingGravity; if(a){ _motionState.ax=a.x||0; _motionState.ay=a.y||0; _motionState.az=a.z||0; } };
    window.addEventListener('devicemotion',handler);
    ma.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">'
      +'<div style="text-align:center;max-width:320px;">'
      +'<div style="font-size:64px;margin-bottom:8px;">🧍📱</div>'
      +'<div style="font-size:20px;font-weight:900;color:#f2f2f2;margin-bottom:8px;">Przygotuj się</div>'
      +'<div style="font-size:14px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:16px;">Stań prosto. Trzymaj telefon oburącz przed sobą, na wysokości klatki piersiowej.</div>'
      +'<div id="ag-cal-timer" style="font-size:36px;font-weight:900;color:#52C97B;">3</div>'
      +'<div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:4px;">Stój nieruchomo...</div>'
      +'</div></div>';
    var samples=[],n=3;
    var calInt=setInterval(function(){
      samples.push({x:_motionState.ax,y:_motionState.ay,z:_motionState.az});
    },50);
    var countdown=setInterval(function(){
      n--;
      var te=document.getElementById('ag-cal-timer');
      if(te) te.textContent=n>0?n:'✅';
      if(n<=0){
        clearInterval(countdown); clearInterval(calInt);
        if(samples.length>0){
          _agCal.x=samples.reduce(function(s,v){return s+v.x;},0)/samples.length;
          _agCal.y=samples.reduce(function(s,v){return s+v.y;},0)/samples.length;
          _agCal.z=samples.reduce(function(s,v){return s+v.z;},0)/samples.length;
        }
        _motionHandler=handler;
        setTimeout(cb,500);
      }
    },1000);
  });
}

// ── Start Level ──
function _startAgilityLevel(lv){
  if(_motionAbort) return;
  _gameLevel=lv; _agLane=1; _agState='stand'; _agObstacles=[]; _agRound=0; _agCoins=0;
  _agActive=true; _lockGestures();
  var cfg=_agCfg(lv);
  _agTotal=cfg.count;
  _trialIdx=0; _trialTotal=cfg.count;
  _agResults=[];
  var ma=el('motion-active'); ma.style.overflow='hidden'; ma.style.touchAction='none';
  _renderAgility(ma,cfg,lv);
}

function _renderAgility(ma,cfg,lv){
  var W=window.innerWidth;
  var lanes=[Math.round(W*0.2),Math.round(W*0.5),Math.round(W*0.8)];
  // Tor
  var html=_mHUD();
  // Lane lines
  html+='<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">';
  for(var i=0;i<3;i++) html+='<div style="position:absolute;left:'+lanes[i]+'px;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.04);"></div>';
  // Road lines (moving)
  html+='<div id="ag-road" style="position:absolute;inset:0;"></div>';
  html+='</div>';
  // Obstacle container
  html+='<div id="ag-obs" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;"></div>';
  // Player
  html+='<div id="ag-player" style="position:absolute;bottom:80px;left:'+lanes[_agLane]+'px;transform:translateX(-50%);width:44px;height:44px;border-radius:50%;background:rgba(82,201,123,0.2);border:3px solid #52C97B;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(82,201,123,0.3);transition:left 0.2s ease-out,transform 0.3s;z-index:10;font-size:20px;">🏃</div>';
  // Timer
  html+='<div id="ag-timer" style="position:fixed;bottom:40px;left:50%;transform:translateX(-50%);z-index:15;font-size:20px;font-weight:800;color:rgba(255,255,255,0.6);">0/'+cfg.count+'</div>';
  ma.innerHTML=html;
  // Spawn obstacles
  _agRound=0;
  _agSpawnInt=setInterval(function(){
    if(!_agActive||_motionAbort) return;
    if(_agRound>=cfg.count){ clearInterval(_agSpawnInt); return; }
    _spawnObstacle(ma,cfg,lv,lanes);
    _agRound++; _trialIdx=_agRound;
    var te=document.getElementById('ag-timer'); if(te) te.textContent=_agRound+'/'+cfg.count;
  },cfg.interval);
  // Game loop - check collisions + read accelerometer
  _agInt=setInterval(function(){
    if(!_agActive||_motionAbort){ clearInterval(_agInt); return; }
    _readAgilityInput(lanes);
    _checkCollisions(ma,lanes,cfg,lv);
  },50);
}

function _spawnObstacle(ma,cfg,lv,lanes){
  var cont=document.getElementById('ag-obs'); if(!cont) return;
  var types=cfg.types;
  var type=types[Math.floor(Math.random()*types.length)];
  var W=window.innerWidth;
  // Generate obstacle
  var obs={type:type,y:-30,lane:-1,width:0,el:null};
  var div=document.createElement('div');
  if(type==='barrier'){
    var freeLane=Math.floor(Math.random()*3);
    var x1,x2;
    if(cfg.narrow){
      // Narrow: block only 1 lane
      var blockedLane=([0,1,2].filter(function(l){return l!==freeLane;}))[Math.floor(Math.random()*2)];
      x1=lanes[blockedLane]-Math.round(W*0.15); x2=lanes[blockedLane]+Math.round(W*0.15);
      obs.freeLanes=[0,1,2].filter(function(l){return l!==blockedLane;}); obs.freeLane=obs.freeLanes[0];
    } else {
      var blockedLanes=[0,1,2].filter(function(l){return l!==freeLane;});
      x1=Math.min(lanes[blockedLanes[0]],lanes[blockedLanes[1]])-30;
      x2=Math.max(lanes[blockedLanes[0]],lanes[blockedLanes[1]])+30;
    }
    div.style.cssText='position:absolute;top:-30px;left:'+x1+'px;width:'+(x2-x1)+'px;height:16px;background:rgba(226,75,74,0.6);border:2px solid #E24B4A;border-radius:4px;box-shadow:0 0 8px rgba(226,75,74,0.2);transition:top linear;';
    obs.freeLane=freeLane; obs.action='shuffle';
  } else if(type==='beam'){
    div.style.cssText='position:absolute;top:-30px;left:10px;right:10px;height:12px;background:rgba(212,168,67,0.6);border:2px solid #D4A843;border-radius:4px;';
    div.innerHTML='<div style="font-size:9px;font-weight:800;color:#D4A843;text-align:center;margin-top:-14px;">SCHYL SIĘ</div>';
    obs.action='duck';
  } else if(type==='pit'){
    var pitLane=Math.floor(Math.random()*3);
    div.style.cssText='position:absolute;top:-30px;left:'+(lanes[pitLane]-30)+'px;width:60px;height:20px;background:rgba(168,85,247,0.3);border:2px dashed #a855f7;border-radius:4px;';
    div.innerHTML='<div style="font-size:9px;font-weight:800;color:#a855f7;text-align:center;margin-top:-14px;">SKOCZ</div>';
    obs.pitLane=pitLane; obs.action='jump';
  } else { // combo
    var freeLane2=Math.floor(Math.random()*3);
    var x1b=0,x2b=W;
    if(freeLane2===0){ x1b=lanes[1]-30; x2b=lanes[2]+30; }
    else if(freeLane2===2){ x1b=lanes[0]-30; x2b=lanes[1]+30; }
    else { x1b=lanes[0]-30; x2b=lanes[0]+30; }
    div.style.cssText='position:absolute;top:-30px;left:'+x1b+'px;width:'+(x2b-x1b)+'px;height:16px;background:rgba(226,75,74,0.5);border:2px solid #E24B4A;border-radius:4px;';
    obs.freeLane=freeLane2; obs.action='shuffle';
  }
  // Coin
  if(cfg.coins&&Math.random()<0.3){
    var coinLane=Math.floor(Math.random()*3);
    var coin=document.createElement('div');
    coin.className='ag-coin';
    coin.dataset.lane=coinLane;
    coin.style.cssText='position:absolute;top:-50px;left:'+(lanes[coinLane]-10)+'px;width:20px;height:20px;border-radius:50%;background:#D4A843;box-shadow:0 0 8px rgba(212,168,67,0.4);transition:top linear;z-index:5;';
    cont.appendChild(coin);
    setTimeout(function(){
      coin.style.top=(window.innerHeight+20)+'px';
      coin.style.transitionDuration=cfg.speed+'ms';
    },10);
    setTimeout(function(){ coin.remove(); },cfg.speed+100);
  }
  cont.appendChild(div);
  obs.el=div;
  _agObstacles.push(obs);
  // Animate
  setTimeout(function(){
    div.style.top=(window.innerHeight+20)+'px';
    div.style.transitionDuration=cfg.speed+'ms';
  },10);
  // Remove after passing
  setTimeout(function(){
    div.remove();
    var idx=_agObstacles.indexOf(obs);
    if(idx>-1){ if(!obs.hit){ _gameCorrect++; _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo; _gamePoints+=3; _mPtsAnim('+3','var(--green-text)'); _mBeep(600,0.04); _agResults.push({correct:true}); } _agObstacles.splice(idx,1); }
    // Check if done
    if(_agRound>=_agTotal&&_agObstacles.length===0){ _agActive=false; clearInterval(_agInt); clearInterval(_agSpawnInt); _unlockGestures(); setTimeout(function(){ _showLevelComplete(_gameLevel,_agResults); },500); }
  },cfg.speed+100);
}

function _readAgilityInput(lanes){
  // Rolling average (3 samples)
  var bi=_agBuf.i%3;
  _agBuf.x[bi]=_motionState.ax; _agBuf.y[bi]=_motionState.ay; _agBuf.z[bi]=_motionState.az; _agBuf.i++;
  var ax=(_agBuf.x[0]+_agBuf.x[1]+_agBuf.x[2])/3;
  var az=(_agBuf.z[0]+_agBuf.z[1]+_agBuf.z[2])/3;
  if(Date.now()-_agCooldown<600) return;
  var dx=ax-_agCal.x;
  var dz=az-_agCal.z;
  // Noise filter
  if(Math.abs(dx)<1.5&&Math.abs(dz)<1.5) return;
  // Shuffle left
  if(dx<-4.5&&_agLane>0){ _agLane--; _agCooldown=Date.now(); _movePlayer(lanes); }
  // Shuffle right
  if(dx>4.5&&_agLane<2){ _agLane++; _agCooldown=Date.now(); _movePlayer(lanes); }
  // Jump
  if(dz>5.5&&_agState!=='jump'){ _agState='jump'; _agCooldown=Date.now(); _animJump(); setTimeout(function(){ _agState='stand'; },600); }
  // Duck
  if(dz<-4.0&&_agState!=='duck'){ _agState='duck'; _agCooldown=Date.now(); _animDuck(); setTimeout(function(){ _agState='stand'; _animStand(); },800); }
}

function _movePlayer(lanes){
  var p=document.getElementById('ag-player'); if(!p) return;
  p.style.left=lanes[_agLane]+'px';
}
function _animJump(){
  var p=document.getElementById('ag-player'); if(!p) return;
  p.style.transform='translateX(-50%) translateY(-30px) scale(1.1)';
  setTimeout(function(){ p.style.transform='translateX(-50%)'; },400);
}
function _animDuck(){
  var p=document.getElementById('ag-player'); if(!p) return;
  p.style.transform='translateX(-50%) scaleY(0.6) translateY(10px)';
  p.style.borderColor='#D4A843';
}
function _animStand(){
  var p=document.getElementById('ag-player'); if(!p) return;
  p.style.transform='translateX(-50%)';
  p.style.borderColor='#52C97B';
}

function _checkCollisions(ma,lanes,cfg,lv){
  var pH=window.innerHeight-80; // player Y
  var pX=lanes[_agLane];
  _agObstacles.forEach(function(obs){
    if(obs.hit) return;
    var rect=obs.el.getBoundingClientRect();
    if(rect.bottom<pH-22||rect.top>pH+44) return; // not at player height
    var collides=false;
    if(obs.action==='shuffle'){
      var safe=obs.freeLanes?obs.freeLanes.indexOf(_agLane)!==-1:_agLane===obs.freeLane;
      if(!safe) collides=true;
    } else if(obs.action==='duck'){
      if(_agState!=='duck') collides=true;
    } else if(obs.action==='jump'){
      if(_agState!=='jump'&&_agLane===obs.pitLane) collides=true;
    }
    if(collides){
      obs.hit=true;
      _gameLives--; setTimeout(_flashLives,50); _gamePoints-=1; _gameCombo=0;
      _mPtsAnim('-1 💥','#E24B4A'); _mBeep(200,0.1);
      if(navigator.vibrate) navigator.vibrate(200);
      ma.style.background='rgba(226,75,74,0.15)'; setTimeout(function(){ ma.style.background='#060606'; },200);
      var p=document.getElementById('ag-player');
      if(p){ p.style.borderColor='#E24B4A'; setTimeout(function(){ p.style.borderColor='#52C97B'; },500); }
      _agResults.push({correct:false});
      if(_gameLives<=0){ _agActive=false; clearInterval(_agInt); clearInterval(_agSpawnInt); _unlockGestures(); setTimeout(function(){ _showGameOver(); },500); }
    }
  });
  // Check coins
  var coins=ma.querySelectorAll('.ag-coin');
  coins.forEach(function(c){
    var cr=c.getBoundingClientRect();
    if(cr.bottom<pH-10||cr.top>pH+44) return;
    if(parseInt(c.dataset.lane)===_agLane){
      _gamePoints+=3; _agCoins++; _mPtsAnim('+3 🪙','#D4A843'); _mBeep(800,0.04); setTimeout(function(){_mBeep(1000,0.04);},40);
      c.style.transform='scale(1.5)'; c.style.opacity='0';
      setTimeout(function(){ c.remove(); },300);
    }
  });
  // Sync HUD
  var pe=document.getElementById('m-pts'); if(pe){ pe.textContent='⚡ '+_gamePoints; pe.style.color=_gamePoints<0?'#E24B4A':'var(--accent)'; }
}

// ── Modals ──
function openAgilityInfo(){
  _motionModalWrap('agility-info-modal','🏃 Agility - O module',
    '<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:14px;">Moduł Agility rozwija zdolność szybkiej zmiany kierunku (COD), reaktywność i koordynację ruchową. Tu musisz się RUSZAĆ. Naprawdę.</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:14px;">📱 Trzymaj telefon oburącz przed sobą. Akcelerometr mierzy Twoje ruchy: shuffle boczny, skok, przysiad.</div>'
    +'<div style="font-size:12px;color:#d97706;margin-bottom:14px;">⚠️ Upewnij się, że masz min. 2m × 2m miejsca. Zdejmij buty na śliskiej powierzchni.</div>'
    +'<div style="background:rgba(82,201,123,.04);border-radius:10px;padding:10px;margin-top:12px;"><div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.4);">🧠 Ciekawi Cię nauka? Sprawdź sekcję nerdową w module ⚡ Czas Reakcji!</div></div>'
  );
}
function openAgilityGameInfo(){
  _motionModalWrap('agility-game-info','🏃 Agility Dash - Jak grać?',
    '<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">📋 ZASADY</div>'
    +'<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:12px;">Przeszkody jadą na Ciebie. Unikaj ich ruszając się:<br>⬅️➡️ Shuffle - przesuń się w bok (barierki)<br>⬇️ Schyl się - telefon w dół (belki)<br>⬆️ Skocz - wyskocz (dołki)<br>🟡 Monety - bądź na właściwym pasie</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">⚡ PUNKTY</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.8;margin-bottom:12px;">Uniknięcie: +3 pkt | Moneta: +3 pkt | Zderzenie: -1 pkt + ❤️</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">📈 PROGRESJA</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;">Lv.1-2: Tylko shuffle lewo/prawo<br>Lv.3-4: Belki (schyl się)<br>Lv.5-6: Dołki (skocz)<br>Lv.7+: Combo, szybciej</div>'
  );
}
