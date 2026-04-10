// ═══════════════════════════════════════
//  GAMIFIKACJA — punkty, poziomy, streak, awatar
//  Klucz localStorage: axs_gamification
// ═══════════════════════════════════════

var gamificationData={};
function loadGamification(){
  try{ gamificationData=JSON.parse(localStorage.getItem('axs_gamification')||'{}'); }catch(e){ gamificationData={}; }
  // Auto-korekta poziomów po zmianie tabeli rang
  var changed=false;
  Object.keys(gamificationData).forEach(function(name){
    var gp=gamificationData[name]; if(!gp) return;
    var rank=getRank(gp.totalPoints||0);
    if(gp.level!==rank.level){ gp.level=rank.level; changed=true; }
  });
  if(changed) saveGamification();
}
function saveGamification(){ localStorage.setItem('axs_gamification',JSON.stringify(gamificationData)); }

function getGamProfile(name){
  if(!gamificationData[name]) gamificationData[name]={totalPoints:0,level:1,avatar:'',avatarName:'',avatarMotto:'',weeklyStreak:0,bestStreak:0,lastTrainingWeek:'',badges:[],history:[]};
  return gamificationData[name];
}

// ── Tabela rang ──
var RANK_TABLE=[
  {level:1,points:0,name:'Nowicjusz',color:'#9ca3af',emoji:'🌱',desc:'Każda legenda zaczynała od pierwszego powtórzenia. Chodź, rozgrzewka czeka.'},
  {level:2,points:200,name:'Debiutant',color:'#6b7280',emoji:'🌿',desc:'Zakwasy to dowód, że mięśnie wiedzą, że istniejesz. Brawo.'},
  {level:3,points:500,name:'Początkujący',color:'#22c55e',emoji:'🍀',desc:'Trening to już nawyk, nie kara. Tak trzymaj.'},
  {level:5,points:1000,name:'Regularny',color:'#4ade80',emoji:'💧',desc:'Konsekwencja bije talent. A Ty jesteś konsekwentny.'},
  {level:7,points:2000,name:'Adept',color:'#eab308',emoji:'💪',desc:'Zaczynasz czuć różnicę. Inni zaczynają ją widzieć.'},
  {level:10,points:4000,name:'Wojownik',color:'#7c3aed',emoji:'⚔️',desc:'Nie trenujesz bo musisz. Trenujesz bo to część tego kim jesteś.'},
  {level:13,points:7000,name:'Weteran',color:'#9333ea',emoji:'🛡️',desc:'Rok za rokiem, seria za serią. Twoja dyscyplina jest inspiracją.'},
  {level:16,points:12000,name:'Gladiator',color:'#d97706',emoji:'🏛️',desc:'Arena jest Twoja. Każdy trening to kolejna walka — i kolejne zwycięstwo.'},
  {level:20,points:20000,name:'Spartanin',color:'#ea580c',emoji:'🔥',desc:'Nie znasz słowa "odpuszczam". Twoje ciało jest Twoją twierdzą.'},
  {level:25,points:35000,name:'Mistrz',color:'#dc2626',emoji:'👑',desc:'Lata treningu. Tysiące powtórzeń. Jesteś dowodem na to, że się da.'},
  {level:30,points:55000,name:'Legenda',color:'#eab308',emoji:'⭐',desc:'Twoje imię jest synonimem determinacji. Elevate Your Game — i innych.'},
  {level:40,points:85000,name:'Titan',color:'#f59e0b',emoji:'🏔️',desc:'Góry się nie przesuwają. Ale Ty owszem. Od lat.'},
  {level:50,points:130000,name:'Bóg Olimpu',color:'#fbbf24',emoji:'🏆',desc:'Jeśli ktoś mówi że to niemożliwe — pokaż mu swój profil. Elevate Your Game. ⚡'}
];
function getRank(pts){ var r=RANK_TABLE[0]; for(var i=RANK_TABLE.length-1;i>=0;i--){ if(pts>=RANK_TABLE[i].points){ r=RANK_TABLE[i]; break; } } return r; }
function getNextRank(pts){ for(var i=0;i<RANK_TABLE.length;i++){ if(pts<RANK_TABLE[i].points) return RANK_TABLE[i]; } return null; }

