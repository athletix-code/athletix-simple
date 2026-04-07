// ═══════════════════════════════════════
//  SUPABASE CONNECTION
// ═══════════════════════════════════════
var SUPABASE_URL = 'https://anbscmspmmmupbhlclqs.supabase.co';
var SUPABASE_KEY = 'sb_publishable_UBeF70feMUr6lalKJzeSnQ_8CWMHaY0';

// Load Supabase client library dynamically
(function(){
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  script.onload = function(){
    window.supabase = window.supabase || {};
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase connected');
    checkAuth();
  };
  document.head.appendChild(script);
})();

// ═══════════════════════════════════════
//  AUTH (login / register / session)
// ═══════════════════════════════════════
var currentTrainer = null;

function checkAuth(){
  sb.auth.getSession().then(function(res){
    if(res.data.session){
      currentTrainer = res.data.session.user;
      onAuthSuccess();
    } else {
      showAuthScreen();
    }
  });
}

function showAuthScreen(){
  // Hide main app, show login
  el('settings').style.display = 'none';
  var auth = el('auth-screen');
  if(!auth){
    auth = document.createElement('div');
    auth.id = 'auth-screen';
    auth.style.cssText = 'position:fixed;inset:0;z-index:10000;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:20px;';
    document.body.appendChild(auth);
  }
  auth.innerHTML = '<div style="max-width:360px;width:100%;text-align:center;">'
    +'<div style="font-size:28px;font-weight:900;color:var(--text);margin-bottom:4px;">Athleti<span style="color:#ef4444;">X</span>App</div>'
    +'<div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:30px;">by Sigma AthletiX</div>'
    // Toggle
    +'<div style="display:flex;gap:4px;margin-bottom:20px;">'
    +'<button id="auth-tab-login" onclick="switchAuthTab(\'login\')" style="flex:1;padding:10px;border-radius:var(--r-xs);border:2px solid var(--accent);background:var(--accent-bg);color:var(--accent);font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;cursor:pointer;">Logowanie</button>'
    +'<button id="auth-tab-register" onclick="switchAuthTab(\'register\')" style="flex:1;padding:10px;border-radius:var(--r-xs);border:2px solid var(--border2);background:var(--s2);color:var(--muted);font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;cursor:pointer;">Rejestracja</button>'
    +'</div>'
    // Form
    +'<div id="auth-form">'
    +'<input id="auth-email" type="email" placeholder="Email" onkeydown="if(event.key===\'Enter\'){event.preventDefault();doAuth();}" style="width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;margin-bottom:10px;box-sizing:border-box;"/>'
    +'<div style="position:relative;margin-bottom:10px;">'
    +'<input id="auth-pass" type="password" placeholder="Hasło (min. 6 znaków)" onkeydown="if(event.key===\'Enter\'){event.preventDefault();doAuth();}" style="width:100%;padding:12px 44px 12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;box-sizing:border-box;"/>'
    +'<button onclick="var p=el(\'auth-pass\');p.type=p.type===\'password\'?\'text\':\'password\';this.textContent=p.type===\'password\'?\'👁\':\'🙈\';" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:18px;padding:4px 8px;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center;">👁</button>'
    +'</div>'
    +'<div id="auth-name-wrap" style="display:none;">'
    +'<input id="auth-name" type="text" placeholder="Imię i nazwisko" onkeydown="if(event.key===\'Enter\'){event.preventDefault();doAuth();}" style="width:100%;padding:12px 14px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;margin-bottom:10px;box-sizing:border-box;"/>'
    +'</div>'
    +'<button id="auth-submit" onclick="doAuth()" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;letter-spacing:.06em;">Zaloguj się</button>'
    +'<div id="auth-error" style="color:var(--red-text);font-size:12px;font-weight:700;margin-top:10px;display:none;"></div>'
    +'<div id="auth-info" style="color:var(--green-text);font-size:12px;font-weight:700;margin-top:10px;display:none;"></div>'
    +'</div>'
    // Offline mode
    +'<button onclick="useOfflineMode()" style="background:transparent;border:none;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;font-weight:600;color:var(--dim);margin-top:20px;text-decoration:underline;">Użyj offline (bez konta)</button>'
    +'</div>';
  auth.style.display = 'flex';
}

var _authMode = 'login';
function switchAuthTab(mode){
  _authMode = mode;
  var lb = el('auth-tab-login'), rb = el('auth-tab-register');
  lb.style.borderColor = mode==='login'?'var(--accent)':'var(--border2)';
  lb.style.background = mode==='login'?'var(--accent-bg)':'var(--s2)';
  lb.style.color = mode==='login'?'var(--accent)':'var(--muted)';
  rb.style.borderColor = mode==='register'?'var(--accent)':'var(--border2)';
  rb.style.background = mode==='register'?'var(--accent-bg)':'var(--s2)';
  rb.style.color = mode==='register'?'var(--accent)':'var(--muted)';
  el('auth-name-wrap').style.display = mode==='register'?'block':'none';
  el('auth-submit').textContent = mode==='login'?'Zaloguj się':'Zarejestruj się';
  el('auth-error').style.display = 'none';
  el('auth-info').style.display = 'none';
}

