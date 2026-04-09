// ═══════════════════════════════════════
//  SEARCH GAMES - Pary, Kolejność, Słowa
//  Korzysta z globalnych: _motionMode, _gamePoints, _gameLives, _gameLevel, etc.
// ═══════════════════════════════════════

var _searchTimeouts=0; // licznik timeoutów z rzędu

// ── Timeout per level ──
function _searchTimeout(lv){
  if(lv<=2) return 20; if(lv<=4) return 30; if(lv<=6) return 40; if(lv<=8) return 50; return 60;
}

// ── Max-width przycisków per kolumny ──
function _cellMaxW(cols){ if(cols<=2) return 100; if(cols<=3) return 80; if(cols<=4) return 70; return 56; }

// ── Centered grid style ──
function _gridStyle(cols){
  return 'position:absolute;top:calc(50% + 30px);left:50%;transform:translate(-50%,-50%);display:grid;grid-template-columns:repeat('+cols+',1fr);gap:6px;place-items:center;max-width:90%;max-height:calc(100vh - 200px);width:fit-content;';
}

// ── Styl komórki ──
function _cellStyle(cols,fs){
  return 'aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);border-radius:12px;font-size:'+fs+'px;font-weight:800;color:#f2f2f2;cursor:pointer;transition:all .15s;user-select:none;-webkit-user-select:none;min-width:44px;max-width:'+_cellMaxW(cols)+'px;width:100%;';
}

// ── Konfiguracja Pary ──
function _pairsCfg(lv){
  var cfgs=[
    {cols:2,rows:2,pairs:1,chars:'123456789',fs:36,rounds:5},
    {cols:3,rows:2,pairs:1,chars:'123456789',fs:32,rounds:5},
    {cols:3,rows:3,pairs:1,chars:'123456789',fs:28,rounds:5},
    {cols:4,rows:3,pairs:1,chars:'123456789ABCDEF',fs:24,rounds:6},
    {cols:4,rows:4,pairs:2,chars:'123456789ABCDEF',fs:22,rounds:6},
    {cols:4,rows:4,pairs:3,chars:'123456789ABCDEF',fs:22,rounds:6},
    {cols:5,rows:4,pairs:3,chars:'123456789ABCDEFGH',fs:20,rounds:7},
    {cols:5,rows:5,pairs:3,chars:'123456789ABCDEFGH',fs:18,rounds:7},
    {cols:5,rows:5,pairs:3,chars:'1234567891234567',fs:18,rounds:7},
    {cols:6,rows:5,pairs:4,chars:'123456789ABCDEFGHIJK',fs:16,rounds:8}
  ];
  return lv<=cfgs.length?cfgs[lv-1]:cfgs[cfgs.length-1];
}

// ── Konfiguracja Kolejność ──
function _seqCfg(lv){
  var cfgs=[
    {cols:2,rows:2,n:4,rounds:5,hide:0,reshuffle:0},
    {cols:3,rows:2,n:6,rounds:5,hide:0,reshuffle:0},
    {cols:3,rows:3,n:9,rounds:5,hide:0,reshuffle:0},
    {cols:4,rows:3,n:12,rounds:6,hide:0,reshuffle:0},
    {cols:4,rows:4,n:16,rounds:6,hide:0,reshuffle:0,vanish:true},
    {cols:4,rows:4,n:16,rounds:6,hide:3000,reshuffle:0},
    {cols:5,rows:4,n:20,rounds:7,hide:2000,reshuffle:0},
    {cols:5,rows:4,n:20,rounds:7,hide:0,reshuffle:5},
    {cols:5,rows:5,n:25,rounds:7,hide:0,reshuffle:4},
    {cols:5,rows:5,n:25,rounds:8,hide:2000,reshuffle:3},
    {cols:6,rows:5,n:30,rounds:8,hide:0,reshuffle:2}
  ];
  return lv<=cfgs.length?cfgs[lv-1]:cfgs[cfgs.length-1];
}

