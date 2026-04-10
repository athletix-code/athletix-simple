// ═══════════════════════════════════════
//  MIGRATE - Data migration
// ═══════════════════════════════════════

var AX_MIGRATE = {
  currentVersion: 2,

  run: function() {
    var stored = parseInt(localStorage.getItem('axs_data_version') || '0');
    if (stored < 1) this.v0to1();
    if (stored < 2) this.v1to2();
    localStorage.setItem('axs_data_version', String(this.currentVersion));
  },

  v0to1: function() {
    try {
      var raw = localStorage.getItem('axs_athletes');
      if (raw) {
        var athletes = JSON.parse(raw);
        if (Array.isArray(athletes)) {
          athletes.forEach(function(a) {
            if (a && a.wallet && Array.isArray(a.wallet.transactions)) {
              a.wallet.transactions.forEach(function(tx) {
                if (!tx.status) tx.status = 'confirmed';
                if (!tx.confirmedBy) tx.confirmedBy = 'trainer';
              });
            }
          });
          localStorage.setItem('axs_athletes', JSON.stringify(athletes));
        }
      }
      console.log('[AX Migrate] v0-v1: entry status added');
    } catch(err) { if (typeof AX_ERROR !== 'undefined') AX_ERROR.log('migrate.v0to1', err); }
  },

  v1to2: function() {
    try {
      var raw = localStorage.getItem('axs_gamification');
      if (raw) {
        var data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(function(k) {
            var g = data[k];
            if (g) {
              if (typeof g.totalPoints !== 'number' || isNaN(g.totalPoints)) g.totalPoints = 0;
              if (typeof g.weekStreak !== 'number' || isNaN(g.weekStreak)) g.weekStreak = 0;
              if (typeof g.bestStreak !== 'number' || isNaN(g.bestStreak)) g.bestStreak = 0;
            }
          });
          localStorage.setItem('axs_gamification', JSON.stringify(data));
        }
      }
      console.log('[AX Migrate] v1-v2: gamification validated');
    } catch(err) { if (typeof AX_ERROR !== 'undefined') AX_ERROR.log('migrate.v1to2', err); }
  }
};
