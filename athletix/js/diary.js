//  SIMPLE DIARY (notepad)
// ══════════════════════════════════════
var NOTES_KEY='axs_notes';
var notes=[]; // {id, date, athlete, text, type:'strength'|'test', time}
var selectedDay=null, calDate=new Date();
var _diaryMode='strength';

function loadNotes(){ try{ notes=JSON.parse(localStorage.getItem(NOTES_KEY)||'[]'); }catch(e){ notes=[]; } }
function saveNotes(){ try{ localStorage.setItem(NOTES_KEY,JSON.stringify(notes)); }catch(e){} }

function setSimpleDiaryMode(mode){
  _diaryMode=mode;
  var sb=el('diary-mode-strength'),tb=el('diary-mode-test');
  sb.style.borderColor=mode==='strength'?'var(--accent)':'var(--border2)'; sb.style.background=mode==='strength'?'var(--accent-bg)':'var(--s2)'; sb.style.color=mode==='strength'?'var(--accent)':'var(--muted)';
  tb.style.borderColor=mode==='test'?'#7e22ce':'var(--border2)'; tb.style.background=mode==='test'?'rgba(168,85,247,.1)':'var(--s2)'; tb.style.color=mode==='test'?'#7e22ce':'var(--muted)';
  el('diary-note-form').style.display=mode==='strength'?'block':'none';
  el('diary-test-form').style.display=mode==='test'?'block':'none';
  if(mode==='test') initTestCatButtons();
  if(mode==='strength') initExCatChips();
}