// ── Awatary ──
var AVATAR_EMOJIS=['🦁','🐺','🦅','🐻','🦈','🐆','🦊','🦉','🐗','🦬','🦍','🐉','🦥','🐢','🦎','🦇','🥊','🥷','🧙','🦸','🧛','👸','🤴','🎅','👨‍🚀','🕵️','🦹','🏋️','🧗','🏃','🤸','🏊','⚽','🥋','🏆','⚡','🔱','👑','💎','🗡️','🛡️','🔥','⭐','💪','🎯'];
var AVATAR_NAMES=['Wilk','Niedźwiedź','Orzeł','Rekin','Pantera','Byk','Lis','Sowa','Tygrys','Feniks','Kobra','Jastrząb','Spartanin','Gladiator','Wiking','Samuraj','Ninja','Berserker','Centurion','Rycerz','Rocky','Rambo','Thor','Maximus','Achilles','Leonidas','Conan','Ivan Drago','Terminator','Neo','Herkules','Atlas','Tytan','Zeus','Ares','Kolos','Aleksander','Cezar','Maszyna','Diesel','Torpedo','Młot','Granit','Krzemień','Dynamit','Iskra'];
var AVATAR_MOTTOS=['Nie chodzi o to jak mocno uderzasz. Chodzi o to ile uderzeń wytrzymasz.','Każdy powtórzenie się liczy.','Silniejszy niż wczoraj.','Ból jest tymczasowy. Duma jest wieczna.','Nie ma drogi na skróty.','Wchodzimy w ten dzień jak dzik w maliny.','Cisza przed burzą... mięśniową.','Dziś trenujemy. Jutro zwyciężamy.','Zero wymówek. Sto procent zaangażowania.','Pot to tłuszcz, który płacze.','Gravity is just a suggestion.','Nie liczy się start. Liczy się to, że nie przestajesz.','Pokaż na co cię stać.','Dyscyplina bije motywację.','Trening to inwestycja w siebie.'];

function randomizeAvatar(name){
  loadGamification(); var gp=getGamProfile(name);
  gp.avatar=AVATAR_EMOJIS[Math.floor(Math.random()*AVATAR_EMOJIS.length)];
  gp.avatarName=AVATAR_NAMES[Math.floor(Math.random()*AVATAR_NAMES.length)];
  gp.avatarMotto=AVATAR_MOTTOS[Math.floor(Math.random()*AVATAR_MOTTOS.length)];
  saveGamification();
}

// ── Przyznawanie punktów ──
function addPoints(athleteName,source,points,desc){
  if(!athleteName||points===0) return;
  loadGamification(); var gp=getGamProfile(athleteName);
  var oldLevel=gp.level;
  gp.totalPoints=Math.max(0,gp.totalPoints+points);
  var rank=getRank(gp.totalPoints); gp.level=rank.level;
  gp.history.unshift({date:new Date().toISOString(),source:source,points:points,desc:desc});
  if(gp.history.length>100) gp.history.length=100;
  saveGamification();
  if(points>0&&gp.level>oldLevel) showLevelUp(athleteName,rank);
}

// ── Streak tygodniowy ──
function getISOWeek(date){
  var d=new Date(date); d.setHours(0,0,0,0);
  d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  var w1=new Date(d.getFullYear(),0,4);
  return d.getFullYear()+'-W'+String(1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7)).padStart(2,'0');
}
function mondayOfISOWeek(iw){
  var p=iw.split('-W'); var y=parseInt(p[0]); var w=parseInt(p[1]);
  var j4=new Date(y,0,4); var dow=j4.getDay()||7;
  var mon=new Date(j4); mon.setDate(j4.getDate()-dow+1+(w-1)*7);
  return mon.getTime();
}
function updateWeeklyStreak(athleteName){
  if(!athleteName) return; loadGamification();
  var gp=getGamProfile(athleteName);
  var cw=getISOWeek(new Date());
  if(gp.lastTrainingWeek===cw){ saveGamification(); return; }
  var lm=gp.lastTrainingWeek?mondayOfISOWeek(gp.lastTrainingWeek):null;
  var tm=mondayOfISOWeek(cw);
  if(lm&&(tm-lm)===7*86400000){
    gp.weeklyStreak++; if(gp.weeklyStreak>gp.bestStreak) gp.bestStreak=gp.weeklyStreak;
    addPoints(athleteName,'streak',gp.weeklyStreak*5,'Streak: '+gp.weeklyStreak+'. tydzień z rzędu');
  } else if(!lm||(tm-lm)>7*86400000){ gp.weeklyStreak=1; }
  gp.lastTrainingWeek=cw; saveGamification();
}