// ── Punktowanie - realistyczne progi ──
function _searchPts(ms,mode,lv){
  lv=lv||_gameLevel;
  if(mode==='pairs'){
    if(lv<=2){ if(ms<2000) return 5; if(ms<4000) return 4; if(ms<6000) return 3; if(ms<10000) return 2; return 1; }
    if(lv<=4){ if(ms<4000) return 5; if(ms<7000) return 4; if(ms<11000) return 3; if(ms<16000) return 2; return 1; }
    if(lv<=6){ if(ms<6000) return 5; if(ms<10000) return 4; if(ms<15000) return 3; if(ms<22000) return 2; return 1; }
    if(lv<=8){ if(ms<8000) return 5; if(ms<14000) return 4; if(ms<20000) return 3; if(ms<30000) return 2; return 1; }
    if(ms<10000) return 5; if(ms<18000) return 4; if(ms<28000) return 3; if(ms<40000) return 2; return 1;
  }
  if(mode==='sequence'){
    if(lv<=2){ if(ms<4000) return 5; if(ms<7000) return 4; if(ms<11000) return 3; if(ms<16000) return 2; return 1; }
    if(lv<=4){ if(ms<8000) return 5; if(ms<14000) return 4; if(ms<20000) return 3; if(ms<30000) return 2; return 1; }
    if(lv<=6){ if(ms<12000) return 5; if(ms<20000) return 4; if(ms<30000) return 3; if(ms<45000) return 2; return 1; }
    if(ms<15000) return 5; if(ms<25000) return 4; if(ms<40000) return 3; if(ms<60000) return 2; return 1;
  }
  if(mode==='words'){
    if(lv<=2){ if(ms<4000) return 5; if(ms<7000) return 4; if(ms<11000) return 3; if(ms<16000) return 2; return 1; }
    if(lv<=4){ if(ms<6000) return 5; if(ms<10000) return 4; if(ms<16000) return 3; if(ms<24000) return 2; return 1; }
    if(ms<10000) return 5; if(ms<16000) return 4; if(ms<24000) return 3; if(ms<35000) return 2; return 1;
  }
  return 1;
}

// ── Dźwięki ──
function _sndMatch(){ _mBeep(800,0.05); setTimeout(function(){_mBeep(1000,0.05);},60); setTimeout(function(){_mBeep(1200,0.06);},120); }
function _sndMiss(){ _mBeep(300,0.12); }
function _sndShuffle(){ _mBeep(400,0.03); setTimeout(function(){_mBeep(500,0.03);},30); setTimeout(function(){_mBeep(600,0.03);},60); }

// ── Start Search Level ──
function _startSearchLevel(lv){
  if(_motionAbort) return;
  _gameLevel=lv; _searchTimeouts=0;
  if(_motionMode==='pairs') _runPairsLevel(lv,0,[]);
  else if(_motionMode==='sequence') _runSeqLevel(lv,0,[]);
  else if(_motionMode==='words') _runWordsLevel(lv,0,[]);
}

