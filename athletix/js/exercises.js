// ══════════════════════════════════════
//  BIBLIOTEKA ĆWICZEŃ
//  UWAGA: Ta biblioteka i struktura danych jest współdzielona z AthletiX Planner.
//  Zmiany w formacie wymagają aktualizacji obu aplikacji.
// ══════════════════════════════════════
var EXERCISE_LIBRARY = {
  sila: {
    label: 'Siłowe', color: '#3b82f6', fields: ['reps','load','rir'],
    upper: ['Bench Press','Overhead Press','Barbell Row','Weighted Pull-up','Weighted Dip','DB Shoulder Press','DB Bench Press','Pendlay Row','Chin-up','Incline Bench Press'],
    lower: ['Back Squat','Front Squat','Deadlift','Romanian Deadlift','Hip Thrust','Bulgarian Split Squat','Leg Press','Hack Squat','Sumo Deadlift','Barbell Lunges'],
    full: ['Turkish Get-up','Trap Bar Deadlift']
  },
  wyt_sil: {
    label: 'Wytrzymałość siłowa', color: '#d97706', fields: ['reps','load'],
    upper: ['Push-ups','TRX Row','Face Pull','DB Lateral Raise','Band Pull-Apart','Landmine Press','Pike Push-up','Ring Rows'],
    lower: ['Goblet Squat','DB Lunges','Step-up','Wall Sit','Calf Raises','Nordic Curl','Sissy Squat','Glute Bridge'],
    full: ['Farmers Walk','Bear Crawl','Sandbag Carry']
  },
  eksplozywnosc: {
    label: 'Eksplozywność / Moc', color: '#ea580c', fields: ['reps','load'],
    upper: ['Plyo Push-up','Med Ball Slam','Med Ball Chest Pass','Med Ball Rotational Throw','Clap Push-up'],
    lower: ['Box Jump','Broad Jump','Power Clean','Hang Clean','Push Press','KB Swing','Depth Jump','Hurdle Hop','Skok w dal','Hang Snatch'],
    full: ['Clean & Jerk','Snatch','Med Ball Throw Over','KB Snatch']
  },
  stabilizacja: {
    label: 'Stabilizacja / Core', color: '#16a34a', fields: ['time','reps'],
    upper: ['Pallof Press','Band Anti-Rotation','Plate Halo','Bottoms-Up KB Press','Face-Down Y-T-W'],
    lower: ['Single Leg RDL Hold','Copenhagen Plank','Cossack Squat Hold','SL Glute Bridge Hold','Banded Monster Walk'],
    full: ['Plank','Dead Bug','Bird Dog','Ab Wheel Rollout','Hanging Knee Raise','Side Plank','Hollow Body Hold','Anti-Extension Walkout']
  },
  mobilnosc: {
    label: 'Mobilność / Ruch', color: '#a855f7', fields: ['time','reps'],
    upper: ['Banded Shoulder Dislocates','Thoracic Rotation','Pec Stretch','Lat Hang','Prone Y Raise','Sleeper Stretch'],
    lower: ['Hip 90/90','World Greatest Stretch','Couch Stretch','Pigeon Stretch','Ankle Mobility','Deep Squat Hold','Adductor Rockback'],
    full: ['Cat-Cow','Inchworm','Controlled Articular Rotations','Scorpion Stretch']
  },
  kondycja: {
    label: 'Kondycja / Cardio', color: '#dc2626', fields: ['dist','time','rir'],
    upper: ['Battle Ropes','SkiErg Concept2','Airdyne Arms Only'],
    lower: ['Bieg','Sprint','Prowler Push','Sled Push','Schody/Stairs','Bieg pod górę'],
    full: ['RowErg Concept2','AirBike Assault','AirBike Rogue','Burpees','Jumping Jacks','Swimming']
  }
};
var ZONE_LABELS = { upper: '💪 Góra', lower: '🦵 Dół', full: '🫁 Centrum' };
var CAT_SHORT = { sila:'SIŁ', wyt_sil:'WYT', eksplozywnosc:'EKS', stabilizacja:'STB', mobilnosc:'MOB', kondycja:'KON' };
var FIELD_LABELS = { reps:'Powt', load:'kg', rir:'RIR', time:'Czas(s)', dist:'Dystans(m)' };
var FIELD_TYPES = { reps:'number', load:'text', rir:'number', time:'number', dist:'number' };
var FIELD_INPUTMODES = { reps:'numeric', load:'decimal', rir:'numeric', time:'numeric', dist:'numeric' };

// ── Custom ćwiczenia ──
var CUSTOM_EX_KEY='axs_custom_exercises';
var customExercises=[];
function loadCustomExercises(){ try{ customExercises=JSON.parse(localStorage.getItem(CUSTOM_EX_KEY)||'[]'); }catch(e){ customExercises=[]; } }
function saveCustomExercises(){ localStorage.setItem(CUSTOM_EX_KEY,JSON.stringify(customExercises)); }

