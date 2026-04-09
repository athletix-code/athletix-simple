// ═══════════════════════════════════════
//  SHARE - Generowanie grafik wynikow
// ═══════════════════════════════════════

var _sharePhoto=null, _shareFormat='story', _shareColor='blue';

// roundRect polyfill
function _rrect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

function _getShareData(){
  var isSearch=(_motionMode==='pairs'||_motionMode==='sequence'||_motionMode==='words');
  var avg=_gameTimes.length?Math.round(_gameTimes.reduce(function(a,b){return a+b;},0)/_gameTimes.length):0;
  var best=_gameTimes.length?Math.min.apply(null,_gameTimes):0;
  var acc=_gameTotalTrials?Math.round(_gameCorrect/_gameTotalTrials*100):0;
  var ch=getLevelCharacter(_gameLevel);
  var modeNames={simple:'Reakcja',directions:'Kierunki',gonogo:'Go/No-Go',pattern:'Wzorce',pairs:'Pary',sequence:'Kolejność',words:'Słowa'};
  return {
    gameName:modeNames[_motionMode]||'Motion',
    avgTime:avg, bestTime:best, accuracy:acc,
    maxCombo:_gameMaxCombo, maxLevel:_gameLevel, points:_gamePoints,
    characterEmoji:ch.emoji, characterName:ch.name,
    isSearch:isSearch,
    avgTxt:isSearch?(avg/1000).toFixed(1)+'s':avg+'ms',
    bestTxt:isSearch?(best/1000).toFixed(1)+'s':best+'ms'
  };
}

var _THEMES={
  blue:{bg1:'#08080c',bg2:'#0a1428',accent:'#3b82f6',ar:'59,130,246',good:'#4ade80',text:'#ffffff',muted:'rgba(255,255,255,0.3)',sub:'rgba(255,255,255,0.5)'},
  gold:{bg1:'#0c0c04',bg2:'#1a1808',accent:'#eab308',ar:'234,179,8',good:'#eab308',text:'#ffffff',muted:'rgba(255,255,255,0.3)',sub:'rgba(255,255,255,0.5)'},
  green:{bg1:'#040c06',bg2:'#0a1a0e',accent:'#4ade80',ar:'74,222,128',good:'#4ade80',text:'#ffffff',muted:'rgba(255,255,255,0.3)',sub:'rgba(255,255,255,0.5)'},
  fire:{bg1:'#0c0404',bg2:'#1a0808',accent:'#f87171',ar:'220,38,38',good:'#f87171',text:'#ffffff',muted:'rgba(255,255,255,0.3)',sub:'rgba(255,255,255,0.5)'},
  purple:{bg1:'#08040c',bg2:'#140a1e',accent:'#a855f7',ar:'168,85,247',good:'#a855f7',text:'#ffffff',muted:'rgba(255,255,255,0.3)',sub:'rgba(255,255,255,0.5)'},
  light:{bg1:'#f5f5f5',bg2:'#ffffff',accent:'#2563eb',ar:'37,99,235',good:'#16a34a',text:'#1a1a1a',muted:'rgba(0,0,0,0.3)',sub:'rgba(0,0,0,0.5)'}
};

