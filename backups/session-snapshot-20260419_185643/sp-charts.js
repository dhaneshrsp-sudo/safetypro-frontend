/* =============================================================
   SafetyPro AI — Unified Chart.js Palette (Phase 3)
   Patches Chart.defaults so every chart uses coordinated tokens.
   Must load AFTER Chart.js but BEFORE chart instances are created.
   ============================================================= */
(function(){
  if (typeof Chart === 'undefined') {
    console.warn('[sp-charts] Chart.js not found on page — skipping.');
    return;
  }

  // Fixed 5-color palette matching CSS tokens (--sp-chart-1..5)
  var SP_PALETTE = {
    emerald: '#10B981',   // --sp-success (chart-1: primary/positive)
    amber:   '#F59E0B',   // --sp-warning (chart-2: secondary)
    blue:    '#3B82F6',   // --sp-info    (chart-3: tertiary)
    violet:  '#8B5CF6',   // --sp-accent  (chart-4: quaternary)
    red:     '#EF4444'    // --sp-danger  (chart-5: alerts/negative)
  };

  var SP_PALETTE_ORDER = [
    SP_PALETTE.emerald,
    SP_PALETTE.amber,
    SP_PALETTE.blue,
    SP_PALETTE.violet,
    SP_PALETTE.red
  ];

  // Semi-transparent versions for fills
  var SP_PALETTE_FILL = [
    'rgba(16, 185, 129, 0.12)',   // emerald tint
    'rgba(245, 158, 11, 0.12)',   // amber tint
    'rgba(59, 130, 246, 0.12)',   // blue tint
    'rgba(139, 92, 246, 0.12)',   // violet tint
    'rgba(239, 68, 68, 0.12)'     // red tint
  ];

  // ============================================================
  // GLOBAL TYPOGRAPHY (charts use Inter 12px to match platform)
  // ============================================================
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.font.weight = '500';

  // ============================================================
  // GLOBAL COLORS (text + grid lines)
  // ============================================================
  Chart.defaults.color = '#9CA3AF';              // --sp-text-body
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';  // --sp-border-subtle

  // ============================================================
  // TOOLTIP — muted dark, consistent with platform
  // ============================================================
  if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
    Chart.defaults.plugins.tooltip.backgroundColor = '#1C2230';   // --sp-surface-2
    Chart.defaults.plugins.tooltip.titleColor = '#F3F4F6';         // --sp-text-strong
    Chart.defaults.plugins.tooltip.bodyColor = '#9CA3AF';          // --sp-text-body
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.10)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 12, weight: '400' };
  }

  // ============================================================
  // LEGEND — compact, platform-consistent
  // ============================================================
  if (Chart.defaults.plugins && Chart.defaults.plugins.legend) {
    Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
    Chart.defaults.plugins.legend.labels.color = '#9CA3AF';
    Chart.defaults.plugins.legend.labels.font = { size: 11, weight: '500' };
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.padding = 12;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
  }

  // ============================================================
  // SCALE STYLING (axes, grid lines)
  // ============================================================
  if (Chart.defaults.scales) {
    ['linear','logarithmic','category','time','timeseries'].forEach(function(scale) {
      if (Chart.defaults.scales[scale]) {
        Chart.defaults.scales[scale].grid = Chart.defaults.scales[scale].grid || {};
        Chart.defaults.scales[scale].grid.color = 'rgba(255,255,255,0.04)';
        Chart.defaults.scales[scale].grid.borderColor = 'rgba(255,255,255,0.06)';
        Chart.defaults.scales[scale].ticks = Chart.defaults.scales[scale].ticks || {};
        Chart.defaults.scales[scale].ticks.color = '#6B7280';   // --sp-text-muted
        Chart.defaults.scales[scale].ticks.font = { size: 11, weight: '400' };
      }
    });
  }

  // ============================================================
  // ELEMENT DEFAULTS (bars, lines, points, arcs)
  // ============================================================
  if (Chart.defaults.elements) {
    // Lines
    if (Chart.defaults.elements.line) {
      Chart.defaults.elements.line.tension = 0.35;       // smooth curves
      Chart.defaults.elements.line.borderWidth = 2;
    }
    // Points
    if (Chart.defaults.elements.point) {
      Chart.defaults.elements.point.radius = 3;
      Chart.defaults.elements.point.hoverRadius = 5;
      Chart.defaults.elements.point.borderWidth = 2;
    }
    // Bars
    if (Chart.defaults.elements.bar) {
      Chart.defaults.elements.bar.borderRadius = 4;
      Chart.defaults.elements.bar.borderSkipped = false;
    }
    // Arc (doughnut/pie)
    if (Chart.defaults.elements.arc) {
      Chart.defaults.elements.arc.borderWidth = 2;
      Chart.defaults.elements.arc.borderColor = '#141922';  // --sp-surface-1
    }
  }

  // ============================================================
  // COLORS PLUGIN — auto-assign palette per dataset
  // ============================================================
  if (Chart.defaults.plugins && Chart.defaults.plugins.colors) {
    // Override the built-in colors plugin with our palette
    Chart.defaults.plugins.colors.enabled = true;
    Chart.defaults.plugins.colors.forceOverride = false;  // don't override if user explicitly sets colors
  }

  // Expose palette globally so individual charts can reference it
  window.SP_CHART_PALETTE = SP_PALETTE_ORDER;
  window.SP_CHART_FILL = SP_PALETTE_FILL;
  window.SP_PALETTE = SP_PALETTE;

  // ============================================================
  // AUTO-PATCH existing chart instances (for charts already rendered)
  // ============================================================
  if (Chart.instances) {
    Object.values(Chart.instances).forEach(function(chart) {
      if (chart && chart.update) {
        try { chart.update('none'); } catch(e) {}
      }
    });
  }

  console.log('[sp-charts] Phase 3 palette applied. Palette:', SP_PALETTE_ORDER);

