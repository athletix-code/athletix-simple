// ══════════════════════════════════════
//  MICRO CRM (axs_ prefix)
// ══════════════════════════════════════
var CRM_KEY='axs_athletes';
var SESSION_KEY='axs_sessions';
var GROUPS_KEY='axs_groups';
var TESTS_KEY='axs_tests';
var athletes=[];
var sessions=[];
var teamGroups=[];
var testResults=[];
var sessionAthletes=[];
var activeAthlete=null;
var _expandedAthlete=null;
var _athleteGroupMode={};
var _currentProfileId=null;
var _profileReturnTo='athletes';
var CATEGORIES=['U13','U15','U17','U19','U21','Senior','Masters'];
var DISCIPLINES=['Bieg','Wioślarstwo','Pływanie','Triathlon','Piłka nożna','Koszykówka','Siłownia','Cross-fit','Inne'];

function loadCRM(){ try{ athletes=JSON.parse(localStorage.getItem(CRM_KEY)||'[]'); }catch(e){ athletes=[]; } try{ sessions=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){ sessions=[]; } }
function saveCRM(){ try{ localStorage.setItem(CRM_KEY,JSON.stringify(athletes)); }catch(e){} }
function saveSessions(){ try{ localStorage.setItem(SESSION_KEY,JSON.stringify(sessions)); }catch(e){} }
function loadGroups(){ try{ teamGroups=JSON.parse(localStorage.getItem(GROUPS_KEY)||'[]'); }catch(e){ teamGroups=[]; } }
function saveGroups(){ try{ localStorage.setItem(GROUPS_KEY,JSON.stringify(teamGroups)); }catch(e){} }
function loadTests(){ try{ testResults=JSON.parse(localStorage.getItem(TESTS_KEY)||'[]'); }catch(e){ testResults=[]; } }
function saveTests(){ try{ localStorage.setItem(TESTS_KEY,JSON.stringify(testResults)); }catch(e){} }

// ── TEST LIBRARY ──
var TEST_LIBRARY={
  sila_max:{label:'Siła maksymalna',icon:'🏋️',color:'#ef4444',tests:[
    {name:'Back Squat 1RM',unit:'kg'},{name:'Bench Press 1RM',unit:'kg'},{name:'Deadlift 1RM',unit:'kg'},
    {name:'BB OHP 1RM',unit:'kg'},{name:'Trap-Bar DL 1RM',unit:'kg'},{name:'Pull-Up + obciążenie',unit:'kg'},
    {name:'Back Squat 3RM',unit:'kg'},{name:'Bench Press 3RM',unit:'kg'},{name:'Back Squat 5RM',unit:'kg'},
    {name:'Bench Press 5RM',unit:'kg'},{name:'IMTP VALD',unit:'N'},{name:'Hand Grip',unit:'N'}
  ]},
  wyt_sil:{label:'Wytrzymałość siłowa',icon:'💪',color:'#d97706',tests:[
    {name:'Pull-Up Max Reps',unit:'reps'},{name:'Push-Up Max Reps',unit:'reps'},
    {name:'DB Bench Press 30kg Max Reps',unit:'reps'},{name:'Plank Max',unit:'s'},
    {name:'Wall Sit Max',unit:'s'},{name:'Dead Hang Max',unit:'s'},
    {name:'KB Swing 60s',unit:'reps'},{name:'Burpees 60s',unit:'reps'}
  ]},
  moc:{label:'Moc / Eksplozywność',icon:'⚡',color:'#c2410c',tests:[
    {name:'CMJ',unit:'cm'},{name:'SJ',unit:'cm'},{name:'Skok w dal obunóż',unit:'m'},
    {name:'Drop Jump',unit:'cm'},{name:'Rzut piłką med. oburącz',unit:'m'},
    {name:'Zarzut 1RM',unit:'kg'},{name:'Rwanie 1RM',unit:'kg'},
    {name:'Vmax AirBike',unit:'km/h'},{name:'Vmax Sprint',unit:'km/h'}
  ]},
  wytrzymalosc:{label:'Wytrzymałość',icon:'🫀',color:'#15803d',tests:[
    {name:'30s AirBike',unit:'m'},{name:'60s Wioślarz Concept',unit:'m'},
    {name:'5min AirBike',unit:'km'},{name:'5min Wioślarz',unit:'km'},
    {name:'Beep Test',unit:'poziom'},{name:'VO2max',unit:'ml/kg/min'},
    {name:'Cooper 12min',unit:'m'},{name:'2000m RowErg',unit:'s'},
    {name:'30-15 IFT',unit:'km/h'}
  ]},
  szybkosc:{label:'Szybkość / COD',icon:'🏃',color:'#3b82f6',tests:[
    {name:'Sprint 10m',unit:'s'},{name:'Sprint 20m',unit:'s'},{name:'Sprint 30m',unit:'s'},
    {name:'T-test',unit:'s'},{name:'Illinois',unit:'s'},{name:'5-10-5',unit:'s'}
  ]},
  antropo:{label:'Antropometria',icon:'⚖️',color:'#64748b',tests:[
    {name:'Masa ciała',unit:'kg'},{name:'Wzrost',unit:'cm'},{name:'% tkanki tłuszczowej',unit:'%'},
    {name:'BMI',unit:'kg/m²'}
  ]}
};
var CUSTOM_TESTS_KEY='axs_custom_tests';
function loadCustomTests(){ try{ return JSON.parse(localStorage.getItem(CUSTOM_TESTS_KEY)||'[]'); }catch(e){ return []; } }
function saveCustomTests(arr){ try{ localStorage.setItem(CUSTOM_TESTS_KEY,JSON.stringify(arr)); }catch(e){} }