// ── Ulubione ćwiczenia ──
var FAV_EX_KEY='axs_favorite_exercises';
var favExercises=[];
function loadFavEx(){ try{ favExercises=JSON.parse(localStorage.getItem(FAV_EX_KEY)||'[]'); }catch(e){ favExercises=[]; } }
function saveFavEx(){ localStorage.setItem(FAV_EX_KEY,JSON.stringify(favExercises)); }
function _addToFav(name,catKey,zone){
  loadFavEx();
  if(favExercises.find(function(f){ return f.name===name; })) return;
  favExercises.push({name:name,cat:catKey||null,zone:zone||null});
  if(favExercises.length>20) favExercises.shift();
  saveFavEx();
}
// Buduj optgroup ulubionych do selecta
function _buildFavOptgroup(zoneFilt){
  loadFavEx();
  var items=favExercises.filter(function(f){ return !zoneFilt||!f.zone||f.zone===zoneFilt; });
  if(!items.length) return null;
  var og=document.createElement('optgroup'); og.label='⭐ Ulubione';
  items.forEach(function(f){ var o=document.createElement('option'); o.value=f.name; o.setAttribute('data-cat',f.cat||''); o.setAttribute('data-zone',f.zone||''); o.textContent=f.name; og.appendChild(o); });
  return og;
}

// ── Modal notatki serii (współdzielony) ──
function _openSetNoteModal(setsArr, idx, refreshFn){
  var s=setsArr[idx]; if(!s) return;
  var noteKey=s._note!==undefined?'_note':'note';
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) translateY(16px);opacity:0;max-width:400px;width:calc(100% - 40px);background:var(--s1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:18px;z-index:9993;transition:all .18s ease-out;" id="sn-modal">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    +'<div style="font-size:14px;font-weight:800;color:var(--text);">📝 Notatka — S'+(idx+1)+'</div>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:var(--muted);width:28px;height:28px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<textarea id="sn-ta" rows="5" placeholder="Uwagi do serii, tempo, technika..." style="width:100%;min-height:120px;max-height:40vh;padding:12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-sm);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:500;line-height:1.6;outline:none;resize:vertical;box-sizing:border-box;">'+(s[noteKey]||'')+'</textarea>'
    +'<button id="sn-save" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;margin-top:10px;">Zapisz</button>'
    +'</div>';
  ov.style.display='flex'; ov.style.background='rgba(0,0,0,.45)'; ov.style.backdropFilter='blur(6px)'; ov.style.webkitBackdropFilter='blur(6px)';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ var m=el('sn-modal'); if(m){ m.style.opacity='1'; m.style.transform='translate(-50%,-50%) translateY(0)'; } }); });
  setTimeout(function(){ el('sn-ta').focus(); },100);
  document.getElementById('sn-save').onclick=function(){
    setsArr[idx][noteKey]=(el('sn-ta').value||'').trim();
    ov.style.display='none'; ov.innerHTML=''; ov.style.backdropFilter=''; ov.style.webkitBackdropFilter=''; ov.style.background=''; document.body.style.overflow='';
    if(refreshFn) refreshFn();
  };
}

// Stan formularza ćwiczeń
var _exCat='', _exZone='', _exName='', _exSets=[];
var _strManCat='';

function _catIcon(key){ return {sila:'🏋️',wyt_sil:'💪',eksplozywnosc:'⚡',stabilizacja:'🎯',mobilnosc:'🧘',kondycja:'🏃'}[key]||'🏋️'; }

