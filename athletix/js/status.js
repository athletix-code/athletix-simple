
//  STATUS SYSTEM
//  status: 'active' | 'break' | 'ended'  (availability — mutually exclusive)
//  injury: {active, date, description, recommendations, contact, resolvedDate} | null  (independent layer)
// ═══════════════════════════════════════
function _fmtD(iso){ if(!iso) return ''; var d=new Date(iso+'T12:00:00'); return d.toLocaleDateString('pl-PL',{day:'numeric',month:'short',year:'numeric'}); }

function _mkBadge(label,color,bg,border){
  return '<span style="font-size:9px;font-weight:800;color:'+color+';background:'+bg+';border:1px solid '+border+';border-radius:20px;padding:2px 8px;letter-spacing:.04em;">'+label+'</span>';
}
function statusBadge(a){
  var s=a.status||'active';
  var badges='';
  // Availability badge
  if(s==='active') badges+=_mkBadge('Aktywny','#16a34a','rgba(22,163,74,.12)','rgba(22,163,74,.35)');
  else if(s==='break') badges+=_mkBadge('Przerwa','#d97706','rgba(217,119,6,.12)','rgba(217,119,6,.35)');
  else if(s==='ended') badges+=_mkBadge('Zakończony','#78350f','rgba(120,53,15,.12)','rgba(120,53,15,.35)');
  // Injury badge (independent)
  if(a.injury&&a.injury.active) badges+=' '+_mkBadge('Kontuzja','#dc2626','rgba(220,38,38,.12)','rgba(220,38,38,.35)');
  return badges;
}

function statusDetailHtml(a){
  var html='';
  // Break / ended details
  var s=a.status||'active';
  if(s==='break'){
    var parts=[];
    if(a.breakUnknown) parts.push('<span style="font-size:16px;vertical-align:middle;">⚠️</span> <span style="font-size:13px;font-weight:800;color:#d97706;">Brak informacji — do kontaktu</span>');
    else if(a.breakFrom||a.breakTo){
      var dp='<span style="font-size:14px;vertical-align:middle;">📅</span> ';
      if(a.breakFrom&&a.breakTo) dp+='<span style="font-size:13px;font-weight:800;color:#d97706;">'+_fmtD(a.breakFrom)+'</span> <span style="color:var(--muted);">→</span> <span style="font-size:13px;font-weight:800;color:#d97706;">'+_fmtD(a.breakTo)+'</span>';
      else if(a.breakFrom) dp+='<span style="color:var(--muted);font-size:11px;">od </span><span style="font-size:13px;font-weight:800;color:#d97706;">'+_fmtD(a.breakFrom)+'</span>';
      else dp+='<span style="color:var(--muted);font-size:11px;">do </span><span style="font-size:13px;font-weight:800;color:#d97706;">'+_fmtD(a.breakTo)+'</span>';
      parts.push(dp);
    }
    if(a.breakNote) parts.push('<span style="font-size:12px;color:var(--text);font-weight:600;">'+a.breakNote+'</span>');
    if(parts.length) html+='<div style="margin-top:6px;padding:8px 10px;background:rgba(217,119,6,.06);border-left:4px solid #d97706;border-radius:0 var(--r-xs) var(--r-xs) 0;line-height:1.5;">'+parts.join('<br>')+'</div>';
  }
  if(s==='ended'){
    var ep=[];
    if(a.endedDate) ep.push('<span style="font-size:14px;vertical-align:middle;">📅</span> <span style="color:var(--muted);font-size:11px;">Zakończono: </span><span style="font-size:13px;font-weight:800;color:#d97706;">'+_fmtD(a.endedDate)+'</span>');
    if(a.endedReason) ep.push('<span style="font-size:12px;color:var(--text);font-weight:600;">'+a.endedReason+'</span>');
    if(ep.length) html+='<div style="margin-top:6px;padding:8px 10px;background:rgba(120,53,15,.06);border-left:4px solid #78350f;border-radius:0 var(--r-xs) var(--r-xs) 0;line-height:1.5;">'+ep.join('<br>')+'</div>';
  }
  // Injury details (shown regardless of status)
  if(a.injury&&a.injury.active){
    var ip=[];
    if(a.injury.date) ip.push('<span style="font-size:14px;vertical-align:middle;">🩹</span> <span style="color:var(--muted);font-size:11px;">Od: </span><span style="font-size:13px;font-weight:800;color:#d97706;">'+_fmtD(a.injury.date)+'</span>');
    if(a.injury.description) ip.push('<span style="font-size:12px;color:var(--text);font-weight:600;">'+a.injury.description+'</span>');
    if(a.injury.recommendations) ip.push('<span style="font-size:11px;color:var(--muted);">💊 '+a.injury.recommendations+'</span>');
    if(a.injury.contact) ip.push('<span style="font-size:11px;color:var(--muted);">📞 '+a.injury.contact+'</span>');
    if(ip.length) html+='<div style="margin-top:6px;padding:8px 10px;background:rgba(220,38,38,.06);border-left:4px solid #dc2626;border-radius:0 var(--r-xs) var(--r-xs) 0;line-height:1.5;">'+ip.join('<br>')+'</div>';
  }
  return html;
}

