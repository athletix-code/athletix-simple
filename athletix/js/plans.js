// ═══════════════════════════════════════
//  PLANS MODULE
//  Plan = {id, name, athlete, text, status:'active'|'archived', created, updated}
// ═══════════════════════════════════════

var PLANS_KEY = 'axs_plans';
var plans = [];
var _activeSessionPlanId = null;

function loadPlans(){ try{ plans = JSON.parse(localStorage.getItem(PLANS_KEY)||'[]'); }catch(e){ plans=[]; } }
function savePlans(){ try{ localStorage.setItem(PLANS_KEY, JSON.stringify(plans)); }catch(e){} }

function _findPlan(id){ return plans.find(function(x){ return x.id===id; }); }
function _hideOverlay(){ _closeOverlay(); }

// ── CREATE ──
function createPlan(){
  var athlete=(el('plan-athlete').value||'').trim();
  var name=(el('plan-name').value||'').trim();
  var text=(el('plan-text').value||'').trim();
  if(!name){ el('plan-name').focus(); return; }
  if(!athlete){ el('plan-athlete').focus(); return; }
  _pushUndo('Plan: '+name);
  loadPlans();
  plans.push({id:Date.now(), name:name, athlete:athlete, text:text, status:'active', created:getDayKey(new Date()), updated:getDayKey(new Date())});
  savePlans();
  el('plan-name').value=''; el('plan-text').value='';
  renderPlans();
  var btn=document.querySelector('#tab-plans button[onclick*="createPlan"]');
  if(btn){ var o=btn.textContent; btn.textContent='✓ Utworzono!'; btn.style.background='var(--green)'; setTimeout(function(){ btn.textContent=o; btn.style.background=''; },1200); }
}

// ── RENDER LIST ──
function renderPlans(){
  loadPlans(); loadCRM();
  var list=el('plans-list'); if(!list) return;
  var fSel=el('plan-filter'); var curF=fSel?fSel.value:'all';
  if(fSel){ fSel.innerHTML='<option value="all">Wszyscy</option>'; athletes.forEach(function(a){ var o=document.createElement('option'); o.value=a.name; o.textContent=a.name; fSel.appendChild(o); }); fSel.value=curF; }
  var paSel=el('plan-athlete');
  if(paSel){ var curPa=paSel.value; paSel.innerHTML='<option value="">Wybierz...</option>'; athletes.forEach(function(a){ var o=document.createElement('option'); o.value=a.name; o.textContent=a.name; paSel.appendChild(o); }); if(curPa) paSel.value=curPa; if(activeAthlete&&!curPa) paSel.value=activeAthlete; }
  var sF=el('plan-status-filter')?el('plan-status-filter').value:'active';
  var filtered=plans.filter(function(p){
    if(curF!=='all'&&p.athlete!==curF) return false;
    if(sF==='active'&&p.status!=='active') return false;
    if(sF==='done'&&p.status!=='archived') return false;
    return true;
  });
  filtered.sort(function(a,b){ if(a.status!==b.status) return a.status==='active'?-1:1; return b.updated>a.updated?1:b.updated<a.updated?-1:0; });

  if(!filtered.length){ list.innerHTML='<div style="text-align:center;color:var(--dim);font-size:12px;padding:20px;">'+(sF==='done'?'Brak zarchiwizowanych planów.':'Brak planów.')+'</div>'; return; }

  list.innerHTML='';
  filtered.forEach(function(p){
    var isArch=p.status==='archived';
    var card=document.createElement('div');
    card.style.cssText='background:var(--s1);border:1px solid '+(isArch?'var(--border)':'var(--accent)')+';border-radius:var(--r);padding:12px 14px;margin-bottom:8px;'+(isArch?'opacity:.7;':'');
    var preview=(p.text||'').substring(0,100).replace(/</g,'&lt;').replace(/\n/g,' '); if(p.text&&p.text.length>100) preview+='...';
    card.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">'
      +'<div><div style="font-size:14px;font-weight:800;color:var(--text);">'+p.name+'</div>'
      +'<div style="font-size:11px;color:var(--muted);">👤 '+p.athlete+' · '+(isArch?'Archiwum':'Aktywny')+' · '+p.updated+'</div></div>'
      +(isArch?'<span style="font-size:10px;color:var(--dim);font-weight:800;">📦</span>':'<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent);"></span>')
      +'</div>'
      +(preview?'<div style="font-size:12px;color:var(--muted);line-height:1.4;margin-bottom:8px;">'+preview+'</div>':'')
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
      +(!isArch?'<button onclick="openEditPlan('+p.id+')" style="padding:6px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--text);">✏️ Edytuj</button>':'')
      +(!isArch?'<button onclick="startSessionWithPlan('+p.id+')" style="padding:6px 12px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:800;color:#fff;">▶ Realizuj</button>':'')
      +(!isArch?'<button onclick="archivePlan('+p.id+')" style="padding:6px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--dim);">📦 Archiwizuj</button>':'')
      +(isArch?'<button onclick="reactivatePlan('+p.id+')" style="padding:6px 12px;background:var(--accent-bg);border:1px solid var(--accent);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--accent);">↩ Przywróć</button>':'')
      +'<button onclick="deletePlan('+p.id+')" style="padding:6px 12px;background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--dim);">🗑</button>'
      +'</div>';
    list.appendChild(card);
  });
}