// ══════════════════════════════════════
//  PARY
// ══════════════════════════════════════
function _runPairsLevel(lv,round,results){
  var cfg=_pairsCfg(lv);
  if(_motionAbort||_gameLives<=0){ _showGameOver(); return; }
  if(round>=cfg.rounds){ _showLevelComplete(lv,results); return; }
  _trialIdx=round; _trialTotal=cfg.rounds;
  var total=cfg.cols*cfg.rows;
  var chars=cfg.chars.split('');
  var pairChars=[];
  for(var p=0;p<cfg.pairs;p++){
    var ch=chars[Math.floor(Math.random()*chars.length)];
    var att=0; while(pairChars.indexOf(ch)!==-1&&att<50){ ch=chars[Math.floor(Math.random()*chars.length)]; att++; }
    pairChars.push(ch);
  }
  var positions=[]; for(var i=0;i<total;i++) positions.push(i);
  for(var i2=positions.length-1;i2>0;i2--){ var j=Math.floor(Math.random()*(i2+1)); var tmp=positions[i2]; positions[i2]=positions[j]; positions[j]=tmp; }
  var board=new Array(total);
  pairChars.forEach(function(ch){ var p1=positions.pop(),p2=positions.pop(); board[p1]=ch; board[p2]=ch; });
  var usedChars=pairChars.slice();
  for(var i3=0;i3<total;i3++){
    if(board[i3]===undefined){
      var rc=chars[Math.floor(Math.random()*chars.length)];
      var at2=0; while(usedChars.indexOf(rc)!==-1&&at2<50){ rc=chars[Math.floor(Math.random()*chars.length)]; at2++; }
      board[i3]=rc; usedChars.push(rc);
    }
  }
  var ma=el('motion-active'); ma.style.overflow='hidden';
  var selected=null, foundPairs=0, startTime=Date.now();
  var gridHtml='<div style="'+_gridStyle(cfg.cols)+'">';
  for(var g=0;g<total;g++){
    gridHtml+='<div class="search-cell" data-idx="'+g+'" data-val="'+board[g]+'" style="'+_cellStyle(cfg.cols,cfg.fs)+'">'+board[g]+'</div>';
  }
  gridHtml+='</div>';
  ma.innerHTML=_mHUD()+gridHtml;
  var timeoutSec=_searchTimeout(lv);
  var tout=setTimeout(function(){
    _searchTimeouts++;
    _mPtsAnim('⏱️ Czas!','#d97706');
    if(_searchTimeouts>=3){ _gameLives--; setTimeout(_flashLives,50); _searchTimeouts=0; _mPtsAnim('❤️ -1','var(--red-text)'); }
    results.push({time:timeoutSec*1000,correct:false,type:'timeout'});
    setTimeout(function(){ _runPairsLevel(lv,round+1,results); },800);
  },timeoutSec*1000);
  ma.onclick=function(e){
    var cell=e.target.closest('.search-cell');
    if(!cell||cell.style.opacity==='0') return;
    var idx=parseInt(cell.dataset.idx);
    if(selected===null){
      selected=idx;
      cell.style.borderColor='#3b82f6'; cell.style.background='rgba(59,130,246,.1)'; cell.style.transform='scale(1.05)';
    } else if(selected===idx){
      cell.style.borderColor='rgba(255,255,255,.1)'; cell.style.background='rgba(255,255,255,.06)'; cell.style.transform='';
      selected=null;
    } else {
      var selCell=ma.querySelector('.search-cell[data-idx="'+selected+'"]');
      if(board[selected]===board[idx]){
        foundPairs++; _searchTimeouts=0;
        _gameCorrect++; _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
        cell.style.background='#4ade80'; cell.style.borderColor='#4ade80'; cell.style.transform='scale(1.2)';
        if(selCell){ selCell.style.background='#4ade80'; selCell.style.borderColor='#4ade80'; selCell.style.transform='scale(1.2)'; }
        _sndMatch();
        setTimeout(function(){ cell.style.opacity='0'; cell.style.transform='scale(0)'; if(selCell){ selCell.style.opacity='0'; selCell.style.transform='scale(0)'; } },300);
        if(foundPairs>=cfg.pairs){
          clearTimeout(tout);
          var t=Date.now()-startTime;
          _gameTimes.push(t); _gameLastTime=t;
          var pts=_searchPts(t,'pairs',lv);
          var mult=_gameCombo>=10?4:_gameCombo>=5?3:_gameCombo>=3?2:1;
          var earned=pts*mult; _gamePoints+=earned;
          _mPtsAnim('+'+earned+' ⚡','var(--green-text)');
          _gameTotalTrials++;
          results.push({time:t,correct:true,type:'hit'});
          setTimeout(function(){ _runPairsLevel(lv,round+1,results); },800);
        }
        selected=null;
      } else {
        _gameCombo=0; _gamePoints-=1;
        _sndMiss(); _mPtsAnim('-1 ✕','var(--red-text)');
        cell.style.background='rgba(248,113,113,.3)'; cell.style.borderColor='#f87171';
        if(selCell){ selCell.style.background='rgba(248,113,113,.3)'; selCell.style.borderColor='#f87171'; }
        if(navigator.vibrate) navigator.vibrate(100);
        setTimeout(function(){
          cell.style.background='rgba(255,255,255,.06)'; cell.style.borderColor='rgba(255,255,255,.1)'; cell.style.transform='';
          if(selCell){ selCell.style.background='rgba(255,255,255,.06)'; selCell.style.borderColor='rgba(255,255,255,.1)'; selCell.style.transform=''; }
        },300);
        selected=null;
      }
    }
  };
}