var _selTestCat='', _selTestName='', _selTestUnit='';
function initTestCatButtons(){
  var wrap=el('test-cat-btns'); wrap.innerHTML='';
  var customs=loadCustomTests();
  Object.keys(TEST_LIBRARY).forEach(function(key){
    var cat=TEST_LIBRARY[key];
    var b=document.createElement('button');
    b.className='stab'+(key===_selTestCat?' on':'');
    b.innerHTML=cat.icon+' '+cat.label;
    b.style.cssText='padding:6px 10px;font-size:10px;flex:0 0 auto;';
    b.onclick=function(){ _selTestCat=key; initTestCatButtons(); populateTestExercises(key); };
    wrap.appendChild(b);
  });
  if(_selTestCat) populateTestExercises(_selTestCat);
}
function populateTestExercises(catKey){
  var cat=TEST_LIBRARY[catKey]; if(!cat) return;
  var sel=el('test-exercise-sel'); sel.innerHTML='<option value="">Wybierz ćwiczenie...</option>';
  var customs=loadCustomTests().filter(function(c){ return c.cat===catKey; });
  var allTests=cat.tests.concat(customs.map(function(c){ return {name:c.name,unit:c.unit}; }));
  allTests.forEach(function(t){ var o=document.createElement('option'); o.value=t.name; o.textContent=t.name+' ('+t.unit+')'; o.setAttribute('data-unit',t.unit); sel.appendChild(o); });
  el('test-value-section').style.display='none';
  _selTestName=''; _selTestUnit='';
}
function onTestExSelect(){
  var sel=el('test-exercise-sel'); var opt=sel.options[sel.selectedIndex];
  if(!opt||!opt.value){ el('test-value-section').style.display='none'; return; }
  _selTestName=opt.value; _selTestUnit=opt.getAttribute('data-unit')||'';
  el('test-unit-display').value=_selTestUnit;
  el('test-value-input').value=''; el('test-note-input').value='';
  el('test-value-section').style.display='block';
  setTimeout(function(){ el('test-value-input').focus(); },100);
}
function saveTestResult(){
  var athlete=(el('note-athlete').value||'').trim();
  var value=(el('test-value-input').value||'').trim();
  if(!value||!_selTestName||!_selTestCat) return;
  if(!athlete){ el('note-athlete').focus(); return; }
  var saveDay=selectedDay||getDayKey(new Date());
  var now=new Date(); var hh=String(now.getHours()).padStart(2,'0'); var mm=String(now.getMinutes()).padStart(2,'0');
  var testNote=(el('test-note-input').value||'').trim()||null;
  _pushUndo('Test: '+_selTestName+' '+value+' '+_selTestUnit);
  // 1. Save to test results (for charts) — date = selected calendar day
  loadTests();
  testResults.push({
    id:Date.now(), date:saveDay, athlete:athlete,
    category:_selTestCat, testName:_selTestName, value:value, unit:_selTestUnit,
    note:testNote
  });
  saveTests();
  // 2. Save as note entry (for day view / reports) — same date
  loadNotes();
  var noteText='📈 '+_selTestName+': '+value+' '+_selTestUnit+(testNote?' — '+testNote:'');
  notes.push({id:Date.now()+1, date:saveDay, athlete:athlete, text:noteText, type:'test', time:hh+':'+mm});
  saveNotes();
  el('test-value-input').value=''; el('test-note-input').value='';
  // Refresh calendar and day view
  renderCal(); renderDayDetail(saveDay);
  // Flash confirmation
  var btn=document.querySelector('#diary-test-form button[onclick*="saveTestResult"]');
  if(btn){ var orig=btn.textContent; btn.textContent='✓ Zapisano!'; btn.style.background='var(--green)'; setTimeout(function(){ btn.textContent=orig; btn.style.background='#a855f7'; },1200); }
}
function openAddCustomTest(){
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:360px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:14px;">+ Własne ćwiczenie testowe</div>'
    +'<div style="margin-bottom:8px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Kategoria</div>'
    +'<select id="ct-cat" class="crm-input" style="margin-bottom:0;"></select></div>'
    +'<div style="margin-bottom:8px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Nazwa ćwiczenia</div>'
    +'<input id="ct-name" class="crm-input" type="text" placeholder="np. Front Squat 1RM" style="margin-bottom:0;"/></div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;">Jednostka</div>'
    +'<input id="ct-unit" class="crm-input" type="text" placeholder="np. kg, s, m, reps" style="margin-bottom:0;max-width:120px;"/></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="ct-save" style="flex:1;padding:12px;background:#a855f7;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Dodaj</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="padding:12px 14px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  var catSel=document.getElementById('ct-cat');
  Object.keys(TEST_LIBRARY).forEach(function(k){ var o=document.createElement('option'); o.value=k; o.textContent=TEST_LIBRARY[k].icon+' '+TEST_LIBRARY[k].label; if(k===_selTestCat) o.selected=true; catSel.appendChild(o); });
  document.getElementById('ct-save').onclick=function(){
    var name=(el('ct-name').value||'').trim(); var unit=(el('ct-unit').value||'').trim(); var cat=el('ct-cat').value;
    if(!name||!unit) return;
    _pushUndo('Własny test: '+name);
    var customs=loadCustomTests(); customs.push({cat:cat,name:name,unit:unit}); saveCustomTests(customs);
    ov.style.display='none';
    if(_selTestCat===cat) populateTestExercises(cat);
  };
}

function saveNote(){
  var text=(el('note-text').value||'').trim(); if(!text) return;
  var athlete=(el('note-athlete').value||'').trim();
  var now=new Date(); var hh=String(now.getHours()).padStart(2,'0'); var mm=String(now.getMinutes()).padStart(2,'0');
  var day=selectedDay||getDayKey(now);
  _pushUndo('Wpis: '+text.substring(0,30));
  notes.push({id:Date.now(),date:day,athlete:athlete,text:text,type:_diaryMode,time:hh+':'+mm});
  saveNotes(); el('note-text').value=''; renderCal(); renderDayDetail(day);
}

