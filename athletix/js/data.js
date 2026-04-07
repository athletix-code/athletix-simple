// ══════════════════════════════════════
//  EXPORT / IMPORT / BACKUP
// ══════════════════════════════════════
var AXS_KEYS=['axs_athletes','axs_sessions','axs_groups','axs_tests','axs_notes','axs_custom_tests','axs_packages','axs_int_presets','axs_custom_exercises','axs_plans','axs_favorite_exercises','cts_v5','ct_theme'];
var BACKUP_CFG_KEY='axs_backup_cfg';

function openAppSettings(){ setMode('data'); }

function exportAllData(){
  var data={_meta:{app:'AthletiXApp Simple',version:'1.0',exportDate:new Date().toISOString()}};
  AXS_KEYS.forEach(function(k){ try{ var v=localStorage.getItem(k); if(v) data[k]=JSON.parse(v); }catch(e){ if(v) data[k]=v; } });
  var json=JSON.stringify(data,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  var d=new Date(); var fname='athletix-backup-'+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'.json';
  a.href=url; a.download=fname; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  // Mark backup time
  var cfg=loadBackupCfg(); cfg.lastBackup=Date.now(); saveBackupCfg(cfg);
  var st=el('export-status'); if(st){ st.textContent='✓ Wyeksportowano: '+fname; st.style.display='block'; st.style.color='var(--green-text)'; }
}

function importDataFile(input){
  var file=input.files&&input.files[0]; if(!file) return;
  var st=el('import-status');
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var data=JSON.parse(e.target.result);
      if(!data._meta||data._meta.app!=='AthletiXApp Simple'){
        if(st){ st.textContent='Nieprawidłowy plik — brak sygnatury AthletiXApp Simple.'; st.style.color='var(--red-text)'; st.style.display='block'; }
        return;
      }
      // Confirm
      var ov=_ensureOverlay();
      var keys=Object.keys(data).filter(function(k){ return k!=='_meta'; });
      var athleteCount=data.axs_athletes?data.axs_athletes.length:0;
      var noteCount=data.axs_notes?data.axs_notes.length:0;
      var sessCount=data.axs_sessions?data.axs_sessions.length:0;
      ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:24px 20px;max-width:380px;width:100%;text-align:center;">'
        +'<div style="font-size:28px;margin-bottom:10px;">📂</div>'
        +'<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">Przywrócić dane z pliku?</div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:4px;line-height:1.5;">'+file.name+'</div>'
        +'<div style="font-size:12px;color:var(--muted);margin-bottom:4px;">Eksport z: '+new Date(data._meta.exportDate).toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})+'</div>'
        +'<div style="font-size:13px;color:var(--text);font-weight:700;margin-bottom:14px;">'+athleteCount+' zawodników · '+noteCount+' wpisów · '+sessCount+' sesji</div>'
        +'<div style="font-size:11px;color:var(--red-text);margin-bottom:14px;font-weight:700;">Obecne dane zostaną nadpisane!</div>'
        +'<div style="display:flex;gap:8px;">'
        +'<button id="import-confirm-btn" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Przywróć dane</button>'
        +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
      ov.style.display='flex';
      document.getElementById('import-confirm-btn').onclick=function(){
        keys.forEach(function(k){ try{ localStorage.setItem(k,JSON.stringify(data[k])); }catch(ex){ try{ localStorage.setItem(k,data[k]); }catch(ex2){} } });
        ov.style.display='none';
        // Reload everything
        loadCRM(); loadNotes(); loadTests(); loadGroups(); loadCustomExercises(); loadLS();
        if(st){ st.textContent='✓ Dane przywrócone pomyślnie! ('+keys.length+' kluczy)'; st.style.color='var(--green-text)'; st.style.display='block'; }
        refreshDataStats();
        renderAthleteList(); populateAthleteSelect();
      };
    }catch(ex){
      if(st){ st.textContent='Błąd odczytu pliku: '+ex.message; st.style.color='var(--red-text)'; st.style.display='block'; }
    }
  };
  reader.readAsText(file);
  input.value=''; // reset so same file can be re-selected
}