// ── ATHLETE BAR ──
function setActiveAthlete(name){ activeAthlete=name; renderAthleteBar(); syncFormToActiveAthlete(name); }
function syncFormToActiveAthlete(name){
  if(!name) return;
  var sel=el('note-athlete');
  if(sel){ for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===name){ sel.selectedIndex=i; break; } } }
}
function syncAthleteBarFromForm(name){
  if(!name) return;
  if(sessionAthletes.indexOf(name)>=0) activeAthlete=name;
  else if(sessionAthletes.length<4){ sessionAthletes.push(name); activeAthlete=name; }
  renderAthleteBar();
}
function renderAthleteBar(){
  var bar=el('athlete-bar'); var btns=el('athlete-bar-buttons'); var countEl=el('athlete-bar-count');
  if(!btns) return;
  if(!sessionAthletes.length){ if(bar) bar.style.display='none'; if(countEl) countEl.textContent=''; return; }
  if(bar) bar.style.display='flex'; if(countEl) countEl.textContent=sessionAthletes.length+' os.';
  btns.innerHTML=''; btns.style.flexWrap='wrap';
  sessionAthletes.forEach(function(name){
    var isActive=name===activeAthlete; var parts=name.trim().split(' ');
    var initials=((parts[0]||'')[0]||'').toUpperCase()+((parts[1]||'')[0]||'').toUpperCase();
    var firstName=parts[0]||name; var many=sessionAthletes.length>4;
    var btn=document.createElement('button'); btn.title=name;
    btn.style.cssText='display:flex;align-items:center;gap:'+(many?'4':'7')+'px;padding:3px '+(many?'8':'10')+'px 3px 3px;border-radius:24px;border:2px solid '+(isActive?'#3b82f6':'rgba(255,255,255,.15)')+';background:'+(isActive?'rgba(59,130,246,.2)':'rgba(255,255,255,.04)')+';cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;margin-bottom:4px;';
    var cs=many?'26':'32'; var fs=many?'10':'11';
    btn.innerHTML='<div style="width:'+cs+'px;height:'+cs+'px;border-radius:50%;background:'+(isActive?'#3b82f6':'rgba(255,255,255,.12)')+';display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;font-size:'+fs+'px;font-weight:900;color:'+(isActive?'#fff':'rgba(255,255,255,.45)')+';flex-shrink:0;">'+initials+'</div>'
      +(many?'':'<span style="font-family:Montserrat,sans-serif;font-size:11px;font-weight:'+(isActive?'800':'600')+';color:'+(isActive?'#fff':'rgba(255,255,255,.4)')+';letter-spacing:.04em;-webkit-user-select:none;user-select:none;">'+firstName+'</span>');
    btn.onclick=function(){ setActiveAthlete(name); };
    btns.appendChild(btn);
    // Profile shortcut button
    var profBtn=document.createElement('button');
    profBtn.style.cssText='display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);cursor:pointer;flex-shrink:0;margin-left:-6px;margin-bottom:4px;font-size:10px;color:rgba(255,255,255,.5);';
    profBtn.textContent='👤';
    profBtn.title='Profil '+name;
    (function(n){ profBtn.onclick=function(e){
      e.stopPropagation();
      loadCRM(); var ath=athletes.find(function(x){ return x.name===n; });
      if(ath) openAthleteProfile(ath.id);
    }; })(name);
    btns.appendChild(profBtn);
    // Test results shortcut button
    var testBtn=document.createElement('button');
    testBtn.style.cssText='display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);cursor:pointer;flex-shrink:0;margin-left:-6px;margin-bottom:4px;font-size:10px;color:rgba(255,255,255,.5);';
    testBtn.textContent='📈';
    testBtn.title='Wyniki testów '+name;
    (function(n){ testBtn.onclick=function(e){
      e.stopPropagation();
      loadCRM(); var ath=athletes.find(function(x){ return x.name===n; });
      if(ath){ openAthleteProfile(ath.id); setTimeout(function(){ openTestHistory(n); },200); }
    }; })(name);
    btns.appendChild(testBtn);
  });
}

