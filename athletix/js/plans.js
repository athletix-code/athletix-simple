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
  h+='<button onclick="'+moveF+'('+ei+',-1)" title="Przesuń ćwiczenie wyżej" class="pe-move-btn'+(ei===0?' disabled':'')+'">▲</button>';
  h+='<button onclick="'+moveF+'('+ei+',1)" title="Przesuń ćwiczenie niżej" class="pe-move-btn'+(ei>=total-1?' disabled':'')+'">▼</button>';
  h+='<button onclick="'+rmF+'('+ei+')" title="Usuń ćwiczenie" class="pe-del-btn">🗑</button>';
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
  var athHtml=athletes.length?athletes.map(function(a){
    var ch=p.athletes&&p.athletes.indexOf(a.name)>=0;
    return '<button type="button" data-ath-name="'+a.name.replace(/"/g,'&quot;')+'" style="display:inline-flex;align-items:center;padding:6px 10px;background:'+(ch?'var(--accent-bg)':'var(--s2)')+';border:1px solid '+(ch?'var(--accent)':'var(--border2)')+';border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:'+(ch?'var(--accent)':'var(--muted)')+';margin:0 4px 4px 0;min-height:36px;">'+a.name+'</button>';
  }).join(''):'<div style="font-size:11px;color:var(--dim);">Dodaj zawodników w zakładce Zawodnicy</div>';

  ov.innerHTML='<div style="position:fixed;inset:0;background:var(--bg);overflow-y:auto;z-index:9991;padding:0 0 100px;">'
    +'<div style="max-width:520px;margin:0 auto;padding:16px 14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);">'+(isNew?'+ Nowy plan':'✏️ Edytuj plan')+'</div>'
    +'<button onclick="_closePlanEditor()" style="background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:8px 12px;cursor:pointer;font-size:14px;color:var(--muted);min-width:40px;min-height:40px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<input id="pe-name" type="text" value="'+(p.name||'').replace(/"/g,'&quot;')+'" placeholder="Nazwa planu..." style="width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;outline:none;margin-bottom:12px;box-sizing:border-box;"/>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Zawodnicy</div>'
    +'<div id="pe-athletes" style="display:flex;flex-wrap:wrap;margin-bottom:14px;">'+athHtml+'</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">Elementy planu</div>'
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
    var catBadge=ex.exCat?'<span class="ex-cat-badge" style="color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);">'+(CAT_SHORT[ex.exCat]||'?')+'</span>':'';
    html+='<div style="background:var(--s2);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px;margin-bottom:'+mb+'px;'+bl+'">'
      // Header: [label] [badge] nazwa [zone]   [↑][↓][🗑]
      +'<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">'
      +'<input type="text" value="'+(ex.label||'').replace(/"/g,'&quot;')+'" placeholder="Nr" maxlength="4" oninput="_editingPlan.exercises['+ei+'].label=this.value" style="width:42px;text-align:center;font-size:14px;font-weight:900;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);padding:6px 2px;color:var(--text);outline:none;flex-shrink:0;"/>'
      +catBadge
      +'<span style="font-size:13px;font-weight:800;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ex.exercise+'</span>'
      +(ex.exZone?'<span style="font-size:9px;color:var(--dim);flex-shrink:0;">'+(ZONE_LABELS[ex.exZone]||'')+'</span>':'')
      +_cardControls(ei,total,'_movePeEx','_rmPeEx')
      +'</div>'
      // Nagłówki kolumn
      +'<div style="display:flex;gap:5px;padding-left:29px;margin-bottom:3px;">';
    fields.forEach(function(f){ html+='<div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;flex:1;min-width:'+(_fieldWidth(f)-10)+'px;">'+FIELD_LABELS[f]+'</div>'; });
    html+='</div>';
    // Serie
    (ex.targetSets||[]).forEach(function(s,si){
      html+='<div class="ex-set-row" style="margin-bottom:3px;"><div class="ex-set-badge">S'+(si+1)+'</div>';
      fields.forEach(function(f){ html+='<input class="ex-set-input" style="flex:1;min-width:'+(_fieldWidth(f)-10)+'px;" data-ei="'+ei+'" data-si="'+si+'" data-field="'+f+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" placeholder="—" value="'+(s[f]||'')+'" oninput="_upPeSet('+ei+','+si+',\''+f+'\',this.value)"/>'; });
      if((ex.targetSets||[]).length>1) html+='<button class="ex-set-del" onclick="_rmPeSet('+ei+','+si+')">✕</button>';
      html+='</div>';
    });
    // + Seria + notatka
    html+='<div style="display:flex;gap:6px;margin-top:4px;">'
      +'<button onclick="_addPeSet('+ei+')" style="padding:4px 10px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:10px;font-weight:700;color:var(--muted);min-height:28px;">+ Seria</button>'
      +'</div>';
    // Notatka
    if(ex.note) html+='<textarea rows="1" oninput="_editingPlan.exercises['+ei+'].note=this.value" style="width:100%;margin-top:4px;padding:5px 8px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-xs);color:var(--muted);font-family:Montserrat,sans-serif;font-size:11px;outline:none;resize:none;box-sizing:border-box;">'+ex.note+'</textarea>';
    else html+='<button onclick="_editingPlan.exercises['+ei+'].note=\' \';_rfPeEx();" style="margin-top:4px;padding:3px 8px;background:transparent;border:none;cursor:pointer;font-size:10px;color:var(--dim);">📝 Notatka</button>';
    html+='</div>';
  });
  return html;
}

function _upPeSet(ei,si,f,v){ if(_editingPlan&&_editingPlan.exercises[ei]&&_editingPlan.exercises[ei].targetSets[si]) _editingPlan.exercises[ei].targetSets[si][f]=v; }
function _addPeSet(ei){ if(!_editingPlan||!_editingPlan.exercises[ei]) return; var cat=EXERCISE_LIBRARY[_editingPlan.exercises[ei].exCat]||{fields:['reps','load']}; var s={note:''}; cat.fields.forEach(function(f){ s[f]=''; }); _editingPlan.exercises[ei].targetSets.push(s); _rfPeEx(); }
function _rmPeSet(ei,si){ if(!_editingPlan||!_editingPlan.exercises[ei]) return; _editingPlan.exercises[ei].targetSets.splice(si,1); _rfPeEx(); }
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