// ══ Szybki select ćwiczeń (tryb ręczny — Sesja) ══
function _strFilterAllEx(){
  var zone=(el('str-zone-sel')||{}).value||'';
  var sel=el('str-exercise-sel'); if(!sel) return;
  sel.innerHTML='<option value="">Wybierz ćwiczenie...</option>';
  loadCustomExercises();
  // Ulubione na górze
  var favOg=_buildFavOptgroup(zone); if(favOg) sel.appendChild(favOg);
  Object.keys(EXERCISE_LIBRARY).forEach(function(catKey){
    var cat=EXERCISE_LIBRARY[catKey]; var icon=_catIcon(catKey);
    var zones=zone?[zone]:['upper','lower','full'];
    zones.forEach(function(z){
      var items=(cat[z]||[]).slice();
      customExercises.filter(function(c){ return c.cat===catKey&&c.zone===z; }).forEach(function(c){ items.push('★ '+c.name); });
      if(!items.length) return;
      var og=document.createElement('optgroup'); og.label=icon+' '+cat.label+' — '+ZONE_LABELS[z];
      items.forEach(function(name){ var o=document.createElement('option'); o.value=name; o.setAttribute('data-cat',catKey); o.setAttribute('data-zone',z); o.textContent=name; og.appendChild(o); });
      sel.appendChild(og);
    });
  });
}
function _strQuickSelect(){
  var sel=el('str-exercise-sel'); if(!sel||!sel.value) return;
  var opt=sel.options[sel.selectedIndex];
  var catKey=opt.getAttribute('data-cat'); var zone=opt.getAttribute('data-zone');
  _exCat=catKey||''; _exZone=zone||''; _exName=sel.value.replace(/^★ /,'');
  _addToFav(_exName,catKey,zone);
  initExSets();
  el('ex-sets-wrap').style.display='block';
  el('ex-general-wrap').style.display='block';
  el('ex-save-wrap').style.display='block';
}
function _strShowManual(){
  el('str-manual-wrap').style.display='block';
  _strManCat='';
  var mc=el('str-manual-cats'); if(mc){
    mc.innerHTML='';
    Object.keys(EXERCISE_LIBRARY).forEach(function(k){ var c=EXERCISE_LIBRARY[k]; var b=document.createElement('button'); b.className='ex-cat-chip'; b.setAttribute('data-cat',k); b.style.cssText='padding:4px 8px;font-size:9px;'; b.innerHTML=_catIcon(k)+' '+c.label;
    b.onclick=function(){ _strManCat=(_strManCat===k)?'':k; mc.querySelectorAll('.ex-cat-chip').forEach(function(x){ var xk=x.getAttribute('data-cat'); var xc=EXERCISE_LIBRARY[xk]; if(xk===_strManCat){ x.style.background='rgba('+_hexToRgb(xc.color)+',.12)'; x.style.borderColor=xc.color; x.style.color=xc.color; } else { x.style.background=''; x.style.borderColor=''; x.style.color=''; } }); };
    mc.appendChild(b); });
  }
  setTimeout(function(){ el('str-manual-name').focus(); },50);
}
function _strManualAdd(){
  var name=(el('str-manual-name').value||'').trim(); if(!name) return;
  _exCat=_strManCat||''; _exZone=''; _exName=name;
  el('str-manual-name').value=''; el('str-manual-wrap').style.display='none';
  initExSets();
  el('ex-sets-wrap').style.display='block';
  el('ex-general-wrap').style.display='block';
  el('ex-save-wrap').style.display='block';
}
function _strShowCatFlow(){
  el('str-cat-flow').style.display='block';
  initExCatChips();
}
// Ulubione chipy w formularzu ręcznym
function _renderStrFavChips(){
  var wrap=el('str-fav-chips'); if(!wrap) return;
  loadFavEx();
  if(!favExercises.length){ wrap.innerHTML=''; return; }
  wrap.innerHTML='';
  favExercises.slice(0,8).forEach(function(f){
    var b=document.createElement('button');
    b.style.cssText='padding:5px 11px;background:var(--s2);border:1px solid var(--border2);border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;color:var(--text);';
    b.textContent=f.name;
    b.onclick=function(){
      _exCat=f.cat||''; _exZone=f.zone||''; _exName=f.name;
      initExSets();
      el('ex-sets-wrap').style.display='block';
      el('ex-general-wrap').style.display='block';
      el('ex-save-wrap').style.display='block';
    };
    wrap.appendChild(b);
  });
}
function _hexToRgb(hex){ hex=hex.replace('#',''); var r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16); return r+','+g+','+b; }
function _fieldWidth(f){ return {reps:60,load:70,rir:50,time:70,dist:80}[f]||60; }

function initExCatChips(){
  var wrap=el('ex-cat-scroll'); if(!wrap||wrap.children.length) return;
  loadCustomExercises();
  Object.keys(EXERCISE_LIBRARY).forEach(function(key){
    var cat=EXERCISE_LIBRARY[key];
    var b=document.createElement('button'); b.className='ex-cat-chip'; b.setAttribute('data-cat',key);
    b.innerHTML='<span style="font-size:12px;">'+_catIcon(key)+'</span> '+cat.label;
    b.onclick=function(){ selectExCat(key); };
    wrap.appendChild(b);
  });
}

function selectExCat(key){
  _exCat=key; _exZone=''; _exName=''; _exSets=[];
  var cat=EXERCISE_LIBRARY[key]; if(!cat) return;
  el('ex-cat-scroll').querySelectorAll('.ex-cat-chip').forEach(function(b){
    var k=b.getAttribute('data-cat'); var c=EXERCISE_LIBRARY[k];
    if(k===key){ b.style.background='rgba('+_hexToRgb(c.color)+',.12)'; b.style.borderColor=c.color; b.style.color=c.color; }
    else { b.style.background=''; b.style.borderColor=''; b.style.color=''; }
  });
  var zw=el('ex-zone-wrap'); var zb=el('ex-zone-btns'); zb.innerHTML='';
  var zones=['upper','lower']; if(cat.full&&cat.full.length) zones.push('full');
  zones.forEach(function(z){
    var b=document.createElement('button'); b.className='ex-zone-chip'; b.setAttribute('data-zone',z);
    b.textContent=ZONE_LABELS[z];
    b.onclick=function(){ selectExZone(z===_exZone?'':z); };
    zb.appendChild(b);
  });
  zw.style.display='flex';
  populateExSelect();
  el('ex-select-wrap').style.display='block';
  el('ex-sets-wrap').style.display='none';
  el('ex-general-wrap').style.display='none';
  el('ex-save-wrap').style.display='none';
}

function selectExZone(zone){
  _exZone=zone; _exName='';
  el('ex-zone-btns').querySelectorAll('.ex-zone-chip').forEach(function(b){
    var z=b.getAttribute('data-zone'); var c=EXERCISE_LIBRARY[_exCat].color;
    if(z===zone&&zone){ b.style.background='rgba('+_hexToRgb(c)+',.12)'; b.style.borderColor=c; b.style.color=c; }
    else { b.style.background=''; b.style.borderColor=''; b.style.color=''; }
  });
  populateExSelect();
  el('ex-sets-wrap').style.display='none';
  el('ex-general-wrap').style.display='none';
  el('ex-save-wrap').style.display='none';
}

