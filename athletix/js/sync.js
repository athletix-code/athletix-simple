// ═══════════════════════════════════════
//  DATA SYNC — localStorage ↔ Supabase
//  Simple approach: periodic push every 30s + push on key actions
// ═══════════════════════════════════════

var _syncEnabled = false;
var _syncTimer = null;

function initSync(){
  if(!window.sb || !currentTrainer || currentTrainer.id === 'offline'){
    _syncEnabled = false;
    console.log('Sync disabled (offline mode)');
    return;
  }
  _syncEnabled = true;
  console.log('Sync enabled for:', currentTrainer.email);

  // Initial sync: wait for pull to finish first (5s), then push
  setTimeout(function(){ syncNow(); }, 5000);

  // Periodic sync every 30 seconds
  _syncTimer = setInterval(function(){ syncNow(); }, 30000);

  // Update account info
  var info = el('account-info');
  var userName=(currentTrainer.user_metadata&&currentTrainer.user_metadata.name)?currentTrainer.user_metadata.name:'';
  if(info) info.innerHTML = (userName?'👤 '+userName+'<br>':'')+'📧 '+currentTrainer.email;
}

function syncNow(){
  if(!_syncEnabled || !window.sb || !currentTrainer || currentTrainer.id === 'offline') return;
  var uid = currentTrainer.id;

  function _push(table, rows, label){
    // SAFETY: never overwrite cloud with empty data
    if(!rows.length){
      console.log('Skip sync '+label+': local empty');
      return;
    }
    // Check cloud count first — don't delete if cloud has more data
    sb.from(table).select('id',{count:'exact',head:true}).eq('trainer_id', uid).then(function(countRes){
      var cloudCount=(countRes.count||0);
      if(cloudCount>0 && rows.length===0){
        console.warn('BLOCKED: would delete '+cloudCount+' '+label+' from cloud with empty local');
        return;
      }
      sb.from(table).delete().eq('trainer_id', uid).then(function(delRes){
        if(delRes.error){ console.warn('Sync delete '+label+':', delRes.error.message); return; }
        sb.from(table).insert(rows).then(function(res){
          if(res.error) console.warn('Sync '+label+' error:', res.error.message);
          else console.log('Synced '+rows.length+' '+label);
        });
      });
    });
  }

  // ── Athletes ──
  var localAthletes = Storage.get('axs_athletes') || [];
  _push('athletes', localAthletes.map(function(a){
    return {
      trainer_id:uid, name:a.name, notes:a.notes||null,
      status:a.status||'active', birth_date:a.birthDate||null,
      category:a.category||null, discipline:a.discipline||null,
      club:a.club||null, tags:a.tags||[],
      injury:a.injury||null, wallet:a.wallet||null,
      break_data:(a.breakFrom||a.breakTo||a.breakNote)?{from:a.breakFrom,to:a.breakTo,note:a.breakNote,unknown:a.breakUnknown}:null,
      ended_data:a.endedDate?{date:a.endedDate,reason:a.endedReason}:null
    };
  }), 'athletes');

  // ── Notes ──
  var localNotes = Storage.get('axs_notes') || [];
  _push('notes', localNotes.map(function(n){
    return {trainer_id:uid, athlete_name:n.athlete||'', date:n.date, text:n.text, type:n.type||'strength', time:n.time||''};
  }), 'notes');

  // ── Test results ──
  var localTests = Storage.get('axs_tests') || [];
  _push('test_results', localTests.map(function(t){
    return {trainer_id:uid, athlete_name:t.athlete||'', date:t.date, category:t.category, test_name:t.testName, value:t.value, unit:t.unit||'', note:t.note||null};
  }), 'test_results');

  // ── Sessions ──
  var localSessions = Storage.get('axs_sessions') || [];
  _push('sessions', localSessions.map(function(s){
    return {trainer_id:uid, athlete_name:s.athlete||'', date:s.date, mode:s.mode, label:s.label||'', params:s.params||{}, intervals:s.intervals||[], hr_drop:s.hrDrop||null, end_date:s.endDate||null};
  }), 'sessions');

  // ── Groups ──
  var localGroups = Storage.get('axs_groups') || [];
  _push('groups', localGroups.map(function(g){
    return {trainer_id:uid, name:g.name, athletes:g.athletes||[]};
  }), 'groups');

  // ── Plans ──
  var localPlans = Storage.get('axs_plans') || [];
  _push('plans', localPlans.map(function(p){
    return {trainer_id:uid, name:p.name, athlete_name:p.athlete, text:p.text||'', status:p.status||'active', created:p.created||'', updated:p.updated||''};
  }), 'plans');
}

// ── PULL FROM CLOUD (restore each table independently if local is empty) ──
function pullFromCloud(){
  if(!_syncEnabled) return;
  var uid = currentTrainer.id;
  console.log('Pull from cloud — checking each table...');

  // Each table pulls independently: if local empty → restore from cloud
  function _pullIfEmpty(table, localKey, mapper, onDone){
    var local = Storage.get(localKey) || [];
    if(local.length > 0){ return; } // local has data, skip
    sb.from(table).select('*').eq('trainer_id', uid).then(function(res){
      if(!res.data||!res.data.length) return;
      console.log('Restored '+res.data.length+' rows from '+table);
      Storage.set(localKey, res.data.map(mapper));
      if(onDone) onDone();
    });
  }

  _pullIfEmpty('athletes', 'axs_athletes', function(a){
    var obj={id:a.id,name:a.name,notes:a.notes,status:a.status,tags:a.tags||[]};
    if(a.birth_date) obj.birthDate=a.birth_date;
    if(a.category) obj.category=a.category;
    if(a.discipline) obj.discipline=a.discipline;
    if(a.club) obj.club=a.club;
    if(a.injury) obj.injury=a.injury;
    if(a.wallet) obj.wallet=a.wallet;
    if(a.break_data){obj.breakFrom=a.break_data.from;obj.breakTo=a.break_data.to;obj.breakNote=a.break_data.note;obj.breakUnknown=a.break_data.unknown;}
    if(a.ended_data){obj.endedDate=a.ended_data.date;obj.endedReason=a.ended_data.reason;}
    return obj;
  }, function(){ loadCRM(); renderAthleteList(); });

  _pullIfEmpty('notes', 'axs_notes', function(n){
    return {id:n.id,date:n.date,athlete:n.athlete_name,text:n.text,type:n.type,time:n.time};
  }, function(){ loadNotes(); });

  _pullIfEmpty('test_results', 'axs_tests', function(t){
    return {id:t.id,date:t.date,athlete:t.athlete_name,category:t.category,testName:t.test_name,value:t.value,unit:t.unit,note:t.note};
  }, function(){ loadTests(); });

  _pullIfEmpty('sessions', 'axs_sessions', function(s){
    return {id:s.id,date:s.date,athlete:s.athlete_name,mode:s.mode,label:s.label,params:s.params,intervals:s.intervals,hrDrop:s.hr_drop,endDate:s.end_date};
  }, function(){ loadCRM(); });

  _pullIfEmpty('groups', 'axs_groups', function(g){
    return {name:g.name,athletes:g.athletes||[]};
  }, function(){ loadGroups(); });

  _pullIfEmpty('plans', 'axs_plans', function(p){
    return {id:p.id,name:p.name,athlete:p.athlete_name,text:p.text,status:p.status,created:p.created,updated:p.updated};
  }, function(){ loadPlans(); });
}

function stopSync(){
  clearInterval(_syncTimer);
  _syncEnabled = false;
}