function doAuth(){
  var email = (el('auth-email').value||'').trim();
  var pass = (el('auth-pass').value||'').trim();
  var errEl = el('auth-error');
  var infoEl = el('auth-info');
  errEl.style.display = 'none';
  infoEl.style.display = 'none';

  if(!email || !pass){ errEl.textContent='Wpisz email i hasło'; errEl.style.display='block'; return; }
  if(pass.length < 6){ errEl.textContent='Hasło musi mieć min. 6 znaków'; errEl.style.display='block'; return; }

  var btn = el('auth-submit');
  btn.textContent = 'Czekaj...';
  btn.style.opacity = '0.5';

  if(_authMode === 'login'){
    sb.auth.signInWithPassword({email:email, password:pass}).then(function(res){
      btn.style.opacity = '1';
      if(res.error){
        btn.textContent = 'Zaloguj się';
        errEl.textContent = res.error.message === 'Invalid login credentials' ? 'Błędny email lub hasło' : res.error.message;
        errEl.style.display = 'block';
      } else {
        currentTrainer = res.data.user;
        onAuthSuccess();
      }
    });
  } else {
    var name = (el('auth-name').value||'').trim();
    sb.auth.signUp({email:email, password:pass, options:{data:{name:name||email}}}).then(function(res){
      btn.style.opacity = '1';
      if(res.error){
        btn.textContent = 'Zarejestruj się';
        errEl.textContent = res.error.message;
        errEl.style.display = 'block';
      } else {
        // Update trainer name
        if(name && res.data.user){
          sb.from('trainers').update({name:name}).eq('id',res.data.user.id).then(function(){});
        }
        infoEl.textContent = 'Konto utworzone! Sprawdź email i potwierdź link.';
        infoEl.style.display = 'block';
        btn.textContent = 'Zarejestruj się';
      }
    });
  }
}

function onAuthSuccess(){
  var auth = el('auth-screen');
  if(auth) auth.style.display = 'none';
  el('settings').style.display = 'flex';
  loadCRM(); loadNotes(); loadTests(); loadGroups();
  _renderUndoBar();
  // Start cloud sync
  initSync();
  pullFromCloud();
  console.log('Logged in as:', currentTrainer.email);
}

function useOfflineMode(){
  currentTrainer = {id:'offline', email:'offline'};
  var auth = el('auth-screen');
  if(auth) auth.style.display = 'none';
  el('settings').style.display = 'flex';
  loadCRM(); loadNotes(); loadTests(); loadGroups();
  _renderUndoBar();
}

function openChangeName(){
  var ov=_ensureOverlay();
  var currentName=currentTrainer&&currentTrainer.user_metadata?currentTrainer.user_metadata.name||'':'';
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:340px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:14px;">✏️ Zmień nazwę</div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Imię i nazwisko</div>'
    +'<input id="new-name" type="text" value="'+currentName+'" placeholder="Twoje imię i nazwisko" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;box-sizing:border-box;"/></div>'
    +'<div id="name-msg" style="display:none;font-size:11px;font-weight:700;margin-bottom:10px;"></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="name-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz</button>'
    +'<button id="name-cancel" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('new-name').focus(); },100);
  document.getElementById('name-save').onclick=function(){
    var name=(el('new-name').value||'').trim();
    if(!name) return;
    var msg=el('name-msg');
    sb.auth.updateUser({data:{name:name}}).then(function(res){
      if(res.error){ msg.textContent=res.error.message; msg.style.color='var(--red-text)'; msg.style.display='block'; }
      else {
        if(currentTrainer) currentTrainer.user_metadata={name:name};
        sb.from('trainers').update({name:name}).eq('id',currentTrainer.id).then(function(){});
        var info=el('account-info'); if(info) info.innerHTML='👤 '+name+'<br>📧 '+currentTrainer.email;
        msg.textContent='✓ Nazwa zmieniona!'; msg.style.color='var(--green-text)'; msg.style.display='block';
        setTimeout(function(){ _closeOverlay(); },1200);
      }
    });
  };
  document.getElementById('name-cancel').onclick=function(){ _closeOverlay(); };
}