function populateExSelect(){
  loadCustomExercises();
  var cat=EXERCISE_LIBRARY[_exCat]; if(!cat) return;
  var sel=el('ex-select'); sel.innerHTML='<option value="">Wybierz ćwiczenie...</option>';
  var zones=_exZone?[_exZone]:['upper','lower','full'];
  zones.forEach(function(z){
    var items=(cat[z]||[]).slice();
    customExercises.filter(function(c){ return c.cat===_exCat&&c.zone===z; }).forEach(function(c){ items.push('★ '+c.name); });
    if(!items.length) return;
    var og=document.createElement('optgroup'); og.label=ZONE_LABELS[z];
    items.forEach(function(name){ var o=document.createElement('option'); o.value=name; o.textContent=name; og.appendChild(o); });
    sel.appendChild(og);
  });
  var sep=document.createElement('optgroup'); sep.label='─────────';
  var addOpt=document.createElement('option'); addOpt.value='__add_custom__'; addOpt.textContent='➕ Dodaj własne ćwiczenie...';
  sel.appendChild(sep); sel.appendChild(addOpt);
  sel.value='';
}

function onExSelect(){
  var val=el('ex-select').value;
  if(val==='__add_custom__'){ el('ex-select').value=''; openAddCustomExercise(); return; }
  if(!val){ el('ex-sets-wrap').style.display='none'; el('ex-general-wrap').style.display='none'; el('ex-save-wrap').style.display='none'; return; }
  _exName=val;
  if(!_exZone){
    var cat=EXERCISE_LIBRARY[_exCat];
    ['upper','lower','full'].forEach(function(z){ if((cat[z]||[]).indexOf(val)>=0) _exZone=z; });
    if(!_exZone){ var clean=val.replace(/^★ /,''); customExercises.forEach(function(c){ if(c.cat===_exCat&&c.name===clean) _exZone=c.zone; }); }
  }
  initExSets();
  el('ex-sets-wrap').style.display='block';
  el('ex-general-wrap').style.display='block';
  el('ex-save-wrap').style.display='block';
}

function initExSets(){
  var cat=EXERCISE_LIBRARY[_exCat]; var fields=cat?cat.fields:['reps','load'];
  var s={note:''}; fields.forEach(function(f){ s[f]=''; });
  _exSets=[s];
  renderExSets();
}

function renderExSets(){
  var cat=EXERCISE_LIBRARY[_exCat];
  var fields=cat?cat.fields:['reps','load'];
  // Ukryj batch row i nagłówki (używamy placeholder w inputach)
  var batch=el('ex-batch-row'); if(batch) batch.style.display='none';
  var hdr=el('ex-sets-header'); if(hdr) hdr.innerHTML='';
  // Lista serii
  _renderExSetsList(fields);
}

function _exBatchAdd(){
  var cat=EXERCISE_LIBRARY[_exCat]; var fields=cat?cat.fields:['reps','load'];
  var cnt=parseInt((el('ex-batch-cnt')||{}).value)||1; if(cnt<1) cnt=1; if(cnt>20) cnt=20;
  var vals={}; fields.forEach(function(f){ vals[f]=(el('ex-batch-'+f)||{}).value||''; });
  for(var i=0;i<cnt;i++){
    var s={note:''}; fields.forEach(function(f){ s[f]=vals[f]; });
    _exSets.push(s);
  }
  _renderExSetsList(fields);
  // Reset batch inputs (nie count)
  fields.forEach(function(f){ var inp=el('ex-batch-'+f); if(inp) inp.value=''; });
}

