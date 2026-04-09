// ═══════════════════════════════════════
//  SHARE - Generowanie grafik wyników
// ═══════════════════════════════════════

var _sharePhoto=null, _shareFormat='story', _shareStyle=0;
var _SHARE_STYLES=['Dark Minimal','Neon Accent','Clean White','Gradient Sport','Photo + Bar','Photo + Badge','Photo + Centrum'];

function _openShareModal(){
  var old=document.getElementById('share-modal'); if(old) old.remove();
  _sharePhoto=null; _shareStyle=0; _shareFormat='story';
  var ov=document.createElement('div'); ov.id='share-modal';
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
  ov.innerHTML='<div style="max-width:400px;width:calc(100% - 32px);background:#1a1a1a;border-radius:16px;padding:20px;max-height:85vh;overflow-y:auto;color:#f2f2f2;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:800;">📸 Udostępnij wynik</div><button onclick="document.getElementById(\'share-modal\').remove()" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:rgba(255,255,255,.5);width:32px;height:32px;">✕</button></div>'
    // Format
    +'<div style="display:flex;gap:8px;margin:12px 0;" id="share-fmt">'
    +'<button class="share-fmt-btn on" data-f="story" onclick="_setShareFmt(\'story\')" style="flex:1;padding:8px;border-radius:8px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;background:#3b82f6;color:#fff;border:none;">Story 9:16</button>'
    +'<button class="share-fmt-btn" data-f="post" onclick="_setShareFmt(\'post\')" style="flex:1;padding:8px;border-radius:8px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.1);">Post 1:1</button>'
    +'</div>'
    // Styl
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px;">STYL</div>'
    +'<div id="share-styles" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;"></div>'
    // Zdjecie
    +'<div id="share-photo-area" style="margin-bottom:12px;">'
    +'<button onclick="document.getElementById(\'share-file-input\').click()" style="width:100%;padding:10px;border:1px dashed rgba(255,255,255,.2);border-radius:10px;background:transparent;color:rgba(255,255,255,.5);font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;cursor:pointer;">📷 Dodaj swoje zdjecie</button>'
    +'<input type="file" id="share-file-input" accept="image/*" capture="environment" style="display:none;" onchange="_onSharePhoto(this)">'
    +'<div id="share-photo-preview" style="display:none;margin-top:8px;text-align:center;"></div>'
    +'</div>'
    // Generuj
    +'<button onclick="_generateShare()" style="width:100%;padding:14px;background:#3b82f6;color:#fff;border:none;border-radius:12px;font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;">Generuj grafike</button>'
    // Podglad
    +'<div id="share-preview" style="margin-top:12px;text-align:center;display:none;"></div>'
    +'</div>';
  document.body.appendChild(ov);
  _renderShareStyles();
}

function _setShareFmt(f){
  _shareFormat=f;
  document.querySelectorAll('.share-fmt-btn').forEach(function(b){
    var on=b.dataset.f===f;
    b.style.background=on?'#3b82f6':'rgba(255,255,255,.06)';
    b.style.color=on?'#fff':'rgba(255,255,255,.6)';
    b.style.border=on?'none':'1px solid rgba(255,255,255,.1)';
  });
  _renderShareStyles();
}

function _renderShareStyles(){
  var c=document.getElementById('share-styles'); if(!c) return;
  var colors=[['#0a0a0a','#1a1a2e'],['#0d0d1a','#3b82f6'],['#f8f8f8','#1a1a1a'],['#0f172a','#1e3a5f']];
  var photoColors=[['#000','overlay'],['#000','badge'],['#000','center']];
  var ar=_shareFormat==='story'?'9/16':'1/1';
  var html='';
  for(var i=0;i<4;i++){
    var sel=_shareStyle===i;
    html+='<div onclick="_shareStyle='+i+';_renderShareStyles()" style="aspect-ratio:'+ar+';border-radius:8px;border:2px solid '+(sel?'#3b82f6':'rgba(255,255,255,.1)')+';cursor:pointer;overflow:hidden;background:linear-gradient(180deg,'+colors[i][0]+','+colors[i][1]+');display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;">'
      +'<div style="font-size:20px;">⚡</div>'
      +'<div style="font-size:8px;font-weight:700;color:rgba(255,255,255,.5);">'+_SHARE_STYLES[i]+'</div></div>';
  }
  if(_sharePhoto){
    for(var j=0;j<3;j++){
      var si=4+j; var sel2=_shareStyle===si;
      html+='<div onclick="_shareStyle='+si+';_renderShareStyles()" style="aspect-ratio:'+ar+';border-radius:8px;border:2px solid '+(sel2?'#3b82f6':'rgba(255,255,255,.1)')+';cursor:pointer;overflow:hidden;position:relative;">'
        +'<img src="'+_sharePhoto.src+'" style="width:100%;height:100%;object-fit:cover;opacity:.5;">'
        +'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;">'
        +'<div style="font-size:16px;">📷</div>'
        +'<div style="font-size:7px;font-weight:700;color:#fff;">'+_SHARE_STYLES[si]+'</div></div></div>';
    }
  }
  c.innerHTML=html;
}