// ── Animacja awansu ──
function showLevelUp(athleteName,rank){
  var ov=document.createElement('div'); ov.id='levelup-modal';
  ov.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;';
  var box=document.createElement('div');
  box.style.cssText='text-align:center;background:var(--s1);border:3px solid '+rank.color+';border-radius:20px;padding:28px 24px;max-width:320px;width:calc(100% - 40px);transform:scale(0.8);transition:transform .3s ease-out;';
  box.innerHTML='<div style="font-size:56px;margin-bottom:8px;">'+rank.emoji+'</div>'
    +'<div style="font-size:22px;font-weight:900;color:'+rank.color+';margin-bottom:4px;">⚡ AWANS!</div>'
    +'<div style="font-size:16px;font-weight:700;color:var(--text);">'+rank.name+' • Poziom '+rank.level+'</div>'
    +(rank.desc?'<div style="font-size:13px;font-weight:500;font-style:italic;color:var(--muted);line-height:1.5;margin-top:10px;max-width:280px;margin-left:auto;margin-right:auto;">'+rank.desc+'</div>':'')
    +'<div style="font-size:11px;font-weight:800;color:var(--accent);margin-top:12px;">Elevate Your Game ⚡</div>';
  ov.appendChild(box); document.body.appendChild(ov);
  requestAnimationFrame(function(){ ov.style.opacity='1'; box.style.transform='scale(1)'; });
  launchConfetti();
  function close(){ ov.style.opacity='0'; setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); },300); }
  ov.addEventListener('click',close); setTimeout(close,3000);
}

