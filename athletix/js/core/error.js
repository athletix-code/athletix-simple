// ═══════════════════════════════════════
//  ERROR - Global error handling
// ═══════════════════════════════════════

var AX_ERROR = {
  logs: [],
  maxLogs: 50,

  log: function(context, error) {
    var entry = {
      time: new Date().toISOString(),
      context: context,
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : '',
      version: typeof AX_CONFIG !== 'undefined' ? AX_CONFIG.version : 'unknown'
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    try { localStorage.setItem('axs_error_log', JSON.stringify(this.logs)); } catch(e) {}
    console.error('[AX Error]', context, error);
  },

  export: function() { return JSON.stringify(this.logs, null, 2); },

  clear: function() {
    this.logs = [];
    try { localStorage.removeItem('axs_error_log'); } catch(e) {}
  }
};

window.onerror = function(msg, url, line, col, error) {
  AX_ERROR.log('global', { message: msg, url: url, line: line, col: col, stack: error ? error.stack : '' });
};
window.addEventListener('unhandledrejection', function(event) {
  AX_ERROR.log('promise', { message: String(event.reason) });
});

// Restore previous logs
try { var prev = localStorage.getItem('axs_error_log'); if (prev) AX_ERROR.logs = JSON.parse(prev); } catch(e) {}