function _onSharePhoto(input){
  if(!input.files||!input.files[0]) return;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=new Image(); img.onload=function(){
      _sharePhoto=img;
      if(_shareStyle<4) _shareStyle=4;
      _renderShareStyles();
      var prev=document.getElementById('share-photo-preview');
      if(prev){ prev.style.display='block'; prev.innerHTML='<img src="'+e.target.result+'" style="max-width:80px;max-height:80px;border-radius:8px;margin-right:8px;vertical-align:middle;"><button onclick="_sharePhoto=null;this.parentElement.style.display=\'none\';if(_shareStyle>=4)_shareStyle=0;_renderShareStyles();" style="font-size:11px;color:#f87171;background:transparent;border:none;cursor:pointer;">✕ Usun</button>'; }
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

function _generateShare(){
  var w=1080, h=_shareFormat==='story'?1920:1080;
  var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  var ctx=cv.getContext('2d');
  // Dane
  var ch=getLevelCharacter(_gameLevel);
  var avg=_gameTimes.length?Math.round(_gameTimes.reduce(function(a,b){return a+b;},0)/_gameTimes.length):0;
  var best=_gameTimes.length?Math.min.apply(null,_gameTimes):0;
  var acc=_gameTotalTrials?Math.round(_gameCorrect/_gameTotalTrials*100):0;
  var isSearch=(_motionMode==='pairs'||_motionMode==='sequence'||_motionMode==='words');
  var modeNames={simple:'Reakcja',directions:'Kierunki',gonogo:'Go/No-Go',pattern:'Wzorce',pairs:'Pary',sequence:'Kolejność',words:'Słowa'};
  var modeName=modeNames[_motionMode]||'Motion';
  var avgTxt=isSearch?(avg/1000).toFixed(1)+'s':avg+'ms';
  var bestTxt=isSearch?(best/1000).toFixed(1)+'s':best+'ms';

  if(_shareStyle>=4&&_sharePhoto){
    _drawPhotoStyle(ctx,w,h,_shareStyle-4,ch,modeName,avgTxt,bestTxt,acc);
  } else {
    _drawBaseStyle(ctx,w,h,_shareStyle,ch,modeName,avgTxt,bestTxt,acc);
  }
  _showSharePreview(cv);
}

function _drawBaseStyle(ctx,w,h,style,ch,modeName,avgTxt,bestTxt,acc){
  // Backgrounds
  var grads=[[['#0a0a0a','#1a1a2e'],'#4ade80','#fff'],[['#0d0d1a','#0d0d1a'],'#fff','#3b82f6'],[['#f8f8f8','#f0f0f0'],'#1a1a1a','#3b82f6'],[['#0f172a','#1e3a5f'],'#fff','#4ade80']];
  var s=grads[style]||grads[0];
  var grd=ctx.createLinearGradient(0,0,0,h);
  grd.addColorStop(0,s[0][0]); grd.addColorStop(1,s[0][1]);
  ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
  // Neon border
  if(style===1){ ctx.strokeStyle='#3b82f6'; ctx.lineWidth=4; ctx.strokeRect(40,40,w-80,h-80); }
  // Decorative circles for sport
  if(style===3){ ctx.globalAlpha=0.05; ctx.fillStyle='#3b82f6'; ctx.beginPath(); ctx.arc(w*0.8,h*0.15,200,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(w*0.2,h*0.85,150,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
  var isLight=style===2;
  var textCol=s[1]; var accentCol=s[2];
  var cy=h*0.18;
  // Emoji
  ctx.font='80px sans-serif'; ctx.textAlign='center'; ctx.fillStyle=textCol; ctx.fillText(ch.emoji,w/2,cy); cy+=40;
  // Character name
  ctx.font='800 24px Montserrat,sans-serif'; ctx.fillStyle=textCol; ctx.fillText(ch.name,w/2,cy); cy+=30;
  // Game name
  ctx.font='700 16px Montserrat,sans-serif'; ctx.fillStyle=accentCol; ctx.fillText(modeName.toUpperCase()+' • LEVEL '+_gameLevel,w/2,cy); cy+=h*0.08;
  // Main metric
  ctx.font='900 96px Montserrat,sans-serif'; ctx.fillStyle=accentCol;
  if(style===1){ ctx.shadowColor='rgba(59,130,246,0.5)'; ctx.shadowBlur=20; }
  ctx.fillText('⚡ '+_gamePoints,w/2,cy); ctx.shadowBlur=0; cy+=30;
  ctx.font='700 20px Montserrat,sans-serif'; ctx.fillStyle=isLight?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.4)'; ctx.fillText('PUNKTÓW',w/2,cy); cy+=h*0.06;
  // Tiles 2x2
  var tileW=220,tileH=100,tileGap=16,tileX=(w-tileW*2-tileGap)/2,tileY=cy;
  var tiles=[{v:avgTxt,l:'Średni czas'},{v:bestTxt,l:'Najlepszy'},{v:acc+'%',l:'Celność'},{v:'x'+_gameMaxCombo,l:'Max combo'}];
  var tileBg=isLight?'rgba(0,0,0,0.04)':'rgba(255,255,255,0.05)';
  var tileBorder=style===1?'rgba(59,130,246,0.15)':isLight?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.08)';
  tiles.forEach(function(t,i){
    var tx=tileX+(i%2)*(tileW+tileGap), ty=tileY+Math.floor(i/2)*(tileH+tileGap);
    _roundRect(ctx,tx,ty,tileW,tileH,14,tileBg,tileBorder);
    ctx.font='800 28px Montserrat,sans-serif'; ctx.fillStyle=textCol; ctx.textAlign='center'; ctx.fillText(t.v,tx+tileW/2,ty+45);
    ctx.font='700 12px Montserrat,sans-serif'; ctx.fillStyle=isLight?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.4)'; ctx.fillText(t.l.toUpperCase(),tx+tileW/2,ty+72);
  });
  // Branding
  ctx.font='800 18px Montserrat,sans-serif'; ctx.fillStyle=isLight?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.6)'; ctx.textAlign='center';
  ctx.fillText('AthletiX',w/2,h-80);
  ctx.font='500 14px Montserrat,sans-serif'; ctx.fillStyle=isLight?'rgba(0,0,0,0.25)':'rgba(255,255,255,0.25)';
  ctx.fillText('Elevate Your Game',w/2,h-55);
}

function _drawPhotoStyle(ctx,w,h,variant,ch,modeName,avgTxt,bestTxt,acc){
  // Draw photo cover
  var r=Math.max(w/_sharePhoto.width,h/_sharePhoto.height);
  var nw=_sharePhoto.width*r, nh=_sharePhoto.height*r;
  ctx.drawImage(_sharePhoto,(w-nw)/2,(h-nh)/2,nw,nh);
  if(variant===0){
    // Bar on bottom
    var grd=ctx.createLinearGradient(0,h*0.5,0,h);
    grd.addColorStop(0,'transparent'); grd.addColorStop(0.5,'rgba(0,0,0,0.85)'); grd.addColorStop(1,'rgba(0,0,0,0.95)');
    ctx.fillStyle=grd; ctx.fillRect(0,h*0.5,w,h*0.5);
    _drawStatsBlock(ctx,w,h*0.68,w,h,ch,modeName,avgTxt,bestTxt,acc);
  } else if(variant===1){
    // Badges
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(0,0,w,h);
    var by=h*0.15;
    _roundRect(ctx,w/2-160,by,320,60,16,'rgba(0,0,0,0.6)','transparent');
    ctx.font='800 22px Montserrat,sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText(ch.emoji+' '+modeName+' Lv.'+_gameLevel,w/2,by+38);
    by=h*0.35;
    _roundRect(ctx,w/2-120,by,240,100,16,'rgba(0,0,0,0.6)','transparent');
    ctx.font='900 48px Montserrat,sans-serif'; ctx.fillStyle='#4ade80'; ctx.fillText('⚡'+_gamePoints,w/2,by+55);
    ctx.font='700 14px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillText('PUNKTÓW',w/2,by+80);
    _drawStatsBlock(ctx,w,h*0.6,w,h,ch,modeName,avgTxt,bestTxt,acc);
  } else {
    // Center frosted box
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(0,0,w,h);
    var bx=80,by2=h*0.2,bw=w-160,bh=h*0.6;
    _roundRect(ctx,bx,by2,bw,bh,24,'rgba(0,0,0,0.55)','rgba(255,255,255,0.1)');
    var cy=by2+60;
    ctx.font='60px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(ch.emoji,w/2,cy); cy+=50;
    ctx.font='800 20px Montserrat,sans-serif'; ctx.fillStyle='#fff'; ctx.fillText(ch.name+' • Lv.'+_gameLevel,w/2,cy); cy+=40;
    ctx.font='900 64px Montserrat,sans-serif'; ctx.fillStyle='#4ade80'; ctx.fillText('⚡ '+_gamePoints,w/2,cy); cy+=30;
    ctx.font='700 14px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillText('PUNKTÓW',w/2,cy); cy+=50;
    ctx.font='800 22px Montserrat,sans-serif'; ctx.fillStyle='#fff';
    ctx.fillText(avgTxt+' avg  |  '+bestTxt+' best  |  '+acc+'%',w/2,cy); cy+=30;
    ctx.font='700 14px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.fillText('combo x'+_gameMaxCombo,w/2,cy);
  }
  // Branding
  ctx.font='800 18px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.textAlign='center';
  ctx.fillText('AthletiX',w/2,h-50);
  ctx.font='500 12px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.25)';
  ctx.fillText('Elevate Your Game',w/2,h-30);
}

function _drawStatsBlock(ctx,x0,y0,w,h,ch,modeName,avgTxt,bestTxt,acc){
  ctx.textAlign='center';
  ctx.font='800 20px Montserrat,sans-serif'; ctx.fillStyle='#fff';
  ctx.fillText(ch.emoji+' '+ch.name+' • '+modeName+' Lv.'+_gameLevel,w/2,y0+10);
  ctx.font='900 48px Montserrat,sans-serif'; ctx.fillStyle='#4ade80';
  ctx.fillText('⚡ '+_gamePoints+' pkt',w/2,y0+70);
  ctx.font='700 16px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.fillText('Śr: '+avgTxt+'  |  Best: '+bestTxt+'  |  Celność: '+acc+'%  |  Combo: x'+_gameMaxCombo,w/2,y0+110);
}

function _roundRect(ctx,x,y,w,h,r,fill,stroke){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  if(fill&&fill!=='transparent'){ ctx.fillStyle=fill; ctx.fill(); }
  if(stroke&&stroke!=='transparent'){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); }
}