function refreshDataStats(){
  var s=el('data-stats'); if(!s) return;
  loadCRM(); loadNotes(); loadTests(); loadGroups();
  var totalBytes=0; AXS_KEYS.forEach(function(k){ var v=localStorage.getItem(k); if(v) totalBytes+=v.length; });
  var kb=(totalBytes/1024).toFixed(1);
  var cfg=loadBackupCfg();
  var lastBk=cfg.lastBackup?new Date(cfg.lastBackup).toLocaleDateString('pl-PL',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Nigdy';
  s.innerHTML='<div>👤 Zawodnicy: <strong>'+athletes.length+'</strong></div>'
    +'<div>📋 Wpisy notatnika: <strong>'+notes.length+'</strong></div>'
    +'<div>⏱ Sesje interwałowe: <strong>'+sessions.length+'</strong></div>'
    +'<div>📈 Wyniki testów: <strong>'+testResults.length+'</strong></div>'
    +'<div>👥 Grupy: <strong>'+teamGroups.length+'</strong></div>'
    +'<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">💾 Rozmiar danych: <strong>'+kb+' KB</strong></div>'
    +'<div>📅 Ostatni backup: <strong>'+lastBk+'</strong></div>';
}

// ── Auto-backup reminder ──
function loadBackupCfg(){ try{ return JSON.parse(localStorage.getItem(BACKUP_CFG_KEY)||'{}'); }catch(e){ return {}; } }
function saveBackupCfg(cfg){ try{ localStorage.setItem(BACKUP_CFG_KEY,JSON.stringify(cfg)); }catch(e){} }

function setAutoBackup(hours){
  var cfg=loadBackupCfg(); cfg.intervalHours=hours; saveBackupCfg(cfg); refreshAutoBackupUI();
}
function refreshAutoBackupUI(){
  var cfg=loadBackupCfg(); var h=cfg.intervalHours||0;
  ['off','1','3','8','12','24','72','168'].forEach(function(v){ var b=el('ab-'+v); if(b) b.classList.toggle('on',String(h)===v||(v==='off'&&h===0)); });
  var st=el('ab-status');
  if(st){
    if(!h) st.textContent='Automatyczne przypomnienia wyłączone.';
    else {
      var nextDue=cfg.lastBackup?(cfg.lastBackup+h*3600000):Date.now();
      var remaining=Math.max(0,nextDue-Date.now());
      var rh=Math.floor(remaining/3600000); var rm=Math.floor((remaining%3600000)/60000);
      st.textContent='Następne przypomnienie za: '+(rh>0?rh+'h ':'')+(rm>0?rm+'min':'<1min');
    }
  }
}
function checkAutoBackupDue(){
  var cfg=loadBackupCfg(); if(!cfg.intervalHours) return;
  var due=cfg.lastBackup?(cfg.lastBackup+cfg.intervalHours*3600000):0;
  if(Date.now()>=due) showBackupReminder();
}
function showBackupReminder(){
  var existing=document.getElementById('backup-reminder'); if(existing) return;
  var div=document.createElement('div'); div.id='backup-reminder';
  div.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:9500;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,.3);';
  div.innerHTML='<div style="flex:1;min-width:0;">'
    +'<div style="font-size:13px;font-weight:800;">💾 Czas na backup!</div>'
    +'<div style="font-size:11px;opacity:.8;margin-top:2px;">Wyeksportuj dane, żeby ich nie stracić.</div>'
    +'</div>'
    +'<button onclick="document.getElementById(\'backup-reminder\').remove();exportAllData();" style="padding:8px 16px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;">Eksportuj</button>'
    +'<button onclick="document.getElementById(\'backup-reminder\').remove();" style="background:transparent;border:none;cursor:pointer;color:rgba(255,255,255,.5);font-size:18px;padding:4px 8px;flex-shrink:0;">✕</button>';
  document.body.appendChild(div);
}

function confirmClearAllData(){
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);padding:24px 20px;max-width:340px;width:100%;text-align:center;">'
    +'<div style="font-size:28px;margin-bottom:10px;">⚠️</div>'
    +'<div style="font-size:15px;font-weight:800;color:var(--red-text);margin-bottom:8px;">Usunąć WSZYSTKIE dane?</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.5;">Zawodnicy, sesje, wpisy, ustawienia — wszystko zostanie usunięte bezpowrotnie. Upewnij się, że masz backup.</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="clear-all-btn" style="flex:1;padding:12px;background:#dc2626;color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń wszystko</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('clear-all-btn').onclick=function(){
    AXS_KEYS.forEach(function(k){ localStorage.removeItem(k); });
    localStorage.removeItem(BACKUP_CFG_KEY);
    ov.style.display='none';
    loadCRM(); loadNotes(); loadTests(); loadGroups();
    refreshDataStats(); renderAthleteList(); populateAthleteSelect();
    var st=el('import-status'); if(st){ st.textContent='✓ Wszystkie dane usunięte.'; st.style.color='var(--red-text)'; st.style.display='block'; }
  };
}

// Check backup on app start
document.addEventListener('DOMContentLoaded',function(){ setTimeout(checkAutoBackupDue,2000); });