// ── EDIT ──
function openEditPlan(id){
  loadPlans();
  var p=_findPlan(id); if(!p) return;
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:440px;width:100%;padding:22px 18px 24px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:4px;">✏️ '+p.name+'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">👤 '+p.athlete+'</div>'
    +'<div style="margin-bottom:10px;"><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Nazwa</div>'
    +'<input id="edit-plan-name" type="text" value="'+(p.name||'').replace(/"/g,'&quot;')+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;box-sizing:border-box;"/></div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Treść</div>'
    +'<textarea id="edit-plan-text" rows="10" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;font-weight:600;outline:none;resize:vertical;line-height:1.5;box-sizing:border-box;">'+((p.text||'').replace(/</g,'&lt;'))+'</textarea></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="edit-plan-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">💾 Zapisz</button>'
    +'<button id="edit-plan-cancel" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('edit-plan-text').focus(); },100);
  document.getElementById('edit-plan-save').onclick=function(){
    _pushUndo('Edycja: '+p.name); loadPlans();
    var p2=_findPlan(id); if(!p2) return;
    p2.name=(el('edit-plan-name').value||'').trim()||p2.name;
    p2.text=(el('edit-plan-text').value||'').trim();
    p2.updated=getDayKey(new Date());
    savePlans(); _hideOverlay(); renderPlans();
  };
  document.getElementById('edit-plan-cancel').onclick=function(){ _hideOverlay(); };
}

// ── ARCHIVE / REACTIVATE / DELETE ──
function archivePlan(id){
  _pushUndo('Archiwizacja planu'); loadPlans();
  var p=_findPlan(id); if(!p) return;
  p.status='archived'; p.updated=getDayKey(new Date());
  savePlans(); renderPlans();
}
function reactivatePlan(id){
  _pushUndo('Przywrócenie planu'); loadPlans();
  var p=_findPlan(id); if(!p) return;
  p.status='active'; p.updated=getDayKey(new Date());
  savePlans(); renderPlans();
}
function deletePlan(id){
  loadPlans(); var p=_findPlan(id); if(!p) return;
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:22px 18px;max-width:340px;width:100%;text-align:center;">'
    +'<div style="font-size:24px;margin-bottom:8px;">🗑</div>'
    +'<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Usunąć plan?</div>'
    +'<div style="font-size:13px;color:var(--muted);margin-bottom:16px;">'+p.name+' · '+p.athlete+'</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="del-plan-ok" style="flex:1;padding:11px;background:#ef4444;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button>'
    +'<button id="del-plan-no" style="flex:1;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('del-plan-ok').onclick=function(){
    _pushUndo('Usunięto: '+p.name); loadPlans();
    plans=plans.filter(function(x){ return x.id!==id; });
    savePlans(); _hideOverlay(); renderPlans();
  };
  document.getElementById('del-plan-no').onclick=function(){ _hideOverlay(); };
}

// ══════════════════════════════════════
//  SESSION INTEGRATION
// ══════════════════════════════════════

