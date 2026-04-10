// ═══════════════════════════════════════
//  VALIDATE - Data validation
// ═══════════════════════════════════════

var AX_VALIDATE = {
  isString: function(v) { return typeof v === 'string' && v.length > 0; },
  isNumber: function(v) { return typeof v === 'number' && !isNaN(v) && isFinite(v); },
  isObject: function(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); },
  isArray: function(v) { return Array.isArray(v); },

  athlete: function(data) {
    if (!this.isObject(data)) return false;
    if (!this.isString(data.name)) return false;
    if (data.name.length > 100) return false;
    return true;
  },

  entry: function(data) {
    if (!this.isObject(data)) return false;
    if (!this.isString(data.type)) return false;
    if (!this.isNumber(data.amount)) return false;
    if (!data.date) return false;
    return true;
  },

  motionResult: function(data) {
    if (!this.isObject(data)) return false;
    if (data.avgTime !== undefined && !this.isNumber(data.avgTime)) return false;
    if (data.maxLevel !== undefined && (!this.isNumber(data.maxLevel) || data.maxLevel < 0)) return false;
    return true;
  },

  plan: function(data) {
    if (!this.isObject(data)) return false;
    if (!this.isString(data.name)) return false;
    if (!this.isArray(data.exercises)) return false;
    return true;
  }
};