function statusButtons(a){
  var s=a.status||'active';
  var hasInjury=a.injury&&a.injury.active;
  function btn(val,label,color){ var active=s===val; return '<button onclick="event.stopPropagation();openStatusChange('+a.id+',\''+val+'\')" style="padding:6px 4px;border-radius:var(--r-xs);border:1px solid '+(active?'rgba('+color+',.5)':'var(--border2)')+';background:'+(active?'rgba('+color+',.15)':'var(--s2)')+';color:'+(active?'rgb('+color+')':'var(--muted)')+';cursor:pointer;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;letter-spacing:.06em;text-align:center;">'+label+'</button>'; }
  var injLabel=hasInjury?'Kontuzja ✓':'Kontuzja';
  var injBtn='<button onclick="event.stopPropagation();openInjuryModal('+a.id+')" style="padding:6px 4px;border-radius:var(--r-xs);border:1px solid '+(hasInjury?'rgba(220,38,38,.5)':'var(--border2)')+';background:'+(hasInjury?'rgba(220,38,38,.15)':'var(--s2)')+';color:'+(hasInjury?'rgb(220,38,38)':'var(--muted)')+';cursor:pointer;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;letter-spacing:.06em;text-align:center;">'+injLabel+'</button>';
  return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-top:6px;">'+btn('active','Aktywny','22,163,74')+btn('break','Przerwa','217,119,6')+btn('ended','Zakończony','120,53,15')+injBtn+'</div>';
}

function _ensureOverlay(){
  var ov=el('confirm-overlay');
  if(!ov){
    ov=document.createElement('div'); ov.id='confirm-overlay';
    ov.style.cssText='position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
    document.body.appendChild(ov);
  }
  ov.style.zIndex='9990';
  ov.style.display='flex';
  return ov;
}
function _closeOverlay(){ var ov=el('confirm-overlay'); if(ov) ov.style.display='none'; }