// ==============================================================
// AUTO-PALETTE: distribute our 5-color palette across bar charts
// so single-dataset bars get visual variety (emerald/amber/blue/violet/red)
// ==============================================================
if (typeof Chart !== 'undefined' && Chart.register) {
  Chart.register({
    id: 'spAutoPalette',
    beforeInit: function(chart) {
      if (chart.config.type !== 'bar') return;
      if (!chart.data.datasets || chart.data.datasets.length === 0) return;

      // Force uniform bar widths + rounded corners on ALL bar charts
      chart.data.datasets.forEach(function(d) {
        d.maxBarThickness = 40;
        d.barPercentage = 0.7;
        d.categoryPercentage = 0.85;
        d.borderWidth = 1;
        d.borderRadius = 4;
        d.borderSkipped = false;
      });

      // Auto-palette for single-dataset bar charts only
      var ds = chart.data.datasets[0];
      if (chart.data.datasets.length === 1 && !Array.isArray(ds.backgroundColor)) {
        var dataLen = (ds.data || []).length;
        if (dataLen > 0) {
          var bgColors = [];
          var borderColors = [];
          for (var i = 0; i < dataLen; i++) {
            var idx = i % 5;
            borderColors.push(window.SP_CHART_PALETTE[idx]);
            bgColors.push(window.SP_CHART_FILL[idx]);
          }
          ds.backgroundColor = bgColors;
          ds.borderColor = borderColors;
        }
      }
    }
  });
  console.log('[sp-charts] Auto-palette plugin registered');
}
})();

// ==============================================================
// PROGRESS BAR NORMALIZER — runs after DOM ready
// Sets inline style.height/borderRadius directly = beats any CSS
// ==============================================================
function normalizeProgressBars() {
  var tracks = document.querySelectorAll('div');
  tracks.forEach(function(d) {
    var r = d.getBoundingClientRect();
    var cs = window.getComputedStyle(d);
    // Is it a progress track? (narrow, wide, not transparent)
    if (r.height >= 1 && r.height <= 14 && r.width > 40 && r.width > r.height * 3) {
      var bg = cs.backgroundColor;
      if (bg === 'rgba(0, 0, 0, 0)') return;
      var p = d.parentElement;
      if (!p) return;
      var pr = p.getBoundingClientRect();
      if (pr.height > 20) return;
      
      // It IS a progress bar element. Force uniform dimensions.
      // If it's a TRACK (has child with width:x%), set height to 6
      var hasFillChild = Array.from(d.children).some(function(c){
        var st = c.getAttribute('style') || '';
        return /width:\s*\d+%/.test(st);
      });
      if (hasFillChild) {
        // This is a track
        d.style.setProperty('height', '4px', 'important');
        d.style.setProperty('border-radius', '2px', 'important');
        d.style.setProperty('overflow', 'hidden', 'important');
      } else {
        // This is likely a fill
        d.style.setProperty('height', '100%', 'important');
        d.style.setProperty('border-radius', '2px', 'important');
      }
    }
  });
  console.log('[sp-charts] Progress bars normalized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', normalizeProgressBars);
} else {
  // DOM already ready, run shortly to catch async-rendered bars
  setTimeout(normalizeProgressBars, 500);
  setTimeout(normalizeProgressBars, 1500);  // re-run for late-loaders
}