function _openShareModal(){
  var old=document.getElementById('share-modal'); if(old) old.remove();
  _sharePhoto=null; _shareFormat='story'; _shareColor='blue';
  var ov=document.createElement('div'); ov.id='share-modal';
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
  ov.innerHTML='<div style="max-width:400px;width:calc(100% - 32px);background:#1a1a1a;border-radius:16px;padding:20px;max-height:85vh;overflow-y:auto;color:#f2f2f2;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:800;">📸 Udostępnij wynik</div><div onclick="document.getElementById(\'share-modal\').remove()" style="cursor:pointer;font-size:14px;color:rgba(255,255,255,.5);width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</div></div>'
    // Format
    +'<div style="display:flex;gap:8px;margin:12px 0;" id="share-fmt">'
    +'<div class="sfmt" data-f="story" onclick="_setShareFmt(\'story\')" style="flex:1;padding:8px;border-radius:8px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;background:#3b82f6;color:#fff;">Story 9:16</div>'
    +'<div class="sfmt" data-f="post" onclick="_setShareFmt(\'post\')" style="flex:1;padding:8px;border-radius:8px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.1);">Post 1:1</div>'
    +'</div>'
    // Kolor
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;">KOLOR</div>'
    +'<div id="share-colors" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;"></div>'
    // Zdjecie
    +'<div onclick="document.getElementById(\'share-file\').click()" style="width:100%;padding:10px;border:1px dashed rgba(255,255,255,.15);border-radius:8px;background:transparent;color:rgba(255,255,255,.5);font-size:11px;font-weight:600;cursor:pointer;text-align:center;margin-bottom:4px;">📷 Dodaj zdjęcie</div>'
    +'<input type="file" id="share-file" accept="image/*" capture="environment" style="display:none;" onchange="_onShareFile(this)">'
    +'<div id="share-photo-prev" style="display:none;margin:6px 0;align-items:center;gap:8px;"></div>'
    // Generuj
    +'<div id="share-gen-btn" onclick="_doGenerate()" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border-radius:10px;text-align:center;font-size:13px;font-weight:800;cursor:pointer;margin-top:8px;">Generuj podgląd</div>'
    // Preview
    +'<div id="share-prev" style="display:none;margin-top:12px;text-align:center;"></div>'
    +'</div>';
  document.body.appendChild(ov);
  _renderColorPicker();
}

function _setShareFmt(f){
  _shareFormat=f;
  document.querySelectorAll('.sfmt').forEach(function(b){
    var on=b.dataset.f===f;
    b.style.background=on?'#3b82f6':'rgba(255,255,255,.06)';
    b.style.color=on?'#fff':'rgba(255,255,255,.6)';
    b.style.border=on?'none':'1px solid rgba(255,255,255,.1)';
  });
}

function _renderColorPicker(){
  var c=document.getElementById('share-colors'); if(!c) return;
  var cols=[
    {k:'blue',bg:'#0a1428'},{k:'gold',bg:'#1a1808'},{k:'green',bg:'#0a1a0e'},
    {k:'fire',bg:'#1a0808'},{k:'purple',bg:'#140a1e'},{k:'light',bg:'#f5f5f5'}
  ];
  c.innerHTML=cols.map(function(cl){
    var sel=_shareColor===cl.k;
    return '<div onclick="_shareColor=\''+cl.k+'\';_renderColorPicker()" style="width:32px;height:32px;border-radius:50%;background:'+cl.bg+';cursor:pointer;border:2px solid '+(sel?_THEMES[cl.k].accent:'rgba(255,255,255,.1)')+';"></div>';
  }).join('');
}

