// ═══════════════════════════════════════
//  PLANY TRENINGOWE — strukturyzowane z EXERCISE_LIBRARY
//  Plan = {id, name, athletes:[], exercises:[{type:'exercise'|'note', label, exCat, exZone, exercise, targetSets:[], note, text}], status, created, updated}
// ═══════════════════════════════════════

var PLANS_KEY = 'axs_plans';
var trainingPlans = [];

function loadPlans(){ try{ trainingPlans = JSON.parse(localStorage.getItem(PLANS_KEY)||'[]'); }catch(e){ trainingPlans=[]; } }
function savePlans(){ try{ localStorage.setItem(PLANS_KEY, JSON.stringify(trainingPlans)); }catch(e){} }
function _findPlan(id){ return trainingPlans.find(function(x){ return x.id===id; }); }

// Helper: czy dwa labele tworzą super serię (ta sama pierwsza cyfra, np "3A" i "3B")
function _sameGroup(lab1, lab2){
  if(!lab1||!lab2) return false;
  var d1=lab1.match(/^(\d+)/); var d2=lab2.match(/^(\d+)/);
  return d1&&d2&&d1[1]===d2[1]&&lab1!==lab2;
}

// ══════════════════════════════════════
//  LISTA PLANÓW
// ══════════════════════════════════════
function initPlansTab(){ loadPlans(); loadCRM(); renderPlansList(); }