// ══════════════════════════════════════
//  KOLEJNOŚĆ
// ══════════════════════════════════════
function _runSeqLevel(lv,round,results){
  var cfg=_seqCfg(lv);
  if(_motionAbort||_gameLives<=0){ _showGameOver(); return; }
  if(round>=cfg.rounds){ _showLevelComplete(lv,results); return; }
  _trialIdx=round; _trialTotal=cfg.rounds;
  var n=cfg.n, total=cfg.cols*cfg.rows;
  var positions=[]; for(var i=0;i<total;i++) positions.push(i);
  for(var i2=positions.length-1;i2>0;i2--){ var j=Math.floor(Math.random()*(i2+1)); var tmp=positions[i2]; positions[i2]=positions[j]; positions[j]=tmp; }
  var board=new Array(total);
  for(var k=0;k<n;k++) board[positions[k]]=k+1;
  var ma=el('motion-active'); ma.style.overflow='hidden';
  var nextExpected=1, startTime=Date.now(), clicks=0;
  var fs=n<=9?28:n<=16?22:n<=25?18:16;
  function renderGrid(){
    var gridHtml='<div id="seq-grid" style="'+_gridStyle(cfg.cols)+'">';
    for(var g=0;g<total;g++){
      var val=board[g];
      if(val===undefined){ gridHtml+='<div style="aspect-ratio:1;min-width:44px;max-width:'+_cellMaxW(cfg.cols)+'px;width:100%;"></div>'; continue; }
      var done=val<nextExpected;
      var hidden=cfg.hide>0&&!done;
      gridHtml+='<div class="seq-cell'+(done?' done':'')+'" data-idx="'+g+'" data-val="'+val+'" style="'+_cellStyle(cfg.cols,fs)+'background:'+(done?'rgba(74,222,128,.15)':'rgba(255,255,255,.06)')+';border-color:'+(done?'#4ade80':'rgba(255,255,255,.1)')+';color:'+(done?'#4ade80':'#f2f2f2')+';cursor:'+(done?'default':'pointer')+';">'+(done?'✓':(hidden?'':val))+'</div>';
    }
    gridHtml+='</div>';
    ma.innerHTML=_mHUD()+gridHtml;
    if(cfg.hide>0){
      setTimeout(function(){ var cells=ma.querySelectorAll('.seq-cell:not(.done)'); cells.forEach(function(c){ c.textContent=''; }); },cfg.hide);
    }
  }
  renderGrid();
  var timeoutSec=_searchTimeout(lv);
  var tout=setTimeout(function(){
    _searchTimeouts++;
    _mPtsAnim('⏱️ Czas!','#d97706');
    if(_searchTimeouts>=3){ _gameLives--; setTimeout(_flashLives,50); _searchTimeouts=0; _mPtsAnim('❤️ -1','var(--red-text)'); }
    results.push({time:timeoutSec*1000,correct:false,type:'timeout'});
    setTimeout(function(){ _runSeqLevel(lv,round+1,results); },800);
  },timeoutSec*1000);
  ma.onclick=function(e){
    var cell=e.target.closest('.seq-cell');
    if(!cell||cell.classList.contains('done')) return;
    var val=parseInt(cell.dataset.val);
    clicks++;
    if(val===nextExpected){
      nextExpected++;
      cell.classList.add('done');
      cell.style.background='rgba(74,222,128,.15)'; cell.style.borderColor='#4ade80'; cell.style.color='#4ade80';
      cell.textContent='✓'; _sndGood();
      if(cfg.vanish){ cell.style.transition='all .2s'; cell.style.opacity='0.3'; }
      if(cfg.reshuffle>0&&clicks%cfg.reshuffle===0&&nextExpected<=n){
        _sndShuffle();
        var cells=ma.querySelectorAll('.seq-cell:not(.done)');
        cells.forEach(function(c){ c.style.transform='scale(0)'; });
        setTimeout(function(){
          var undoneVals=[],undoneIdxs=[];
          for(var i=0;i<total;i++){ if(board[i]!==undefined&&board[i]>=nextExpected){ undoneVals.push(board[i]); undoneIdxs.push(i); } }
          for(var s=undoneIdxs.length-1;s>0;s--){ var r=Math.floor(Math.random()*(s+1)); var t2=undoneIdxs[s]; undoneIdxs[s]=undoneIdxs[r]; undoneIdxs[r]=t2; }
          var newBoard=board.slice();
          for(var u=0;u<undoneIdxs.length;u++) newBoard[undoneIdxs[u]]=undefined;
          for(var v=0;v<undoneVals.length;v++) newBoard[undoneIdxs[v]]=undoneVals[v];
          board=newBoard; renderGrid();
        },150);
      }
      if(nextExpected>n){
        clearTimeout(tout); _searchTimeouts=0;
        var t=Date.now()-startTime;
        _gameTimes.push(t); _gameLastTime=t; _gameCorrect++; _gameTotalTrials++;
        _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
        var pts=_searchPts(t,'sequence',lv);
        var mult=_gameCombo>=10?4:_gameCombo>=5?3:_gameCombo>=3?2:1;
        var earned=pts*mult; _gamePoints+=earned;
        _sndMatch(); _mPtsAnim('+'+earned+' ⚡','var(--green-text)');
        results.push({time:t,correct:true,type:'hit'});
        setTimeout(function(){ _runSeqLevel(lv,round+1,results); },800);
      }
    } else {
      _gameCombo=0; _gamePoints-=1;
      _sndMiss(); _mPtsAnim('-1 ✕','var(--red-text)');
      cell.style.background='rgba(248,113,113,.3)'; cell.style.borderColor='#f87171';
      if(navigator.vibrate) navigator.vibrate(100);
      setTimeout(function(){ cell.style.background='rgba(255,255,255,.06)'; cell.style.borderColor='rgba(255,255,255,.1)'; },300);
    }
  };
}

