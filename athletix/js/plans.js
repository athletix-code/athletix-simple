// ═══════════════════════════════════════
//  PLANY TRENINGOWE — strukturyzowane z EXERCISE_LIBRARY
//  Plan = {id, name, athletes:[], exercises:[{type, label, exCat, exZone, exercise, targetSets:[], note, text, isCustomEntry}], status, created, updated}
// ═══════════════════════════════════════

var PLANS_KEY='axs_plans';
var trainingPlans=[];

function loadPlans(){ try{ trainingPlans=JSON.parse(localStorage.getItem(PLANS_KEY)||'[]'); }catch(e){ trainingPlans=[]; } }
function savePlans(){ try{ localStorage.setItem(PLANS_KEY,JSON.stringify(trainingPlans)); }catch(e){} }
function _findPlan(id){ return trainingPlans.find(function(x){ return x.id===id; }); }
function _sameGroup(a,b){ if(!a||!b) return false; var d1=a.match(/^(\d+)/),d2=b.match(/^(\d+)/); return d1&&d2&&d1[1]===d2[1]&&a!==b; }
// Helper: opis planowanych serii
function _planSetSummary(ex){
  if(!ex||!ex.targetSets||!ex.targetSets.length) return '';
  var cat=EXERCISE_LIBRARY[ex.exCat]; var fields=cat?cat.fields:['reps','load'];
  var ts=ex.targetSets, pp=[];
  if(fields.indexOf('reps')>=0){ var r=ts.map(function(s){ return s.reps||''; }).filter(Boolean); if(r.length) pp.push(ts.length+'×'+r[0]); }
  if(fields.indexOf('load')>=0){ var l=ts.map(function(s){ return s.load||''; }).filter(Boolean); if(l.length) pp.push('@'+l.join('-')+'kg'); }
  if(fields.indexOf('rir')>=0){ var ri=ts.map(function(s){ return s.rir||''; }).filter(Boolean); if(ri.length) pp.push('RIR '+ri.join('-')); }
  if(fields.indexOf('time')>=0){ var t=ts.map(function(s){ return s.time||''; }).filter(Boolean); if(t.length) pp.push(t.join('-')+'s'); }
  if(fields.indexOf('dist')>=0){ var d=ts.map(function(s){ return s.dist||''; }).filter(Boolean); if(d.length) pp.push(d.join('-')+'m'); }
  return pp.join(' ');
}
// Helper: opis oryginalnej serii (do indicatora zmian)
function _origSetText(os, fields){
  if(!os) return ''; var pp=[];
  if(fields.indexOf('reps')>=0&&os.reps) pp.push(os.reps);
  if(fields.indexOf('load')>=0&&os.load) pp.push('× '+os.load+'kg');
  if(fields.indexOf('rir')>=0&&os.rir) pp.push('RIR '+os.rir);
  if(fields.indexOf('time')>=0&&os.time) pp.push(os.time+'s');
  if(fields.indexOf('dist')>=0&&os.dist) pp.push(os.dist+'m');
  return pp.join(' ');
}
// Helper: kontrolki prawego górnego rogu karty (↑↓🗑)
function _cardControls(ei, total, moveF, rmF){
  var h='<div style="display:flex;gap:3px;flex-shrink:0;">';
  h+='<button onclick="'+moveF+'('+ei+',-1)" title="Przesuń wyżej" class="pe-move-btn'+(ei===0?' disabled':'')+'" style="width:34px;height:34px;">▲</button>';
  h+='<button onclick="'+moveF+'('+ei+',1)" title="Przesuń niżej" class="pe-move-btn'+(ei>=total-1?' disabled':'')+'" style="width:34px;height:34px;">▼</button>';
  h+='<button onclick="'+rmF+'('+ei+')" title="Usuń ćwiczenie" class="pe-del-btn" style="width:34px;height:34px;">🗑</button>';
  return h+'</div>';
}

// ══════════════════════════════════════
//  LISTA PLANÓW
// ══════════════════════════════════════
function initPlansTab(){ loadPlans(); loadCRM(); renderPlansList(); }
function renderPlansList(){
  loadPlans(); loadCRM();
  var list=el('plans-list'); if(!list) return;
  if(!trainingPlans.length){ list.innerHTML='<div style="text-align:center;padding:40px 20px;"><div style="font-size:40px;margin-bottom:12px;">📋</div><div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Brak planów</div><div style="font-size:12px;color:var(--muted);">Stwórz swój pierwszy plan treningowy</div></div>'; return; }
  list.innerHTML='';
  trainingPlans.forEach(function(p){
    var card=document.createElement('div'); card.style.cssText='background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:8px;';
    var athChips=p.athletes&&p.athletes.length?p.athletes.map(function(a){ return '<span style="font-size:10px;font-weight:700;color:var(--muted);background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:2px 7px;">'+a+'</span>'; }).join(' '):'<span style="font-size:10px;color:var(--dim);font-style:italic;">Nie przypisany</span>';
    var exItems=(p.exercises||[]).filter(function(e){ return e.type!=='note'; });
    var exPreview=exItems.map(function(e){ return (e.label?e.label+' ':'')+e.exercise; }).join(' • ');
    if(exPreview.length>80) exPreview=exPreview.substring(0,80)+'...';
    card.innerHTML='<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px;">'+p.name+'</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">'+athChips+'</div>'
      +'<div style="font-size:11px;color:var(--dim);margin-bottom:4px;">'+(p.exercises||[]).length+' elem. • '+(p.created||'')+'</div>'
      +(exPreview?'<div style="font-size:11px;color:var(--muted);margin-bottom:8px;max-height:32px;overflow:hidden;line-height:1.5;">'+exPreview+'</div>':'')
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
      +'<button onclick="launchPlan('+p.id+')" style="padding:7px 14px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:800;color:#fff;min-height:34px;">▶ Uruchom</button>'
      +'<button onclick="openPlanEditor('+p.id+')" style="padding:7px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--text);min-height:34px;">✏️ Edytuj</button>'
      +'<button onclick="copyPlan('+p.id+')" style="padding:7px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--text);min-height:34px;">📋 Kopiuj</button>'
      +'<button onclick="deletePlanConfirm('+p.id+')" style="padding:7px 12px;background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--dim);min-height:34px;">🗑</button>'
      +'</div>';
    list.appendChild(card);
  });
}

// ══════════════════════════════════════
//  EDYTOR PLANU (overlay full-screen)
// ══════════════════════════════════════
var _editingPlan=null;
function openPlanEditor(id){
  loadPlans(); loadCRM(); loadCustomExercises();
  var isNew=!id;
  var plan=isNew?{id:0,name:'',athletes:[],exercises:[],created:'',updated:'',status:'active'}:JSON.parse(JSON.stringify(_findPlan(id)));
  if(!plan) return;
  _editingPlan=plan;
  var ov=_ensureOverlay();
  _renderPlanEditorOverlay(ov,isNew);
}