function openStatusChange(id, status){
  var a=athletes.find(function(x){ return x.id===id||String(x.id)===String(id); }); if(!a) return;
  var today=new Date().toISOString().slice(0,10);

  // Active — set directly
  if(status==='active'){
    _pushUndo('Status: '+a.name+' → Aktywny');
    a.status='active'; a.breakFrom=null; a.breakTo=null; a.breakNote=null; a.breakUnknown=false;
    saveCRM(); renderAthleteList(); return;
  }

  // Break — modal with dates
  if(status==='break'){
    var ov=_ensureOverlay();
    ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:380px;width:100%;padding:22px 18px 24px;">'
      +'<div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:4px;">⏸ Przerwa</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">'+a.name+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">'
      +'<div><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Od kiedy</div>'
      +'<input id="status-from" type="date" value="'+(a.breakFrom||today)+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;box-sizing:border-box;"/></div>'
      +'<div><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Planowany powrót</div>'
      +'<input id="status-to" type="date" value="'+(a.breakTo||'')+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;box-sizing:border-box;"/></div></div>'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:8px 10px;background:var(--s2);border-radius:var(--r-xs);cursor:pointer;" onclick="var c=el(\'status-unknown\');c.checked=!c.checked;">'
      +'<input id="status-unknown" type="checkbox" '+(a.breakUnknown?'checked ':'')+' onclick="event.stopPropagation();" style="width:18px;height:18px;accent-color:#71717a;cursor:pointer;flex-shrink:0;"/>'
      +'<div><div style="font-size:12px;font-weight:700;color:var(--text);">Brak informacji</div>'
      +'<div style="font-size:10px;color:var(--dim);margin-top:1px;">Nie mam jasnej informacji — do kontaktu</div></div></div>'
      +'<div style="margin-bottom:14px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Powód</div>'
      +'<textarea id="status-note" rows="4" placeholder="np. Wakacje, sesja egzaminacyjna, sprawy rodzinne..." style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;resize:vertical;box-sizing:border-box;line-height:1.5;">'+(a.breakNote||'')+'</textarea></div>'
      +'<div style="display:flex;gap:8px;">'
      +'<button id="status-save-btn" style="flex:1;padding:12px;background:#71717a;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz</button>'
      +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
    ov.style.display='flex';
    document.getElementById('status-save-btn').onclick=function(){
      _pushUndo('Status: '+a.name+' → Przerwa');
      a.status='break';
      a.breakUnknown=!!el('status-unknown').checked;
      a.breakFrom=a.breakUnknown?null:(el('status-from').value||null);
      a.breakTo=a.breakUnknown?null:(el('status-to').value||null);
      a.breakNote=(el('status-note').value||'').trim()||null;
      saveCRM(); ov.style.display='none'; renderAthleteList();
    };
    return;
  }

  // Ended — modal with date and reason
  if(status==='ended'){
    var ov=_ensureOverlay();
    ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:380px;width:100%;padding:22px 18px 24px;">'
      +'<div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:4px;">🚪 Zakończenie współpracy</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">'+a.name+'</div>'
      +'<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Data zakończenia</div>'
      +'<input id="ended-date" type="date" value="'+(a.endedDate||today)+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;box-sizing:border-box;max-width:200px;"/></div>'
      +'<div style="margin-bottom:14px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Powód zakończenia</div>'
      +'<textarea id="ended-reason" rows="2" placeholder="np. Zmiana miasta, koniec sezonu, sprawy finansowe..." style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;resize:vertical;box-sizing:border-box;">'+(a.endedReason||'')+'</textarea></div>'
      +'<div style="font-size:10px;color:var(--dim);margin-bottom:14px;line-height:1.4;">Zawodnik pozostanie w bazie. Możesz przywrócić go do statusu Aktywny w dowolnym momencie.</div>'
      +'<div style="display:flex;gap:8px;">'
      +'<button id="ended-save-btn" style="flex:1;padding:12px;background:#78350f;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zakończ współpracę</button>'
      +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
    ov.style.display='flex';
    document.getElementById('ended-save-btn').onclick=function(){
      _pushUndo('Status: '+a.name+' → Zakończony');
      a.status='ended';
      a.endedDate=el('ended-date').value||today;
      a.endedReason=(el('ended-reason').value||'').trim()||null;
      saveCRM(); ov.style.display='none'; renderAthleteList();
    };
  }
}