function renderPlansList(){
  loadPlans(); loadCRM();
  var list=el('plans-list'); if(!list) return;
  if(!trainingPlans.length){
    list.innerHTML='<div style="text-align:center;padding:40px 20px;"><div style="font-size:40px;margin-bottom:12px;">📋</div><div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Brak planów</div><div style="font-size:12px;color:var(--muted);">Stwórz swój pierwszy plan treningowy</div></div>';
    return;
  }
  list.innerHTML='';
  trainingPlans.forEach(function(p){
    var card=document.createElement('div');
    card.style.cssText='background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:8px;';
    var athChips=p.athletes&&p.athletes.length?p.athletes.map(function(a){ return '<span style="font-size:10px;font-weight:700;color:var(--muted);background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:2px 7px;">'+a+'</span>'; }).join(' '):'<span style="font-size:10px;color:var(--dim);font-style:italic;">Nie przypisany</span>';
    var exItems=(p.exercises||[]).filter(function(e){ return e.type!=='note'; });
    var exPreview=exItems.map(function(e){ return (e.label?e.label+' ':'')+(e.exercise||''); }).join(' • ');
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
  _renderPlanEditorOverlay(ov, isNew);
}

function _renderPlanEditorOverlay(ov, isNew){
  var p=_editingPlan;
  // Chipy zawodników — z onclick działającym przez event delegation
  var athHtml=athletes.length?athletes.map(function(a){
    var ch=p.athletes&&p.athletes.indexOf(a.name)>=0;
    var n=a.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return '<button type="button" data-ath-name="'+a.name.replace(/"/g,'&quot;')+'" style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:'+(ch?'var(--accent-bg)':'var(--s2)')+';border:1px solid '+(ch?'var(--accent)':'var(--border2)')+';border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:'+(ch?'var(--accent)':'var(--muted)')+';margin:0 4px 4px 0;min-height:36px;">'+a.name+'</button>';
  }).join(''):'<div style="font-size:11px;color:var(--dim);">Najpierw dodaj zawodników w zakładce Zawodnicy</div>';

  ov.innerHTML='<div style="position:fixed;inset:0;background:var(--bg);overflow-y:auto;z-index:9991;padding:0 0 100px;">'
    +'<div style="max-width:520px;margin:0 auto;padding:16px 14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);">'+(isNew?'+ Nowy plan':'✏️ Edytuj plan')+'</div>'
    +'<button onclick="_closePlanEditor()" style="background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:8px 12px;cursor:pointer;font-size:14px;color:var(--muted);min-width:40px;min-height:40px;display:flex;align-items:center;justify-content:center;">✕</button></div>'
    +'<input id="pe-name" type="text" value="'+(p.name||'').replace(/"/g,'&quot;')+'" placeholder="Nazwa planu..." style="width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;outline:none;margin-bottom:12px;box-sizing:border-box;"/>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Zawodnicy</div>'
    +'<div id="pe-athletes" style="display:flex;flex-wrap:wrap;margin-bottom:14px;">'+athHtml+'</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">Elementy planu</div>'
    +'<div id="pe-exercises">'+_renderPlanExCards()+'</div>'
    +'<div id="pe-add-wrap" style="display:flex;gap:6px;">'
    +'<button onclick="_showPeAddEx()" id="pe-add-btn" style="flex:1;padding:12px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);min-height:44px;">+ Dodaj ćwiczenie</button>'
    +'<button onclick="_addPeNote()" style="padding:12px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--muted);min-height:44px;">📝 Notatka</button>'
    +'</div>'
    +'<div id="pe-add-inline" style="display:none;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-sm);padding:12px;margin-top:6px;"></div>'
    +'</div>'
    +'<div style="position:fixed;bottom:0;left:0;right:0;background:var(--s1);border-top:1px solid var(--border);padding:12px 16px calc(env(safe-area-inset-bottom,10px) + 12px);z-index:9992;"><div style="max-width:520px;margin:0 auto;">'
    +'<button onclick="_savePlan('+p.id+')" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;">💾 Zapisz plan</button>'
    +'</div></div></div>';
  ov.style.display='block';
  // Event delegation dla chipów zawodników
  var athWrap=document.getElementById('pe-athletes');
  if(athWrap) athWrap.addEventListener('click',function(e){
    var btn=e.target.closest('[data-ath-name]'); if(!btn) return;
    var name=btn.getAttribute('data-ath-name');
    var idx=_editingPlan.athletes.indexOf(name);
    if(idx>=0) _editingPlan.athletes.splice(idx,1); else _editingPlan.athletes.push(name);
    var ch=_editingPlan.athletes.indexOf(name)>=0;
    btn.style.background=ch?'var(--accent-bg)':'var(--s2)'; btn.style.borderColor=ch?'var(--accent)':'var(--border2)'; btn.style.color=ch?'var(--accent)':'var(--muted)';
  });
}

// ── Renderowanie kart ćwiczeń/notatek w edytorze ──
function _renderPlanExCards(){
  var p=_editingPlan; if(!p||!p.exercises) return ''; var html='';
  p.exercises.forEach(function(ex,ei){
    var prevLabel=ei>0?p.exercises[ei-1].label:'';
    var grouped=_sameGroup(prevLabel,ex.label);
    if(ex.type==='note'){
      // Karta notatki
      html+='<div style="background:rgba(59,130,246,.03);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;margin-bottom:'+(grouped?'2':'8')+'px;'+(grouped?'border-left:3px solid var(--accent);':'')+'display:flex;gap:8px;align-items:flex-start;">'
        +'<input type="text" value="'+(ex.label||'').replace(/"/g,'&quot;')+'" placeholder="Nr" maxlength="4" oninput="_editingPlan.exercises['+ei+'].label=this.value" style="width:42px;text-align:center;font-size:14px;font-weight:900;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);padding:6px 2px;color:var(--text);font-family:Montserrat,sans-serif;outline:none;flex-shrink:0;"/>'
        +'<div style="flex:1;min-width:0;">'
        +'<textarea rows="3" placeholder="Notatka, instrukcje, uwagi..." oninput="_editingPlan.exercises['+ei+'].text=this.value" style="width:100%;padding:8px 10px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;outline:none;resize:vertical;box-sizing:border-box;">'+(ex.text||'')+'</textarea>'
        +'<div style="display:flex;gap:6px;margin-top:6px;">';
      if(ei>0) html+='<button onclick="_movePeEx('+ei+',-1)" style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:center;">↑</button>';
      if(ei<p.exercises.length-1) html+='<button onclick="_movePeEx('+ei+',1)" style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:center;">↓</button>';
      html+='<button onclick="_rmPeEx('+ei+')" style="width:28px;height:28px;background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:11px;color:var(--dim);display:flex;align-items:center;justify-content:center;">🗑</button>'
        +'</div></div></div>';
      return;
    }
    // Karta ćwiczenia
    var cat=EXERCISE_LIBRARY[ex.exCat]||{color:'#888',fields:['reps']}; var fields=cat.fields;
    html+='<div style="background:var(--s2);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;margin-bottom:'+(grouped?'2':'8')+'px;'+(grouped?'border-left:3px solid var(--accent);':'')+'">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">'
      +'<input type="text" value="'+(ex.label||'').replace(/"/g,'&quot;')+'" placeholder="Nr" maxlength="4" oninput="_editingPlan.exercises['+ei+'].label=this.value" style="width:42px;text-align:center;font-size:14px;font-weight:900;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);padding:6px 2px;color:var(--text);font-family:Montserrat,sans-serif;outline:none;flex-shrink:0;"/>'
      +'<span class="ex-cat-badge" style="color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);">'+CAT_SHORT[ex.exCat]+'</span>'
      +'<span style="font-size:13px;font-weight:800;color:var(--text);flex:1;">'+ex.exercise+'</span>'
      +'<span style="font-size:9px;color:var(--dim);">'+(ZONE_LABELS[ex.exZone]||'')+'</span></div>'
      +'<div style="display:flex;gap:5px;padding-left:29px;margin-bottom:4px;">';
    fields.forEach(function(f){ html+='<div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;width:'+_fieldWidth(f)+'px;flex-shrink:0;">'+FIELD_LABELS[f]+'</div>'; });
    html+='</div>';
    (ex.targetSets||[]).forEach(function(s,si){
      html+='<div class="ex-set-row" style="margin-bottom:4px;"><div class="ex-set-badge">S'+(si+1)+'</div>';
      fields.forEach(function(f){ html+='<input class="ex-set-input" data-ei="'+ei+'" data-si="'+si+'" data-field="'+f+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" style="width:'+_fieldWidth(f)+'px;" placeholder="—" value="'+(s[f]||'')+'" oninput="_upPeSet('+ei+','+si+',\''+f+'\',this.value)"/>'; });
      if((ex.targetSets||[]).length>1) html+='<button class="ex-set-del" onclick="_rmPeSet('+ei+','+si+')">✕</button>';
      html+='</div>';
    });
    html+='<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">'
      +'<button onclick="_addPeSet('+ei+')" style="padding:5px 10px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:10px;font-weight:700;color:var(--muted);min-height:32px;">+ Seria</button>';
    if(ei>0) html+='<button onclick="_movePeEx('+ei+',-1)" style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:center;">↑</button>';
    else html+='<button style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);font-size:14px;color:var(--muted);opacity:.2;display:flex;align-items:center;justify-content:center;pointer-events:none;">↑</button>';
    if(ei<p.exercises.length-1) html+='<button onclick="_movePeEx('+ei+',1)" style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:center;">↓</button>';
    else html+='<button style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);font-size:14px;color:var(--muted);opacity:.2;display:flex;align-items:center;justify-content:center;pointer-events:none;">↓</button>';
    html+='<button onclick="_rmPeEx('+ei+')" style="width:28px;height:28px;background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:11px;color:var(--dim);display:flex;align-items:center;justify-content:center;">🗑</button></div>'
      +'<input type="text" value="'+(ex.note||'').replace(/"/g,'&quot;')+'" placeholder="Notatka do ćwiczenia..." oninput="_editingPlan.exercises['+ei+'].note=this.value" style="width:100%;margin-top:6px;padding:6px 10px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-xs);color:var(--muted);font-family:Montserrat,sans-serif;font-size:11px;outline:none;box-sizing:border-box;"/>'
      +'</div>';
  });
  return html;
}

function _upPeSet(ei,si,f,v){ if(_editingPlan&&_editingPlan.exercises[ei]&&_editingPlan.exercises[ei].targetSets[si]) _editingPlan.exercises[ei].targetSets[si][f]=v; }
function _addPeSet(ei){ if(!_editingPlan||!_editingPlan.exercises[ei]) return; var cat=EXERCISE_LIBRARY[_editingPlan.exercises[ei].exCat]||{fields:['reps']}; var s={note:''}; cat.fields.forEach(function(f){ s[f]=''; }); _editingPlan.exercises[ei].targetSets.push(s); _rfPeEx(); }
function _rmPeSet(ei,si){ if(!_editingPlan||!_editingPlan.exercises[ei]) return; _editingPlan.exercises[ei].targetSets.splice(si,1); _rfPeEx(); }
function _rmPeEx(ei){ if(!_editingPlan) return; _editingPlan.exercises.splice(ei,1); _rfPeEx(); }
function _movePeEx(ei,d){ if(!_editingPlan) return; var a=_editingPlan.exercises; var n=ei+d; if(n<0||n>=a.length) return; var t=a[ei]; a[ei]=a[n]; a[n]=t; _rfPeEx(); }
function _rfPeEx(){ var c=document.getElementById('pe-exercises'); if(c) c.innerHTML=_renderPlanExCards(); }

// Dodawanie notatki do planu
function _addPeNote(){
  _editingPlan.exercises.push({type:'note',label:'',text:'',exCat:null,exZone:null,exercise:null,targetSets:[]});
  _rfPeEx();
}

// ── Dodawanie ćwiczenia w edytorze ──
var _peAddCat='',_peAddZone='';
function _showPeAddEx(){
  _peAddCat=''; _peAddZone='';
  var w=document.getElementById('pe-add-inline'); if(!w) return;
  w.style.display='block'; document.getElementById('pe-add-wrap').style.display='none';
  w.innerHTML='<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Kategoria</div>'
    +'<div class="ex-cat-scroll" id="pe-cat-chips"></div>'
    +'<div id="pe-zw" style="display:none;margin-top:8px;"><div style="display:flex;gap:5px;" id="pe-zb"></div></div>'
    +'<div id="pe-sw" style="display:none;margin-top:8px;"><select class="crm-input" id="pe-esel" style="margin-bottom:0;" onchange="_peOnSel()"><option value="">Wybierz...</option></select></div>'
    +'<button onclick="_peCancel()" style="margin-top:8px;padding:6px 12px;background:transparent;border:none;cursor:pointer;font-size:11px;font-weight:700;color:var(--muted);">Anuluj</button>';
  var cc=document.getElementById('pe-cat-chips');
  Object.keys(EXERCISE_LIBRARY).forEach(function(key){
    var cat=EXERCISE_LIBRARY[key]; var b=document.createElement('button'); b.className='ex-cat-chip'; b.setAttribute('data-cat',key);
    b.innerHTML='<span style="font-size:12px;">'+_catIcon(key)+'</span> '+cat.label;
    b.onclick=function(){ _pePickCat(key); }; cc.appendChild(b);
  });
}
function _peCancel(){ var w=document.getElementById('pe-add-inline'); if(w) w.style.display='none'; document.getElementById('pe-add-wrap').style.display='flex'; }
function _pePickCat(k){
  _peAddCat=k; _peAddZone=''; var cat=EXERCISE_LIBRARY[k];
  document.getElementById('pe-cat-chips').querySelectorAll('.ex-cat-chip').forEach(function(b){ var k2=b.getAttribute('data-cat'); var c2=EXERCISE_LIBRARY[k2]; if(k2===k){ b.style.background='rgba('+_hexToRgb(c2.color)+',.12)'; b.style.borderColor=c2.color; b.style.color=c2.color; } else { b.style.background=''; b.style.borderColor=''; b.style.color=''; } });
  var zb=document.getElementById('pe-zb'); zb.innerHTML='';
  ['upper','lower'].concat(cat.full&&cat.full.length?['full']:[]).forEach(function(z){ var btn=document.createElement('button'); btn.className='ex-zone-chip'; btn.setAttribute('data-zone',z); btn.textContent=ZONE_LABELS[z]; btn.onclick=function(){ _pePickZone(z===_peAddZone?'':z); }; zb.appendChild(btn); });
  document.getElementById('pe-zw').style.display='flex'; _peFillSel(); document.getElementById('pe-sw').style.display='block';
}
function _pePickZone(z){
  _peAddZone=z; var cat=EXERCISE_LIBRARY[_peAddCat];
  document.getElementById('pe-zb').querySelectorAll('.ex-zone-chip').forEach(function(b){ var bz=b.getAttribute('data-zone'); if(bz===z&&z){ b.style.background='rgba('+_hexToRgb(cat.color)+',.12)'; b.style.borderColor=cat.color; b.style.color=cat.color; } else { b.style.background=''; b.style.borderColor=''; b.style.color=''; } });
  _peFillSel();
}
function _peFillSel(){
  var cat=EXERCISE_LIBRARY[_peAddCat]; if(!cat) return;
  var sel=document.getElementById('pe-esel'); sel.innerHTML='<option value="">Wybierz...</option>';
  (_peAddZone?[_peAddZone]:['upper','lower','full']).forEach(function(z){
    var items=(cat[z]||[]).slice();
    customExercises.filter(function(c){ return c.cat===_peAddCat&&c.zone===z; }).forEach(function(c){ items.push('★ '+c.name); });
    if(!items.length) return; var og=document.createElement('optgroup'); og.label=ZONE_LABELS[z];
    items.forEach(function(n){ var o=document.createElement('option'); o.value=n; o.textContent=n; og.appendChild(o); }); sel.appendChild(og);
  });
}
function _peOnSel(){
  var val=document.getElementById('pe-esel').value; if(!val) return;
  var zone=_peAddZone||'full';
  if(!_peAddZone){ var cat=EXERCISE_LIBRARY[_peAddCat]; ['upper','lower','full'].forEach(function(z){ if((cat[z]||[]).indexOf(val)>=0) zone=z; }); }
  var cat=EXERCISE_LIBRARY[_peAddCat]||{fields:['reps']}; var s={note:''}; cat.fields.forEach(function(f){ s[f]=''; });
  _editingPlan.exercises.push({type:'exercise',label:'',exCat:_peAddCat,exZone:zone,exercise:val.replace(/^★ /,''),targetSets:[Object.assign({},s)],note:''});
  _rfPeEx(); _peCancel();
}

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
  loadPlans(); var p=_findPlan(id); if(!p) return;
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:22px 18px;max-width:340px;width:100%;text-align:center;">'
    +'<div style="font-size:24px;margin-bottom:8px;">🗑</div><div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Usunąć plan?</div>'
    +'<div style="font-size:13px;color:var(--muted);margin-bottom:16px;">'+p.name+'</div>'
    +'<div style="display:flex;gap:8px;"><button onclick="_delPlan('+id+')" style="flex:1;padding:11px;background:#ef4444;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
}
function _delPlan(id){ _pushUndo('Usunięto plan'); loadPlans(); trainingPlans=trainingPlans.filter(function(x){ return x.id!==id; }); savePlans(); el('confirm-overlay').style.display='none'; renderPlansList(); }

// ══════════════════════════════════════
//  TRYB WYKONANIA PLANU W SESJI
// ══════════════════════════════════════
var _sessionMode='manual', _execPlan=null;

function setSessionMode(mode){
  _sessionMode=mode;
  var m=el('smode-manual'),p=el('smode-plan');
  if(m){ m.className='chip'+(mode==='manual'?' on-blue':''); }
  if(p){ p.className='chip'+(mode==='plan'?' on-blue':''); }
  var mw=el('manual-forms-wrap'), pe=el('plan-execution');
  if(mw) mw.style.display=mode==='manual'?'block':'none';
  if(pe) pe.style.display=mode==='plan'?'block':'none';
  if(mode==='plan') _refreshPlanSel();
  if(mode==='manual') _renderPlanHint();
}

function _refreshPlanSel(){
  loadPlans(); var sel=el('plan-select'); if(!sel) return;
  var ath=(el('note-athlete').value||'').trim()||activeAthlete||'';
  sel.innerHTML='<option value="">Wybierz plan...</option>';
  var avail=trainingPlans.filter(function(p){ return p.status!=='archived'&&(!ath||!p.athletes||!p.athletes.length||p.athletes.indexOf(ath)>=0); });
  var noPlans=el('plan-no-plans');
  if(!avail.length){
    sel.innerHTML='<option value="">Brak planów'+(ath?' dla '+ath:'')+'</option>';
    if(noPlans){ noPlans.style.display='block'; noPlans.innerHTML='<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px;">Brak planów'+(ath?' dla '+ath:'')+'. <button onclick="setMode(\'plans\')" style="background:transparent;border:none;cursor:pointer;color:var(--accent);font-weight:700;font-size:12px;text-decoration:underline;">Przejdź do Planów</button></div>'; }
    return;
  }
  if(noPlans) noPlans.style.display='none';
  avail.forEach(function(p){ var o=document.createElement('option'); o.value=p.id; o.textContent=p.name+(p.athletes&&p.athletes.length?' ('+p.athletes.join(', ')+')':''); sel.appendChild(o); });
}

function renderPlanExecution(){
  var sel=el('plan-select'); var pid=parseInt(sel?sel.value:'');
  var c=el('plan-exec-list'); if(!c) return;
  if(!pid){ c.innerHTML=''; el('plan-exec-save-wrap').style.display='none'; return; }
  loadPlans(); var plan=_findPlan(pid); if(!plan){ c.innerHTML=''; return; }
  _execPlan=JSON.parse(JSON.stringify(plan));
  _execPlan.exercises.forEach(function(ex){ if(ex.targetSets) ex.targetSets.forEach(function(s){ s._checked=false; }); });
  _renderExecCards(c);
  el('plan-exec-save-wrap').style.display='block';
}

function _renderExecCards(container){
  if(!_execPlan) return;
  var orig=_findPlan(_execPlan.id);
  container.innerHTML='';
  _execPlan.exercises.forEach(function(ex,ei){
    var prevLabel=ei>0?_execPlan.exercises[ei-1].label:'';
    var grouped=_sameGroup(prevLabel,ex.label);

    // Karta notatki
    if(ex.type==='note'){
      var nd=document.createElement('div');
      nd.style.cssText='background:rgba(59,130,246,.03);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:'+(grouped?'2':'8')+'px;'+(grouped?'border-left:3px solid var(--accent);':'');
      nd.innerHTML='<div style="display:flex;align-items:flex-start;gap:8px;">'
        +(ex.label?'<span style="font-size:14px;font-weight:900;color:var(--dim);min-width:28px;">'+ex.label+'</span>':'')
        +'<div style="font-size:12px;font-style:italic;color:var(--muted);line-height:1.5;white-space:pre-wrap;">'+(ex.text||'').replace(/</g,'&lt;')+'</div></div>';
      container.appendChild(nd);
      return;
    }

    // Karta ćwiczenia
    var cat=EXERCISE_LIBRARY[ex.exCat]||{color:'#888',fields:['reps']}; var fields=cat.fields;
    var origEx=orig&&orig.exercises&&orig.exercises[ei]?orig.exercises[ei]:null;
    var sum='';
    if(origEx&&origEx.targetSets&&origEx.targetSets.length){
      var ts=origEx.targetSets; var pp=[];
      if(fields.indexOf('reps')>=0) pp.push(ts.length+'×'+(ts[0].reps||'?'));
      if(fields.indexOf('load')>=0){ var ls=ts.map(function(s){ return s.load||''; }).filter(Boolean); if(ls.length) pp.push('@'+ls.join('-')+'kg'); }
      if(fields.indexOf('rir')>=0){ var rs=ts.map(function(s){ return s.rir||''; }).filter(Boolean); if(rs.length) pp.push('RIR '+rs.join('-')); }
      if(fields.indexOf('time')>=0){ var tt=ts.map(function(s){ return s.time||''; }).filter(Boolean); if(tt.length) pp.push(tt.join('-')+'s'); }
      sum=pp.join(' ');
    }
    var card=document.createElement('div');
    card.style.cssText='background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:'+(grouped?'2':'8')+'px;'+(grouped?'border-left:3px solid var(--accent);':'');
    var h='<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">';
    if(ex.label) h+='<span style="font-size:14px;font-weight:900;color:var(--text);min-width:28px;">'+ex.label+'</span>';
    h+='<span class="ex-cat-badge" style="color:'+cat.color+';background:rgba('+_hexToRgb(cat.color)+',.1);">'+(CAT_SHORT[ex.exCat]||'?')+'</span>'
      +'<span style="font-size:14px;font-weight:800;color:var(--text);flex:1;">'+ex.exercise+'</span>'
      +'<span style="font-size:9px;color:var(--dim);">'+(ZONE_LABELS[ex.exZone]||'')+'</span></div>';
    if(sum) h+='<div style="font-size:11px;color:var(--muted);margin-bottom:8px;">Cel: '+sum+'</div>';
    // Nagłówki + serie
    h+='<div style="display:flex;gap:5px;padding-left:38px;margin-bottom:4px;">';
    fields.forEach(function(f){ h+='<div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);text-align:center;width:'+_fieldWidth(f)+'px;flex-shrink:0;">'+FIELD_LABELS[f]+'</div>'; });
    h+='</div>';
    (ex.targetSets||[]).forEach(function(s,si){
      var ck=s._checked; var os=origEx&&origEx.targetSets&&origEx.targetSets[si]?origEx.targetSets[si]:null;
      h+='<div class="pe-exec-row" style="display:flex;gap:5px;align-items:center;margin-bottom:4px;padding:4px 0;border-radius:var(--r-xs);'+(ck?'background:rgba(22,163,74,.05);':'')+'transition:background .2s;">'
        +'<label style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;cursor:pointer;flex-shrink:0;">'
        +'<input type="checkbox" data-ei="'+ei+'" data-si="'+si+'" '+(ck?'checked ':'')+' onchange="_togExec('+ei+','+si+',this)" style="width:18px;height:18px;accent-color:var(--green);cursor:pointer;"/></label>';
      fields.forEach(function(f){
        var v=s[f]||''; var ov2=os?(os[f]||''):''; var ch=v&&ov2&&String(v)!==String(ov2);
        h+='<div style="position:relative;flex-shrink:0;"><input class="ex-set-input" data-ei="'+ei+'" data-si="'+si+'" data-field="'+f+'" type="'+FIELD_TYPES[f]+'" inputmode="'+FIELD_INPUTMODES[f]+'" style="width:'+_fieldWidth(f)+'px;'+(ck?'border-color:var(--green);':'')+(ch?'border-color:var(--amber);':'')+'" value="'+v+'" placeholder="—" oninput="_upExec('+ei+','+si+',\''+f+'\',this.value)"/>'
          +(ch?'<div style="font-size:8px;color:var(--amber-text);text-align:center;margin-top:1px;">plan: '+ov2+'</div>':'')+'</div>';
      });
      h+='</div>';
    });
    h+='<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">'
      +'<button onclick="_addExecSet('+ei+')" style="padding:5px 10px;background:transparent;border:1px dashed var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:10px;font-weight:700;color:var(--muted);min-height:32px;">+ Seria ekstra</button>';
    if(ei>0) h+='<button onclick="_moveExecEx('+ei+',-1)" style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:center;">↑</button>';
    if(ei<_execPlan.exercises.length-1) h+='<button onclick="_moveExecEx('+ei+',1)" style="width:28px;height:28px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:center;">↓</button>';
    h+='</div>';
    if(ex.note) h+='<div style="font-size:11px;font-style:italic;color:var(--muted);margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">'+ex.note+'</div>';
    card.innerHTML=h; container.appendChild(card);
  });
}

function _togExec(ei,si,cb){ if(!_execPlan) return; _execPlan.exercises[ei].targetSets[si]._checked=cb.checked; var r=cb.closest('.pe-exec-row'); if(r){ r.style.background=cb.checked?'rgba(22,163,74,.05)':''; r.querySelectorAll('.ex-set-input').forEach(function(i){ if(!i.style.borderColor.match(/amber/)) i.style.borderColor=cb.checked?'var(--green)':''; }); } }
function _upExec(ei,si,f,v){ if(_execPlan&&_execPlan.exercises[ei]&&_execPlan.exercises[ei].targetSets[si]) _execPlan.exercises[ei].targetSets[si][f]=v; }
function _addExecSet(ei){ if(!_execPlan||!_execPlan.exercises[ei]) return; var cat=EXERCISE_LIBRARY[_execPlan.exercises[ei].exCat]||{fields:['reps']}; var s={note:'',_checked:false}; cat.fields.forEach(function(f){ s[f]=''; }); _execPlan.exercises[ei].targetSets.push(s); var c=el('plan-exec-list'); if(c) _renderExecCards(c); }
function _moveExecEx(ei,d){ if(!_execPlan) return; var a=_execPlan.exercises; var n=ei+d; if(n<0||n>=a.length) return; var t=a[ei]; a[ei]=a[n]; a[n]=t; var c=el('plan-exec-list'); if(c) _renderExecCards(c); }

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
    // Notatki z planu → zapisz jako type='note' (stary format, kompatybilny)
    if(ex.type==='note'){
      if(ex.text&&ex.text.trim()){
        notes.push({id:Date.now()+ei,date:saveDay,time:hh+':'+mm,athlete:athlete,type:'strength',text:ex.text,label:ex.label||'',fromPlan:_execPlan.id}); count++;
      }
      return;
    }
    var cat=EXERCISE_LIBRARY[ex.exCat]||{fields:['reps']};
    var sets=ex.targetSets.filter(function(s){ return cat.fields.some(function(f){ return s[f]&&String(s[f]).trim(); }); }).map(function(s){ var o={note:s.note||''}; cat.fields.forEach(function(f){ o[f]=s[f]||''; }); return o; });
    if(!sets.length) return;
    var entry={id:Date.now()+ei,date:saveDay,time:hh+':'+mm,athlete:athlete,type:'strength',exCat:ex.exCat,exZone:ex.exZone,exercise:ex.exercise,sets:sets,generalNote:ex.note||'',label:ex.label||'',fromPlan:_execPlan.id,fromPlanName:_execPlan.name};
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
    var exN=p.exercises?p.exercises.filter(function(e){ return e.type!=='note'; }).map(function(e){ return (e.label?e.label+' ':'')+e.exercise; }).join(', '):'';
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