// ── ATHLETE BAR SELECTOR (MY ATHLETIX TEAM modal) ──
function openAthleteBarSelector(){
  loadCRM(); loadGroups();
  var ov=el('athlete-bar-overlay');
  if(!ov){ ov=document.createElement('div'); ov.id='athlete-bar-overlay'; ov.style.cssText='position:fixed;inset:0;z-index:8000;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;'; document.body.appendChild(ov); }
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:400px;width:100%;padding:18px 16px 20px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:2px;">👥 MY ATHLETI<span style="color:#ef4444;">X</span> TEAM</div>'
    +'<div id="abs-count" style="font-size:11px;color:var(--muted);margin-bottom:12px;">Wybrano: '+sessionAthletes.length+' zawodników</div>'
    +'<div id="abs-groups">'+buildGroupsHtml()+'</div>'
    +'<div id="abs-list">'+buildAthleteList()+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:10px;">'
    +'<button onclick="confirmAthleteBarSelection()" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zatwierdź</button>'
    +'<button onclick="clearAthleteBar()" style="padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;">Wyczyść</button>'
    +'</div></div>';
  ov.style.display='flex';
}
function buildAthleteList(){
  var memberOf={}; teamGroups.forEach(function(g){ g.athletes.forEach(function(name){ if(!memberOf[name]) memberOf[name]=[]; memberOf[name].push(g.name); }); });
  return athletes.map(function(a){
    var sel=sessionAthletes.indexOf(a.name)>=0; var n=a.name.replace(/'/g,"\\'");
    var groups=memberOf[a.name]||[];
    var groupChips=groups.map(function(g){ return '<span style="font-size:9px;font-weight:800;color:#c2410c;background:rgba(194,65,12,.08);border:1px solid rgba(251,146,60,.3);border-radius:20px;padding:1px 7px;">'+g+'</span>'; }).join(' ');
    return '<div style="background:'+(sel?'var(--accent-bg)':'var(--s2)')+';border:2px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:var(--r);margin-bottom:6px;overflow:hidden;">'
      +'<div onclick="toggleSessionAthlete(\''+n+'\')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;">'
      +'<div style="width:22px;height:22px;border-radius:50%;border:2px solid '+(sel?'var(--accent)':'var(--border2)')+';background:'+(sel?'var(--accent)':'transparent')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:900;color:#fff;">'+(sel?'✓':'')+'</div>'
      +'<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><span style="font-size:13px;font-weight:800;color:var(--text);">'+a.name+'</span>'+groupChips+'</div>'
      +(a.notes?'<div style="font-size:11px;color:var(--muted);margin-top:1px;">'+a.notes+'</div>':'')+'</div>'
      +'<button onclick="event.stopPropagation();openAthleteProfile('+a.id+',\'team\')" style="background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);padding:4px 10px;cursor:pointer;font-family:Montserrat,sans-serif;display:flex;flex-direction:column;align-items:center;gap:1px;color:var(--muted);flex-shrink:0;"><span style="font-size:14px;">👤</span><span style="font-size:9px;font-weight:800;letter-spacing:.06em;">PROFIL</span></button>'
      +'</div></div>';
  }).join('')
  +'<div style="border:1px dashed var(--border2);border-radius:var(--r);padding:10px 12px;margin-top:8px;">'
  +'<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">+ Dodaj zawodnika</div>'
  +'<input id="new-ath-name" type="text" placeholder="Imię i nazwisko" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;margin-bottom:6px;box-sizing:border-box;"/>'
  +'<button onclick="addAthleteFromModal()" style="width:100%;padding:9px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;color:var(--text);">Dodaj do listy</button></div>';
}
function buildGroupsHtml(){
  var html='<div style="margin-bottom:12px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);">Grupy</div>'
    +'<button onclick="openCreateGroup()" style="padding:4px 12px;background:transparent;border:1px dashed var(--border2);border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:800;color:var(--accent);">+ Nowa grupa</button>'
    +'</div>';
  if(teamGroups.length){
    html+='<div style="display:flex;flex-direction:column;gap:6px;">';
    teamGroups.forEach(function(g,gi){
      var cnt=g.athletes?g.athletes.length:0;
      html+='<div style="display:flex;align-items:center;gap:8px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:8px 10px;">'
        +'<button onclick="loadGroup('+gi+')" style="flex:1;background:transparent;border:none;cursor:pointer;font-family:Montserrat,sans-serif;text-align:left;padding:0;">'
        +'<div style="font-size:13px;font-weight:800;color:var(--text);">'+g.name+'</div>'
        +'<div style="font-size:10px;color:var(--muted);margin-top:1px;">'+cnt+' zawodnik'+(cnt===1?'':'ów')+(cnt?' · '+g.athletes.join(', '):'')+'</div>'
        +'</button>'
        +'<button onclick="openEditGroup('+gi+')" style="background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);padding:4px 8px;cursor:pointer;font-size:10px;color:var(--muted);">✏️</button>'
        +'<button onclick="deleteGroup('+gi+')" style="background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);padding:4px 8px;cursor:pointer;font-size:10px;color:var(--dim);">✕</button>'
        +'</div>';
    });
    html+='</div>';
  } else {
    html+='<div style="font-size:11px;color:var(--dim);text-align:center;padding:8px;">Brak grup. Utwórz pierwszą.</div>';
  }
  html+='</div>';
  return html;
}
function refreshAthleteModal(){ var list=el('abs-list'); if(list) list.innerHTML=buildAthleteList(); var g=el('abs-groups'); if(g) g.innerHTML=buildGroupsHtml(); var c=el('abs-count'); if(c) c.textContent='Wybrano: '+sessionAthletes.length; }
function toggleSessionAthlete(name){ var idx=sessionAthletes.indexOf(name); if(idx>=0){ sessionAthletes.splice(idx,1); if(activeAthlete===name) activeAthlete=sessionAthletes[0]||null; } else { if(sessionAthletes.length>=12) return; sessionAthletes.push(name); if(!activeAthlete) activeAthlete=name; } loadCRM(); refreshAthleteModal(); }
function loadGroup(gi){ loadGroups(); var g=teamGroups[gi]; if(!g) return; sessionAthletes=g.athletes.slice(); activeAthlete=sessionAthletes[0]||null; loadCRM(); refreshAthleteModal(); }
function openCreateGroup(){
  var ov2=_ensureOverlay();
  ov2.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:360px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:12px;">+ Nowa grupa</div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Nazwa grupy</div>'
    +'<input id="new-group-name" type="text" placeholder="np. Czwartek 17, Piłkarze U19..." style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;box-sizing:border-box;"/></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="create-group-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Utwórz</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov2.style.display='flex';
  setTimeout(function(){ el('new-group-name').focus(); },100);
  document.getElementById('create-group-save').onclick=function(){
    var name=(el('new-group-name').value||'').trim(); if(!name) return;
    _pushUndo('Nowa grupa: '+name);
    loadGroups();
    if(teamGroups.find(function(g){ return g.name===name; })){ el('new-group-name').focus(); return; }
    teamGroups.push({name:name,athletes:[]});
    saveGroups(); ov2.style.display='none';
    var gs=el('abs-groups'); if(gs) gs.innerHTML=buildGroupsHtml();
  };
}

function openEditGroup(gi){
  loadGroups(); loadCRM();
  var g=teamGroups[gi]; if(!g) return;
  var ov2=_ensureOverlay();
  var memberSet={}; g.athletes.forEach(function(n){ memberSet[n]=true; });
  var listHtml=athletes.map(function(a){
    var isMember=!!memberSet[a.name];
    var n=a.name.replace(/'/g,"\\'");
    return '<div onclick="this.querySelector(\'input\').click()" style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:'+(isMember?'var(--accent-bg)':'var(--s2)')+';border:1px solid '+(isMember?'var(--accent)':'var(--border)')+';border-radius:var(--r-xs);cursor:pointer;margin-bottom:4px;">'
      +'<input type="checkbox" data-name="'+n+'" '+(isMember?'checked ':'')+' onclick="event.stopPropagation();" style="width:18px;height:18px;accent-color:var(--accent);cursor:pointer;flex-shrink:0;"/>'
      +'<span style="font-size:13px;font-weight:700;color:var(--text);">'+a.name+'</span>'
      +'</div>';
  }).join('');
  ov2.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:380px;width:100%;padding:22px 18px 24px;max-height:85vh;overflow-y:auto;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:4px;">✏️ '+g.name+'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:12px;">Zaznacz zawodników w grupie</div>'
    +'<div style="margin-bottom:10px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Nazwa grupy</div>'
    +'<input id="edit-group-name" type="text" value="'+g.name+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;box-sizing:border-box;"/></div>'
    +'<div id="edit-group-list">'+listHtml+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:12px;">'
    +'<button id="edit-group-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov2.style.display='flex';
  document.getElementById('edit-group-save').onclick=function(){
    var newName=(el('edit-group-name').value||'').trim()||g.name;
    var checks=document.querySelectorAll('#edit-group-list input[type=checkbox]');
    var members=[];
    checks.forEach(function(cb){ if(cb.checked) members.push(cb.getAttribute('data-name')); });
    _pushUndo('Edycja grupy: '+g.name);
    loadGroups();
    teamGroups[gi].name=newName;
    teamGroups[gi].athletes=members;
    saveGroups(); ov2.style.display='none';
    var gs=el('abs-groups'); if(gs) gs.innerHTML=buildGroupsHtml();
  };
}

function deleteGroup(gi){ if(!confirm('Usunąć grupę?')) return; _pushUndo('Usunięto grupę'); loadGroups(); teamGroups.splice(gi,1); saveGroups(); var gs2=el('abs-groups'); if(gs2) gs2.innerHTML=buildGroupsHtml(); }
function confirmAthleteBarSelection(){ if(!activeAthlete&&sessionAthletes.length) activeAthlete=sessionAthletes[0]; var ov=el('athlete-bar-overlay'); if(ov) ov.style.display='none'; renderAthleteBar(); populateAthleteSelect(); if(activeAthlete) setActiveAthlete(activeAthlete); }
function clearAthleteBar(){ sessionAthletes=[]; activeAthlete=null; var ov=el('athlete-bar-overlay'); if(ov) ov.style.display='none'; renderAthleteBar(); }
function addAthleteFromModal(){ var nameEl=el('new-ath-name'); var name=(nameEl?nameEl.value.trim():''); if(!name) return; loadCRM(); if(athletes.find(function(a){ return a.name===name; })) return; _pushUndo('Dodano: '+name); athletes.push({id:Date.now(),name:name,notes:'',status:'active'}); saveCRM(); if(nameEl) nameEl.value=''; refreshAthleteModal(); populateAthleteSelect(); renderAthleteList(); }

// ── ATHLETE PROFILE ──
function openAthleteProfile(id, returnTo){
  loadCRM(); loadGroups(); loadTests();
  var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){}
  var a=athletes.find(function(x){ return x.id===id||String(x.id)===String(id); }); if(!a) return;
  _currentProfileId=id; _profileReturnTo=returnTo||((_currentMode==='athletes')?'athletes':'athletes');
  var teamOv=el('athlete-bar-overlay'); if(teamOv) teamOv.style.display='none';
  el('athlete-profile-overlay').style.display='block'; el('ap-name-header').textContent='👤 '+a.name;
  renderAthleteProfile(a, allSess);
}
function closeAthleteProfile(){
  el('athlete-profile-overlay').style.display='none'; _currentProfileId=null;
  if(_profileReturnTo==='team') openAthleteBarSelector();
  else { loadCRM(); renderAthleteList(); }
}
function renderAthleteProfile(a, allSess){
  var allSessCached=allSess||[];
  var sessCnt=allSessCached.filter(function(s){ return s.athlete===a.name; }).length;
  var notesCnt=notes.filter(function(n){ return n.athlete===a.name; }).length;
  var lastSess=allSessCached.filter(function(s){ return s.athlete===a.name; }).sort(function(x,y){ return new Date(y.date)-new Date(x.date); })[0];
  var lastSessDate=lastSess?new Date(lastSess.date).toLocaleDateString('pl-PL',{day:'numeric',month:'short'}):'—';
  var exMap={}; allSessCached.filter(function(s){ return s.athlete===a.name&&s.exercise; }).forEach(function(s){ exMap[s.exercise]=(exMap[s.exercise]||0)+1; });
  var topEx=Object.keys(exMap).sort(function(x,y){ return exMap[y]-exMap[x]; })[0]||'—';
  var myGroups=teamGroups.filter(function(g){ return g.athletes.indexOf(a.name)>=0; });
  var tags=a.tags||[];
  var tagHtml=tags.map(function(t,ti){ return '<span class="ap-tag">'+t+'<button class="ap-tag-del" data-ti="'+ti+'" onclick="removeAthleteTag(this.dataset.ti)">×</button></span>'; }).join(' ');
  var catOpts=CATEGORIES.map(function(c){ return '<option value="'+c+'"'+(a.category===c?' selected':'')+'>'+c+'</option>'; }).join('');
  var discOpts=DISCIPLINES.map(function(d){ return '<option value="'+d+'"'+(a.discipline===d?' selected':'')+'>'+d+'</option>'; }).join('');

  el('ap-content').innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:18px;">'
    +'<div class="ap-stat"><div class="ap-stat-val">'+sessCnt+'</div><div class="ap-stat-lbl">Sesji</div></div>'
    +'<div class="ap-stat"><div class="ap-stat-val">'+notesCnt+'</div><div class="ap-stat-lbl">Wpisów</div></div>'
    +'<div class="ap-stat"><div class="ap-stat-val" style="font-size:13px;">'+lastSessDate+'</div><div class="ap-stat-lbl">Ostatnia</div></div></div>'
    +'<div class="ap-stat" style="margin-bottom:18px;text-align:left;padding:10px 12px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:3px;">Najczęstsze ćwiczenie</div>'
    +'<div style="font-size:14px;font-weight:800;color:var(--text);">'+topEx+'</div></div>'
    // Skarbiec
    +_buildWalletSection(a)
    // Dane podstawowe
    +'<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;">Dane zawodnika</div>'
    +'<div style="margin-bottom:8px;"><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Imię i nazwisko</div>'
    +'<input id="ap-name" type="text" value="'+a.name+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;box-sizing:border-box;"/></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Data urodzenia</div>'
    +'<input id="ap-birthdate" type="date" value="'+(a.birthDate||'')+'" style="width:100%;padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;height:36px;max-height:36px;-webkit-appearance:none;appearance:none;"/></div>'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Kategoria</div>'
    +'<select id="ap-category" style="width:100%;padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;height:36px;-webkit-appearance:none;appearance:none;"><option value="">—</option>'+catOpts+'</select></div></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Dyscyplina</div>'
    +'<select id="ap-discipline" style="width:100%;padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;height:36px;-webkit-appearance:none;appearance:none;"><option value="">—</option>'+discOpts+'</select></div>'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Klub</div>'
    +'<input id="ap-club" type="text" value="'+(a.club||'')+'" placeholder="Nazwa klubu" style="width:100%;padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;height:36px;"/></div></div>'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Notatki</div>'
    +'<textarea id="ap-notes" rows="2" placeholder="Dowolne notatki..." style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;resize:vertical;box-sizing:border-box;">'+(a.notes||'')+'</textarea></div>'
    +'<button onclick="saveAthleteProfile()" style="width:100%;margin-top:10px;padding:11px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz dane</button></div>'
    // Tags
    +'<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;">Tagi</div>'
    +'<div id="ap-tags-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">'+tagHtml+(tags.length===0?'<span style="font-size:11px;color:var(--dim);font-style:italic;">Brak tagów</span>':'')+'</div>'
    +'<div style="display:flex;gap:6px;">'
    +'<input id="ap-new-tag" type="text" placeholder="Nowy tag..." onkeydown="if(event.key===\'Enter\'){addAthleteTag();event.preventDefault();}" style="flex:1;padding:7px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;"/>'
    +'<button onclick="addAthleteTag()" style="padding:7px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;color:var(--text);">+ Dodaj</button></div></div>'
    // Groups
    +(teamGroups.length?'<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">Grupki</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'
    +teamGroups.map(function(g){ var isMember=g.athletes.indexOf(a.name)>=0;
      return '<button data-gname="'+g.name+'" data-aname="'+a.name+'" onclick="toggleAthleteInGroupBtn(this)" style="padding:5px 12px;border-radius:20px;border:2px solid '+(isMember?'#c2410c':'var(--border2)')+';background:'+(isMember?'rgba(194,65,12,.08)':'transparent')+';color:'+(isMember?'#c2410c':'var(--muted)')+';font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;cursor:pointer;">'+g.name+(isMember?' ✓':'')+'</button>';
    }).join('')+'</div></div>':'')
    // Test results
    +'<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);">Wyniki testów</div>'
    +'<button data-aname="'+a.name+'" onclick="openTestHistory(this.dataset.aname)" style="background:transparent;border:1px solid var(--border2);border-radius:20px;padding:3px 12px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:800;color:var(--muted);">Historia →</button></div>'
    +buildLatestTestResults(a.name)+'</div>'
    // Plans
    +(typeof buildAthletePlansHtml==='function'?buildAthletePlansHtml(a.name):'')
    // Recent sessions
    +'<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">Ostatnie sesje</div>'
    +allSessCached.filter(function(s){ return s.athlete===a.name; }).sort(function(x,y){ return new Date(y.date)-new Date(x.date); }).slice(0,3).map(function(s){
      var d2=new Date(s.date); var ds=getDayKey(d2);
      var tag=''; if(s.mode==='custom'&&s.params) tag=s.params.rounds+'×'+fmtSec(s.params.work)+'/'+fmtSec(s.params.rest);
      else if(s.mode==='emom'&&s.params) tag='EMOM '+s.params.emom+'min';
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">'
        +'<div><span style="font-weight:700;color:var(--text);">'+(s.exercise||'Interwał')+'</span>'+(tag?' <span style="color:#c2410c;font-weight:800;font-size:11px;">'+tag+'</span>':'')+'</div>'
        +'<span style="color:var(--dim);">'+ds+'</span></div>';
    }).join('')+(sessCnt===0?'<div style="color:var(--dim);font-size:12px;text-align:center;padding:8px;">Brak sesji</div>':'')+'</div>';
}
function saveAthleteProfile(){
  loadCRM(); var a=athletes.find(function(x){ return String(x.id)===String(_currentProfileId); }); if(!a) return;
  _pushUndo('Profil: '+a.name);
  var newName=(el('ap-name').value||'').trim(); var oldName=a.name;
  a.name=newName||a.name; a.birthDate=(el('ap-birthdate')?el('ap-birthdate').value||null:null);
  a.category=el('ap-category').value||null; a.discipline=el('ap-discipline').value||null;
  a.club=(el('ap-club').value||'').trim()||null; a.notes=(el('ap-notes').value||'').trim()||null;
  saveCRM();
  if(newName&&newName!==oldName){ loadGroups(); teamGroups.forEach(function(g){ var i=g.athletes.indexOf(oldName); if(i>=0) g.athletes[i]=newName; }); saveGroups(); }
  el('ap-name-header').textContent='👤 '+a.name;
  var btn=document.querySelector('#ap-content button[onclick*="saveAthleteProfile"]');
  if(btn){ var orig=btn.textContent; btn.textContent='✓ Zapisano!'; btn.style.background='var(--green)'; setTimeout(function(){ btn.textContent=orig; btn.style.background=''; },1400); }
  renderAthleteList(); checkBirthdays();
}
function addAthleteTag(){
  var inp=el('ap-new-tag'); var tag=(inp?inp.value.trim():''); if(!tag) return;
  loadCRM(); var a=athletes.find(function(x){ return String(x.id)===String(_currentProfileId); }); if(!a) return;
  _pushUndo('Tag: +'+tag);
  if(!a.tags) a.tags=[]; if(a.tags.indexOf(tag)<0){ a.tags.push(tag); saveCRM(); }
  if(inp) inp.value='';
  var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a,allSess);
}
function removeAthleteTag(tagIdx){
  loadCRM(); var a=athletes.find(function(x){ return String(x.id)===String(_currentProfileId); }); if(!a||!a.tags) return;
  _pushUndo('Tag: -'+a.tags[parseInt(tagIdx)]);
  a.tags.splice(parseInt(tagIdx),1); saveCRM();
  var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a,allSess);
}
function toggleAthleteInGroupBtn(btn){ toggleAthleteInGroup(btn.dataset.gname,btn.dataset.aname,btn); }
function toggleAthleteInGroup(groupName,athleteName,btn){
  loadGroups(); var g=teamGroups.find(function(x){ return x.name===groupName; }); if(!g) return;
  var idx=g.athletes.indexOf(athleteName);
  if(idx>=0){ g.athletes.splice(idx,1); btn.style.borderColor='var(--border2)'; btn.style.background='transparent'; btn.style.color='var(--muted)'; btn.textContent=groupName; }
  else { g.athletes.push(athleteName); btn.style.borderColor='#c2410c'; btn.style.background='rgba(194,65,12,.08)'; btn.style.color='#c2410c'; btn.textContent=groupName+' ✓'; }
  saveGroups();
}
function buildLatestTestResults(athleteName){
  loadTests(); var byTest={};
  testResults.filter(function(t){ return t.athlete===athleteName; }).forEach(function(t){
    if(!byTest[t.testName]) byTest[t.testName]=[];
    byTest[t.testName].push(t);
  });
  Object.keys(byTest).forEach(function(k){ byTest[k].sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; }); });
  var names=Object.keys(byTest);
  if(!names.length) return '<div style="color:var(--dim);font-size:12px;text-align:center;padding:8px;font-style:italic;">Brak wyników testów</div>';
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
    +names.slice(0,6).map(function(name){
      var arr=byTest[name]; var r=arr[arr.length-1]; var cat=TEST_LIBRARY[r.category]||{};
      var latV=parseFloat(r.value)||0; var firstV=arr.length>=2?(parseFloat(arr[0].value)||0):null;
      var prevV=arr.length>=2?(parseFloat(arr[arr.length-2].value)||0):null;
      var diffHtml='';
      if(firstV!==null&&firstV!==0){
        var pct=((latV-firstV)/Math.abs(firstV)*100);
        diffHtml='<div style="font-size:9px;font-weight:700;color:'+(pct>=0?'var(--green-text)':'var(--red-text)')+';">'+(pct>0?'▲':'▼')+' '+(pct>0?'+':'')+pct.toFixed(1)+'%</div>';
      }
      return '<div style="background:var(--s2);border-radius:var(--r-xs);padding:8px 10px;border-left:3px solid '+(cat.color||'#7e22ce')+';">'
        +'<div style="font-size:10px;font-weight:700;color:var(--dim);margin-bottom:2px;">'+name+'</div>'
        +'<div style="font-size:16px;font-weight:900;color:'+(cat.color||'#7e22ce')+';">'+r.value+' <span style="font-size:10px;font-weight:600;color:var(--muted);">'+r.unit+'</span></div>'
        +diffHtml
        +'<div style="font-size:9px;color:var(--dim);margin-top:1px;">'+r.date+'</div></div>';
    }).join('')+'</div>'+(names.length>6?'<div style="font-size:11px;color:var(--dim);text-align:center;margin-top:6px;">...i '+(names.length-6)+' więcej</div>':'');
}
var _compareTest=null; // {athleteName, testName} for comparison overlay
function openTestHistory(athleteName){
  loadTests(); loadCRM();
  var ath=athletes.find(function(a){ return a.name===athleteName; });
  var byTest={}; testResults.filter(function(t){ return t.athlete===athleteName; }).forEach(function(t){ if(!byTest[t.testName]) byTest[t.testName]=[]; byTest[t.testName].push(t); });
  Object.keys(byTest).forEach(function(k){ byTest[k].sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; }); }); // chronological asc for charts
  var names=Object.keys(byTest);
  var html='<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">'
    +'<button onclick="openAthleteProfile('+ath.id+')" style="background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:7px 12px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);">← Profil</button>'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);">📊 Wyniki testów</div></div>';
  if(!names.length) html+='<div style="color:var(--dim);text-align:center;padding:40px;">Brak wyników testów</div>';
  names.forEach(function(name,ni){
    var results=byTest[name]; var cat=TEST_LIBRARY[results[0].category]||{};
    var canvasId='chart-'+ni;
    var latest=results[results.length-1]; var first=results[0];
    var latestV=parseFloat(latest.value)||0; var firstV=parseFloat(first.value)||0;
    var diffFirst=results.length>=2?(latestV-firstV):null;
    var pctFirst=results.length>=2&&firstV!==0?((latestV-firstV)/Math.abs(firstV)*100):null;
    var prev=results.length>=2?results[results.length-2]:null;
    var prevV=prev?(parseFloat(prev.value)||0):null;
    var diffPrev=prev?(latestV-prevV):null;
    var pctPrev=prev&&prevV!==0?((latestV-prevV)/Math.abs(prevV)*100):null;

    html+='<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      +'<div style="font-size:14px;font-weight:800;color:var(--text);">'+(cat.icon||'📈')+' '+name+'</div>'
      +'<div style="text-align:right;">'
      +'<div style="font-size:18px;font-weight:900;color:'+(cat.color||'#7e22ce')+';">'+latest.value+' <span style="font-size:11px;font-weight:600;color:var(--muted);">'+latest.unit+'</span></div>'
      +(diffFirst!==null?'<div style="font-size:10px;font-weight:700;color:'+(diffFirst>=0?'var(--green-text)':'var(--red-text)')+';margin-top:2px;">'
        +'vs pierwszy: '+(diffFirst>0?'+':'')+diffFirst.toFixed(1)+(pctFirst!==null?' ('+(pctFirst>0?'+':'')+pctFirst.toFixed(1)+'%)':'')+'</div>':'')
      +(diffPrev!==null?'<div style="font-size:10px;font-weight:700;color:'+(diffPrev>=0?'var(--green-text)':'var(--red-text)')+';opacity:.75;">'
        +'vs ostatni: '+(diffPrev>0?'+':'')+diffPrev.toFixed(1)+(pctPrev!==null?' ('+(pctPrev>0?'+':'')+pctPrev.toFixed(1)+'%)':'')+'</div>':'')
      +'</div></div>';
    // Chart
    if(results.length>=2){
      html+='<canvas id="'+canvasId+'" width="400" height="140" style="width:100%;height:140px;border-radius:var(--r-xs);margin-bottom:6px;"></canvas>';
    }
    // Data points with delete
    var safeAth2=athleteName.replace(/'/g,"\\'");
    html+='<div style="max-height:120px;overflow-y:auto;">';
    results.slice().reverse().forEach(function(r,ri){
      var isFirst=ri===0;
      html+='<div style="display:flex;align-items:center;padding:4px 0;border-top:1px solid var(--border);font-size:12px;gap:6px;">'
        +'<div style="flex:1;min-width:0;"><span style="font-weight:'+(isFirst?'800':'600')+';color:'+(isFirst?cat.color||'#7e22ce':'var(--muted)')+';">'+r.value+' '+r.unit+(r.note?' <span style="color:var(--dim);font-weight:500;">· '+r.note+'</span>':'')+'</span></div>'
        +'<span style="color:var(--dim);font-size:10px;flex-shrink:0;">'+r.date+'</span>'
        +'<button onclick="deleteTestResult('+r.id+',\''+safeAth2+'\')" style="background:transparent;border:none;cursor:pointer;color:var(--dim);font-size:11px;padding:2px 4px;flex-shrink:0;" title="Usuń">✕</button>'
        +'</div>';
    });
    html+='</div>';
    // Compare button
    if(results.length>=2){
      var safeName=name.replace(/'/g,"\\'"); var safeAth=athleteName.replace(/'/g,"\\'");
      html+='<button onclick="openCompareChart(\''+safeAth+'\',\''+safeName+'\')" style="margin-top:6px;background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);padding:5px 12px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--muted);width:100%;">📊 Porównaj z innym testem</button>';
    }
    html+='</div>';
  });
  el('ap-name-header').textContent='📊 '+athleteName;
  el('ap-content').innerHTML=html;
  // Render charts after DOM update
  setTimeout(function(){
    names.forEach(function(name,ni){
      var results=byTest[name];
      if(results.length>=2){
        var cat=TEST_LIBRARY[results[0].category]||{};
        _renderChart('chart-'+ni, results, cat.color||'#7e22ce');
      }
    });
  },50);
}

// ── DELETE TEST + UNDO/REDO ──
var _undoStack=[], _redoStack=[], _UNDO_MAX=30;
var _ALL_DATA_KEYS=['axs_athletes','axs_sessions','axs_groups','axs_tests','axs_notes','axs_custom_tests','axs_packages','axs_int_presets'];
function _pushUndo(label){
  var snapshot=_ALL_DATA_KEYS.map(function(k){ return {key:k, val:localStorage.getItem(k)}; });
  _undoStack.push({label:label, data:snapshot, time:Date.now()});
  if(_undoStack.length>_UNDO_MAX) _undoStack.shift();
  _redoStack=[];
  _renderUndoBar();
}
function _snapshotKeys(keys){ return keys.map(function(k){ return {key:k, val:localStorage.getItem(k)}; }); }
function _restoreSnapshot(pairs){ pairs.forEach(function(p){ if(p.val===null) localStorage.removeItem(p.key); else localStorage.setItem(p.key,p.val); }); }

function undoLast(){
  if(!_undoStack.length) return;
  var action=_undoStack.pop();
  var redoPairs=_snapshotKeys(action.data.map(function(p){ return p.key; }));
  _redoStack.push({label:action.label, data:redoPairs, time:Date.now()});
  _restoreSnapshot(action.data);
  loadCRM(); loadTests(); loadNotes(); loadGroups();
}
function redoLast(){
  if(!_redoStack.length) return;
  var action=_redoStack.pop();
  var undoPairs=_snapshotKeys(action.data.map(function(p){ return p.key; }));
  _undoStack.push({label:action.label, data:undoPairs, time:Date.now()});
  _restoreSnapshot(action.data);
  loadCRM(); loadTests(); loadNotes(); loadGroups();
}
function _renderUndoBar(){
  // Update header button indicator
  var hdrBtn=el('undo-header-btn');
  if(hdrBtn){
    var hasU=_undoStack.length>0;
    hdrBtn.style.color=hasU?'var(--accent)':'var(--muted)';
    hdrBtn.style.borderColor=hasU?'var(--accent)':'var(--border2)';
  }
}
function toggleUndoDropdown(){
  var existing=document.getElementById('undo-dropdown');
  if(existing){ existing.remove(); return; }
  var btn=el('undo-header-btn'); if(!btn) return;
  var rect=btn.getBoundingClientRect();
  var dd=document.createElement('div'); dd.id='undo-dropdown';
  dd.style.cssText='position:fixed;top:'+(rect.bottom+6)+'px;right:12px;z-index:9960;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r);padding:10px;min-width:240px;max-width:320px;box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:Montserrat,sans-serif;';
  var hasU=_undoStack.length>0, hasR=_redoStack.length>0;
  var lastUndo=hasU?_undoStack[_undoStack.length-1]:null;
  var lastRedo=hasR?_redoStack[_redoStack.length-1]:null;
  dd.innerHTML='<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">Cofnij / Ponów</div>'
    +'<button onclick="_undoDropdownAction(\'undo\')" style="width:100%;padding:10px 12px;background:'+(hasU?'var(--s2)':'var(--s2)')+';border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:'+(hasU?'var(--text)':'var(--dim)')+';text-align:left;margin-bottom:6px;display:flex;align-items:center;gap:8px;'+(hasU?'':'opacity:.4;pointer-events:none;')+'">'
    +'<span style="font-size:16px;">↩</span><div><div>Cofnij</div>'+(hasU?'<div style="font-size:10px;color:var(--muted);margin-top:1px;">'+lastUndo.label+'</div>':'')+'</div></button>'
    +'<button onclick="_undoDropdownAction(\'redo\')" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:'+(hasR?'var(--text)':'var(--dim)')+';text-align:left;display:flex;align-items:center;gap:8px;'+(hasR?'':'opacity:.4;pointer-events:none;')+'">'
    +'<span style="font-size:16px;">↪</span><div><div>Ponów</div>'+(hasR?'<div style="font-size:10px;color:var(--muted);margin-top:1px;">'+lastRedo.label+'</div>':'')+'</div></button>';
  document.body.appendChild(dd);
  // Close on outside click
  setTimeout(function(){
    document.addEventListener('click',function _closeDD(e){
      if(!dd.contains(e.target)&&e.target!==btn){ dd.remove(); document.removeEventListener('click',_closeDD); }
    });
  },50);
}
function _undoDropdownAction(type){
  var dd=document.getElementById('undo-dropdown'); if(dd) dd.remove();
  if(type==='undo') undoLast(); else redoLast();
  _renderUndoBar();
  // Refresh current view
  var tabScroll=document.querySelector('.tab-scroll');
  var savedScroll=tabScroll?tabScroll.scrollTop:0;
  if(_currentMode==='diary'){ renderCal(); if(selectedDay) renderDayDetail(selectedDay); }
  else if(_currentMode==='athletes'){ loadNotes(); renderAthleteList(); }
  else if(_currentMode==='data') refreshDataStats();
  if(tabScroll) requestAnimationFrame(function(){ tabScroll.scrollTop=savedScroll; });
}
// Alias for backward compatibility
function _undoBarAction(type){ _undoDropdownAction(type); }

function deleteTestResult(id, athleteName){
  var ov=_ensureOverlay();
  loadTests();
  var t=testResults.find(function(r){ return r.id===id; });
  if(!t){ ov.style.display='none'; return; }
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:22px 18px;max-width:340px;width:100%;text-align:center;">'
    +'<div style="font-size:24px;margin-bottom:8px;">🗑</div>'
    +'<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Usunąć wynik testu?</div>'
    +'<div style="font-size:13px;color:var(--muted);margin-bottom:4px;font-weight:700;">'+t.testName+': '+t.value+' '+t.unit+'</div>'
    +'<div style="font-size:11px;color:var(--dim);margin-bottom:16px;">'+t.date+(t.note?' · '+t.note:'')+'</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="del-test-confirm" style="flex:1;padding:11px;background:#ef4444;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('del-test-confirm').onclick=function(){
    // Snapshot for undo
    _pushUndo('Usunięto test: '+t.testName+' '+t.value+' '+t.unit);
    // Remove from testResults
    loadTests();
    testResults=testResults.filter(function(r){ return r.id!==id; });
    saveTests();
    // Remove matching note entry if exists
    loadNotes();
    var noteMatch='📈 '+t.testName+': '+t.value+' '+t.unit;
    notes=notes.filter(function(n){ return !(n.date===t.date&&n.athlete===t.athlete&&n.text.indexOf(noteMatch)===0); });
    saveNotes();
    ov.style.display='none';
    // Refresh test history
    openTestHistory(athleteName);
  };
}