// ── INJURY MODAL (independent of status) ──
function openInjuryModal(id){
  var a=athletes.find(function(x){ return x.id===id||String(x.id)===String(id); }); if(!a) return;
  var inj=a.injury||{};
  var hasActive=inj.active;
  var today=new Date().toISOString().slice(0,10);
  var ov=_ensureOverlay();

  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:400px;width:100%;padding:22px 18px 24px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:4px;">🩹 Kontuzja</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">'+a.name+(hasActive?' — <span style="color:#dc2626;font-weight:800;">aktywna</span>':'')+'</div>'
    // Date
    +'<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Data wystąpienia</div>'
    +'<input id="inj-date" type="date" value="'+(inj.date||today)+'" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;box-sizing:border-box;max-width:200px;"/></div>'
    // Description
    +'<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Opis kontuzji</div>'
    +'<textarea id="inj-desc" rows="4" placeholder="np. Naderwanie mięśnia czworogłowego, lewa noga..." style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;resize:vertical;box-sizing:border-box;line-height:1.5;">'+(inj.description||'')+'</textarea></div>'
    // Recommendations
    +'<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Zalecenia</div>'
    +'<textarea id="inj-reco" rows="4" placeholder="np. Fizjoterapia 2x/tyg, unikać obciążeń osiowych..." style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;resize:vertical;box-sizing:border-box;line-height:1.5;">'+(inj.recommendations||'')+'</textarea></div>'
    // Contact
    +'<div style="margin-bottom:14px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Osoba kontaktowa (lekarz / fizjoterapeuta)</div>'
    +'<input id="inj-contact" type="text" value="'+(inj.contact||'')+'" placeholder="np. dr Kowalski, tel. 600-100-200" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;"/></div>'
    // Buttons
    +'<div style="display:flex;gap:8px;">'
    +'<button id="inj-save-btn" style="flex:1;padding:12px;background:#dc2626;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">'+(hasActive?'Zapisz zmiany':'Zgłoś kontuzję')+'</button>'
    +(hasActive?'<button id="inj-resolve-btn" style="padding:12px 14px;background:var(--green);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;cursor:pointer;">✓ Rozwiązano</button>':'')
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="padding:12px 14px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button>'
    +'</div></div>';
  ov.style.display='flex';

  document.getElementById('inj-save-btn').onclick=function(){
    _pushUndo('Kontuzja: '+a.name);
    a.injury={
      active:true,
      date:el('inj-date').value||today,
      description:(el('inj-desc').value||'').trim()||null,
      recommendations:(el('inj-reco').value||'').trim()||null,
      contact:(el('inj-contact').value||'').trim()||null
    };
    saveCRM(); ov.style.display='none'; renderAthleteList();
  };
  var resolveBtn=document.getElementById('inj-resolve-btn');
  if(resolveBtn) resolveBtn.onclick=function(){
    _pushUndo('Kontuzja rozwiązana: '+a.name);
    if(a.injury) a.injury.active=false;
    if(a.injury) a.injury.resolvedDate=today;
    saveCRM(); ov.style.display='none'; renderAthleteList();
  };
}

