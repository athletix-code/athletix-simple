// ═══════════════════════════════════════
//  STORAGE ABSTRACTION LAYER
//  Currently: localStorage
//  Future: Supabase client
// ═══════════════════════════════════════
var Storage = {
  _keys: {
    athletes: 'axs_athletes',
    sessions: 'axs_sessions',
    groups: 'axs_groups',
    tests: 'axs_tests',
    notes: 'axs_notes',
    customTests: 'axs_custom_tests',
    packages: 'axs_packages',
    intPresets: 'axs_int_presets',
    customExercises: 'axs_custom_exercises',
    plans: 'axs_plans',
    backupCfg: 'axs_backup_cfg',
    settings: 'cts_v5',
    theme: 'ct_theme'
  },
  get: function(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  },
  set: function(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
  },
  remove: function(key) {
    try { localStorage.removeItem(key); } catch(e) {}
  },
  getRaw: function(key) {
    return localStorage.getItem(key);
  },
  setRaw: function(key, val) {
    try { localStorage.setItem(key, val); } catch(e) {}
  },
  getAllKeys: function() {
    return Object.values(this._keys);
  },
  getAllDataKeys: function() {
    return [this._keys.athletes, this._keys.sessions, this._keys.groups, this._keys.tests,
      this._keys.notes, this._keys.customTests, this._keys.packages, this._keys.intPresets, this._keys.customExercises, this._keys.plans];
  },
  exportAll: function() {
    var data = {_meta:{app:'AthletiXApp Simple',version:'1.0',exportDate:new Date().toISOString()}};
    var self = this;
    this.getAllKeys().forEach(function(k) {
      var v = self.getRaw(k);
      if(v) try { data[k] = JSON.parse(v); } catch(e) { data[k] = v; }
    });
    return data;
  }
};