function _showSharePreview(cv){
  var prev=document.getElementById('share-preview'); if(!prev) return;
  prev.style.display='block';
  var img=document.createElement('img');
  img.src=cv.toDataURL('image/png');
  img.style.cssText='max-width:100%;border-radius:8px;margin-bottom:12px;';
  prev.innerHTML='';
  prev.appendChild(img);
  // Buttons
  var canShare=navigator.canShare&&navigator.canShare({files:[new File([''],'t.png',{type:'image/png'})]});
  if(canShare){
    var shareBtn=document.createElement('button');
    shareBtn.style.cssText='width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;margin-bottom:6px;';
    shareBtn.textContent='Udostepnij';
    shareBtn.onclick=function(){
      cv.toBlob(function(blob){
        var file=new File([blob],'athletix-wynik.png',{type:'image/png'});
        navigator.share({files:[file],title:'Mój wynik - AthletiX',text:'Elevate Your Game!'}).catch(function(){});
      },'image/png');
    };
    prev.appendChild(shareBtn);
  }
  var dlBtn=document.createElement('button');
  dlBtn.style.cssText='width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;';
  dlBtn.textContent='Pobierz PNG';
  dlBtn.onclick=function(){
    cv.toBlob(function(blob){
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a'); a.href=url; a.download='athletix-wynik.png'; a.click();
      URL.revokeObjectURL(url);
    },'image/png');
  };
  prev.appendChild(dlBtn);
}
