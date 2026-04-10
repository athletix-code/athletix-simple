// ═══════════════════════════════════════
//  UTILS - Shared utilities
// ═══════════════════════════════════════

var AX_UTILS = {
  generateId: function() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  },

  escapeHtml: function(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  formatDate: function(date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pl-PL');
  },

  formatTime: function(date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  },

  debounce: function(fn, delay) {
    var timer;
    return function() {
      var args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay || 300);
    };
  },

  deepClone: function(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch(e) { return obj; }
  }
};