function _onShareFile(input){
  if(!input.files||!input.files[0]) return;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=new Image(); img.onload=function(){
      _sharePhoto=img;
      var p=document.getElementById('share-photo-prev');
      if(p){ p.style.display='flex'; p.innerHTML='<img src="'+e.target.result+'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"><div onclick="_sharePhoto=null;this.parentElement.style.display=\'none\'" style="font-size:11px;color:#f87171;cursor:pointer;">✕ Usuń</div>'; }
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

function _doGenerate(){
  var cv=document.createElement('canvas');
  var w=1080, h=_shareFormat==='story'?1920:1080;
  cv.width=w; cv.height=h;
  var ctx=cv.getContext('2d');
  var d=_getShareData();
  var t=_THEMES[_shareColor]||_THEMES.blue;

  // 1. TLO
  if(_sharePhoto){
    var r=Math.max(w/_sharePhoto.width,h/_sharePhoto.height);
    ctx.drawImage(_sharePhoto,(w-_sharePhoto.width*r)/2,(h-_sharePhoto.height*r)/2,_sharePhoto.width*r,_sharePhoto.height*r);
    var tg=ctx.createLinearGradient(0,0,0,h*0.12); tg.addColorStop(0,'rgba(0,0,0,0.6)'); tg.addColorStop(1,'transparent');
    ctx.fillStyle=tg; ctx.fillRect(0,0,w,h*0.12);
    var bg=ctx.createLinearGradient(0,h*0.5,0,h); bg.addColorStop(0,'transparent'); bg.addColorStop(0.25,'rgba(0,0,0,0.4)'); bg.addColorStop(0.5,'rgba(0,0,0,0.7)'); bg.addColorStop(1,'rgba(0,0,0,0.92)');
    ctx.fillStyle=bg; ctx.fillRect(0,h*0.5,w,h*0.5);
  } else {
    var g=ctx.createLinearGradient(0,0,w*0.4,h); g.addColorStop(0,t.bg1); g.addColorStop(0.5,t.bg2); g.addColorStop(1,t.bg1);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }

  // 2. DEKORACYJNE LINIE
  var lG=ctx.createLinearGradient(w*0.1,0,w*0.9,0);
  lG.addColorStop(0,'transparent'); lG.addColorStop(0.3,'rgba('+t.ar+',0.3)'); lG.addColorStop(0.5,'rgba('+t.ar+',0.5)'); lG.addColorStop(0.7,'rgba('+t.ar+',0.3)'); lG.addColorStop(1,'transparent');
  ctx.fillStyle=lG; ctx.fillRect(w*0.08,h*0.06,w*0.84,2); ctx.fillRect(w*0.08,h-h*0.06,w*0.84,2);

  // 3. BRANDING GORA
  ctx.textAlign='left';
  ctx.font='700 36px Montserrat,sans-serif'; ctx.fillStyle=_sharePhoto?'rgba(255,255,255,0.7)':t.sub;
  ctx.fillText('Athleti',w*0.06,h*0.04);
  var aw=ctx.measureText('Athleti').width;
  ctx.fillStyle='#dc2626'; ctx.fillText('X',w*0.06+aw,h*0.04);
  var xw=ctx.measureText('X').width;
  ctx.font='500 28px Montserrat,sans-serif'; ctx.fillStyle=_sharePhoto?'rgba(255,255,255,0.5)':t.muted;
  ctx.fillText(' App',w*0.06+aw+xw,h*0.04);
  // AX badge
  ctx.font='900 28px Montserrat,sans-serif'; ctx.fillStyle='rgba('+t.ar+',0.2)'; ctx.textAlign='right'; ctx.fillText('AX',w*0.94,h*0.04);

  // 4. POSTAC
  var cy;
  if(_sharePhoto){
    cy=h*0.65;
    // Ze zdjeciem: mniejszy tekst levelu
    ctx.font='700 26px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.textAlign='center';
    ctx.fillText(d.characterEmoji+' '+d.characterName+' - Level '+d.maxLevel,w/2,cy-20);
  } else {
    cy=h*0.3;
    ctx.font='120px serif'; ctx.textAlign='center'; ctx.fillStyle=t.text; ctx.fillText(d.characterEmoji,w/2,cy-60);
    ctx.font='800 32px Montserrat,sans-serif'; ctx.fillStyle=t.text; ctx.fillText(d.characterName+' - Level '+d.maxLevel,w/2,cy);
  }

  // 5. NAZWA GRY
  ctx.font='700 24px Montserrat,sans-serif'; ctx.fillStyle=_sharePhoto?'rgba(255,255,255,0.9)':t.accent; ctx.textAlign='center';
  ctx.fillText(d.gameName.toUpperCase(),w/2,cy+40);

  // 6. GLOWNA METRYKA (punkty)
  var ptsCol=d.points<0?'#f87171':(_sharePhoto?'#ffffff':t.text);
  ctx.font='900 120px Montserrat,sans-serif'; ctx.fillStyle=ptsCol; ctx.textAlign='center';
  ctx.fillText(d.points+'',w/2,cy+160);
  ctx.font='700 28px Montserrat,sans-serif'; ctx.fillStyle=_sharePhoto?'#4ade80':t.good;
  ctx.fillText('⚡ PUNKTY',w/2,cy+198);

  // 7. SREDNI CZAS
  var avgDisplay=(d.avgTime>0&&!isNaN(d.avgTime))?d.avgTxt:'---';
  ctx.font='500 22px Montserrat,sans-serif'; ctx.fillStyle=_sharePhoto?'rgba(255,255,255,0.5)':t.muted;
  ctx.fillText('średni czas: '+avgDisplay,w/2,cy+235);

  // 8. KAFELKI 2x2
  var bestDisplay=(d.bestTime>0&&!isNaN(d.bestTime))?d.bestTxt:'---';
  var tW=(w-w*0.16-16)/2, tH=100, tY=cy+260;
  var tiles=[
    {v:bestDisplay,l:'NAJLEPSZY',c:t.good},
    {v:d.accuracy+'%',l:'CELNOŚĆ',c:_sharePhoto?'#fff':t.text},
    {v:'x'+d.maxCombo,l:'COMBO',c:'#f59e0b'},
    {v:'Lv.'+d.maxLevel,l:'LEVEL',c:t.accent}
  ];
  for(var i=0;i<4;i++){
    var tx=w*0.08+(i%2)*(tW+16), ty=tY+Math.floor(i/2)*(tH+10);
    _rrect(ctx,tx,ty,tW,tH,16);
    ctx.fillStyle=_sharePhoto?'rgba(0,0,0,0.4)':'rgba('+t.ar+',0.04)'; ctx.fill();
    ctx.strokeStyle=_sharePhoto?'rgba(255,255,255,0.08)':'rgba('+t.ar+',0.08)'; ctx.lineWidth=1; ctx.stroke();
    ctx.font='800 36px Montserrat,sans-serif'; ctx.fillStyle=tiles[i].c; ctx.textAlign='center'; ctx.fillText(tiles[i].v,tx+tW/2,ty+50);
    ctx.font='700 14px Montserrat,sans-serif'; ctx.fillStyle=t.muted; ctx.fillText(tiles[i].l,tx+tW/2,ty+78);
  }

  // 9. BRANDING DOL
  ctx.font='600 20px Montserrat,sans-serif'; ctx.fillStyle=_sharePhoto?'rgba(255,255,255,0.2)':t.muted; ctx.textAlign='center';
  ctx.fillText('Elevate Your Game ⚡',w/2,h-h*0.03-14);
  ctx.font='400 14px Montserrat,sans-serif'; ctx.fillStyle='rgba('+t.ar+',0.15)';
  ctx.fillText('athletix-code.github.io',w/2,h-h*0.03+6);

  // POKAZ PODGLAD
  _showShareResult(cv);
}

function _showShareResult(cv){
  var p=document.getElementById('share-prev'); if(!p) return;
  p.style.display='block';
  var img=document.createElement('img'); img.src=cv.toDataURL('image/png');
  img.style.cssText='max-width:280px;width:100%;border-radius:8px;margin:0 auto 12px;display:block;';
  p.innerHTML=''; p.appendChild(img);
  // Share btn
  var canShare=false;
  try{ canShare=navigator.canShare&&navigator.canShare({files:[new File([''],'t.png',{type:'image/png'})]}); }catch(e){}
  if(canShare){
    var sb=document.createElement('div');
    sb.style.cssText='width:100%;padding:12px;background:#3b82f6;color:#fff;border-radius:10px;text-align:center;font-size:13px;font-weight:800;cursor:pointer;margin-bottom:6px;';
    sb.textContent='Udostępnij';
    sb.onclick=function(){ cv.toBlob(function(blob){ var f=new File([blob],'athletix-wynik.png',{type:'image/png'}); navigator.share({files:[f],title:'Mój wynik - AthletiX',text:'Elevate Your Game!'}).catch(function(){}); },'image/png'); };
    p.appendChild(sb);
  }
  var db=document.createElement('div');
  db.style.cssText='width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;';
  db.textContent='Pobierz PNG';
  db.onclick=function(){ cv.toBlob(function(blob){ var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download='athletix-wynik.png'; a.click(); URL.revokeObjectURL(url); },'image/png'); };
  p.appendChild(db);
  // Hide generate btn
  var gb=document.getElementById('share-gen-btn'); if(gb) gb.style.display='none';
}