function openPlanSelector(){
  loadPlans(); loadCRM();
  var athleteName=(el('note-athlete').value||'').trim()||(activeAthlete||'');
  var available=plans.filter(function(p){ return p.status==='active'; });
  // Sort: matching athlete first
  if(athleteName){
    available.sort(function(a,b){ return (a.athlete===athleteName?0:1)-(b.athlete===athleteName?0:1); });
  }
  if(!available.length){
    var ov=_ensureOverlay();
    ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:22px 18px;max-width:340px;width:100%;text-align:center;">'
      +'<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:8px;">Brak aktywnych planów</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-bottom:14px;">Utwórz plan w zakładce Plany.</div>'
      +'<button id="no-plans-ok" style="width:100%;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">OK</button></div>';
    ov.style.display='flex';
    document.getElementById('no-plans-ok').onclick=function(){ _hideOverlay(); };
    return;
  }
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:380px;width:100%;padding:22px 18px 24px;max-height:80vh;overflow-y:auto;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:12px;">📅 Wybierz plan</div>'
    +available.map(function(p){
      var preview=(p.text||'').substring(0,50).replace(/\n/g,' ');
      var isCurrent=athleteName&&p.athlete===athleteName;
      return '<button data-plan-id="'+p.id+'" class="plan-pick-btn" style="width:100%;text-align:left;padding:10px 12px;background:'+(isCurrent?'var(--accent-bg)':'var(--s2)')+';border:1px solid '+(isCurrent?'var(--accent)':'var(--border2)')+';border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;margin-bottom:6px;">'
        +'<div style="font-size:13px;font-weight:800;color:var(--text);">'+p.name+'</div>'
        +'<div style="font-size:11px;color:var(--muted);">👤 '+p.athlete+(preview?' · '+preview:'')+'</div></button>';
    }).join('')
    +'<button id="plan-pick-cancel" style="width:100%;padding:10px;background:transparent;color:var(--muted);border:none;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;margin-top:4px;">Anuluj</button></div>';
  ov.style.display='flex';
  // Bind clicks
  document.querySelectorAll('.plan-pick-btn').forEach(function(btn){
    btn.onclick=function(){ var pid=parseInt(btn.getAttribute('data-plan-id')); _hideOverlay(); _openPlanInSession(pid); };
  });
  document.getElementById('plan-pick-cancel').onclick=function(){ _hideOverlay(); };
}

function _openPlanInSession(id){
  loadPlans();
  var p=_findPlan(id); if(!p) return;
  _activeSessionPlanId=id;
  var bar=el('session-plan-bar');
  if(!bar){ console.warn('session-plan-bar not found'); return; }
  bar.style.display='block';
  el('session-plan-name').textContent='📅 '+p.name+' — '+p.athlete;
  el('session-plan-text').value=p.text||'';
  var aSel=el('note-athlete'); if(aSel) aSel.value=p.athlete;
  // Bind buttons (safer than inline onclick)
  var saveBtn=el('plan-save-close-btn');
  var archBtn=el('plan-archive-btn');
  if(saveBtn) saveBtn.onclick=function(){ saveAndCloseSessionPlan(); };
  if(archBtn) archBtn.onclick=function(){ archiveSessionPlan(); };
}

function startSessionWithPlan(id){
  console.log('startSessionWithPlan called, id:', id);
  // Close any overlay first
  _hideOverlay();
  // Close athlete profile if open
  var profOv=el('athlete-profile-overlay');
  if(profOv&&profOv.style.display==='block') profOv.style.display='none';
  // Switch to diary
  setMode('diary');
  // Open plan after DOM settles
  setTimeout(function(){ _openPlanInSession(id); }, 200);
}

// "Zapisz i zamknij"
function saveAndCloseSessionPlan(){
  console.log('saveAndCloseSessionPlan called, planId:', _activeSessionPlanId);
  if(!_activeSessionPlanId){ console.warn('No active plan'); return; }
  loadPlans();
  var p=_findPlan(_activeSessionPlanId); if(!p) return;
  var newText=(el('session-plan-text').value||'').trim();
  _pushUndo('Plan sesji: '+p.name);
  p.text=newText; p.updated=getDayKey(new Date()); savePlans();
  _createPlanDiaryNote(p, newText);
  closeSessionPlan();
  renderCal(); if(selectedDay) renderDayDetail(selectedDay);
}

