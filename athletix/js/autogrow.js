// ═══════════════════════════════════════
//  AUTOGROW — premium modal for textarea on mobile
//  Safe: standalone module, no changes to existing code
// ═══════════════════════════════════════

(function(){
  function isMobile(){ return window.innerWidth < 768; }

  var _overlay = null;
  var _activeTextarea = null;
  var _mirrorTextarea = null;

  document.addEventListener('focusin', function(e){
    if(!isMobile()) return;
    var ta = e.target;
    if(ta.tagName !== 'TEXTAREA') return;
    if(ta.id === '_ag-mirror') return;
    if(ta.rows && ta.rows < 2) return;
    // Skip textarea inside ANY overlay, modal, or fixed element
    if(ta.closest('[style*="position:fixed"], [style*="position: fixed"], #confirm-overlay, #athlete-profile-overlay, #presession-modal, #interval-data-modal, #hrdrop-modal, #history-overlay, #athlete-bar-overlay')) return;
    // Also skip if any overlay is currently visible
    var ov = document.getElementById('confirm-overlay');
    if(ov && ov.style.display === 'flex') return;
    var ap = document.getElementById('athlete-profile-overlay');
    if(ap && ap.style.display === 'block') return;

    _activeTextarea = ta;
    ta.blur();
    setTimeout(function(){ _showModal(ta); }, 50);
  });

  function _showModal(ta){
    _overlay = document.createElement('div');
    _overlay.id = '_ag-overlay';
    _overlay.style.cssText = 'position:fixed;inset:0;z-index:9800;background:rgba(0,0,0,.65);display:flex;align-items:flex-start;justify-content:center;padding:24px 12px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--s1);border-radius:16px;width:100%;max-width:460px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.06);overflow:hidden;margin-top:10vh;transform:translateY(0);animation:_agSlideIn .25s ease-out;';

    // Inject animation
    if(!document.getElementById('_ag-style')){
      var style = document.createElement('style');
      style.id = '_ag-style';
      style.textContent = '@keyframes _agSlideIn{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}';
      document.head.appendChild(style);
    }

    // Header — gradient accent bar
    var header = document.createElement('div');
    header.style.cssText = 'padding:14px 16px 12px;background:linear-gradient(135deg,rgba(59,130,246,.08),rgba(168,85,247,.08));border-bottom:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;';
    header.innerHTML = '<div style="display:flex;align-items:center;gap:8px;">'
      +'<div style="width:4px;height:20px;border-radius:2px;background:linear-gradient(180deg,var(--accent),#a855f7);"></div>'
      +'<span style="font-size:13px;font-weight:800;color:var(--text);letter-spacing:.02em;">Edycja</span></div>'
      +'<button id="_ag-done" style="padding:9px 20px;background:linear-gradient(135deg,var(--accent),#2563eb);color:#fff;border:none;border-radius:20px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(59,130,246,.3);letter-spacing:.04em;">Gotowe</button>';
    modal.appendChild(header);

    // Textarea — large
    _mirrorTextarea = document.createElement('textarea');
    _mirrorTextarea.id = '_ag-mirror';
    _mirrorTextarea.value = ta.value;
    _mirrorTextarea.placeholder = ta.placeholder || 'Wpisz treść...';
    _mirrorTextarea.style.cssText = 'flex:1;width:100%;min-height:260px;padding:16px 18px;background:var(--bg);border:none;color:var(--text);font-family:Montserrat,sans-serif;font-size:16px;font-weight:600;outline:none;resize:none;line-height:1.7;box-sizing:border-box;';
    modal.appendChild(_mirrorTextarea);

    // Footer — subtle
    var footer = document.createElement('div');
    footer.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--s2);border-top:1px solid var(--border);flex-shrink:0;';
    footer.innerHTML = '<button id="_ag-clear" style="padding:7px 14px;background:transparent;border:1px solid var(--border2);border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--muted);">Wyczyść</button>'
      +'<div style="flex:1;"></div>'
      +'<span id="_ag-count" style="font-size:10px;color:var(--dim);font-family:Montserrat,sans-serif;font-variant-numeric:tabular-nums;"></span>'
      +'<button id="_ag-cancel" style="padding:7px 14px;background:transparent;border:1px solid var(--border2);border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--muted);">Anuluj</button>';
    modal.appendChild(footer);

    _overlay.appendChild(modal);
    document.body.appendChild(_overlay);

    // Character counter
    var countEl = document.getElementById('_ag-count');
    function updateCount(){ if(countEl) countEl.textContent = _mirrorTextarea.value.length + ' znaków'; }
    _mirrorTextarea.addEventListener('input', updateCount);
    updateCount();

    setTimeout(function(){
      _mirrorTextarea.focus();
      _mirrorTextarea.setSelectionRange(_mirrorTextarea.value.length, _mirrorTextarea.value.length);
    }, 200);

    // Buttons
    document.getElementById('_ag-done').onclick = function(){ _save(); };
    document.getElementById('_ag-clear').onclick = function(){ _mirrorTextarea.value = ''; updateCount(); _mirrorTextarea.focus(); };
    document.getElementById('_ag-cancel').onclick = function(){ _close(); };
    _overlay.onclick = function(e){ if(e.target === _overlay) _save(); };
  }

  function _save(){
    if(_activeTextarea && _mirrorTextarea){
      _activeTextarea.value = _mirrorTextarea.value;
      _activeTextarea.dispatchEvent(new Event('input', {bubbles:true}));
      _activeTextarea.dispatchEvent(new Event('change', {bubbles:true}));
    }
    _close();
  }

  function _close(){
    if(_overlay) _overlay.remove();
    _overlay = null;
    _mirrorTextarea = null;
    _activeTextarea = null;
  }
})();