// ══════════════════════════════════════
//  SŁOWA
// ══════════════════════════════════════
var _WORDS_EASY=['RUN','FIT','GYM','REP','SET','ABS','LEG','ARM','HIP','ROW'];
var _WORDS_MED=['SILA','SKOK','BIEG','FORMA','TEMPO','DIETA','ODDECH','TRENING','MIESIEN','CIALO'];
var _WORDS_HARD=['PRZYSIAD','MARATON','MOTYWACJA','DYSCYPLINA','REGENERACJA'];

function _wordsCfg(lv){
  var cfgs=[
    {size:5,words:2,pool:_WORDS_EASY,hint:true,diag:false,rounds:3},
    {size:5,words:3,pool:_WORDS_EASY,hint:false,diag:false,rounds:3},
    {size:6,words:3,pool:_WORDS_MED,hint:false,diag:false,rounds:4},
    {size:7,words:4,pool:_WORDS_MED,hint:false,diag:false,rounds:4},
    {size:8,words:4,pool:_WORDS_MED.concat(_WORDS_HARD),hint:false,diag:true,rounds:5}
  ];
  return lv<=cfgs.length?cfgs[lv-1]:cfgs[cfgs.length-1];
}

function _runWordsLevel(lv,round,results){
  var cfg=_wordsCfg(lv);
  if(_motionAbort||_gameLives<=0){ _showGameOver(); return; }
  if(round>=cfg.rounds){ _showLevelComplete(lv,results); return; }
  _trialIdx=round; _trialTotal=cfg.rounds;
  var size=cfg.size;
  var grid=[]; for(var r=0;r<size;r++){ grid[r]=[]; for(var c=0;c<size;c++) grid[r][c]=''; }
  var pool=cfg.pool.slice(); var words=[];
  for(var w=0;w<cfg.words&&pool.length>0;w++){ var idx=Math.floor(Math.random()*pool.length); words.push(pool.splice(idx,1)[0]); }
  var wordPositions=[];
  words.forEach(function(word){
    var placed=false, attempts=0;
    while(!placed&&attempts<100){
      attempts++;
      var dirs=[[0,1],[1,0]]; if(cfg.diag) dirs.push([1,1]);
      var dir=dirs[Math.floor(Math.random()*dirs.length)];
      var maxR=size-word.length*dir[0], maxC=size-word.length*dir[1];
      if(maxR<0||maxC<0) continue;
      var sr=Math.floor(Math.random()*(maxR+1)), sc=Math.floor(Math.random()*(maxC+1));
      var ok=true;
      for(var i=0;i<word.length;i++){ var gr=sr+i*dir[0],gc=sc+i*dir[1]; if(grid[gr][gc]!==''&&grid[gr][gc]!==word[i]){ ok=false; break; } }
      if(ok){ var pos=[]; for(var j=0;j<word.length;j++){ var pr=sr+j*dir[0],pc=sc+j*dir[1]; grid[pr][pc]=word[j]; pos.push({r:pr,c:pc}); } wordPositions.push({word:word,pos:pos}); placed=true; }
    }
  });
  var alpha='ABCDEFGHIJKLMNOPRSTUWYZ';
  for(var r2=0;r2<size;r2++) for(var c2=0;c2<size;c2++) if(grid[r2][c2]==='') grid[r2][c2]=alpha[Math.floor(Math.random()*alpha.length)];
  var ma=el('motion-active'); ma.style.overflow='hidden';
  var found=[], startTime=Date.now();
  var wordListHtml='<div style="position:fixed;top:56px;left:50%;transform:translateX(-50%);width:calc(100% - 80px);max-width:340px;z-index:15;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">';
  words.forEach(function(w,i){ wordListHtml+='<span id="wl-'+i+'" style="font-size:11px;font-weight:700;color:rgba(255,255,255,.6);background:rgba(255,255,255,.06);padding:3px 8px;border-radius:8px;">'+w+'</span>'; });
  wordListHtml+='</div>';
  var wFs=size<=5?20:size<=6?18:16;
  var gridHtml='<div style="'+_gridStyle(size)+'">';
  for(var r3=0;r3<size;r3++) for(var c3=0;c3<size;c3++){
    var isHint=cfg.hint&&wordPositions.length>0&&wordPositions[0].pos[0].r===r3&&wordPositions[0].pos[0].c===c3;
    gridHtml+='<div class="word-cell" data-r="'+r3+'" data-c="'+c3+'" style="'+_cellStyle(size,wFs)+'background:'+(isHint?'rgba(59,130,246,.15)':'rgba(255,255,255,.06)')+';border-color:'+(isHint?'rgba(59,130,246,.3)':'rgba(255,255,255,.08)')+';">'+grid[r3][c3]+'</div>';
  }
  gridHtml+='</div>';
  ma.innerHTML=_mHUD()+wordListHtml+gridHtml;
  var timeoutSec=_searchTimeout(lv);
  var tout=setTimeout(function(){
    _searchTimeouts++;
    _mPtsAnim('⏱️ Czas!','#d97706');
    if(_searchTimeouts>=3){ _gameLives--; setTimeout(_flashLives,50); _searchTimeouts=0; }
    results.push({time:timeoutSec*1000,correct:false,type:'timeout'});
    setTimeout(function(){ _runWordsLevel(lv,round+1,results); },800);
  },timeoutSec*1000);
  var selStart=null;
  ma.onclick=function(e){
    var cell=e.target.closest('.word-cell');
    if(!cell) return;
    var r=parseInt(cell.dataset.r), c=parseInt(cell.dataset.c);
    if(!selStart){
      selStart={r:r,c:c};
      cell.style.borderColor='#3b82f6'; cell.style.background='rgba(59,130,246,.15)';
    } else {
      var dr=r-selStart.r, dc=c-selStart.c;
      var len=Math.max(Math.abs(dr),Math.abs(dc))+1;
      if(len<2||(dr!==0&&dc!==0&&Math.abs(dr)!==Math.abs(dc))){ resetSel(); return; }
      var stepR=dr===0?0:(dr>0?1:-1), stepC=dc===0?0:(dc>0?1:-1);
      var letters='', cells2=[];
      for(var i=0;i<len;i++){ var cr2=selStart.r+i*stepR,cc2=selStart.c+i*stepC; letters+=grid[cr2][cc2]; cells2.push(ma.querySelector('.word-cell[data-r="'+cr2+'"][data-c="'+cc2+'"]')); }
      var matchIdx=-1, lettersRev=letters.split('').reverse().join('');
      for(var w2=0;w2<words.length;w2++){ if(found.indexOf(w2)===-1&&(letters===words[w2]||lettersRev===words[w2])){ matchIdx=w2; break; } }
      if(matchIdx>=0){
        found.push(matchIdx); _searchTimeouts=0;
        cells2.forEach(function(c2){ if(c2){ c2.style.background='rgba(74,222,128,.15)'; c2.style.borderColor='#4ade80'; c2.style.color='#4ade80'; } });
        var wl=document.getElementById('wl-'+matchIdx);
        if(wl){ wl.style.textDecoration='line-through'; wl.style.color='#4ade80'; }
        _sndMatch(); _gameCorrect++;
        _gameCombo++; if(_gameCombo>_gameMaxCombo) _gameMaxCombo=_gameCombo;
        if(found.length>=words.length){
          clearTimeout(tout);
          var t=Date.now()-startTime;
          _gameTimes.push(t); _gameLastTime=t; _gameTotalTrials++;
          var pts=_searchPts(t,'words',lv); _gamePoints+=pts;
          _mPtsAnim('+'+pts+' ⚡','var(--green-text)');
          results.push({time:t,correct:true,type:'hit'});
          setTimeout(function(){ _runWordsLevel(lv,round+1,results); },800);
        }
      } else {
        _sndMiss(); _gamePoints-=1; _gameCombo=0;
        _mPtsAnim('-1 ✕','var(--red-text)');
        cells2.forEach(function(c2){ if(c2){ c2.style.background='rgba(248,113,113,.2)'; c2.style.borderColor='#f87171'; } });
        setTimeout(function(){ cells2.forEach(function(c2){ if(c2){ c2.style.background='rgba(255,255,255,.06)'; c2.style.borderColor='rgba(255,255,255,.08)'; } }); },300);
      }
      selStart=null; resetSel();
    }
    function resetSel(){
      selStart=null;
      ma.querySelectorAll('.word-cell').forEach(function(c2){
        if(c2.style.color!=='rgb(74, 222, 128)'){ c2.style.borderColor='rgba(255,255,255,.08)'; c2.style.background='rgba(255,255,255,.06)'; }
      });
    }
  };
}