// "Archiwizuj"
function archiveSessionPlan(){
  if(!_activeSessionPlanId) return;
  loadPlans();
  var p=_findPlan(_activeSessionPlanId); if(!p) return;
  var newText=(el('session-plan-text').value||'').trim();
  _pushUndo('Archiwizacja: '+p.name);
  p.text=newText; p.status='archived'; p.updated=getDayKey(new Date()); savePlans();
  _createPlanDiaryNote(p, newText);
  closeSessionPlan();
  renderCal(); if(selectedDay) renderDayDetail(selectedDay);
}

function _createPlanDiaryNote(p, text){
  loadNotes();
  var today=getDayKey(new Date());
  var now=new Date();
  var hh=String(now.getHours()).padStart(2,'0');
  var mm=String(now.getMinutes()).padStart(2,'0');
  var noteContent='📅 '+p.name+'\n'+text;
  // Find existing note for this plan in this day — match by plan ID stored in note
  var planTag='[plan:'+p.id+']';
  var existing=null;
  for(var i=0;i<notes.length;i++){
    if(notes[i].date===today && notes[i].athlete===p.athlete && notes[i].planId===p.id){
      existing=notes[i]; break;
    }
  }
  if(existing){
    existing.text=noteContent;
    existing.time=hh+':'+mm;
    console.log('Updated existing plan note for', p.name);
  } else {
    notes.push({id:Date.now(), date:today, athlete:p.athlete, text:noteContent, type:'strength', time:hh+':'+mm, planId:p.id});
    console.log('Created new plan note for', p.name);
  }
  saveNotes();
}

function closeSessionPlan(){
  _activeSessionPlanId=null;
  var bar=el('session-plan-bar'); if(bar) bar.style.display='none';
}

// ══════════════════════════════════════
//  PLANS IN ATHLETE PROFILE
// ══════════════════════════════════════
function buildAthletePlansHtml(athleteName){
  loadPlans();
  var ap=plans.filter(function(p){ return p.athlete===athleteName; });
  if(!ap.length) return '';
  var active=ap.filter(function(p){ return p.status==='active'; });
  var archived=ap.filter(function(p){ return p.status==='archived'; });
  var html='<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;">📅 Plany</div>';
  if(active.length){
    active.forEach(function(p){
      var preview=(p.text||'').substring(0,60).replace(/\n/g,' ');
      html+='<div style="background:var(--accent-bg);border:1px solid var(--accent);border-radius:var(--r-xs);padding:8px 10px;margin-bottom:6px;">'
        +'<div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:3px;">'+p.name+'</div>'
        +(preview?'<div style="font-size:11px;color:var(--muted);margin-bottom:6px;">'+preview+'</div>':'')
        +'<div style="display:flex;gap:6px;">'
        +'<button onclick="openEditPlan('+p.id+')" style="flex:1;padding:6px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--text);">✏️ Edytuj</button>'
        +'<button onclick="startSessionWithPlan('+p.id+')" style="flex:1;padding:6px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:800;color:#fff;">▶ Realizuj</button>'
        +'</div></div>';
    });
  } else {
    html+='<div style="font-size:11px;color:var(--dim);margin-bottom:4px;">Brak aktywnych planów</div>';
  }
  if(archived.length){
    html+='<div style="font-size:9px;color:var(--dim);margin-top:8px;margin-bottom:4px;">Archiwum ('+archived.length+')</div>';
    archived.slice(0,3).forEach(function(p){
      html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-top:1px solid var(--border);font-size:11px;">'
        +'<span style="color:var(--muted);">'+p.name+'</span>'
        +'<div style="display:flex;gap:4px;align-items:center;">'
        +'<span style="color:var(--dim);">'+p.updated+'</span>'
        +'<button onclick="event.stopPropagation();reactivatePlan('+p.id+')" style="background:transparent;border:none;cursor:pointer;font-size:10px;color:var(--accent);font-weight:700;padding:2px 6px;">↩</button>'
        +'</div></div>';
    });
  }
  html+='</div>';
  return html;
}