function deleteNote(id){
  var entry=notes.find(function(n){ return n.id===id; }); if(!entry) return;
  var ov=el('confirm-overlay');
  if(!ov){ ov=document.createElement('div'); ov.id='confirm-overlay'; ov.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px;'; document.body.appendChild(ov); }
  var preview=(entry.text||'').substring(0,60)+(entry.text.length>60?'...':'');
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:24px 20px;max-width:340px;width:100%;text-align:center;">'
    +'<div style="font-size:28px;margin-bottom:10px;">🗑</div>'
    +'<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">Usunąć ten wpis?</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:6px;line-height:1.4;max-height:60px;overflow:hidden;">'+preview.replace(/</g,'&lt;')+'</div>'
    +(entry.athlete?'<div style="font-size:11px;color:var(--dim);margin-bottom:16px;">'+entry.athlete+' · '+entry.time+'</div>':'<div style="margin-bottom:16px;"></div>')
    +'<div style="display:flex;gap:8px;">'
    +'<button id="confirm-del-note" style="flex:1;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button>'
    +'</div></div>';
  ov.style.display='flex';
  document.getElementById('confirm-del-note').onclick=function(){
    _pushUndo('Usunięto wpis: '+entry.text.substring(0,40));
    notes=notes.filter(function(n){ return n.id!==id; }); saveNotes();
    ov.style.display='none'; renderCal(); renderDayDetail(selectedDay);
  };
}

function editNote(id){
  var entry=notes.find(function(n){ return n.id===id; }); if(!entry) return;
  var d=new Date(entry.date+'T12:00:00');
  var dateLabel=d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'});
  var ov=el('confirm-overlay');
  if(!ov){ ov=document.createElement('div'); ov.id='confirm-overlay'; ov.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:20px;'; document.body.appendChild(ov); }
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:520px;width:100%;padding:20px 18px 22px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:4px;">✏️ Edytuj wpis</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">'+(entry.athlete?entry.athlete+' · ':'')+dateLabel+' · '+entry.time
    +(entry.type==='test'?' · <span style="color:#7e22ce;font-weight:800;">TEST</span>':'')+'</div>'
    +'<textarea id="edit-note-textarea" rows="8" style="width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;outline:none;resize:vertical;line-height:1.6;box-sizing:border-box;min-height:160px;">'+((entry.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'))+'</textarea>'
    +'<div style="display:flex;gap:8px;margin-top:12px;">'
    +'<button id="edit-note-save" style="flex:1;padding:13px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.06em;">Zapisz</button>'
    +'<button id="edit-note-cancel" style="padding:13px 18px;background:var(--s2);color:var(--muted);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button>'
    +'</div></div>';
  ov.style.display='flex';
  setTimeout(function(){ var ta=el('edit-note-textarea'); if(ta){ ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length); } },100);
  document.getElementById('edit-note-save').onclick=function(){
    var newText=(el('edit-note-textarea').value||'').trim();
    if(newText&&newText!==entry.text){ _pushUndo('Edycja: '+entry.text.substring(0,30)); entry.text=newText; saveNotes(); }
    ov.style.display='none'; renderDayDetail(selectedDay);
  };
  document.getElementById('edit-note-cancel').onclick=function(){ ov.style.display='none'; };
}

function getDayKey(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function renderCal(){
  loadNotes();
  var y=calDate.getFullYear(),m=calDate.getMonth();
  var MONTHS=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  el('cal-month-label').textContent=MONTHS[m]+' '+y;
  var grid=el('cal-grid'); grid.innerHTML='';
  ['Pn','Wt','Śr','Cz','Pt','So','Nd'].forEach(function(d){ var h=document.createElement('div'); h.className='cal-day-hdr'; h.textContent=d; grid.appendChild(h); });
  var first=new Date(y,m,1); var startDay=(first.getDay()+6)%7;
  var daysInMonth=new Date(y,m+1,0).getDate();
  var todayKey=getDayKey(new Date());
  var noteDays={}; notes.forEach(function(n){ noteDays[n.date]=true; });
  // Previous month days
  var prevDays=new Date(y,m,0).getDate();
  for(var i=startDay-1;i>=0;i--){ var d2=document.createElement('div'); d2.className='cal-day other-month'; d2.textContent=prevDays-i; grid.appendChild(d2); }
  for(var d=1;d<=daysInMonth;d++){
    var dk=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var btn=document.createElement('div'); btn.className='cal-day';
    if(dk===todayKey) btn.classList.add('today');
    if(dk===selectedDay) btn.classList.add('selected');
    if(noteDays[dk]) btn.classList.add('has-data');
    btn.textContent=d;
    (function(key){ btn.onclick=function(){ selectedDay=key; renderCal(); renderDayDetail(key); }; })(dk);
    grid.appendChild(btn);
  }
  // Fill remaining
  var total=startDay+daysInMonth; var rem=total%7?7-total%7:0;
  for(var r=1;r<=rem;r++){ var d3=document.createElement('div'); d3.className='cal-day other-month'; d3.textContent=r; grid.appendChild(d3); }
}
function calPrev(){ calDate.setMonth(calDate.getMonth()-1); renderCal(); }
function calNext(){ calDate.setMonth(calDate.getMonth()+1); renderCal(); }

var _dayCollapsed={};
function toggleDayAthleteCard(aid){ _dayCollapsed[aid]=!_dayCollapsed[aid]; renderDayDetail(selectedDay); }

function renderDayDetail(day){
  if(!day){ el('day-detail').style.display='none'; return; }
  var d=new Date(day+'T12:00:00');
  var dayName=d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  el('day-detail-title').textContent=dayName.charAt(0).toUpperCase()+dayName.slice(1);
  loadNotes();
  var entries=notes.filter(function(n){ return n.date===day; });
  var container=el('day-entries'); container.innerHTML='';

  if(!entries.length){
    container.innerHTML='<div style="text-align:center;color:var(--dim);font-size:12px;padding:16px;">Brak wpisów w tym dniu.</div>';
    el('day-detail').style.display='block'; return;
  }

  // Group by athlete
  var athleteMap={};
  entries.forEach(function(n){ var a=n.athlete||'Bez zawodnika'; if(!athleteMap[a]) athleteMap[a]=[]; athleteMap[a].push(n); });

  Object.keys(athleteMap).sort().forEach(function(athlete){
    var items=athleteMap[athlete];
    var aid='day-ath-'+athlete.replace(/[^a-zA-Z0-9]/g,'_');
    var isCollapsed=!!_dayCollapsed[aid];
    var totalTxt=items.length+' wpis'+(items.length===1?'':'ów');

    var section=document.createElement('div');
    section.style.cssText='background:var(--s1);border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden;';

    // Header
    var hdr=document.createElement('div');
    hdr.style.cssText='padding:10px 14px;background:var(--s2);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer;';
    hdr.onclick=function(){ toggleDayAthleteCard(aid); };
    hdr.innerHTML='<span style="font-size:14px;font-weight:900;color:var(--text);">👤 '+athlete+'</span>'
      +'<div style="display:flex;gap:8px;align-items:center;">'
      +'<span style="font-size:11px;color:var(--muted);">'+totalTxt+'</span>'
      +'<button onclick="event.stopPropagation();printAthleteDay(\''+athlete.replace(/'/g,"\\'")+'\',\''+day+'\')" style="background:#1d4ed8;border:none;border-radius:var(--r-xs);padding:4px 10px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:800;color:#fff;display:flex;align-items:center;gap:4px;">🖨 RAPORT</button>'
      +'<span style="color:var(--muted);font-size:14px;transition:transform .2s;'+(isCollapsed?'':'transform:rotate(180deg)')+'">▼</span>'
      +'</div>';
    section.appendChild(hdr);

    // Content (entries list)
    if(!isCollapsed){
      var body=document.createElement('div');
      body.style.cssText='padding:6px 10px;';
      items.forEach(function(n){
        if(n.type==='strength'&&n.sets&&n.sets.length){
          body.appendChild(_renderStrengthCard(n));
        } else {
          var div=document.createElement('div'); div.className='note-entry'; div.setAttribute('data-note-id',n.id);
          var badge=n.type==='test'?'<span class="note-test-badge">TEST</span>':'';
          div.innerHTML='<div class="note-actions"><button onclick="editNote('+n.id+')" title="Edytuj">✏️</button><button onclick="deleteNote('+n.id+')" title="Usuń">🗑</button></div>'
            +'<div class="note-entry-text">'+badge+(n.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
            +'<div class="note-entry-meta">'+n.time+'</div>';
          body.appendChild(div);
        }
      });
      section.appendChild(body);
    }

    container.appendChild(section);
  });
  el('day-detail').style.display='block';
}