// ── Modal info Wyszukiwanie ──
function openSearchInfo(){
  var existing=document.getElementById('search-info-modal'); if(existing) existing.remove();
  var modal=document.createElement('div'); modal.id='search-info-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var h='<div style="max-width:420px;width:calc(100% - 32px);background-color:#1a1a1a !important;color:#f2f2f2 !important;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:20px;max-height:80vh;overflow-y:auto;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:900;color:#f2f2f2;">🔍 Wyszukiwanie - Jak grać?</div><button onclick="document.getElementById(\'search-info-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:rgba(255,255,255,.5);width:32px;height:32px;">✕</button></div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:4px;">📋 TRYBY</div>'
    +'<div style="font-size:13px;color:#f2f2f2;line-height:1.6;margin-bottom:12px;"><strong>🔢 Pary</strong> - znajdź dwie takie same cyfry<br><strong>📊 Kolejność</strong> - klikaj cyfry od 1 do N po kolei<br><strong>📝 Słowa</strong> - znajdź ukryte słowa</div>'
    +'<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin:12px 0;">'
    +'<div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#3b82f6;margin-bottom:10px;">📈 PROGRESJA</div>'
    +'<div style="font-size:12px;font-weight:500;color:rgba(255,255,255,.6);line-height:2;">'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Każdy level = większa siatka, więcej elementów.</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Pary: od 4 pól do 30. Więcej par do znalezienia.</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);margin-bottom:4px;">Kolejność: od 4 do 30 cyfr. Na wyższych levelach cyfry ZNIKAJĄ i ZMIENIAJĄ POZYCJE!</div>'
    +'<div style="padding-left:8px;border-left:2px solid rgba(59,130,246,.2);">Słowa: od 3 do 12+ liter. Mogą być po przekątnej!</div>'
    +'</div></div>'
    +'<div style="font-size:11px;color:rgba(255,255,255,.4);margin:8px 0;">⏱️ Timeout = 0 pkt (bez kary). Życie tracisz dopiero za 3 timeouty z rzędu.</div>'
    +'<button onclick="var nd=document.getElementById(\'search-nerd\');nd.style.display=nd.style.display===\'none\'?\'block\':\'none\';" style="font-size:11px;font-weight:700;color:rgba(255,255,255,.35);background:transparent;border:none;cursor:pointer;text-decoration:underline;padding:8px 0;width:100%;text-align:center;">🤓 Chcesz wiedzieć więcej?</button>'
    +'<div id="search-nerd" style="display:none;background:rgba(59,130,246,.04);border-radius:12px;padding:16px;margin-top:8px;font-size:12px;font-weight:500;line-height:1.7;color:#f2f2f2;">'
    +'<p style="margin-bottom:10px;">Wyszukiwanie wzrokowe to fundamentalna funkcja poznawcza. Trail Making Test (TMT) opracowany przez Reitana (1958) jest do dziś standardem w neuropsychologii.</p>'
    +'<p style="margin-bottom:10px;">Trening wyszukiwania wzrokowego przenosi się na codzienne funkcjonowanie - szybsze skanowanie otoczenia, lepsze dostrzeganie szczegółów.</p>'
    +'<div style="font-size:10px;color:rgba(255,255,255,.35);">📚 <a href="https://pubmed.ncbi.nlm.nih.gov/13601598/" target="_blank" style="color:#3b82f6;text-decoration:underline;">Reitan RM (1958). Validity of the Trail Making Test.</a></div>'
    +'</div>'
    +'<button onclick="document.getElementById(\'search-info-modal\').remove()" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:14px;font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;margin-top:10px;">Rozumiem! 💪</button></div>';
  var box=document.createElement('div'); box.innerHTML=h; modal.appendChild(box.firstChild);
  document.body.appendChild(modal);
}