// ══════════════════════════════════════
//  PLANS IN ATHLETE LIST (expanded)
// ══════════════════════════════════════
function buildAthleteActivePlans(athleteName){
  loadPlans();
  var active=plans.filter(function(p){ return p.athlete===athleteName&&p.status==='active'; });
  if(!active.length) return '';
  var html='<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin:10px 0 5px;">📅 Aktywne plany</div>';
  active.forEach(function(p){
    var preview=(p.text||'').substring(0,50).replace(/\n/g,' ');
    html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;">'
      +'<div style="flex:1;min-width:0;"><span style="font-weight:700;color:var(--text);">'+p.name+'</span>'
      +(preview?'<span style="color:var(--dim);margin-left:6px;">'+preview+'</span>':'')+'</div>'
      +'<button onclick="event.stopPropagation();startSessionWithPlan('+p.id+')" style="padding:4px 10px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:9px;font-weight:800;color:#fff;flex-shrink:0;">▶</button>'
      +'</div>';
  });
  return html;
}

// ── QUICK PLAN ACCESS (from athlete list + profile) ──
function openQuickPlan(athleteName){
  loadPlans();
  var active=plans.filter(function(p){ return p.athlete===athleteName&&p.status==='active'; });
  var ov=_ensureOverlay();
  if(!active.length){
    ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:340px;width:100%;padding:22px 18px 24px;text-align:center;">'
      +'<div style="font-size:20px;margin-bottom:8px;">📅</div>'
      +'<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px;">Brak aktywnych planów</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-bottom:14px;">'+athleteName+'</div>'
      +'<button id="_qp-create" style="width:100%;padding:11px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;margin-bottom:8px;">+ Utwórz plan</button>'
      +'<button id="_qp-close" style="width:100%;padding:9px;background:transparent;color:var(--muted);border:none;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">Anuluj</button></div>';
    ov.style.display='flex';
    document.getElementById('_qp-create').onclick=function(){ _closeOverlay(); setMode('plans'); setTimeout(function(){ var s=el('plan-athlete'); if(s) s.value=athleteName; el('plan-name').focus(); },200); };
    document.getElementById('_qp-close').onclick=function(){ _closeOverlay(); };
    return;
  }
  var listHtml=active.map(function(p){
    var preview=(p.text||'').substring(0,40).replace(/\n/g,' ');
    return '<div style="background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);padding:10px 12px;margin-bottom:6px;">'
      +'<div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:4px;">'+p.name+'</div>'
      +(preview?'<div style="font-size:11px;color:var(--muted);margin-bottom:8px;">'+preview+'</div>':'')
      +'<div style="display:flex;gap:6px;">'
      +'<button data-pid="'+p.id+'" class="_qp-edit" style="flex:1;padding:8px;background:var(--s1);border:1px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:700;color:var(--text);">✏️ Edytuj</button>'
      +'<button data-pid="'+p.id+'" class="_qp-run" style="flex:1;padding:8px;background:var(--accent);border:none;border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;color:#fff;">▶ Realizuj</button>'
      +'</div></div>';
  }).join('');
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:380px;width:100%;padding:22px 18px 24px;max-height:80vh;overflow-y:auto;">'
    +'<div style="font-size:14px;font-weight:900;color:var(--text);margin-bottom:4px;">📅 Plany</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">'+athleteName+'</div>'
    +listHtml
    +'<button id="_qp-close" style="width:100%;padding:9px;background:transparent;color:var(--muted);border:none;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;margin-top:4px;">Zamknij</button></div>';
  ov.style.display='flex';
  document.querySelectorAll('._qp-edit').forEach(function(btn){ btn.onclick=function(){ var pid=parseInt(btn.getAttribute('data-pid')); _closeOverlay(); openEditPlan(pid); }; });
  document.querySelectorAll('._qp-run').forEach(function(btn){ btn.onclick=function(){ var pid=parseInt(btn.getAttribute('data-pid')); _closeOverlay(); startSessionWithPlan(pid); }; });
  document.getElementById('_qp-close').onclick=function(){ _closeOverlay(); };
}

// ── INIT ──
function initPlansTab(){ loadPlans(); loadCRM(); renderPlans(); }
