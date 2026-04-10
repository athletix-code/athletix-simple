// ═══════════════════════════════════════
//  STORAGE SAFE - Safe localStorage wrapper
// ═══════════════════════════════════════

var AX_STORAGE = {
  get: function(key, fallback) {
    try {
      var raw = localStorage.getItem('axs_' + key);
      if (raw === null || raw === undefined) return fallback !== undefined ? fallback : null;
      return JSON.parse(raw);
    } catch(err) {
      AX_ERROR.log('storage.get.' + key, err);
      return fallback !== undefined ? fallback : null;
    }
  },

  set: function(key, value) {
    try {
      var json = JSON.stringify(value);
      if (json.length > 4 * 1024 * 1024) {
        AX_ERROR.log('storage.set.' + key, 'Data too large: ' + json.length + ' bytes');
        return false;
      }
      localStorage.setItem('axs_' + key, json);
      return true;
    } catch(err) {
      if (err.name === 'QuotaExceededError') {
        AX_ERROR.log('storage.quota', 'localStorage full. Key: ' + key);
        alert('Brak miejsca na dane. Wyeksportuj backup w ustawieniach.');
      } else {
        AX_ERROR.log('storage.set.' + key, err);
      }
      return false;
    }
  },

  remove: function(key) {
    try { localStorage.removeItem('axs_' + key); return true; } catch(err) { AX_ERROR.log('storage.remove.' + key, err); return false; }
  },

  has: function(key) {
    try { return localStorage.getItem('axs_' + key) !== null; } catch(e) { return false; }
  },

  exportAll: function() {
    var backup = { version: typeof AX_CONFIG !== 'undefined' ? AX_CONFIG.version : '1.0', exportDate: new Date().toISOString(), data: {} };
    var keys = typeof AX_CONFIG !== 'undefined' ? AX_CONFIG.storageKeys : ['axs_athletes','axs_sessions','axs_gamification','axs_motion_results','axs_quiz_results','axs_plans','axs_tests','cts_v5','ct_theme'];
    keys.forEach(function(fullKey) {
      try { var raw = localStorage.getItem(fullKey); if (raw !== null) backup.data[fullKey] = JSON.parse(raw); } catch(e) { if (raw) backup.data[fullKey] = raw; }
    });
    return JSON.stringify(backup, null, 2);
  },

  importAll: function(jsonString) {
    try {
      var backup = JSON.parse(jsonString);
      if (!backup.data || typeof backup.data !== 'object') { AX_ERROR.log('import', 'Invalid backup format'); return false; }
      Object.keys(backup.data).forEach(function(key) {
        if (backup.data[key] !== null && backup.data[key] !== undefined) {
          localStorage.setItem(key.startsWith('axs_') || key.startsWith('cts_') || key === 'ct_theme' ? key : 'axs_' + key, typeof backup.data[key] === 'string' ? backup.data[key] : JSON.stringify(backup.data[key]));
        }
      });
      return true;
    } catch(err) { AX_ERROR.log('import', err); return false; }
  },

  getSize: function() {
    var total = 0;
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k) total += (localStorage.getItem(k) || '').length; } } catch(e) {}
    return { bytes: total * 2, kb: Math.round(total * 2 / 1024), mb: (total * 2 / 1024 / 1024).toFixed(2) };
  }
};