function openChangeEmail(){
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:340px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:4px;">📧 Zmień email</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">Obecny: '+(currentTrainer?currentTrainer.email:'')+'</div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Nowy adres email</div>'
    +'<input id="new-email" type="email" placeholder="nowy@email.com" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;box-sizing:border-box;"/></div>'
    +'<div id="email-msg" style="display:none;font-size:11px;font-weight:700;margin-bottom:10px;"></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="email-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zmień email</button>'
    +'<button id="email-cancel" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('new-email').focus(); },100);
  document.getElementById('email-save').onclick=function(){
    var email=(el('new-email').value||'').trim();
    if(!email){ return; }
    var msg=el('email-msg');
    sb.auth.updateUser({email:email}).then(function(res){
      if(res.error){ msg.textContent=res.error.message; msg.style.color='var(--red-text)'; msg.style.display='block'; }
      else { msg.textContent='✓ Link potwierdzający wysłany na '+email; msg.style.color='var(--green-text)'; msg.style.display='block'; }
    });
  };
  document.getElementById('email-cancel').onclick=function(){ _closeOverlay(); };
}

function openChangePassword(){
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:360px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:14px;">🔑 Zmień hasło</div>'
    +'<div style="margin-bottom:10px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Nowe hasło (min. 6 znaków)</div>'
    +'<div style="position:relative;">'
    +'<input id="new-pass" type="password" placeholder="Nowe hasło" style="width:100%;padding:10px 44px 10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;box-sizing:border-box;"/>'
    +'<button onclick="var p=el(\'new-pass\');p.type=p.type===\'password\'?\'text\':\'password\';this.textContent=p.type===\'password\'?\'👁\':\'🙈\';" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;font-size:16px;padding:4px;">👁</button>'
    +'</div></div>'
    +'<div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Powtórz nowe hasło</div>'
    +'<input id="new-pass2" type="password" placeholder="Powtórz hasło" style="width:100%;padding:10px 12px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;box-sizing:border-box;"/></div>'
    +'<div id="pass-error" style="display:none;font-size:11px;color:var(--red-text);font-weight:700;margin-bottom:10px;"></div>'
    +'<div id="pass-ok" style="display:none;font-size:11px;color:var(--green-text);font-weight:700;margin-bottom:10px;"></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="pass-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zmień hasło</button>'
    +'<button id="pass-cancel" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button>'
    +'</div></div>';
  ov.style.display='flex';
  setTimeout(function(){ el('new-pass').focus(); },100);
  document.getElementById('pass-save').onclick=function(){
    var p1=(el('new-pass').value||'').trim();
    var p2=(el('new-pass2').value||'').trim();
    var err=el('pass-error'); var ok=el('pass-ok');
    err.style.display='none'; ok.style.display='none';
    if(p1.length<6){ err.textContent='Hasło musi mieć min. 6 znaków'; err.style.display='block'; return; }
    if(p1!==p2){ err.textContent='Hasła nie są identyczne'; err.style.display='block'; return; }
    if(!window.sb||!currentTrainer||currentTrainer.id==='offline'){ err.textContent='Nie jesteś zalogowany'; err.style.display='block'; return; }
    var btn=document.getElementById('pass-save'); btn.textContent='Czekaj...'; btn.style.opacity='0.5';
    sb.auth.updateUser({password:p1}).then(function(res){
      btn.style.opacity='1'; btn.textContent='Zmień hasło';
      if(res.error){ err.textContent=res.error.message; err.style.display='block'; }
      else { ok.textContent='✓ Hasło zmienione!'; ok.style.display='block'; setTimeout(function(){ _closeOverlay(); },1500); }
    });
  };
  document.getElementById('pass-cancel').onclick=function(){ _closeOverlay(); };
}

function logout(){
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:340px;width:100%;padding:22px 18px 24px;text-align:center;">'
    +'<div style="font-size:20px;margin-bottom:8px;">🚪</div>'
    +'<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:6px;">Wylogować się?</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:16px;line-height:1.5;">Dane lokalne pozostaną na urządzeniu.<br>Możesz też pobrać backup przed wylogowaniem.</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px;">'
    +'<button id="logout-export" style="width:100%;padding:11px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">💾 Pobierz backup i wyloguj</button>'
    +'<button id="logout-now" style="width:100%;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Wyloguj bez backupu</button>'
    +'<button id="logout-cancel" style="width:100%;padding:9px;background:transparent;color:var(--muted);border:none;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">Anuluj</button>'
    +'</div></div>';
  ov.style.display='flex';
  document.getElementById('logout-export').onclick=function(){
    exportAllData();
    setTimeout(function(){
      if(window.sb) sb.auth.signOut();
      currentTrainer=null;
      _closeOverlay();
      showAuthScreen();
    },500);
  };
  document.getElementById('logout-now').onclick=function(){
    if(window.sb) sb.auth.signOut();
    currentTrainer=null;
    _closeOverlay();
    showAuthScreen();
  };
  document.getElementById('logout-cancel').onclick=function(){ _closeOverlay(); };
}