function addAthlete(){ var name=(el('crm-name').value||'').trim(); if(!name) return; var notes=(el('crm-notes').value||'').trim(); _pushUndo('Dodano: '+name); athletes.push({id:Date.now(),name:name,notes:notes,status:'active'}); saveCRM(); el('crm-name').value=''; el('crm-notes').value=''; renderAthleteList(); }
function deleteAthlete(i,e){
  if(e){ e.stopPropagation(); e.preventDefault(); } var a=athletes[i]; if(!a) return;
  var ov=el('confirm-overlay'); if(!ov){ ov=document.createElement('div'); ov.id='confirm-overlay'; ov.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px;'; document.body.appendChild(ov); }
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:24px 20px;max-width:340px;width:100%;text-align:center;">'
    +'<div style="font-size:28px;margin-bottom:10px;">🗑</div><div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">Usunąć zawodnika?</div>'
    +'<div style="font-size:13px;color:var(--muted);margin-bottom:20px;font-weight:700;">'+a.name+'</div>'
    +'<div style="display:flex;gap:8px;"><button onclick="confirmDeleteAthlete('+i+')" style="flex:1;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
}
function confirmDeleteAthlete(i){ var a=athletes[i]; if(!a) return; _pushUndo('Usunięto: '+a.name); if(_expandedAthlete===a.name) _expandedAthlete=null; athletes.splice(i,1); saveCRM(); el('confirm-overlay').style.display='none'; renderAthleteList(); }

function renderAthleteList(){
  var list=el('athlete-list'); if(!list) return; loadNotes();
  if(!athletes.length){ list.innerHTML='<div style="text-align:center;color:var(--dim);font-size:12px;padding:20px;">Brak zawodników. Dodaj pierwszego powyżej.</div>'; return; }
  list.innerHTML='';
  var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){}
  athletes.forEach(function(a,i){
    var wrap=document.createElement('div'); wrap.style.marginBottom='8px';
    var sessCnt=allSess.filter(function(s){ return s.athlete===a.name; }).length;
    var notesCnt=notes.filter(function(n){ return n.athlete===a.name; }).length;
    var total=sessCnt+notesCnt;
    var isOpen=_expandedAthlete===a.name;
    var tagChips=(a.tags&&a.tags.length)?a.tags.map(function(t){ return '<span style="font-size:9px;font-weight:800;color:#c2410c;background:rgba(194,65,12,.08);border:1px solid rgba(251,146,60,.25);border-radius:20px;padding:1px 6px;">'+t+'</span>'; }).join(' '):'';
    var card=document.createElement('div'); card.className='athlete-card'+(isOpen?' selected':'');
    card.innerHTML='<div style="flex:1;min-width:0;">'
      +'<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><span class="athlete-name">'+a.name+'</span>'+statusBadge(a)+'</div>'
      +(tagChips?'<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;">'+tagChips+'</div>':'')
      +(a.notes?'<div class="athlete-meta" style="margin-top:2px;">'+a.notes+'</div>':'')
      +(total?'<div class="athlete-meta" style="margin-top:3px;color:var(--accent);">'+sessCnt+' sesji · '+notesCnt+' wpisów</div>':'<div class="athlete-meta" style="margin-top:3px;">Brak historii</div>')
      +_walletBadge(a)
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">'
      +'<button onclick="event.stopPropagation();openAthleteProfile('+a.id+')" style="background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);padding:8px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--muted);min-width:44px;min-height:44px;justify-content:center;"><span style="font-size:14px;">👤</span><span style="font-size:9px;font-weight:700;letter-spacing:.06em;font-family:Montserrat,sans-serif;">PROFIL</span></button>'
      +'<button onclick="deleteAthlete('+i+',event)" style="background:transparent;border:1px solid var(--border2);border-radius:var(--r-xs);padding:8px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--muted);min-width:44px;min-height:44px;justify-content:center;"><span style="font-size:14px;">🗑</span><span style="font-size:9px;font-weight:700;letter-spacing:.06em;font-family:Montserrat,sans-serif;">USUŃ</span></button>'
      +(total?'<span style="color:var(--muted);font-size:14px;transition:transform .2s;'+(isOpen?'transform:rotate(180deg)':'')+'">▼</span>':'')
      +'</div>';
    if(total){ card.onclick=function(){ _expandedAthlete=(_expandedAthlete===a.name)?null:a.name; loadCRM(); renderAthleteList(); }; }
    wrap.appendChild(card);
    // Expanded history — grouped by day
    if(isOpen&&total){
      var hist=document.createElement('div');
      hist.style.cssText='background:var(--s1);border:1px solid var(--accent);border-top:none;border-radius:0 0 var(--r) var(--r);padding:12px 14px;margin-top:-6px;';
      var contentHtml='';
      // Status controls + details (moved from card to expanded section)
      contentHtml+=statusButtons(a);
      contentHtml+=statusDetailHtml(a);
      contentHtml+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);"></div>';

      // Collect all days: sessions + notes
      var byDay={};
      allSess.filter(function(s){ return s.athlete===a.name; }).forEach(function(s){
        var dk=getDayKey(new Date(s.date)); if(!byDay[dk]) byDay[dk]={sessions:[],notes:[]}; byDay[dk].sessions.push(s);
      });
      notes.filter(function(n){ return n.athlete===a.name; }).forEach(function(n){
        if(!byDay[n.date]) byDay[n.date]={sessions:[],notes:[]}; byDay[n.date].notes.push(n);
      });
      var sortedDays=Object.keys(byDay).sort().reverse();

      sortedDays.slice(0,10).forEach(function(dk){
        var data=byDay[dk];
        var d3=new Date(dk+'T12:00:00');
        var dayLabel=d3.toLocaleDateString('pl-PL',{weekday:'short',day:'numeric',month:'short'});
        var itemCount=data.sessions.length+data.notes.length;
        var safeName=a.name.replace(/'/g,"\\'");
        contentHtml+='<div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 5px;padding-bottom:4px;border-bottom:2px solid var(--border2);">'
          +'<div style="font-size:10px;font-weight:800;color:var(--text);">'+dayLabel+' <span style="color:var(--dim);font-weight:600;">('+itemCount+')</span></div>'
          +'<button onclick="event.stopPropagation();printAthleteDay(\''+safeName+'\',\''+dk+'\')" style="background:#1d4ed8;border:none;border-radius:var(--r-xs);padding:3px 8px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:9px;font-weight:800;color:#fff;display:flex;align-items:center;gap:3px;">🖨 Raport</button>'
          +'</div>';
        // Sessions for this day
        data.sessions.forEach(function(s){
          var tag=''; if(s.mode==='custom'&&s.params) tag=' <span style="color:#c2410c;font-weight:800;">'+s.params.rounds+'×'+fmtSec(s.params.work)+'/'+fmtSec(s.params.rest)+'</span>';
          else if(s.mode==='emom'&&s.params) tag=' <span style="color:#c084fc;font-weight:800;">EMOM '+s.params.emom+'min</span>';
          else if(s.mode==='stoper'&&s.params&&s.params.duration) tag=' <span style="color:#7e22ce;font-weight:800;">Stoper '+fmtSec(s.params.duration)+'</span>';
          contentHtml+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;">'
            +'<div>⏱ <span style="font-weight:700;color:var(--text);">'+(s.exercise||'Interwał')+'</span>'+tag+'</div></div>';
        });
        // Notes for this day
        data.notes.forEach(function(n){
          var badge=n.type==='test'?'<span style="font-size:10px;font-weight:800;color:#7e22ce;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3);border-radius:10px;padding:0 5px;margin-right:4px;">TEST</span>':'';
          contentHtml+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;">'
            +'<span style="flex:1;min-width:0;">'+badge+'<span style="color:var(--muted);">'+n.text.substring(0,50)+(n.text.length>50?'...':'')+'</span></span>'
            +'<span style="color:var(--dim);flex-shrink:0;margin-left:8px;">'+n.time+'</span></div>';
        });
      });
      if(sortedDays.length>10) contentHtml+='<div style="font-size:11px;color:var(--dim);padding:6px 0;">...i '+(sortedDays.length-10)+' więcej dni</div>';
      // Active plans
      if(typeof buildAthleteActivePlans==='function') contentHtml+=buildAthleteActivePlans(a.name);
      if(!contentHtml) contentHtml='<div style="color:var(--dim);font-size:12px;">Brak danych.</div>';
      hist.innerHTML=contentHtml; wrap.appendChild(hist);
    }
    list.appendChild(wrap);
  });
}

function populateAthleteSelect(){
  var sel=el('note-athlete'); if(!sel) return; var cur=sel.value;
  sel.innerHTML='<option value="">Wybierz...</option>';
  athletes.forEach(function(a){ var o=document.createElement('option'); o.value=a.name; o.textContent=a.name; sel.appendChild(o); });
  if(cur) sel.value=cur;
}
loadCRM();
document.addEventListener('DOMContentLoaded',function(){ setTimeout(checkBirthdays,800); });

// ══════════════════════════════════════