function _renderPlanEditorOverlay(ov,isNew){
  var p=_editingPlan;
  // Chipy zawodników — max 6 (sesja + aktywni), reszta w dropdown
  var topAths=[]; var shown={};
  // Najpierw sessionAthletes
  (typeof sessionAthletes!=='undefined'?sessionAthletes:[]).forEach(function(n){ if(!shown[n]&&topAths.length<6){ topAths.push(n); shown[n]=true; } });
  // Potem aktywni
  athletes.filter(function(a){ return a.status==='active'&&!shown[a.name]; }).forEach(function(a){ if(topAths.length<6){ topAths.push(a.name); shown[a.name]=true; } });
  // Dodaj też tych co już są w planie
  (p.athletes||[]).forEach(function(n){ if(!shown[n]){ topAths.push(n); shown[n]=true; } });
  var athHtml=topAths.length?topAths.map(function(n){
    var ch=p.athletes&&p.athletes.indexOf(n)>=0;
    return '<button type="button" data-ath-name="'+n.replace(/"/g,'&quot;')+'" style="display:inline-flex;align-items:center;padding:6px 10px;background:'+(ch?'rgba(59,130,246,.15)':'var(--s2)')+';border:1px solid '+(ch?'var(--accent)':'var(--border2)')+';border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:'+(ch?'var(--accent)':'var(--muted)')+';margin:0 4px 4px 0;min-height:36px;">'+n+'</button>';
  }).join(''):'';
  // Dropdown dla reszty
  var restAths=athletes.filter(function(a){ return !shown[a.name]; });
  var dropHtml='';
  if(restAths.length||!topAths.length){
    dropHtml='<select class="crm-input" style="margin-top:4px;margin-bottom:0;padding:6px 10px;font-size:11px;" onchange="_peToggleAthDrop(this)">'
      +'<option value="">+ Dodaj zawodnika...</option>';
    // Grupuj wg grup
    loadGroups();
    var inGroup={}; teamGroups.forEach(function(g){ g.athletes.forEach(function(n){ inGroup[n]=g.name; }); });
    var grouped={}; var ungrouped=[];
    restAths.forEach(function(a){ var gn=inGroup[a.name]; if(gn){ if(!grouped[gn]) grouped[gn]=[]; grouped[gn].push(a.name); } else ungrouped.push(a.name); });
    Object.keys(grouped).forEach(function(gn){ dropHtml+='<optgroup label="'+gn+'">'; grouped[gn].forEach(function(n){ dropHtml+='<option value="'+n+'">'+n+'</option>'; }); dropHtml+='</optgroup>'; });
    if(ungrouped.length){ dropHtml+='<optgroup label="Bez grupy">'; ungrouped.forEach(function(n){ dropHtml+='<option value="'+n+'">'+n+'</option>'; }); dropHtml+='</optgroup>'; }
    dropHtml+='</select>';
  }
  if(!topAths.length&&!restAths.length) athHtml='<div style="font-size:11px;color:var(--dim);">Dodaj zawodników w zakładce Zawodnicy</div>';

  // Ulubione chipy + przycisk +
  loadFavEx();
  var favCnt=favExercises.length;
  var favNeedToggle=favCnt>4;
  var favChipsHtml='<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:5px;">Ulubione</div>'
    +'<div id="pe-fav-chips" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;'+(favNeedToggle?'max-height:42px;overflow:hidden;':'')+'transition:max-height .25s ease;">';
  favExercises.forEach(function(f){
    favChipsHtml+='<button data-fav-add="'+f.name.replace(/"/g,'&quot;')+'" data-fc="'+(f.cat||'')+'" data-fz="'+(f.zone||'')+'" style="padding:5px 11px;background:var(--s2);border:1px solid var(--border2);border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;color:var(--text);position:relative;-webkit-user-select:none;user-select:none;">'+f.name+'</button>';
  });
  favChipsHtml+='<button onclick="_openFavPanel()" title="Zarządzaj ulubionymi" style="width:30px;height:30px;border-radius:50%;background:var(--s2);border:1px solid var(--border2);font-size:18px;font-weight:600;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .12s;" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'\';this.style.color=\'var(--muted)\'">+</button>';
  favChipsHtml+='</div>'
    +'<button id="pe-fav-toggle" onclick="_toggleFavChips()" style="'+(favNeedToggle?'display:block':'display:none')+';font-size:10px;font-weight:700;color:var(--accent);background:transparent;border:none;cursor:pointer;padding:6px 0;width:100%;text-align:center;margin-top:2px;margin-bottom:8px;">▼ pokaż wszystkie ('+favCnt+')</button>';

  ov.innerHTML='<div style="position:fixed;inset:0;background:var(--bg);overflow-y:auto;z-index:9991;padding:0 0 100px;">'
    +'<div style="max-width:520px;margin:0 auto;padding:16px 14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);">'+(isNew?'+ Nowy plan':'✏️ Edytuj plan')+'</div>'
    +'<button onclick="_closePlanEditor()" style="background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:8px 12px;cursor:pointer;font-size:14px;color:var(--muted);min-width:40px;min-height:40px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<input id="pe-name" type="text" value="'+(p.name||'').replace(/"/g,'&quot;')+'" placeholder="Nazwa planu..." style="width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;outline:none;margin-bottom:12px;box-sizing:border-box;"/>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Zawodnicy</div>'
    +'<div id="pe-athletes" style="display:flex;flex-wrap:wrap;margin-bottom:0;">'+athHtml+'</div>'
    +dropHtml
    +'<div style="margin-bottom:14px;"></div>'
    +favChipsHtml
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">Ćwiczenia</div>'
    +'<div id="pe-exercises">'+_renderPeCards()+'</div>'
    // Dodawanie — szybki select + ręcznie + kategorie + notatka
    +'<div id="pe-add-wrap">'
    +'<div style="display:flex;gap:6px;margin-bottom:6px;">'
    +'<select id="pe-zone-sel" class="crm-input" style="width:90px;margin-bottom:0;padding:8px 6px;font-size:11px;" onchange="_peFilterAllEx()"><option value="">Część...</option><option value="upper">💪 Góra</option><option value="lower">🦵 Dół</option><option value="full">🫁 Centrum</option></select>'
    +'<select id="pe-all-ex-sel" class="crm-input" style="flex:1;margin-bottom:0;padding:8px 6px;font-size:11px;" onchange="_peQuickAdd()"><option value="">+ Dodaj ćwiczenie...</option></select>'
    +'</div>'
    +'<div style="display:flex;gap:6px;">'
    +'<button onclick="_peShowManual()" style="flex:1;padding:8px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--muted);">✍️ Wpisz ręcznie</button>'
    +'<button onclick="_addPeNote()" style="padding:8px 12px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--muted);">📝 Notatka</button>'
    +'</div>'
    +'<div id="pe-manual-wrap" style="display:none;margin-top:8px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-sm);padding:10px;">'
    +'<input id="pe-manual-name" type="text" placeholder="Nazwa ćwiczenia..." style="width:100%;padding:8px 10px;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;outline:none;margin-bottom:6px;box-sizing:border-box;"/>'
    +'<div class="ex-cat-scroll" id="pe-manual-cats" style="margin-bottom:8px;"></div>'
    +'<div style="display:flex;gap:6px;"><button onclick="_peManualAdd()" style="padding:8px 14px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;color:#fff;">Dodaj</button>'
    +'<button onclick="el(\'pe-manual-wrap\').style.display=\'none\'" style="padding:8px 10px;background:transparent;border:none;cursor:pointer;font-size:11px;color:var(--muted);">Anuluj</button></div>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'<div style="position:fixed;bottom:0;left:0;right:0;background:var(--s1);border-top:1px solid var(--border);padding:12px 16px calc(env(safe-area-inset-bottom,10px) + 12px);z-index:9992;"><div style="max-width:520px;margin:0 auto;">'
    +'<button onclick="_savePlan('+p.id+')" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;">💾 Zapisz plan</button>'
    +'</div></div></div>';
  ov.style.display='block';
  _favExpanded=false;
  // Event delegation — chipy zawodników
  var aw=document.getElementById('pe-athletes');
  if(aw) aw.addEventListener('click',function(e){
    var btn=e.target.closest('[data-ath-name]'); if(!btn) return;
    var name=btn.getAttribute('data-ath-name');
    var idx=_editingPlan.athletes.indexOf(name);
    if(idx>=0) _editingPlan.athletes.splice(idx,1); else _editingPlan.athletes.push(name);
    var ch=_editingPlan.athletes.indexOf(name)>=0;
    btn.style.background=ch?'var(--accent-bg)':'var(--s2)'; btn.style.borderColor=ch?'var(--accent)':'var(--border2)'; btn.style.color=ch?'var(--accent)':'var(--muted)';
  });
  // Inicjalizuj long press na chipach ulubionych
  _initFavChipEvents();
  // Wypełnij szybki select wszystkimi ćwiczeniami
  _peFilterAllEx();
  // Wypełnij chipy kategorii w manual
  var mc=document.getElementById('pe-manual-cats'); if(mc){
    mc.innerHTML=''; var _peManCat='';
    Object.keys(EXERCISE_LIBRARY).forEach(function(k){ var c=EXERCISE_LIBRARY[k]; var b=document.createElement('button'); b.className='ex-cat-chip'; b.setAttribute('data-cat',k); b.style.cssText='padding:4px 8px;font-size:9px;'; b.innerHTML=_catIcon(k)+' '+c.label;
    b.onclick=function(){ _peManCat=(_peManCat===k)?'':k; mc.querySelectorAll('.ex-cat-chip').forEach(function(x){ var xk=x.getAttribute('data-cat'); var xc=EXERCISE_LIBRARY[xk]; if(xk===_peManCat){ x.style.background='rgba('+_hexToRgb(xc.color)+',.12)'; x.style.borderColor=xc.color; x.style.color=xc.color; } else { x.style.background=''; x.style.borderColor=''; x.style.color=''; } }); };
    mc.appendChild(b); });
    window._peManCat='';
  }
}

// Szybki select — wszystkie ćwiczenia pogrupowane
function _peFilterAllEx(){
  var zone=(document.getElementById('pe-zone-sel')||{}).value||'';
  var sel=document.getElementById('pe-all-ex-sel'); if(!sel) return;
  sel.innerHTML='<option value="">+ Dodaj ćwiczenie...</option>';
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
function _peQuickAdd(){
  var sel=document.getElementById('pe-all-ex-sel'); if(!sel||!sel.value) return;
  var opt=sel.options[sel.selectedIndex];
  var catKey=opt.getAttribute('data-cat'); var zone=opt.getAttribute('data-zone');
  var name=sel.value.replace(/^★ /,'');
  _addToFav(name,catKey,zone);
  var cat=EXERCISE_LIBRARY[catKey]||{fields:['reps','load']}; var s={note:''}; cat.fields.forEach(function(f){ s[f]=''; });
  _editingPlan.exercises.push({type:'exercise',label:'',exCat:catKey,exZone:zone||'full',exercise:name,targetSets:[Object.assign({},s)],note:''});
  _rfPeEx(); sel.value='';
}
function _peShowManual(){ var w=el('pe-manual-wrap'); if(w){ w.style.display='block'; setTimeout(function(){ el('pe-manual-name').focus(); },50); } }
function _peManualAdd(){
  var name=(el('pe-manual-name').value||'').trim(); if(!name) return;
  var mc=document.getElementById('pe-manual-cats'); var catKey=null;
  if(mc){ var active=mc.querySelector('.ex-cat-chip[style*="border-color"]'); if(active) catKey=active.getAttribute('data-cat')||null; }
  // Sprawdź czy _peManCat jest ustawiony
  if(window._peManCat) catKey=window._peManCat;
  var fields=catKey&&EXERCISE_LIBRARY[catKey]?EXERCISE_LIBRARY[catKey].fields:['reps','load'];
  var s={note:''}; fields.forEach(function(f){ s[f]=''; });
  _editingPlan.exercises.push({type:'exercise',label:'',exCat:catKey,exZone:null,exercise:name,isCustomEntry:true,targetSets:[Object.assign({},s)],note:''});
  el('pe-manual-name').value=''; el('pe-manual-wrap').style.display='none'; window._peManCat='';
  _rfPeEx();
}
function _addPeNote(){ _editingPlan.exercises.push({type:'note',label:'',text:'',exCat:null,exZone:null,exercise:null,targetSets:[]}); _rfPeEx(); }

// Dropdown zawodników i ulubione
function _peToggleAthDrop(sel){
  var name=sel.value; sel.selectedIndex=0; if(!name||!_editingPlan) return;
  var idx=_editingPlan.athletes.indexOf(name);
  if(idx>=0) _editingPlan.athletes.splice(idx,1); else _editingPlan.athletes.push(name);
  var wrap=document.getElementById('pe-athletes'); if(!wrap) return;
  var existing=wrap.querySelector('[data-ath-name="'+name+'"]');
  if(!existing){
    var btn=document.createElement('button'); btn.type='button'; btn.setAttribute('data-ath-name',name);
    btn.style.cssText='display:inline-flex;align-items:center;padding:6px 10px;background:rgba(59,130,246,.15);border:1px solid var(--accent);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--accent);margin:0 4px 4px 0;min-height:36px;';
    btn.textContent=name; wrap.appendChild(btn);
  }
}
function _peAddFav(name,catKey,zone){
  if(!_editingPlan) return;
  var cat=EXERCISE_LIBRARY[catKey]||{fields:['reps','load']}; var s={note:''}; cat.fields.forEach(function(f){ s[f]=''; });
  _editingPlan.exercises.push({type:'exercise',label:'',exCat:catKey||null,exZone:zone||null,exercise:name,targetSets:[Object.assign({},s)],note:''});
  _rfPeEx();
  // Flash na chipie (event.target)
  if(event&&event.target){ var t=event.target; t.style.background='rgba(22,163,74,.15)'; setTimeout(function(){ t.style.background=''; },300); }
}

// ── Odświeżanie chipów ulubionych w edytorze ──
function _refreshPeFavChips(){
  var wrap=document.getElementById('pe-fav-chips'); if(!wrap) return;
  loadFavEx();
  var cnt=favExercises.length; var needToggle=cnt>4;
  wrap.style.maxHeight=needToggle&&!_favExpanded?'42px':'none';
  wrap.style.overflow=needToggle&&!_favExpanded?'hidden':'visible';
  wrap.innerHTML='';
  favExercises.forEach(function(f){
    wrap.innerHTML+='<button data-fav-add="'+f.name.replace(/"/g,'&quot;')+'" data-fc="'+(f.cat||'')+'" data-fz="'+(f.zone||'')+'" style="padding:5px 11px;background:var(--s2);border:1px solid var(--border2);border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;color:var(--text);position:relative;-webkit-user-select:none;user-select:none;">'+f.name+'</button>';
  });
  wrap.innerHTML+='<button onclick="_openFavPanel()" title="Zarządzaj ulubionymi" style="width:30px;height:30px;border-radius:50%;background:var(--s2);border:1px solid var(--border2);font-size:18px;font-weight:600;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">+</button>';
  var btn=document.getElementById('pe-fav-toggle');
  if(btn){
    btn.style.display=needToggle?'block':'none';
    btn.textContent=_favExpanded?'▲ zwiń':'▼ pokaż wszystkie ('+cnt+')';
  }
  _initFavChipEvents();
}
var _favExpanded=false;
function _toggleFavChips(){
  var wrap=document.getElementById('pe-fav-chips'); if(!wrap) return;
  var btn=document.getElementById('pe-fav-toggle'); if(!btn) return;
  loadFavEx();
  _favExpanded=!_favExpanded;
  if(_favExpanded){
    wrap.style.maxHeight='500px'; wrap.style.overflow='visible';
    btn.textContent='▲ zwiń';
  } else {
    wrap.style.maxHeight='42px'; wrap.style.overflow='hidden';
    btn.textContent='▼ pokaż wszystkie ('+favExercises.length+')';
  }
}

// ── Long press + klik na chipach ulubionych (event delegation) ──
var _favLpTimer=null, _favLpTriggered=false;
function _initFavChipEvents(){
  var wrap=document.getElementById('pe-fav-chips'); if(!wrap) return;
  // Usuwamy starych listenerów przez klona (prostsze niż removeEventListener)
  function handler(e){
    var btn=e.target.closest('[data-fav-add]'); if(!btn) return;
    var name=btn.getAttribute('data-fav-add');
    var cat=btn.getAttribute('data-fc'); var zone=btn.getAttribute('data-fz');
    if(_favLpTriggered){ _favLpTriggered=false; e.preventDefault(); e.stopPropagation(); return; }
    // Krótki klik — dodaj do planu
    _peAddFav(name,cat,zone);
    btn.style.background='rgba(22,163,74,.15)'; setTimeout(function(){ btn.style.background=''; },300);
  }
  function startLp(e){
    var btn=e.target.closest('[data-fav-add]'); if(!btn) return;
    _favLpTriggered=false;
    _favLpTimer=setTimeout(function(){
      _favLpTriggered=true;
      _showFavRemovePopup(btn);
    },600);
  }
  function endLp(){ clearTimeout(_favLpTimer); }
  function moveLp(){ clearTimeout(_favLpTimer); }
  wrap.addEventListener('click',handler);
  wrap.addEventListener('mousedown',startLp);
  wrap.addEventListener('mouseup',endLp);
  wrap.addEventListener('mouseleave',endLp);
  wrap.addEventListener('touchstart',startLp,{passive:true});
  wrap.addEventListener('touchend',endLp);
  wrap.addEventListener('touchmove',moveLp,{passive:true});
}

function _showFavRemovePopup(chipBtn){
  // Zamknij stary popup
  var old=document.getElementById('fav-rm-popup'); if(old) old.remove();
  var name=chipBtn.getAttribute('data-fav-add');
  var popup=document.createElement('div'); popup.id='fav-rm-popup';
  popup.style.cssText='position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--s1);border:1px solid var(--border2);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.15);padding:10px 14px;z-index:100;white-space:nowrap;text-align:center;';
  popup.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:8px;">Usunąć z ulubionych?</div>'
    +'<div style="display:flex;gap:8px;justify-content:center;">'
    +'<button id="fav-rm-yes" style="padding:6px 14px;background:transparent;border:none;cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--red-text);">Usuń</button>'
    +'<button id="fav-rm-no" style="padding:6px 14px;background:transparent;border:none;cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;color:var(--muted);">Anuluj</button>'
    +'</div>'
    // Strzałka na dole
    +'<div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:12px;height:6px;overflow:hidden;"><div style="width:12px;height:12px;background:var(--s1);border:1px solid var(--border2);transform:rotate(45deg);position:absolute;top:-7px;left:0;"></div></div>';
  chipBtn.style.position='relative';
  chipBtn.appendChild(popup);
  document.getElementById('fav-rm-yes').onclick=function(e){
    e.stopPropagation();
    loadFavEx();
    favExercises=favExercises.filter(function(f){ return f.name!==name; });
    saveFavEx(); popup.remove(); _refreshPeFavChips(); _initFavChipEvents();
  };
  document.getElementById('fav-rm-no').onclick=function(e){ e.stopPropagation(); popup.remove(); };
  // Zamknij na klik poza
  setTimeout(function(){
    document.addEventListener('click',function _closeFavPopup(e){
      if(!popup.contains(e.target)){ popup.remove(); document.removeEventListener('click',_closeFavPopup); }
    });
  },10);
}

// ── Panel inline ulubionych (pod chipami, NIE modal) ──
function _openFavPanel(){
  var existing=document.getElementById('fav-panel'); if(existing){ existing.remove(); return; }
  loadFavEx(); loadCustomExercises();
  // Zbierz WSZYSTKIE ćwiczenia
  var allEx=[];
  Object.keys(EXERCISE_LIBRARY).forEach(function(catKey){
    var cat=EXERCISE_LIBRARY[catKey];
    ['upper','lower','full'].forEach(function(z){ (cat[z]||[]).forEach(function(name){ allEx.push({name:name,cat:catKey,zone:z}); }); });
    customExercises.filter(function(c){ return c.cat===catKey; }).forEach(function(c){ allEx.push({name:c.name,cat:catKey,zone:c.zone}); });
  });
  // Znajdź kontener — wstaw panel za togglem lub chipami
  var toggle=document.getElementById('pe-fav-toggle');
  var chips=document.getElementById('pe-fav-chips');
  var anchor=toggle||chips; if(!anchor) return;
  var panel=document.createElement('div'); panel.id='fav-panel';
  panel.style.cssText='background:var(--s2);border:1px solid var(--border2);border-radius:12px;padding:12px;margin-top:6px;margin-bottom:8px;max-height:0;overflow:hidden;transition:max-height .2s ease-out;';
  anchor.parentNode.insertBefore(panel,anchor.nextSibling);
  function renderList(filter){
    var filt=(filter||'').toLowerCase(); loadFavEx();
    var html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +'<span style="font-size:12px;font-weight:800;color:var(--text);">⭐ Dodaj ulubione</span>'
      +'<button onclick="document.getElementById(\'fav-panel\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:12px;color:var(--muted);width:24px;height:24px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
      +'<input id="fav-search" type="text" placeholder="Szukaj ćwiczenie..." value="'+(filter||'').replace(/"/g,'&quot;')+'" style="width:100%;padding:8px 10px;background:var(--s1);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;outline:none;margin-bottom:6px;box-sizing:border-box;"/>'
      +'<div style="max-height:200px;overflow-y:auto;scrollbar-width:thin;">';
    var shown=allEx.filter(function(ex){ return !filt||ex.name.toLowerCase().indexOf(filt)>=0; });
    shown.forEach(function(ex){
      var isFav=favExercises.some(function(f){ return f.name===ex.name; });
      var cat=EXERCISE_LIBRARY[ex.cat]||{color:'#888'};
      html+='<div data-fn="'+ex.name.replace(/"/g,'&quot;')+'" data-fc="'+(ex.cat||'')+'" data-fz="'+(ex.zone||'')+'" style="padding:6px 4px;display:flex;align-items:center;gap:8px;cursor:pointer;border-radius:6px;transition:background .3s;" onclick="_toggleFavInPanel(this)">'
        +'<span style="font-size:14px;opacity:'+(isFav?'1':'0.3')+';color:'+(isFav?'#eab308':'var(--muted)')+';">'+(isFav?'⭐':'☆')+'</span>'
        +'<span style="font-size:12px;font-weight:600;color:var(--text);flex:1;">'+ex.name+'</span>'
        +'<span style="font-size:7px;font-weight:800;color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);border-radius:20px;padding:2px 6px;">'+(CAT_SHORT[ex.cat]||'')+'</span></div>';
    });
    if(!shown.length) html+='<div style="text-align:center;color:var(--dim);font-size:11px;padding:12px;">Brak wyników</div>';
    html+='</div><div style="border-top:1px solid var(--border);margin:8px 0;"></div>'
      +'<div style="display:flex;gap:6px;">'
      +'<input id="fav-custom-inp" type="text" placeholder="Wpisz własne..." style="flex:1;padding:8px 10px;background:var(--s1);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;outline:none;box-sizing:border-box;"/>'
      +'<button id="fav-custom-btn" onclick="_addCustomFavInPanel()" style="padding:8px 12px;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:700;white-space:nowrap;">Dodaj</button></div>';
    panel.innerHTML=html;
    var si=document.getElementById('fav-search');
    if(si){ si.oninput=function(){ renderList(si.value); setTimeout(function(){ var s2=document.getElementById('fav-search'); if(s2){ s2.focus(); s2.setSelectionRange(s2.value.length,s2.value.length); } },10); }; }
  }
  renderList('');
  // Animacja otwarcia
  requestAnimationFrame(function(){ panel.style.maxHeight='400px'; });
}
function _closeFavPanel(){ var p=document.getElementById('fav-panel'); if(p){ p.style.maxHeight='0'; setTimeout(function(){ p.remove(); },200); } }

function _toggleFavInPanel(row){
  var name=row.getAttribute('data-fn');
  var catKey=row.getAttribute('data-fc');
  var zone=row.getAttribute('data-fz');
  loadFavEx();
  var idx=favExercises.findIndex(function(f){ return f.name===name; });
  if(idx>=0) favExercises.splice(idx,1);
  else { favExercises.push({name:name,cat:catKey||null,zone:zone||null}); if(favExercises.length>40) favExercises.shift(); }
  saveFavEx();
  // Flash na wierszu
  row.style.background='rgba(59,130,246,.1)'; setTimeout(function(){ row.style.background=''; },300);
  // Odśwież gwiazdkę
  var star=row.querySelector('span');
  var isFav=favExercises.some(function(f){ return f.name===name; });
  if(star){ star.textContent=isFav?'⭐':'☆'; star.style.opacity=isFav?'1':'0.3'; star.style.color=isFav?'#eab308':'var(--muted)'; }
  // Odśwież chipy nad panelem
  _refreshPeFavChips();
}

function _addCustomFavInPanel(){
  var inp=document.getElementById('fav-custom-inp'); if(!inp) return;
  var name=inp.value.trim(); if(!name) return;
  loadFavEx();
  if(!favExercises.find(function(f){ return f.name===name; })){
    favExercises.push({name:name,cat:null,zone:null});
    if(favExercises.length>40) favExercises.shift();
    saveFavEx();
  }
  inp.value='';
  _refreshPeFavChips();
  // Flash na przycisku
  var btn=document.getElementById('fav-custom-btn');
  if(btn){ btn.textContent='✓'; setTimeout(function(){ btn.textContent='Dodaj'; },500); }
}

// ── Renderowanie kart w edytorze ──
function _renderPeCards(){
  var p=_editingPlan; if(!p||!p.exercises) return ''; var html=''; var total=p.exercises.length;
  p.exercises.forEach(function(ex,ei){
    var prev=ei>0?p.exercises[ei-1].label:'';
    var grp=_sameGroup(prev,ex.label);
    var mb=grp?'2':'8'; var bl=grp?'border-left:3px solid var(--accent);':'';
    if(ex.type==='note'){
      html+='<div style="background:rgba(59,130,246,.03);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px;margin-bottom:'+mb+'px;'+bl+'">'
        +'<div style="display:flex;align-items:flex-start;gap:6px;">'
        +'<input type="text" value="'+(ex.label||'').replace(/"/g,'&quot;')+'" placeholder="Nr" maxlength="4" oninput="_editingPlan.exercises['+ei+'].label=this.value" style="width:42px;text-align:center;font-size:14px;font-weight:900;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);padding:6px 2px;color:var(--text);outline:none;flex-shrink:0;"/>'
        +'<textarea rows="2" placeholder="Notatka, instrukcje, uwagi..." oninput="_editingPlan.exercises['+ei+'].text=this.value" style="flex:1;padding:6px 8px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;outline:none;resize:vertical;box-sizing:border-box;">'+(ex.text||'')+'</textarea>'
        +_cardControls(ei,total,'_movePeEx','_rmPeEx')
        +'</div></div>';
      return;
    }
    var cat=EXERCISE_LIBRARY[ex.exCat]||{color:'#888',fields:['reps','load']}; var fields=cat.fields;
    var catBadge=ex.exCat?'<span class="ex-cat-badge" style="color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);border-radius:20px;padding:3px 10px;">'+(CAT_SHORT[ex.exCat]||'?')+'</span>':'';
    // Gwiazdka — ulubione
    loadFavEx(); var isFav=favExercises.some(function(f){ return f.name===ex.exercise; });
    var starBtn='<button onclick="_peToggleFav('+ei+')" title="'+(isFav?'Usuń z ulubionych':'Dodaj do ulubionych')+'" style="font-size:16px;background:transparent;border:none;cursor:pointer;padding:2px;opacity:'+(isFav?'1':'0.25')+';color:'+(isFav?'#eab308':'var(--muted)')+';flex-shrink:0;">⭐</button>';
    html+='<div style="background:var(--s2);border:1px solid var(--border);border-radius:16px;padding:12px;margin-bottom:'+mb+'px;'+bl+'box-shadow:0 2px 8px rgba(0,0,0,.06);">'
      // Header
      +'<div style="display:flex;align-items:center;gap:5px;margin-bottom:8px;">'
      +'<input type="text" value="'+(ex.label||'').replace(/"/g,'&quot;')+'" placeholder="Nr" maxlength="4" oninput="_editingPlan.exercises['+ei+'].label=this.value" style="width:42px;text-align:center;font-size:14px;font-weight:900;background:var(--s1);border:1px solid var(--border2);border-radius:10px;padding:6px 2px;color:var(--text);outline:none;flex-shrink:0;"/>'
      +catBadge
      +'<span style="font-size:13px;font-weight:800;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ex.exercise+'</span>'
      +starBtn
      +(ex.exZone?'<span style="font-size:9px;color:var(--dim);flex-shrink:0;">'+(ZONE_LABELS[ex.exZone]||'')+'</span>':'')
      +_cardControls(ei,total,'_movePeEx','_rmPeEx')
      +'</div>'
      // Serie — z placeholderami zamiast nagłówków
    ;if(!(ex.targetSets||[]).length) html+='<div style="text-align:center;color:var(--dim);font-size:11px;padding:8px;">Dodaj serie przyciskiem + Seria</div>';
    (ex.targetSets||[]).forEach(function(s,si){
      var hasNote=s.note&&s.note.trim();
      html+='<div class="ex-set-row" style="margin-bottom:4px;gap:5px;">'
        +'<div class="ex-set-badge" style="opacity:.5;">S'+(si+1)+'</div>';
      fields.forEach(function(f){
        var ph={reps:'Powt',load:'kg',rir:'RIR',time:'Czas(s)',dist:'Dyst(m)'}[f]||f;
        html+='<input class="ex-set-input" style="flex:1;min-width:'+(_fieldWidth(f)-10)+'px;border-radius:10px;height:40px;font-size:14px;" data-ei="'+ei+'" data-si="'+si+'" data-field="'+f+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" placeholder="'+ph+'" value="'+(s[f]||'')+'" oninput="_upPeSet('+ei+','+si+',\''+f+'\',this.value)"/>';
      });
      html+='<button onclick="_openPeSetNote('+ei+','+si+')" title="Notatka do serii" style="min-width:36px;min-height:36px;background:'+(hasNote?'rgba(59,130,246,.1)':'transparent')+';border:none;border-radius:8px;cursor:pointer;font-size:16px;opacity:'+(hasNote?'0.8':'0.4')+';position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;">📝'+(hasNote?'<span style="position:absolute;top:1px;right:1px;width:4px;height:4px;border-radius:50%;background:var(--accent);"></span>':'')+'</button>';
      html+='<button onclick="_rmPeSet('+ei+','+si+')" title="Usuń serię" style="min-width:36px;min-height:36px;background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--muted);opacity:0.4;display:flex;align-items:center;justify-content:center;flex-shrink:0;" onmouseover="this.style.opacity=\'0.9\';this.style.color=\'var(--red-text)\'" onmouseout="this.style.opacity=\'0.4\';this.style.color=\'var(--muted)\'">🗑</button>';
      html+='</div>';
      if(hasNote) html+='<div onclick="_openPeSetNote('+ei+','+si+')" style="font-size:10px;font-style:italic;color:var(--muted);padding-left:28px;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;">'+s.note+'</div>';
    });
    // + Seria
    html+='<button onclick="_addPeSet('+ei+')" style="margin-top:6px;width:100%;padding:10px;background:transparent;border:1.5px dashed var(--border2);border-radius:12px;cursor:pointer;font-size:12px;font-weight:700;color:var(--muted);">+ Seria</button>';
    // Notatka do ćwiczenia
    html+='<button onclick="_openPeExNote('+ei+')" style="margin-top:6px;padding:4px 8px;background:transparent;border:none;cursor:pointer;font-size:11px;font-weight:600;color:var(--muted);">📝 Notatka do ćwiczenia</button>';
    if(ex.note&&ex.note.trim()) html+='<div onclick="_openPeExNote('+ei+')" style="font-size:11px;font-style:italic;color:var(--muted);padding-left:4px;margin-top:2px;max-height:32px;overflow:hidden;cursor:pointer;">'+ex.note.replace(/</g,'&lt;')+'</div>';
    html+='</div>';
  });
  return html;
}

function _upPeSet(ei,si,f,v){ if(_editingPlan&&_editingPlan.exercises[ei]&&_editingPlan.exercises[ei].targetSets[si]) _editingPlan.exercises[ei].targetSets[si][f]=v; }
function _addPeSet(ei){ if(!_editingPlan||!_editingPlan.exercises[ei]) return; var cat=EXERCISE_LIBRARY[_editingPlan.exercises[ei].exCat]||{fields:['reps','load']}; var s={note:''}; cat.fields.forEach(function(f){ s[f]=''; }); _editingPlan.exercises[ei].targetSets.push(s); _rfPeEx(); }
function _rmPeSet(ei,si){ if(!_editingPlan||!_editingPlan.exercises[ei]) return; _editingPlan.exercises[ei].targetSets.splice(si,1); _rfPeEx(); }
// Toggle ulubione na karcie ćwiczenia
function _peToggleFav(ei){
  if(!_editingPlan||!_editingPlan.exercises[ei]) return;
  var name=_editingPlan.exercises[ei].exercise;
  var catKey=_editingPlan.exercises[ei].exCat;
  var zone=_editingPlan.exercises[ei].exZone;
  loadFavEx();
  var idx=favExercises.findIndex(function(f){ return f.name===name; });
  if(idx>=0) favExercises.splice(idx,1); else { favExercises.push({name:name,cat:catKey||null,zone:zone||null}); if(favExercises.length>40) favExercises.shift(); }
  saveFavEx();
  _refreshPeFavChips(); // Zaktualizuj chipy ulubionych
  _rfPeEx(); // Przerenderuj karty (aktualizuje WSZYSTKIE gwiazdki)
}
// Modal notatki do ćwiczenia (nie serii)
function _openPeExNote(ei){
  if(!_editingPlan||!_editingPlan.exercises[ei]) return;
  var ex=_editingPlan.exercises[ei];
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) translateY(16px);opacity:0;max-width:400px;width:calc(100% - 40px);background:var(--s1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:18px;z-index:9993;transition:all .18s ease-out;" id="en-modal">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    +'<div style="font-size:14px;font-weight:800;color:var(--text);">📝 Notatka — '+ex.exercise+'</div>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:var(--muted);width:28px;height:28px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<textarea id="en-ta" rows="5" placeholder="Uwagi do ćwiczenia..." style="width:100%;min-height:140px;max-height:40vh;padding:12px;background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:500;line-height:1.6;outline:none;resize:vertical;box-sizing:border-box;">'+(ex.note||'')+'</textarea>'
    +'<button id="en-save" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;margin-top:10px;">Zapisz</button>'
    +'</div>';
  ov.style.display='flex'; ov.style.background='rgba(0,0,0,.45)'; ov.style.backdropFilter='blur(6px)'; ov.style.webkitBackdropFilter='blur(6px)';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ var m=el('en-modal'); if(m){ m.style.opacity='1'; m.style.transform='translate(-50%,-50%) translateY(0)'; } }); });
  setTimeout(function(){ el('en-ta').focus(); },100);
  document.getElementById('en-save').onclick=function(){
    _editingPlan.exercises[ei].note=(el('en-ta').value||'').trim();
    ov.style.display='none'; ov.innerHTML=''; ov.style.backdropFilter=''; ov.style.webkitBackdropFilter=''; ov.style.background=''; document.body.style.overflow='';
    _rfPeEx();
  };
}

// Batch dodawanie serii w edytorze planu
function _peBatchAdd(ei){
  if(!_editingPlan||!_editingPlan.exercises[ei]) return;
  var cat=EXERCISE_LIBRARY[_editingPlan.exercises[ei].exCat]||{fields:['reps','load']}; var fields=cat.fields;
  var cnt=parseInt((document.getElementById('pe-batch-cnt-'+ei)||{}).value)||1; if(cnt<1) cnt=1; if(cnt>20) cnt=20;
  var vals={}; fields.forEach(function(f){ vals[f]=(document.getElementById('pe-batch-'+ei+'-'+f)||{}).value||''; });
  for(var i=0;i<cnt;i++){ var s={note:''}; fields.forEach(function(f){ s[f]=vals[f]; }); _editingPlan.exercises[ei].targetSets.push(s); }
  fields.forEach(function(f){ var inp=document.getElementById('pe-batch-'+ei+'-'+f); if(inp) inp.value=''; });
  _rfPeEx();
}
// Modal notatki serii w edytorze planu
function _openPeSetNote(ei,si){
  if(!_editingPlan||!_editingPlan.exercises[ei]) return;
  _openSetNoteModal(_editingPlan.exercises[ei].targetSets, si, _rfPeEx);
}
function _rmPeEx(ei){ if(!_editingPlan) return; _editingPlan.exercises.splice(ei,1); _rfPeEx(); }
function _movePeEx(ei,d){ if(!_editingPlan) return; var a=_editingPlan.exercises; var n=ei+d; if(n<0||n>=a.length) return; var t=a[ei]; a[ei]=a[n]; a[n]=t; _rfPeEx(); }
function _rfPeEx(){ var c=document.getElementById('pe-exercises'); if(c) c.innerHTML=_renderPeCards(); }

// ── Zapis planu ──
function _savePlan(existingId){
  var name=(document.getElementById('pe-name').value||'').trim();
  if(!name){ document.getElementById('pe-name').style.borderColor='var(--red)'; setTimeout(function(){ document.getElementById('pe-name').style.borderColor=''; },1000); return; }
  if(!_editingPlan.exercises.length) return;
  _editingPlan.name=name; var today=getDayKey(new Date());
  loadPlans();
  if(existingId){ _pushUndo('Plan: '+name); var idx=-1; for(var i=0;i<trainingPlans.length;i++){ if(trainingPlans[i].id===existingId){ idx=i; break; } } if(idx>=0){ _editingPlan.updated=today; trainingPlans[idx]=_editingPlan; } }
  else { _pushUndo('Nowy plan: '+name); _editingPlan.id=Date.now(); _editingPlan.created=today; _editingPlan.updated=today; _editingPlan.status='active'; trainingPlans.push(_editingPlan); }
  savePlans(); _closePlanEditor(); renderPlansList();
}
function _closePlanEditor(){ _editingPlan=null; var ov=el('confirm-overlay'); if(ov){ ov.style.display='none'; ov.innerHTML=''; } document.body.style.overflow=''; }

// ── Kopiowanie i usuwanie ──
function copyPlan(id){ loadPlans(); var p=_findPlan(id); if(!p) return; _pushUndo('Kopia: '+p.name); var c=JSON.parse(JSON.stringify(p)); c.id=Date.now(); c.name='Kopia — '+c.name; c.created=getDayKey(new Date()); c.updated=c.created; trainingPlans.push(c); savePlans(); renderPlansList(); }
function deletePlanConfirm(id){
  loadPlans(); var p=_findPlan(id); if(!p) return; var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:22px 18px;max-width:340px;width:100%;text-align:center;"><div style="font-size:24px;margin-bottom:8px;">🗑</div><div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Usunąć plan?</div><div style="font-size:13px;color:var(--muted);margin-bottom:16px;">'+p.name+'</div><div style="display:flex;gap:8px;"><button onclick="_delPlan('+id+')" style="flex:1;padding:11px;background:#ef4444;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button><button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
}
function _delPlan(id){ _pushUndo('Usunięto plan'); loadPlans(); trainingPlans=trainingPlans.filter(function(x){ return x.id!==id; }); savePlans(); el('confirm-overlay').style.display='none'; renderPlansList(); }

// ══════════════════════════════════════
//  TRYB WYKONANIA PLANU W SESJI
// ══════════════════════════════════════
var _sessionMode='manual',_execPlan=null;
var _athleteSessionState={};

function setSessionMode(mode){
  _sessionMode=mode;
  var m=el('smode-manual'),p=el('smode-plan'),n=el('smode-notepad');
  if(m) m.className='chip'+(mode==='manual'?' on-blue':'');
  if(p) p.className='chip'+(mode==='plan'?' on-blue':'');
  if(n) n.className='chip'+(mode==='notepad'?' on-blue':'');
  var mw=el('manual-forms-wrap'),pe=el('plan-execution'),nv=el('notepad-view');
  if(mw) mw.style.display=mode==='manual'?'block':'none';
  if(pe) pe.style.display=mode==='plan'?'block':'none';
  if(nv) nv.style.display=mode==='notepad'?'block':'none';
  if(mode==='plan') _refreshPlanSel();
  if(mode==='manual') _renderPlanHint();
}

// ── Notatnik z modalem ──
function _openNotepadModal(){
  var athlete=(el('note-athlete').value||'').trim()||activeAthlete||'';
  var preview=el('notepad-preview');
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) translateY(20px);opacity:0;max-width:480px;width:calc(100% - 32px);background:var(--s1);border-radius:var(--r);box-shadow:0 20px 60px rgba(0,0,0,.3);padding:20px;z-index:9993;transition:all .2s ease-out;" id="notepad-modal">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
    +'<div style="font-size:15px;font-weight:800;color:var(--text);">📝 Notatka'+(athlete?' — '+athlete:'')+'</div>'
    +'<button onclick="_closeNotepadModal()" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--muted);width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<textarea id="notepad-modal-ta" rows="8" placeholder="Wpisz trening: ćwiczenia, serie, uwagi..." style="width:100%;min-height:200px;max-height:50vh;padding:14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-sm);color:var(--text);font-family:Montserrat,sans-serif;font-size:15px;font-weight:500;line-height:1.7;outline:none;resize:vertical;box-sizing:border-box;">'+(preview?preview.value:'')+'</textarea>'
    +'<button onclick="_saveNotepadModal()" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;margin-top:12px;">💾 Zapisz i zamknij</button>'
    +'</div>';
  ov.style.display='flex'; ov.style.background='rgba(0,0,0,.5)'; ov.style.backdropFilter='blur(8px)'; ov.style.webkitBackdropFilter='blur(8px)';
  // Animacja wejścia
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ var modal=el('notepad-modal'); if(modal){ modal.style.opacity='1'; modal.style.transform='translate(-50%,-50%) translateY(0)'; } }); });
  setTimeout(function(){ el('notepad-modal-ta').focus(); },100);
}
function _closeNotepadModal(){
  var ta=el('notepad-modal-ta'); var preview=el('notepad-preview');
  if(ta&&preview) preview.value=ta.value;
  var ov=el('confirm-overlay'); if(ov){ ov.style.display='none'; ov.innerHTML=''; ov.style.backdropFilter=''; ov.style.webkitBackdropFilter=''; ov.style.background=''; }
  document.body.style.overflow='';
}
function _saveNotepadModal(){
  var ta=el('notepad-modal-ta'); var preview=el('notepad-preview');
  if(ta&&preview) preview.value=ta.value;
  _closeNotepadModal();
}
function _saveNotepadEntry(){
  var text=(el('notepad-preview').value||'').trim(); if(!text) return;
  var athlete=(el('note-athlete').value||'').trim();
  var now=new Date(); var hh=String(now.getHours()).padStart(2,'0'); var mm=String(now.getMinutes()).padStart(2,'0');
  var day=selectedDay||getDayKey(now);
  _pushUndo('Notatka: '+text.substring(0,30));
  loadNotes();
  notes.push({id:Date.now(),date:day,athlete:athlete,text:text,type:'strength',time:hh+':'+mm});
  saveNotes(); el('notepad-preview').value=''; renderCal(); renderDayDetail(day);
  var btn=el('notepad-save-btn'); if(btn){ var o=btn.textContent; btn.textContent='✓ Zapisano!'; btn.style.background='var(--green)'; setTimeout(function(){ btn.textContent=o; btn.style.background=''; },1200); }
}

// ── Stan per zawodnik ──
function _saveAthleteState(name){
  if(!name) return;
  var state={mode:_sessionMode};
  if(_sessionMode==='notepad'){ var p=el('notepad-preview'); state.notepadText=p?p.value:''; }
  if(_sessionMode==='plan'){ var s=el('plan-select'); state.planId=s?parseInt(s.value):null; }
  _athleteSessionState[name]=state;
}
function _restoreAthleteState(name){
  if(!name) return;
  var state=_athleteSessionState[name];
  if(state){
    setSessionMode(state.mode||'manual');
    if(state.mode==='notepad'){ var p=el('notepad-preview'); if(p) p.value=state.notepadText||''; }
    if(state.mode==='plan'&&state.planId){
      _refreshPlanSel();
      var s=el('plan-select'); if(s){ s.value=state.planId; renderPlanExecution(); }
    }
  } else {
    setSessionMode('manual');
    _renderPlanHint();
  }
}
function _refreshPlanSel(){
  loadPlans(); var sel=el('plan-select'); if(!sel) return;
  var ath=(el('note-athlete').value||'').trim()||activeAthlete||'';
  sel.innerHTML='<option value="">Wybierz plan...</option>';
  var avail=trainingPlans.filter(function(p){ return p.status!=='archived'&&(!ath||!p.athletes||!p.athletes.length||p.athletes.indexOf(ath)>=0); });
  var np=el('plan-no-plans');
  if(!avail.length){ sel.innerHTML='<option value="">Brak planów'+(ath?' dla '+ath:'')+'</option>'; if(np){ np.style.display='block'; np.innerHTML='<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px;">Brak planów'+(ath?' dla '+ath:'')+'. <button onclick="setMode(\'plans\')" style="background:transparent;border:none;cursor:pointer;color:var(--accent);font-weight:700;font-size:12px;text-decoration:underline;">Przejdź do Planów</button></div>'; } return; }
  if(np) np.style.display='none';
  avail.forEach(function(p){ var o=document.createElement('option'); o.value=p.id; o.textContent=p.name; sel.appendChild(o); });
}

function renderPlanExecution(){
  var sel=el('plan-select'); var pid=parseInt(sel?sel.value:'');
  var c=el('plan-exec-list'); if(!c) return;
  if(!pid){ c.innerHTML=''; el('plan-exec-save-wrap').style.display='none'; return; }
  loadPlans(); var plan=_findPlan(pid); if(!plan){ c.innerHTML=''; return; }
  _execPlan=JSON.parse(JSON.stringify(plan));
  _execPlan.exercises.forEach(function(ex){ if(ex.targetSets) ex.targetSets.forEach(function(s){ s._checked=false; s._note=s._note||''; }); });
  _renderExecCards(c);
  el('plan-exec-save-wrap').style.display='block';
}

function _renderExecCards(container){
  if(!_execPlan) return;
  var orig=_findPlan(_execPlan.id);
  container.innerHTML=''; var total=_execPlan.exercises.length;
  _execPlan.exercises.forEach(function(ex,ei){
    var prev=ei>0?_execPlan.exercises[ei-1].label:'';
    var grp=_sameGroup(prev,ex.label);
    var mb=grp?'2':'8'; var bl=grp?'border-left:3px solid var(--accent);':'';
    // Notatka
    if(ex.type==='note'){
      var nd=document.createElement('div');
      nd.style.cssText='background:rgba(59,130,246,.03);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:'+mb+'px;'+bl;
      nd.innerHTML='<div style="display:flex;align-items:flex-start;gap:8px;">'+(ex.label?'<span style="font-size:14px;font-weight:900;color:var(--dim);min-width:28px;">'+ex.label+'</span>':'')+'<div style="font-size:12px;font-style:italic;color:var(--muted);line-height:1.5;white-space:pre-wrap;">'+(ex.text||'').replace(/</g,'&lt;')+'</div></div>';
      container.appendChild(nd); return;
    }
    // Ćwiczenie
    var cat=EXERCISE_LIBRARY[ex.exCat]||{color:'#888',fields:['reps','load']}; var fields=cat.fields;
    var origEx=orig&&orig.exercises&&orig.exercises[ei]?orig.exercises[ei]:null;
    var sum=_planSetSummary(origEx||ex);
    var catBadge=ex.exCat?'<span class="ex-cat-badge" style="color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);">'+(CAT_SHORT[ex.exCat]||'?')+'</span>':'';
    var card=document.createElement('div');
    card.style.cssText='background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:'+mb+'px;'+bl;
    var h='<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">';
    if(ex.label) h+='<span style="font-size:14px;font-weight:900;color:var(--text);min-width:28px;">'+ex.label+'</span>';
    h+=catBadge+'<span style="font-size:13px;font-weight:800;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ex.exercise+'</span>'
      +(ex.exZone?'<span style="font-size:9px;color:var(--dim);flex-shrink:0;">'+(ZONE_LABELS[ex.exZone]||'')+'</span>':'')
      +_cardControls(ei,total,'_moveExecEx','_rmExecEx')
      +'</div>';
    if(sum) h+='<div style="font-size:11px;color:var(--muted);margin-bottom:6px;">Cel: '+sum+'</div>';
    // Nagłówki: ✓ + kolumny + 📝
    h+='<div style="display:flex;gap:4px;align-items:center;margin-bottom:3px;">'
      +'<div style="width:34px;flex-shrink:0;text-align:center;font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--muted);">OK</div>';
    fields.forEach(function(f){ h+='<div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;flex:1;min-width:'+(_fieldWidth(f)-10)+'px;">'+FIELD_LABELS[f]+'</div>'; });
    h+='<div style="width:32px;flex-shrink:0;"></div></div>';
    // Serie
    (ex.targetSets||[]).forEach(function(s,si){
      var ck=s._checked; var os=origEx&&origEx.targetSets&&origEx.targetSets[si]?origEx.targetSets[si]:null;
      // Czy seria zmieniona vs plan?
      var changed=false; var origDesc='';
      if(os){ fields.forEach(function(f){ if(String(s[f]||'')!==String(os[f]||'')) changed=true; }); if(changed) origDesc=_origSetText(os,fields); }
      var rowBg=ck?'background:rgba(22,163,74,.05);':'';
      if(changed) rowBg='background:rgba(217,119,6,.05);';
      h+='<div style="margin-bottom:3px;">'
        +'<div class="pe-exec-row" style="display:flex;gap:4px;align-items:center;padding:3px 0;border-radius:var(--r-xs);'+rowBg+'transition:background .2s;">'
        +'<label style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;cursor:pointer;flex-shrink:0;">'
        +'<input type="checkbox" '+(ck?'checked ':'')+' onchange="_togExec('+ei+','+si+',this)" style="width:18px;height:18px;accent-color:var(--green);cursor:pointer;"/></label>';
      fields.forEach(function(f){
        var v=s[f]||'';
        h+='<input class="ex-set-input" style="flex:1;min-width:'+(_fieldWidth(f)-10)+'px;'+(ck&&!changed?'border-color:var(--green);':'')+(changed?'border-color:var(--amber);':'')+'" data-ei="'+ei+'" data-si="'+si+'" data-field="'+f+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" value="'+v+'" placeholder="—" oninput="_upExec('+ei+','+si+',\''+f+'\',this.value)"/>';
      });
      // Notatka serii — przycisk
      var hasNote=s._note&&s._note.trim();
      h+='<button onclick="_openSetNote('+ei+','+si+')" title="Notatka" style="width:32px;height:32px;background:'+(hasNote?'rgba(59,130,246,.1)':'transparent')+';border:none;cursor:pointer;font-size:14px;opacity:'+(hasNote?'0.8':'0.3')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:var(--r-xs);">📝</button>';
      h+='</div>';
      // Indicator zmiany pod wierszem
      if(changed) h+='<div style="font-size:10px;color:var(--amber-text);font-style:italic;padding-left:38px;margin-top:1px;">⚠ Zmieniono: plan → '+origDesc+'</div>';
      // Notatka serii — tekst pod wierszem
      if(hasNote) h+='<div onclick="_openSetNote('+ei+','+si+')" style="font-size:10px;font-style:italic;color:var(--muted);padding-left:38px;margin-top:1px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+s._note.replace(/</g,'&lt;')+'</div>';
      h+='</div>';
    });
    // + Seria ekstra
    h+='<button onclick="_addExecSet('+ei+')" style="margin-top:3px;padding:4px 10px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:10px;font-weight:700;color:var(--muted);min-height:28px;">+ Seria ekstra</button>';
    if(ex.note) h+='<div style="font-size:11px;font-style:italic;color:var(--muted);margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">'+ex.note+'</div>';
    card.innerHTML=h; container.appendChild(card);
  });
}

// Modal notatki do serii
function _openSetNote(ei,si){
  if(!_execPlan) return;
  var s=_execPlan.exercises[ei].targetSets[si];
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:400px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:12px;">📝 Notatka — S'+(si+1)+'</div>'
    +'<textarea id="set-note-ta" rows="5" placeholder="Notatka do serii..." style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;margin-bottom:12px;">'+(s._note||'')+'</textarea>'
    +'<div style="display:flex;gap:8px;"><button id="set-note-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">💾 Zapisz</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="padding:12px 14px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('set-note-ta').focus(); },50);
  document.getElementById('set-note-save').onclick=function(){
    _execPlan.exercises[ei].targetSets[si]._note=(el('set-note-ta').value||'').trim();
    ov.style.display='none'; var c=el('plan-exec-list'); if(c) _renderExecCards(c);
  };
}

function _togExec(ei,si,cb){ if(!_execPlan) return; _execPlan.exercises[ei].targetSets[si]._checked=cb.checked; var c=el('plan-exec-list'); if(c) _renderExecCards(c); }
function _upExec(ei,si,f,v){ if(_execPlan&&_execPlan.exercises[ei]&&_execPlan.exercises[ei].targetSets[si]) _execPlan.exercises[ei].targetSets[si][f]=v; }
function _addExecSet(ei){ if(!_execPlan||!_execPlan.exercises[ei]) return; var cat=EXERCISE_LIBRARY[_execPlan.exercises[ei].exCat]||{fields:['reps','load']}; var s={_note:'',_checked:false}; cat.fields.forEach(function(f){ s[f]=''; }); _execPlan.exercises[ei].targetSets.push(s); var c=el('plan-exec-list'); if(c) _renderExecCards(c); }
function _moveExecEx(ei,d){ if(!_execPlan) return; var a=_execPlan.exercises; var n=ei+d; if(n<0||n>=a.length) return; var t=a[ei]; a[ei]=a[n]; a[n]=t; var c=el('plan-exec-list'); if(c) _renderExecCards(c); }
function _rmExecEx(ei){ if(!_execPlan) return; _execPlan.exercises.splice(ei,1); var c=el('plan-exec-list'); if(c) _renderExecCards(c); }

// ── Zapis wykonanej sesji ──
function saveExecutedPlan(){
  if(!_execPlan) return;
  var athlete=(el('note-athlete').value||'').trim()||activeAthlete||'';
  if(!athlete){ el('note-athlete').focus(); return; }
  var saveDay=selectedDay||getDayKey(new Date());
  var now=new Date(); var hh=String(now.getHours()).padStart(2,'0'); var mm=String(now.getMinutes()).padStart(2,'0');
  _pushUndo('Sesja: '+_execPlan.name+' — '+athlete);
  loadNotes(); var count=0;
  _execPlan.exercises.forEach(function(ex,ei){
    if(ex.type==='note'){ if(ex.text&&ex.text.trim()){ notes.push({id:Date.now()+ei,date:saveDay,time:hh+':'+mm,athlete:athlete,type:'strength',text:ex.text,label:ex.label||'',fromPlan:_execPlan.id}); count++; } return; }
    var cat=EXERCISE_LIBRARY[ex.exCat]||{fields:['reps','load']};
    var sets=ex.targetSets.filter(function(s){ return cat.fields.some(function(f){ return s[f]&&String(s[f]).trim(); }); }).map(function(s){ var o={note:s._note||''}; cat.fields.forEach(function(f){ o[f]=s[f]||''; }); return o; });
    if(!sets.length) return;
    var entry={id:Date.now()+ei,date:saveDay,time:hh+':'+mm,athlete:athlete,type:'strength',exCat:ex.exCat,exZone:ex.exZone,exercise:ex.exercise,sets:sets,generalNote:ex.note||'',label:ex.label||'',fromPlan:_execPlan.id,fromPlanName:_execPlan.name};
    if(ex.isCustomEntry) entry.isCustomEntry=true;
    entry.text=buildEntryText(entry); notes.push(entry); count++;
  });
  saveNotes(); renderCal(); renderDayDetail(saveDay);
  var btn=el('plan-exec-save-btn');
  if(btn){ var o=btn.textContent; btn.textContent='✅ Zapisano! '+count+' elem.'; btn.style.background='var(--green)'; setTimeout(function(){ btn.textContent=o; btn.style.background=''; },2000); }
  launchConfetti();
  setTimeout(function(){ var s=el('plan-select'); if(s) s.value=''; var c=el('plan-exec-list'); if(c) c.innerHTML=''; el('plan-exec-save-wrap').style.display='none'; _execPlan=null; },2500);
}

// ── launchPlan z zakładki Plany ──
function launchPlan(planId){
  loadPlans(); var p=_findPlan(planId); if(!p) return;
  setMode('diary');
  setTimeout(function(){
    setSessionMode('plan');
    if(p.athletes&&p.athletes.length===1){ var s=el('note-athlete'); if(s) s.value=p.athletes[0]; }
    _refreshPlanSel();
    var sel=el('plan-select'); if(sel){ sel.value=planId; renderPlanExecution(); }
  },100);
}

// ── Hint w trybie manual ──
function _renderPlanHint(){
  var h=el('plan-hint'); if(!h) return;
  var ath=(el('note-athlete').value||'').trim()||activeAthlete||'';
  if(!ath||_sessionMode!=='manual'){ h.style.display='none'; return; }
  loadPlans();
  var cnt=trainingPlans.filter(function(p){ return p.athletes&&p.athletes.indexOf(ath)>=0&&p.status!=='archived'; }).length;
  if(cnt>0){ h.textContent='📋 '+ath+' ma '+cnt+' plan'+(cnt===1?'':'ów'); h.style.display='block'; }
  else h.style.display='none';
}

// ── Plany w profilu zawodnika ──
function buildAthletePlansHtml(athleteName){
  loadPlans();
  var ap=trainingPlans.filter(function(p){ return p.athletes&&p.athletes.indexOf(athleteName)>=0&&p.status!=='archived'; });
  if(!ap.length) return '';
  var html='<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">📅 Plany</div>';
  ap.forEach(function(p){
    var exN=(p.exercises||[]).filter(function(e){ return e.type!=='note'; }).map(function(e){ return (e.label?e.label+' ':'')+e.exercise; }).join(', ');
    html+='<div style="background:var(--accent-bg);border:1px solid var(--accent);border-radius:var(--r-xs);padding:8px 10px;margin-bottom:6px;">'
      +'<div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:2px;">'+p.name+'</div>'
      +(exN?'<div style="font-size:10px;color:var(--muted);margin-bottom:6px;">'+exN+'</div>':'')
      +'<div style="display:flex;gap:6px;">'
      +'<button onclick="openPlanEditor('+p.id+')" style="flex:1;padding:6px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:10px;font-weight:700;color:var(--text);">✏️</button>'
      +'<button onclick="launchPlan('+p.id+')" style="flex:1;padding:6px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-size:10px;font-weight:800;color:#fff;">▶ Uruchom</button></div></div>';
  });
  html+='</div>'; return html;
}
function buildAthleteActivePlans(athleteName){
  loadPlans();
  var a=trainingPlans.filter(function(p){ return p.athletes&&p.athletes.indexOf(athleteName)>=0&&p.status!=='archived'; });
  if(!a.length) return '';
  var html='<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin:10px 0 5px;">📅 Aktywne plany</div>';
  a.forEach(function(p){ html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;"><span style="font-weight:700;color:var(--text);">'+p.name+'</span><button onclick="event.stopPropagation();launchPlan('+p.id+')" style="padding:4px 10px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-size:9px;font-weight:800;color:#fff;">▶</button></div>'; });
  return html;
}
function startSessionWithPlan(id){ launchPlan(id); }
function openQuickPlan(ath){ loadPlans(); var a=trainingPlans.filter(function(p){ return p.athletes&&p.athletes.indexOf(ath)>=0&&p.status!=='archived'; }); if(a.length>=1) launchPlan(a[0].id); else setMode('plans'); }