// ── Widget gamifikacji w profilu zawodnika ──
function buildGamificationWidget(athleteName){
  loadGamification(); var gp=getGamProfile(athleteName);
  var rank=getRank(gp.totalPoints); var next=getNextRank(gp.totalPoints);
  var pct=next?Math.min(100,Math.round((gp.totalPoints-rank.points)/(next.points-rank.points)*100)):100;
  var ptsText=next?gp.totalPoints+' / '+next.points+' ATP':'MAX';
  var avatarEmoji=gp.avatar||rank.emoji;
  var n=athleteName.replace(/'/g,"\\'");

  var html='<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">'
    // Awatar
    +'<div onclick="openAvatarModal(\''+n+'\')" style="width:72px;height:72px;border-radius:50%;background:var(--s2);border:3px solid '+rank.color+';display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;flex-shrink:0;">'+avatarEmoji+'</div>'
    +'<div style="flex:1;min-width:0;">'
    +'<div style="font-size:15px;font-weight:800;color:var(--text);">'+(gp.avatarName||'<span style="color:var(--muted);">Wybierz postać...</span>')+'</div>'
    +(gp.avatarMotto?'<div style="font-size:11px;font-style:italic;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+gp.avatarMotto+'</div>':'')
    +'<div style="font-size:11px;font-weight:700;color:'+rank.color+';margin-top:2px;">'+rank.emoji+' '+rank.name+' • Lv.'+gp.level+'</div>'
    +'</div>'
    +'<button onclick="randomizeAvatar(\''+n+'\');var a2=athletes.find(function(x){return x.name===\''+n+'\'});if(a2){var as2=[];try{as2=JSON.parse(localStorage.getItem(\'axs_sessions\')||\'[]\');}catch(e){}renderAthleteProfile(a2,as2);}" title="Losuj awatar" style="width:36px;height:36px;border-radius:50%;background:var(--s2);border:1px solid var(--border2);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">🎲</button>'
    +'</div>';

  // Box PROGRESJA
  html+='<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:12px;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;">'
    +'<span style="font-size:14px;font-weight:800;color:'+rank.color+';">'+rank.emoji+' '+rank.name+'</span>'
    +'<span style="font-size:12px;font-weight:700;color:var(--muted);">Poziom '+gp.level+'</span></div>'
    +'<div style="margin:8px 0;"><div style="font-size:10px;color:var(--muted);margin-bottom:2px;">'+ptsText+'</div>'
    +'<div style="width:100%;height:6px;background:var(--s2);border-radius:3px;"><div style="width:'+pct+'%;height:6px;background:'+rank.color+';border-radius:3px;transition:width .3s;"></div></div></div>'
    +'<div style="display:flex;gap:16px;margin-top:8px;">'
    +'<span style="font-size:12px;font-weight:700;color:var(--text);">'+(gp.weeklyStreak>0?'🔥 '+gp.weeklyStreak+'. tydzień z rzędu':'<span style="color:var(--muted);">Brak streaku</span>')+'</span>'
    +'<span style="font-size:11px;color:var(--muted);">🏆 Najlepiej: '+gp.bestStreak+' tyg.</span></div>'
    +'<div style="font-size:11px;color:var(--muted);margin-top:4px;">ATP łącznie: '+gp.totalPoints+'</div>'
    +'<button onclick="openATPInfoModal(\''+n+'\')" style="font-size:10px;font-weight:600;color:var(--muted);background:transparent;border:none;cursor:pointer;text-decoration:underline;margin-top:6px;padding:0;" onmouseover="this.style.color=\'var(--accent)\'" onmouseout="this.style.color=\'var(--muted)\'">⚡ Jak to działa?</button>'
    +'</div>';
  return html;
}

// ── Modal "Jak to działa?" ──
function openATPInfoModal(athleteName){
  loadGamification(); var gp=getGamProfile(athleteName);
  var curRank=getRank(gp.totalPoints);
  var existing=document.getElementById('atp-info-modal'); if(existing) existing.remove();
  var modal=document.createElement('div'); modal.id='atp-info-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var h='<div style="max-width:400px;width:calc(100% - 32px);background:var(--s1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:20px;max-height:80vh;overflow-y:auto;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
    +'<div style="font-size:17px;font-weight:900;color:var(--accent);">⚡ ATP — Twoje źródło mocy</div>'
    +'<button onclick="document.getElementById(\'atp-info-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:var(--muted);width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<div style="font-size:13px;font-weight:500;line-height:1.6;color:var(--text);margin:12px 0;">ATP to główne źródło energii w Twoich mięśniach. Im więcej trenujesz, tym więcej ATP produkujesz.</div>'
    +'<div style="font-size:14px;font-weight:800;color:var(--accent);text-align:center;margin:12px 0;padding:10px;background:var(--accent-bg);border-radius:var(--r);">Więcej ATP = więcej mocy. Elevate Your Game! ⚡</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-top:14px;margin-bottom:6px;">Jak zdobywać ATP</div>'
    +'<div style="font-size:12px;font-weight:500;line-height:1.8;color:var(--text);">'
    +'💪 Każdy trening → +ATP<br>'
    +'📋 Sesja z planu → +ATP<br>'
    +'🧪 Wykonany test → +ATP<br>'
    +'🔥 Regularny trening co tydzień → bonus ATP<br>'
    +'📝 Notatka treningowa → +ATP</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-top:14px;margin-bottom:6px;">Rangi</div>';
  RANK_TABLE.forEach(function(r,ri){
    var isCurrent=r.level===curRank.level;
    h+='<div style="padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="var d=this.querySelector(\'.rank-desc\');if(d)d.style.display=d.style.display===\'none\'?\'block\':\'none\';">'
      +'<div style="display:flex;align-items:center;gap:8px;">'
      +'<span style="font-size:20px;">'+r.emoji+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:'+r.color+';">'+r.name+'</div>'
      +(r.desc?'<div style="font-size:10px;font-style:italic;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+r.desc+'</div>':'')+'</div>'
      +'<span style="font-size:10px;color:var(--dim);">'+r.points+'</span>'
      +(isCurrent?'<span style="font-size:9px;font-weight:800;color:var(--accent);background:var(--accent-bg);border-radius:10px;padding:2px 8px;flex-shrink:0;">← Tu</span>':'')
      +'</div>'
      +(r.desc?'<div class="rank-desc" style="display:none;font-size:11px;font-style:italic;color:var(--muted);line-height:1.4;padding:4px 0 2px 28px;">'+r.desc+'</div>':'')
      +'</div>';
  });
  h+='<div style="font-size:11px;font-style:italic;color:var(--muted);margin-top:8px;">🏆 Osiągnij szczyt. Elevate Your Game!</div>'
    +'<button onclick="document.getElementById(\'atp-info-modal\').remove()" style="width:100%;padding:10px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r);cursor:pointer;font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;color:var(--text);margin-top:12px;">Zamknij</button>'
    +'</div>';
  var box=document.createElement('div'); box.innerHTML=h;
  modal.appendChild(box.firstChild); document.body.appendChild(modal);
}

// ── Modal edycji awatara ──
function openAvatarModal(athleteName){
  loadGamification(); var gp=getGamProfile(athleteName);
  var existing=document.getElementById('avatar-modal'); if(existing) existing.remove();
  var modal=document.createElement('div'); modal.id='avatar-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var selectedEmoji=gp.avatar||'';
  var box=document.createElement('div');
  box.style.cssText='max-width:420px;width:calc(100% - 32px);background:var(--s1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:18px;max-height:80vh;overflow-y:auto;';
  function render(){
    var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
      +'<div style="font-size:15px;font-weight:800;color:var(--text);">Twój awatar</div>'
      +'<button onclick="document.getElementById(\'avatar-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:var(--muted);width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
      +'<div id="av-grid" style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;">';
    AVATAR_EMOJIS.forEach(function(em){
      var sel=em===selectedEmoji;
      h+='<button data-em="'+em+'" style="width:44px;height:44px;font-size:24px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:'+(sel?'var(--accent-bg)':'var(--s2)')+';border:2px solid '+(sel?'var(--accent)':'transparent')+';cursor:pointer;">'+em+'</button>';
    });
    h+='</div>'
      +'<input id="av-name" type="text" value="'+(gp.avatarName||'').replace(/"/g,'&quot;')+'" placeholder="np. Rocky, Wilk, Gladiator..." maxlength="20" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;outline:none;margin:8px 0;box-sizing:border-box;"/>'
      +'<input id="av-motto" type="text" value="'+(gp.avatarMotto||'').replace(/"/g,'&quot;')+'" placeholder="Twoje motto..." maxlength="80" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;outline:none;margin:4px 0;box-sizing:border-box;"/>'
      +'<button id="av-random" style="width:100%;padding:10px;background:transparent;border:1.5px dashed var(--border2);border-radius:12px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);margin:8px 0;">🎲 Losuj wszystko</button>'
      +'<button id="av-save" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;margin-top:10px;">💾 Zapisz</button>';
    box.innerHTML=h;
    // Bind emoji grid
    box.querySelectorAll('[data-em]').forEach(function(btn){ btn.onclick=function(){ selectedEmoji=btn.getAttribute('data-em'); render(); }; });
    // Bind random
    document.getElementById('av-random').onclick=function(){
      selectedEmoji=AVATAR_EMOJIS[Math.floor(Math.random()*AVATAR_EMOJIS.length)];
      document.getElementById('av-name').value=AVATAR_NAMES[Math.floor(Math.random()*AVATAR_NAMES.length)];
      document.getElementById('av-motto').value=AVATAR_MOTTOS[Math.floor(Math.random()*AVATAR_MOTTOS.length)];
      render();
    };
    // Bind save
    document.getElementById('av-save').onclick=function(){
      loadGamification(); var gp2=getGamProfile(athleteName);
      gp2.avatar=selectedEmoji; gp2.avatarName=(document.getElementById('av-name').value||'').trim();
      gp2.avatarMotto=(document.getElementById('av-motto').value||'').trim();
      saveGamification(); modal.remove();
      // Przerenderuj profil
      loadCRM(); var a=athletes.find(function(x){ return x.name===athleteName; });
      if(a){ var as=[]; try{ as=JSON.parse(localStorage.getItem('axs_sessions')||'[]'); }catch(e){} renderAthleteProfile(a,as); }
    };
  }
  render();
  modal.appendChild(box); document.body.appendChild(modal);
}

// Init
loadGamification();
