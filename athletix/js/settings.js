// ══ SETTINGS SAVE/LOAD (cts_v5 key) ══
var _saveTimer=null;
function queueSave(){ clearTimeout(_saveTimer); _saveTimer=setTimeout(saveLS,400); }
function saveLS(){
  try{ localStorage.setItem('cts_v5',JSON.stringify({
    snd:snd,
    t:{dn:sDn,up:sUp,rp:sRp,pa:+el('sl-pa').value,rs:+el('sl-rs').value,gr:+el('sl-gr').value},
    rc:{sub:rcSubMode,tm:rcTimeMode,rcT:JSON.parse(JSON.stringify(rcT)),opts:JSON.parse(JSON.stringify(rcOpts)),colors:Array.from(selColors),arrows:Array.from(selArrows),sess:rcT.sess,sessCust:sessCustVal,bal:JSON.parse(JSON.stringify(balCfg))},
    int:{sub:intSubMode,emom:intVals.emom,work:intVals.work,rest:intVals.rest,rounds:intVals.rounds}
  })); }catch(e){}
}
function loadLS(){
  try{ var raw=localStorage.getItem('cts_v5'); if(!raw) return; var s=JSON.parse(raw);
    if(s.snd) setSnd(s.snd);
    if(s.t){ if(s.t.dn!=null){ customVals.dn=s.t.dn; applyCustom('dn'); } if(s.t.up!=null){ customVals.up=s.t.up; applyCustom('up'); } if(s.t.rp!=null){ customVals.rp=s.t.rp; applyCustom('rp'); } if(s.t.pa!=null){ el('sl-pa').value=s.t.pa; syncV('pa',s.t.pa); } if(s.t.rs!=null){ el('sl-rs').value=s.t.rs; syncV('rs',s.t.rs); } if(s.t.gr!=null){ el('sl-gr').value=s.t.gr; syncV('gr',s.t.gr); } }
    if(s.rc){ if(s.rc.sub) setRcSub(s.rc.sub); if(s.rc.tm) setTimeMode(s.rc.tm); if(s.rc.rcT) Object.assign(rcT,s.rc.rcT); rcDisp();
      if(s.rc.opts){ if(s.rc.opts.norepeat&&!rcOpts.norepeat) toggleOpt('norepeat'); if(s.rc.opts.base&&!rcOpts.base) toggleOpt('base'); }
      if(s.rc.colors&&s.rc.colors.length){ selColors=new Set(s.rc.colors); el('color-grid').querySelectorAll('.color-swatch').forEach(function(sw){ var hex=sw.getAttribute('data-hex'); sw.classList.toggle('sel',hex&&selColors.has(hex)); }); }
      if(s.rc.arrows&&s.rc.arrows.length){ selArrows=new Set(s.rc.arrows); el('arrow-grid').querySelectorAll('.arrow-sel-btn:not(.empty)').forEach(function(btn){ btn.classList.toggle('sel',selArrows.has(btn.textContent)); }); }
      if(s.rc.sessCust!=null) sessCustVal=s.rc.sessCust;
      if(s.rc.bal){ var _savedPat=s.rc.bal.pattern; s.rc.bal.pattern='constant'; Object.assign(balCfg,s.rc.bal); setBalDir(balCfg.dir); setBalSize(balCfg.size); balCfg.pattern='constant'; setBalSpeed(balCfg.speed); setBalPattern(_savedPat||'constant'); }
    }
    if(s.int){ if(s.int.sub) setIntSub(s.int.sub);
      if(s.int.emom!=null){ intVals.emom=s.int.emom; customVals.emom=s.int.emom; el('vl-emom-min').textContent=s.int.emom; el('cv-emom').textContent=s.int.emom; el('c-emom').querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===s.int.emom?'chip on-purple':'chip'; }); }
      if(s.int.work!=null){ intVals.work=s.int.work; el('vl-work').textContent=fmtSec(s.int.work); if(el('sel-work')) el('sel-work').value=s.int.work; syncIntChips('c-work',s.int.work,'green'); }
      if(s.int.rest!=null){ intVals.rest=s.int.rest; el('vl-rest-int').textContent=fmtSec(s.int.rest); if(el('sel-rest')) el('sel-rest').value=s.int.rest; syncIntChips('c-rest-int',s.int.rest,'red'); }
      if(s.int.rounds!=null){ intVals.rounds=s.int.rounds; customVals.rounds=s.int.rounds; el('vl-rounds').textContent=s.int.rounds; el('cv-rounds').textContent=s.int.rounds; el('c-rounds').querySelectorAll('.chip').forEach(function(ch){ ch.className=parseInt(ch.textContent)===s.int.rounds?'chip on-blue':'chip'; }); }
    }
  }catch(e){ console.log('loadLS error:',e); }
}
window.addEventListener('pagehide',saveLS); window.addEventListener('beforeunload',saveLS);

// Hook queueSave
var _oSS=setSnd; setSnd=function(m){ _oSS(m); queueSave(); };
var _oSV=syncV; syncV=function(k,v){ _oSV(k,v); queueSave(); };
var _oAC=applyCustom; applyCustom=function(k){ _oAC(k); queueSave(); };
var _oRD=rcDisp; rcDisp=function(){ _oRD(); queueSave(); };
var _oTO=toggleOpt; toggleOpt=function(k){ _oTO(k); queueSave(); };
var _oRS=setRcSub; setRcSub=function(m){ _oRS(m); queueSave(); };
var _oTM=setTimeMode; setTimeMode=function(m){ _oTM(m); queueSave(); };
var _oIS=setIntSub; setIntSub=function(m){ _oIS(m); queueSave(); };
var _oAP=applyPreset; applyPreset=function(k){ _oAP(k); queueSave(); };
var _oDIA=doIntAdj; doIntAdj=function(k,d){ _oDIA(k,d); queueSave(); };

// Init — load timer settings (always, even offline)
loadLS();

// ── PWA Service Worker ──
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(function(e){ console.log('SW registration failed:',e); });
}