function _renderExSetsList(fields){
  var list=el('ex-sets-list'); if(!list) return;
  var empty=el('ex-sets-empty');
  if(!_exSets.length){ list.innerHTML=''; if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';
  list.innerHTML='';
  _exSets.forEach(function(s,i){ list.appendChild(_buildSetRow(i,fields)); });
}

function _buildSetRow(idx,fields){
  var frag=document.createDocumentFragment();
  var row=document.createElement('div'); row.className='ex-set-row'; row.setAttribute('data-set-idx',idx);
  row.style.gap='5px';
  var badge=document.createElement('div'); badge.className='ex-set-badge'; badge.style.opacity='0.5';
  badge.textContent='S'+(idx+1);
  row.appendChild(badge);
  fields.forEach(function(f){
    var ph={reps:'Powt',load:'kg',rir:'RIR',time:'Czas(s)',dist:'Dyst(m)'}[f]||f;
    var inp=document.createElement('input'); inp.className='ex-set-input'; inp.setAttribute('data-field',f); inp.setAttribute('data-idx',idx);
    inp.type=FIELD_TYPES[f]; inp.inputMode=FIELD_INPUTMODES[f];
    inp.style.cssText='flex:1;min-width:'+(_fieldWidth(f)-10)+'px;border-radius:10px;height:40px;font-size:14px;';
    inp.placeholder=ph;
    if(_exSets[idx]&&_exSets[idx][f]!=null&&_exSets[idx][f]!=='') inp.value=_exSets[idx][f];
    inp.oninput=function(){ if(!_exSets[idx]) _exSets[idx]={}; _exSets[idx][f]=inp.value; };
    row.appendChild(inp);
  });
  // 📝 notatka
  var hasNote=_exSets[idx]&&_exSets[idx].note;
  var noteBtn=document.createElement('button');
  noteBtn.style.cssText='min-width:36px;min-height:36px;background:'+(hasNote?'rgba(59,130,246,.1)':'transparent')+';border:none;border-radius:8px;cursor:pointer;font-size:16px;opacity:'+(hasNote?'0.8':'0.4')+';position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
  noteBtn.innerHTML='📝'+(hasNote?'<span style="position:absolute;top:1px;right:1px;width:4px;height:4px;border-radius:50%;background:var(--accent);"></span>':'');
  noteBtn.title='Notatka do serii';
  noteBtn.onclick=function(){ _openSetNoteModal(_exSets,idx,function(){ var cat=EXERCISE_LIBRARY[_exCat]; _renderExSetsList(cat?cat.fields:['reps','load']); }); };
  row.appendChild(noteBtn);
  // 🗑 usuń
  var del=document.createElement('button');
  del.style.cssText='min-width:36px;min-height:36px;background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--muted);opacity:0.4;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
  del.textContent='🗑'; del.title='Usuń serię';
  del.onmouseover=function(){ del.style.opacity='0.9'; del.style.color='var(--red-text)'; };
  del.onmouseout=function(){ del.style.opacity='0.4'; del.style.color='var(--muted)'; };
  del.onclick=function(){ removeExSet(idx); };
  row.appendChild(del);
  frag.appendChild(row);
  // Podgląd notatki
  if(hasNote){
    var notePreview=document.createElement('div');
    notePreview.style.cssText='font-size:10px;font-style:italic;color:var(--muted);padding-left:28px;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;';
    notePreview.textContent=_exSets[idx].note;
    notePreview.onclick=function(){ _openSetNoteModal(_exSets,idx,function(){ var cat=EXERCISE_LIBRARY[_exCat]; _renderExSetsList(cat?cat.fields:['reps','load']); }); };
    frag.appendChild(notePreview);
  }
  return frag;
}

function addExSet(){
  var cat=EXERCISE_LIBRARY[_exCat]; var fields=cat?cat.fields:['reps','load'];
  _syncSetsFromDOM();
  _exSets.push({note:''});
  _renderExSetsList(fields);
}
function removeExSet(idx){
  _syncSetsFromDOM();
  _exSets.splice(idx,1);
  var cat=EXERCISE_LIBRARY[_exCat]; var fields=cat?cat.fields:['reps','load'];
  _renderExSetsList(fields);
}
function _syncSetsFromDOM(){
  var list=el('ex-sets-list'); if(!list) return;
  list.querySelectorAll('.ex-set-row').forEach(function(row){
    var i=parseInt(row.getAttribute('data-set-idx'));
    if(!_exSets[i]) _exSets[i]={note:''};
    row.querySelectorAll('.ex-set-input').forEach(function(inp){ _exSets[i][inp.getAttribute('data-field')]=inp.value; });
  });
}

function toggleExGeneralNote(){
  var ta=el('ex-general-note');
  var show=ta.style.display==='none';
  ta.style.display=show?'block':'none';
  el('ex-general-toggle').textContent=show?'📝 Ukryj notatkę':'📝 Notatka ogólna';
}

function openAddCustomExercise(){
  var ov=_ensureOverlay();
  var catOpts=Object.keys(EXERCISE_LIBRARY).map(function(k){ return '<option value="'+k+'"'+(k===_exCat?' selected':'')+'>'+_catIcon(k)+' '+EXERCISE_LIBRARY[k].label+'</option>'; }).join('');
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:360px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:14px;">+ Własne ćwiczenie</div>'
    +'<div style="margin-bottom:8px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Kategoria</div>'
    +'<select id="ce-cat" class="crm-input" style="margin-bottom:0;">'+catOpts+'</select></div>'
    +'<div style="margin-bottom:8px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Nazwa ćwiczenia</div>'
    +'<input id="ce-name" class="crm-input" type="text" placeholder="np. Zercher Squat" style="margin-bottom:0;"/></div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Strefa ciała</div>'
    +'<div style="display:flex;gap:6px;" id="ce-zone-btns">'
    +'<button class="ex-zone-chip" data-z="upper" onclick="document.querySelectorAll(\'#ce-zone-btns .ex-zone-chip\').forEach(function(b){b.style.borderColor=\'\';b.style.color=\'\';b.style.background=\'\'});this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';this.style.background=\'var(--accent-bg)\'">↑ Góra</button>'
    +'<button class="ex-zone-chip" data-z="lower" onclick="document.querySelectorAll(\'#ce-zone-btns .ex-zone-chip\').forEach(function(b){b.style.borderColor=\'\';b.style.color=\'\';b.style.background=\'\'});this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';this.style.background=\'var(--accent-bg)\'">↓ Dół</button>'
    +'<button class="ex-zone-chip" data-z="full" onclick="document.querySelectorAll(\'#ce-zone-btns .ex-zone-chip\').forEach(function(b){b.style.borderColor=\'\';b.style.color=\'\';b.style.background=\'\'});this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';this.style.background=\'var(--accent-bg)\'">↕ Całe</button>'
    +'</div></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="ce-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Dodaj</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="padding:12px 14px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('ce-name').focus(); },50);
  document.getElementById('ce-save').onclick=function(){
    var name=(el('ce-name').value||'').trim(); if(!name) return;
    var cat=el('ce-cat').value;
    var zoneBtn=document.querySelector('#ce-zone-btns .ex-zone-chip[style*="accent"]');
    var zone=zoneBtn?zoneBtn.getAttribute('data-z'):'full';
    loadCustomExercises();
    if(customExercises.find(function(c){ return c.cat===cat&&c.name===name; })){ el('ce-name').focus(); return; }
    _pushUndo('Własne ćwiczenie: '+name);
    customExercises.push({cat:cat,zone:zone,name:name});
    saveCustomExercises();
    ov.style.display='none';
    populateExSelect();
    el('ex-select').value='★ '+name; onExSelect();
  };
}

// ── Generowanie tekstu wpisu ──
function buildEntryText(entry){
  var cat=EXERCISE_LIBRARY[entry.exCat];
  var fields=cat?cat.fields:['reps','load'];
  var parts=[];
  entry.sets.forEach(function(s){
    var p='';
    if(fields.indexOf('reps')>=0&&s.reps) p+=s.reps;
    if(fields.indexOf('load')>=0&&s.load) p+=(p?'×':'')+s.load+'kg';
    if(fields.indexOf('rir')>=0&&s.rir) p+=(p?' ':'')+' RIR'+s.rir;
    if(fields.indexOf('time')>=0&&s.time) p+=(p?', ':'')+s.time+'s';
    if(fields.indexOf('dist')>=0&&s.dist) p+=(p?', ':'')+s.dist+'m';
    if(!p) p='—';
    parts.push(p);
  });
  return entry.exercise+' — '+entry.sets.length+' seri'+(entry.sets.length===1?'a':entry.sets.length<5?'e':'i')+' | '+parts.join(', ');
}

// ── Walidacja + zapis ──
function saveStrengthEntry(){
  var athlete=(el('note-athlete').value||'').trim();
  if(!athlete){ el('note-athlete').style.borderColor='var(--red)'; setTimeout(function(){ el('note-athlete').style.borderColor=''; },1000); el('note-athlete').focus(); return; }
  if(!_exName) return;
  _syncSetsFromDOM();
  var cat=EXERCISE_LIBRARY[_exCat];
  var fields=cat?cat.fields:['reps','load'];
  var firstField=fields[0];
  var hasValid=_exSets.some(function(s){ return s[firstField]&&String(s[firstField]).trim(); });
  if(!hasValid){
    var firstInp=el('ex-sets-list').querySelector('.ex-set-input[data-field="'+firstField+'"]');
    if(firstInp){ firstInp.classList.add('invalid'); setTimeout(function(){ firstInp.classList.remove('invalid'); },1000); firstInp.focus(); }
    return;
  }
  var saveDay=selectedDay||getDayKey(new Date());
  var now=new Date(); var hh=String(now.getHours()).padStart(2,'0'); var mm=String(now.getMinutes()).padStart(2,'0');
  var cleanName=_exName.replace(/^★ /,'');
  var sets=_exSets.filter(function(s){ return fields.some(function(f){ return s[f]&&String(s[f]).trim(); }); }).map(function(s){
    var obj={note:s.note||''};
    fields.forEach(function(f){ obj[f]=s[f]||''; });
    return obj;
  });
  if(!sets.length) return;
  var entry={
    id:Date.now(), date:saveDay, time:hh+':'+mm,
    athlete:athlete, type:'strength',
    exCat:_exCat, exZone:_exZone||'full', exercise:cleanName,
    sets:sets, generalNote:(el('ex-general-note').value||'').trim()||''
  };
  entry.text=buildEntryText(entry);
  _addToFav(cleanName,_exCat,_exZone);
  _pushUndo('Wpis: '+cleanName);
  loadNotes();
  notes.push(entry);
  saveNotes();
  renderCal(); renderDayDetail(saveDay);
  // Reset — zachowaj kategorię
  _exName=''; _exZone=''; _exSets=[];
  el('ex-select').value='';
  el('ex-sets-wrap').style.display='none';
  el('ex-general-wrap').style.display='none';
  el('ex-save-wrap').style.display='none';
  el('ex-general-note').value=''; el('ex-general-note').style.display='none';
  el('ex-general-toggle').textContent='📝 Notatka ogólna';
  var btn=el('ex-save-btn'); var orig=btn.textContent; btn.textContent='✓ Zapisano!'; btn.style.background='var(--green)';
  setTimeout(function(){ btn.textContent=orig; btn.style.background=''; },1200);
  selectExZone('');
}

// ── Karta wpisu strukturyzowanego (widok dnia) ──
function _renderStrengthCard(n){
  var cat=EXERCISE_LIBRARY[n.exCat]||{color:'#3b82f6',fields:['reps','load'],label:'?'};
  var catColor=cat.color;
  var catLabel=CAT_SHORT[n.exCat]||'?';
  var zoneLabel=ZONE_LABELS[n.exZone]||'';
  var div=document.createElement('div'); div.className='str-entry'; div.setAttribute('data-note-id',n.id);
  var html='<div class="note-actions"><button onclick="editStrengthEntry('+n.id+')" title="Edytuj">✏️</button><button onclick="deleteNote('+n.id+')" title="Usuń">🗑</button></div>';
  html+='<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;padding-right:60px;">'
    +'<span class="ex-cat-badge" style="color:'+catColor+';background:rgba('+_hexToRgb(catColor)+',.1);">'+catLabel+'</span>'
    +'<span style="font-size:14px;font-weight:800;color:var(--text);">'+n.exercise+'</span>'
    +(zoneLabel?'<span style="font-size:9px;font-weight:700;color:var(--dim);">'+zoneLabel+'</span>':'')
    +'</div>';
  html+='<div style="margin-bottom:4px;">';
  (n.sets||[]).forEach(function(s,si){
    var parts=[];
    if(s.reps) parts.push(s.reps+(s.load?'×'+s.load+'kg':''));
    else if(s.load) parts.push(s.load+'kg');
    if(!s.reps&&!s.load&&s.time) parts.push(s.time+'s');
    else if(s.time) parts.push(s.time+'s');
    if(s.dist) parts.push(s.dist+'m');
    if(s.rir) parts.push('RIR '+s.rir);
    html+='<div style="display:flex;align-items:baseline;gap:6px;padding:2px 0;">'
      +'<span style="font-size:10px;font-weight:800;color:var(--dim);width:22px;flex-shrink:0;">S'+(si+1)+'</span>'
      +'<span style="font-size:12px;font-weight:600;color:var(--text);">'+(parts.join('  ·  ')||'—')+'</span>'
      +(s.note?'<span style="font-size:12px;opacity:.4;">📝</span>':'')
      +'</div>';
    if(s.note) html+='<div style="font-size:11px;color:var(--muted);font-style:italic;margin-left:28px;margin-bottom:2px;">'+s.note.replace(/</g,'&lt;')+'</div>';
  });
  html+='</div>';
  if(n.generalNote) html+='<div style="font-size:12px;font-style:italic;color:var(--muted);border-top:1px solid var(--border);padding-top:6px;margin-top:6px;">'+n.generalNote.replace(/</g,'&lt;')+'</div>';
  html+='<div class="note-entry-meta" style="margin-top:4px;">'+n.time+'</div>';
  div.innerHTML=html;
  return div;
}

// ── Edycja wpisu strukturyzowanego ──
function editStrengthEntry(entryId){
  loadNotes();
  var entry=notes.find(function(n){ return n.id===entryId; }); if(!entry||!entry.sets) return;
  var cat=EXERCISE_LIBRARY[entry.exCat]; if(!cat) return;
  var fields=cat.fields;
  var ov=_ensureOverlay();
  var hdrHtml='<div style="display:flex;gap:5px;align-items:center;margin-bottom:6px;padding-left:29px;">';
  fields.forEach(function(f){ hdrHtml+='<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);text-align:center;width:'+_fieldWidth(f)+'px;flex-shrink:0;">'+FIELD_LABELS[f]+'</div>'; });
  hdrHtml+='</div>';
  var setsHtml='';
  entry.sets.forEach(function(s,i){
    setsHtml+='<div class="ex-set-row" data-set-idx="'+i+'" style="margin-bottom:5px;">';
    setsHtml+='<div class="ex-set-badge">S'+(i+1)+'</div>';
    fields.forEach(function(f){ setsHtml+='<input class="ex-set-input" data-field="'+f+'" data-idx="'+i+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" style="width:'+_fieldWidth(f)+'px;" placeholder="—" value="'+(s[f]||'')+'"/>'; });
    setsHtml+='<button class="ex-set-note-toggle'+(s.note?' has-note':'')+'" onclick="var ta=this.closest(\'.ex-set-row\').nextElementSibling.querySelector(\'textarea\');ta.style.display=ta.style.display===\'none\'?\'block\':\'none\'">📝</button>';
    if(entry.sets.length>1) setsHtml+='<button class="ex-set-del" onclick="this.closest(\'.ex-set-row\').nextElementSibling.remove();this.closest(\'.ex-set-row\').remove();">✕</button>';
    setsHtml+='</div><div class="ex-set-note-row"><textarea class="ex-set-note" rows="1" placeholder="Notatka do serii..." style="display:'+(s.note?'block':'none')+'">'+(s.note||'')+'</textarea></div>';
  });
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:520px;width:100%;padding:20px 18px 22px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:4px;">✏️ Edytuj wpis</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">'+entry.exercise+' · '+(entry.athlete||'')+'</div>'
    +hdrHtml+'<div id="edit-sets-list">'+setsHtml+'</div>'
    +'<button class="ex-add-set-btn" style="margin-bottom:10px;" onclick="_editAddSet('+JSON.stringify(fields).replace(/"/g,'&quot;')+')">+ Seria</button>'
    +'<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Notatka ogólna</div>'
    +'<textarea id="edit-general-note" rows="2" placeholder="Uwagi do ćwiczenia..." style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;outline:none;resize:vertical;box-sizing:border-box;">'+(entry.generalNote||'')+'</textarea></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="edit-str-save" style="flex:1;padding:13px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;">💾 ZAPISZ ZMIANY</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="padding:13px 18px;background:var(--s2);color:var(--muted);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('edit-str-save').onclick=function(){
    _pushUndo('Edycja: '+entry.exercise);
    loadNotes();
    var e2=notes.find(function(n){ return n.id===entryId; }); if(!e2) return;
    var newSets=[];
    var rows=document.querySelectorAll('#edit-sets-list .ex-set-row');
    var noteAreas=document.querySelectorAll('#edit-sets-list .ex-set-note-row textarea');
    rows.forEach(function(row,ri){
      var s={note:''};
      row.querySelectorAll('.ex-set-input').forEach(function(inp){ s[inp.getAttribute('data-field')]=inp.value; });
      if(noteAreas[ri]) s.note=noteAreas[ri].value||'';
      if(fields.some(function(f){ return s[f]&&String(s[f]).trim(); })) newSets.push(s);
    });
    if(!newSets.length){ ov.style.display='none'; return; }
    e2.sets=newSets;
    e2.generalNote=(el('edit-general-note').value||'').trim()||'';
    e2.text=buildEntryText(e2);
    saveNotes();
    ov.style.display='none';
    renderDayDetail(selectedDay);
  };
}
function _editAddSet(fields){
  var list=document.getElementById('edit-sets-list'); if(!list) return;
  var idx=list.querySelectorAll('.ex-set-row').length;
  var rowHtml='<div class="ex-set-row" data-set-idx="'+idx+'" style="margin-bottom:5px;">';
  rowHtml+='<div class="ex-set-badge">S'+(idx+1)+'</div>';
  fields.forEach(function(f){ rowHtml+='<input class="ex-set-input" data-field="'+f+'" data-idx="'+idx+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" style="width:'+_fieldWidth(f)+'px;" placeholder="—"/>'; });
  rowHtml+='<button class="ex-set-note-toggle" onclick="var ta=this.closest(\'.ex-set-row\').nextElementSibling.querySelector(\'textarea\');ta.style.display=ta.style.display===\'none\'?\'block\':\'none\'">📝</button>';
  rowHtml+='<button class="ex-set-del" onclick="this.closest(\'.ex-set-row\').nextElementSibling.remove();this.closest(\'.ex-set-row\').remove();">✕</button>';
  rowHtml+='</div><div class="ex-set-note-row"><textarea class="ex-set-note" rows="1" placeholder="Notatka do serii..." style="display:none"></textarea></div>';
  list.insertAdjacentHTML('beforeend',rowHtml);
}

// ── Renderowanie wpisu w raporcie print ──
function _renderStrengthReportEntry(n, idx){
  var cat=EXERCISE_LIBRARY[n.exCat]||{color:'#3b82f6',fields:['reps','load'],label:'?'};
  var catLabel=CAT_SHORT[n.exCat]||'?';
  var html='<div class="entry" style="padding:12px 0;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
    +'<span class="entry-num">'+(idx+1)+'.</span>'
    +'<span style="font-size:9px;font-weight:800;color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);padding:2px 6px;border-radius:4px;">'+catLabel+'</span>'
    +'<span style="font-size:14px;font-weight:800;">'+n.exercise+'</span></div>';
  html+='<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px;"><tr style="border-bottom:1px solid #ddd;">'
    +'<th style="text-align:left;padding:4px 6px;font-size:10px;font-weight:700;color:#888;">Seria</th>';
  cat.fields.forEach(function(f){ html+='<th style="text-align:center;padding:4px 6px;font-size:10px;font-weight:700;color:#888;">'+FIELD_LABELS[f]+'</th>'; });
  html+='<th style="text-align:left;padding:4px 6px;font-size:10px;font-weight:700;color:#888;">Notatka</th></tr>';
  n.sets.forEach(function(s,si){
    html+='<tr style="border-bottom:1px solid #eee;"><td style="padding:4px 6px;font-weight:700;color:#999;">S'+(si+1)+'</td>';
    cat.fields.forEach(function(f){ html+='<td style="text-align:center;padding:4px 6px;font-weight:600;">'+(s[f]||(f==='load'?'':'—'))+(f==='load'&&s[f]?'kg':f==='time'&&s[f]?'s':f==='dist'&&s[f]?'m':'')+'</td>'; });
    html+='<td style="padding:4px 6px;color:#888;font-style:italic;font-size:11px;">'+(s.note||'')+'</td></tr>';
  });
  html+='</table>';
  if(n.generalNote) html+='<div style="font-size:12px;font-style:italic;color:#777;margin-top:4px;">'+n.generalNote.replace(/</g,'&lt;')+'</div>';
  html+='<div class="entry-time">'+n.time+'</div></div>';
  return html;
}

// Init on load
document.addEventListener('DOMContentLoaded',function(){ loadCustomExercises(); loadFavEx(); initExCatChips(); _strFilterAllEx(); _renderStrFavChips(); });
