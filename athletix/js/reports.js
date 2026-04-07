// ══ PRINT REPORT ══
function _buildReportHtml(athleteName, day, entries){
  var d=new Date(day+'T12:00:00');
  var dateStr=d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  // Find athlete's club from CRM
  var ath=athletes.find(function(a){ return a.name===athleteName; });
  var club=(ath&&ath.club)?ath.club:'Sigma AthletiX';

  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">'
    +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:"Montserrat",sans-serif;padding:20px;color:#111;}'
    +'.header{background:linear-gradient(135deg,#0b0b0b,#1c1c1c);color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:20px;}'
    +'.header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}'
    +'.header-logo{font-size:22px;font-weight:900;letter-spacing:.04em;}.header-logo .x{color:#ef4444;}'
    +'.header-sub{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.5;margin-top:2px;}'
    +'.header-club{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.6;}'
    +'.header-athlete{font-size:20px;font-weight:900;margin-bottom:4px;}'
    +'.header-date{font-size:13px;font-weight:700;opacity:.7;}'
    +'.entry{padding:10px 0;border-bottom:1px solid #ddd;font-size:13px;line-height:1.6;white-space:pre-wrap;}'
    +'.entry-time{font-size:10px;color:#888;margin-top:3px;}'
    +'.test-badge{font-size:9px;font-weight:800;color:#7e22ce;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3);border-radius:10px;padding:1px 6px;margin-right:4px;}'
    +'.entry-num{display:inline-block;width:24px;font-size:11px;font-weight:900;color:#999;}'
    +'.back-bar{display:flex;gap:10px;align-items:center;margin-bottom:16px;}'
    +'.back-btn{padding:10px 20px;background:#111;color:#fff;border:none;border-radius:8px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;letter-spacing:.04em;}'
    +'.back-btn:hover{background:#333;}'
    +'.print-btn{padding:10px 20px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;letter-spacing:.04em;}'
    +'@media print{body{padding:10px;}.header{break-inside:avoid;}.back-bar{display:none!important;}}</style></head><body>';

  html+='<div class="back-bar"><button class="back-btn" onclick="window.close()">← Zamknij</button><button class="print-btn" onclick="window.print()">🖨 Drukuj</button></div>';
  html+='<div class="header"><div class="header-top"><div><div class="header-logo">Athleti<span class="x">X</span>App</div><div class="header-sub">'+club+'</div></div></div>'
    +'<div class="header-athlete">'+athleteName+'</div>'
    +'<div class="header-date">'+dateStr+'</div></div>';

  if(entries.length){
    entries.forEach(function(n,idx){
      if(n.type==='strength'&&n.sets&&n.sets.length){
        html+=_renderStrengthReportEntry(n,idx);
      } else {
        var badge=n.type==='test'?'<span class="test-badge">TEST</span>':'';
        html+='<div class="entry"><span class="entry-num">'+(idx+1)+'.</span>'+badge+(n.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'<div class="entry-time">'+n.time+'</div></div>';
      }
    });
  } else {
    html+='<div style="text-align:center;color:#999;padding:40px;font-size:14px;">Brak wpisów.</div>';
  }
  // Tonaż łączny
  var rptTon=0; entries.forEach(function(n){ if(n.type==='strength'&&n.sets&&_hasLoad(n.exCat)) rptTon+=calcTonnage(n.sets); });
  if(rptTon>0) html+='<div style="text-align:center;font-size:16px;font-weight:900;color:#1d4ed8;margin-top:16px;padding:12px;border-top:2px solid #ddd;">Tonaż łączny: '+rptTon.toLocaleString('pl-PL')+' kg</div>';
  html+='</body></html>';
  return html;
}

function printAthleteDay(athleteName, day){
  loadNotes(); loadCRM();
  var entries=notes.filter(function(n){ return n.date===day&&(n.athlete||'Bez zawodnika')===athleteName; });
  var html=_buildReportHtml(athleteName, day, entries);
  var w=window.open('','_blank'); w.document.write(html); w.document.close();
}

function printSimpleReport(){
  if(!selectedDay) return;
  loadNotes(); loadCRM();
  var entries=notes.filter(function(n){ return n.date===selectedDay; });
  // Group by athlete, print each
  var byAthlete={};
  entries.forEach(function(n){ var a=n.athlete||'Bez zawodnika'; if(!byAthlete[a]) byAthlete[a]=[]; byAthlete[a].push(n); });
  var athletes2=Object.keys(byAthlete);
  if(athletes2.length===1){
    // Single athlete — direct print
    printAthleteDay(athletes2[0], selectedDay);
  } else if(athletes2.length>1){
    // Multiple athletes — combined report
    var d=new Date(selectedDay+'T12:00:00');
    var dateStr=d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">'
      +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:"Montserrat",sans-serif;padding:20px;color:#111;}'
      +'.header{background:linear-gradient(135deg,#0b0b0b,#1c1c1c);color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;}'
      +'.header-logo{font-size:22px;font-weight:900;letter-spacing:.04em;}.header-logo .x{color:#ef4444;}'
      +'.header-sub{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.5;margin-top:2px;}'
      +'.header-date{font-size:13px;font-weight:700;opacity:.7;}'
      +'.athlete-section{margin-bottom:24px;page-break-inside:avoid;}.athlete-name{font-size:16px;font-weight:900;padding:8px 0;border-bottom:2px solid #111;margin-bottom:8px;}'
      +'.entry{padding:8px 0;border-bottom:1px solid #ddd;font-size:13px;line-height:1.6;white-space:pre-wrap;}'
      +'.entry-time{font-size:10px;color:#888;margin-top:2px;}'
      +'.test-badge{font-size:9px;font-weight:800;color:#7e22ce;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3);border-radius:10px;padding:1px 6px;margin-right:4px;}'
      +'.entry-num{display:inline-block;width:24px;font-size:11px;font-weight:900;color:#999;}'
      +'.back-bar{display:flex;gap:10px;align-items:center;margin-bottom:16px;}'
      +'.back-btn{padding:10px 20px;background:#111;color:#fff;border:none;border-radius:8px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;}'
      +'.print-btn{padding:10px 20px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;}'
      +'@media print{body{padding:10px;}.header{break-inside:avoid;}.back-bar{display:none!important;}}</style></head><body>';
    html+='<div class="back-bar"><button class="back-btn" onclick="window.close()">← Zamknij</button><button class="print-btn" onclick="window.print()">🖨 Drukuj</button></div>';
    html+='<div class="header"><div><div class="header-logo">Athleti<span class="x">X</span>App</div><div class="header-sub">Sigma AthletiX</div></div><div style="text-align:right;"><div class="header-date">'+dateStr+'</div></div></div>';
    athletes2.forEach(function(athlete){
      html+='<div class="athlete-section"><div class="athlete-name">'+athlete+'</div>';
      byAthlete[athlete].forEach(function(n,idx){
        if(n.type==='strength'&&n.sets&&n.sets.length){
          html+=_renderStrengthReportEntry(n,idx);
        } else {
          var badge=n.type==='test'?'<span class="test-badge">TEST</span>':'';
          html+='<div class="entry"><span class="entry-num">'+(idx+1)+'.</span>'+badge+(n.text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'<div class="entry-time">'+n.time+'</div></div>';
        }
      });
      // Tonaż per zawodnik
      var athTon=0; byAthlete[athlete].forEach(function(n){ if(n.type==='strength'&&n.sets&&_hasLoad(n.exCat)) athTon+=calcTonnage(n.sets); });
      if(athTon>0) html+='<div style="text-align:right;font-size:13px;font-weight:800;color:#1d4ed8;margin-top:8px;padding-top:6px;border-top:1px solid #ddd;">Tonaż: '+athTon.toLocaleString('pl-PL')+' kg</div>';
      html+='</div>';
    });
    html+='</body></html>';
    var w=window.open('','_blank'); w.document.write(html); w.document.close();
    setTimeout(function(){ w.print(); },400);
  }
}