function _renderChart(canvasId, results, color, results2, color2, label1, label2){
  var cv=document.getElementById(canvasId); if(!cv) return;
  var ctx=cv.getContext('2d');
  var dpr=window.devicePixelRatio||1;
  var cssW=cv.offsetWidth, cssH=cv.offsetHeight||140;
  cv.width=cssW*dpr; cv.height=cssH*dpr;
  cv.style.width=cssW+'px'; cv.style.height=cssH+'px';
  ctx.scale(dpr,dpr);
  var W=cssW, H=cssH;

  var isDark=document.documentElement.getAttribute('data-theme')!=='light';
  var bgFill=isDark?'#141414':'#ffffff';
  var gridC=isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)';
  var labelC=isDark?'rgba(255,255,255,.4)':'rgba(0,0,0,.45)';
  var dotBg=isDark?'#141414':'#ffffff';

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=bgFill; ctx.fillRect(0,0,W,H);
  var pad={l:44,r:12,t:label1?32:14,b:24};
  var gw=W-pad.l-pad.r, gh=H-pad.t-pad.b;

  function parseVals(arr){ return arr.map(function(r){ return parseFloat(r.value)||0; }); }
  var vals=parseVals(results);
  var allVals=vals.slice();
  var vals2=results2?parseVals(results2):null;
  if(vals2) allVals=allVals.concat(vals2);
  var rawMin=Math.min.apply(null,allVals);
  var rawMax=Math.max.apply(null,allVals);
  var range=rawMax-rawMin;
  var margin=range>0?range*0.12:Math.max(1,Math.abs(rawMax)*0.1);
  var minV=rawMin-margin;
  var maxV=rawMax+margin;

  // Grid lines + Y labels
  ctx.strokeStyle=gridC; ctx.lineWidth=1;
  var gridSteps=4;
  for(var g=0;g<=gridSteps;g++){
    var gy=pad.t+gh*(1-g/gridSteps);
    ctx.beginPath(); ctx.moveTo(pad.l,gy); ctx.lineTo(pad.l+gw,gy); ctx.stroke();
    var gval=minV+(maxV-minV)*g/gridSteps;
    var gtext=Math.abs(gval)>=100?Math.round(gval):gval.toFixed(1);
    ctx.fillStyle=labelC; ctx.font='600 10px Montserrat,sans-serif'; ctx.textAlign='right';
    ctx.fillText(gtext,pad.l-6,gy+4);
  }

  // X labels — dates from results
  ctx.font='500 9px Montserrat,sans-serif'; ctx.textAlign='center'; ctx.fillStyle=labelC;
  var maxLabels=Math.min(results.length,7);
  var step=Math.max(1,Math.floor((results.length-1)/(maxLabels-1)));
  for(var xi=0;xi<results.length;xi+=step){
    var xx=pad.l+gw*(xi/(results.length-1||1));
    var dl=results[xi].date.slice(5); // MM-DD
    ctx.fillText(dl,xx,H-6);
  }
  // Always show last label
  if(results.length>1){
    var lastX=pad.l+gw;
    ctx.fillText(results[results.length-1].date.slice(5),lastX,H-6);
  }

  function drawLine(data,c,dashed){
    ctx.strokeStyle=c; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.lineCap='round';
    if(dashed) ctx.setLineDash([6,4]); else ctx.setLineDash([]);
    ctx.beginPath();
    data.forEach(function(v,i){
      var x=pad.l+gw*(i/(data.length-1||1));
      var y=pad.t+gh*(1-(v-minV)/(maxV-minV));
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke(); ctx.setLineDash([]);
    // Dots
    data.forEach(function(v,i){
      var x=pad.l+gw*(i/(data.length-1||1));
      var y=pad.t+gh*(1-(v-minV)/(maxV-minV));
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fillStyle=dotBg; ctx.fill();
    });
    // Value labels on dots
    ctx.font='700 9px Montserrat,sans-serif'; ctx.textAlign='center'; ctx.fillStyle=c;
    data.forEach(function(v,i){
      var x=pad.l+gw*(i/(data.length-1||1));
      var y=pad.t+gh*(1-(v-minV)/(maxV-minV));
      var txt=Math.abs(v)>=100?Math.round(v):v.toFixed(1);
      ctx.fillText(txt,x,y-8);
    });
  }
  drawLine(vals,color,false);
  if(vals2&&results2) drawLine(vals2,color2||'#3b82f6',true);
  // Legend
  if(label1&&label2){
    ctx.font='700 10px Montserrat,sans-serif';
    ctx.fillStyle=color; ctx.textAlign='left'; ctx.fillText('— '+label1,pad.l+8,14);
    ctx.fillStyle=color2||'#3b82f6'; ctx.fillText('--- '+label2,pad.l+8+ctx.measureText('— '+label1).width+16,14);
  }
}

function openCompareChart(athleteName, testName){
  loadTests();
  var myResults=testResults.filter(function(t){ return t.athlete===athleteName&&t.testName===testName; }).sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:0; });
  var otherTests={}; testResults.filter(function(t){ return t.athlete===athleteName&&t.testName!==testName; }).forEach(function(t){ otherTests[t.testName]=true; });
  var others=Object.keys(otherTests);
  if(!others.length){ alert('Brak innych testów do porównania.'); return; }
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:440px;width:100%;padding:22px 18px 24px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:4px;">📊 Porównaj: '+testName+'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">Wybierz drugi test do nałożenia na wykresie:</div>'
    +'<div id="compare-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;"></div>'
    +'<canvas id="compare-canvas" style="width:100%;height:180px;border-radius:var(--r-xs);display:none;margin-bottom:10px;"></canvas>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="width:100%;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Zamknij</button></div>';
  ov.style.display='flex';
  var list=document.getElementById('compare-list');
  others.forEach(function(other){
    var b=document.createElement('button');
    b.style.cssText='padding:10px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--text);text-align:left;';
    var oResults=testResults.filter(function(t){ return t.athlete===athleteName&&t.testName===other; });
    var cat2=TEST_LIBRARY[oResults[0].category]||{};
    b.innerHTML=(cat2.icon||'📈')+' '+other+' <span style="color:var(--dim);">('+oResults.length+' wyników)</span>';
    b.onclick=function(){
      var cv=document.getElementById('compare-canvas'); cv.style.display='block';
      var oSorted=oResults.sort(function(a,b2){ return a.date>b2.date?1:-1; });
      var cat1=TEST_LIBRARY[myResults[0].category]||{};
      _renderChart('compare-canvas',myResults,cat1.color||'#c2410c',oSorted,cat2.color||'#3b82f6',testName,other);
      // Highlight selected
      list.querySelectorAll('button').forEach(function(x){ x.style.borderColor='var(--border2)'; });
      b.style.borderColor='var(--accent)';
    };
    list.appendChild(b);
  });
}
function checkBirthdays(){
  loadCRM(); var today=new Date(); var todayMM=today.getMonth()+1; var todayDD=today.getDate();
  var bdays=athletes.filter(function(a){ if(!a.birthDate) return false; var p=a.birthDate.split('-'); return parseInt(p[1],10)===todayMM&&parseInt(p[2],10)===todayDD; });
  var existing=document.getElementById('birthday-alert'); if(existing) existing.remove(); if(!bdays.length) return;
  var div=document.createElement('div'); div.id='birthday-alert';
  div.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,#7c3aed,#c2410c);color:#fff;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.4);';
  var names=bdays.map(function(a){ var yr=parseInt((a.birthDate||'').split('-')[0],10); var age=yr?today.getFullYear()-yr:''; return '<strong>'+a.name+'</strong>'+(age?' ('+age+' lat)':''); }).join(', ');
  div.innerHTML='<div style="display:flex;align-items:center;gap:12px;flex:1;"><span style="font-size:26px;">🎂</span><div><div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.75;margin-bottom:2px;">Urodziny dziś!</div><div style="font-size:14px;font-weight:900;">'+names+'</div></div></div><button id="bday-close" style="background:rgba(255,255,255,.25);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>';
  document.body.appendChild(div); document.getElementById('bday-close').addEventListener('click',function(){ div.remove(); });
}

// ── FULL ATHLETE LIST (tab Zawodnicy) ──
