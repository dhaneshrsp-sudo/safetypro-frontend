/* =============================================================
   SafetyPro AI — Dynamic KPI Card State Coloring (v5 Final)
   - Fixes hidden 0x0 element false-match bug
   - Adds AI Priority Actions, Safe Actions, Actions Due, Escalated, Audit Score
   - All 11 cards across dashboard with proper Corner Glow
   ============================================================= */
(function(){
  var CARD_CONFIG = [
    // Main top row
    { labelMatch: /^AI Priority Actions/i, scoreType: 'ai-priority', thresholds: {} },
    // Critical Risks row
    { labelMatch: /^Critical Risks/i,      scoreType: 'risk-count',   thresholds: { safe: 0, warning: 2 } },
    { labelMatch: /^Global HSE Score/i,    scoreType: 'higher-better', thresholds: { safe: 80, warning: 60 } },
    // 4 small KPI tiles
    { labelMatch: /^Overdue Actions$/i,    scoreType: 'risk-count',   thresholds: { safe: 0, warning: 3 } },
    { labelMatch: /^Open Incidents$/i,     scoreType: 'risk-count',   thresholds: { safe: 0, warning: 2 } },
    { labelMatch: /^Permits at Risk$/i,    scoreType: 'risk-count',   thresholds: { safe: 0, warning: 2 } },
    { labelMatch: /^Closed This Week$/i,   scoreType: 'activity-count', thresholds: { safe: 5, warning: 1 } },
    // Additional KPIs user requested
    { labelMatch: /^Safe Actions$/i,       scoreType: 'activity-count', thresholds: { safe: 50, warning: 10 } },
    { labelMatch: /^Actions Due$/i,        scoreType: 'risk-count',   thresholds: { safe: 0, warning: 10 } },
    { labelMatch: /^Escalated$/i,          scoreType: 'risk-count',   thresholds: { safe: 0, warning: 3 } },
    { labelMatch: /^Audit Score$/i,        scoreType: 'higher-better', thresholds: { safe: 80, warning: 60 } }
  ];

  var STATE_COLORS = {
    safe: {
      bgLarge: 'radial-gradient(ellipse 380px 240px at top left, rgba(16,185,129,0.28), rgba(16,185,129,0.10) 40%, rgba(16,185,129,0.02) 70%, transparent 90%), var(--card)',
      bgSmall: 'radial-gradient(ellipse 200px 140px at top left, rgba(16,185,129,0.30), rgba(16,185,129,0.10) 45%, transparent 85%), var(--card)',
      boxShadow: 'inset 0 2px 0 0 rgba(16,185,129,0.85), 0 1px 12px rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.22)',
      text: '#10B981',
      innerBg: 'rgba(16,185,129,0.06)',
      innerBorder: '1px solid rgba(16,185,129,0.15)'
    },
    warning: {
      bgLarge: 'radial-gradient(ellipse 380px 240px at top left, rgba(245,158,11,0.28), rgba(245,158,11,0.10) 40%, rgba(245,158,11,0.02) 70%, transparent 90%), var(--card)',
      bgSmall: 'radial-gradient(ellipse 200px 140px at top left, rgba(245,158,11,0.30), rgba(245,158,11,0.10) 45%, transparent 85%), var(--card)',
      boxShadow: 'inset 0 2px 0 0 rgba(245,158,11,0.85), 0 1px 12px rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.22)',
      text: '#F59E0B',
      innerBg: 'rgba(245,158,11,0.06)',
      innerBorder: '1px solid rgba(245,158,11,0.15)'
    },
    danger: {
      bgLarge: 'radial-gradient(ellipse 380px 240px at top left, rgba(239,68,68,0.28), rgba(239,68,68,0.10) 40%, rgba(239,68,68,0.02) 70%, transparent 90%), var(--card)',
      bgSmall: 'radial-gradient(ellipse 200px 140px at top left, rgba(239,68,68,0.30), rgba(239,68,68,0.10) 45%, transparent 85%), var(--card)',
      boxShadow: 'inset 0 2px 0 0 rgba(239,68,68,0.85), 0 1px 12px rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.22)',
      text: '#EF4444',
      innerBg: 'rgba(239,68,68,0.06)',
      innerBorder: '1px solid rgba(239,68,68,0.15)'
    }
  };

  function determineState(value, config, card) {
    var t = config.thresholds;
    switch(config.scoreType) {
      case 'higher-better':
        if (value >= t.safe) return 'safe';
        if (value >= t.warning) return 'warning';
        return 'danger';
      case 'activity-count':
        if (value >= t.safe) return 'safe';
        if (value >= t.warning) return 'warning';
        return 'warning';  // 0 activity = warning, not danger
      case 'ai-priority':
        // Inspect card content to determine state
        var txt = (card?.textContent || '').toLowerCase();
        var hasAllClear = /all\s*clear|no critical priorities/.test(txt);
        var hasCriticalActive = /critical.*active|incident.*active|urgent|overdue/.test(txt);
        if (hasAllClear && !hasCriticalActive) return 'safe';
        if (hasCriticalActive) return 'warning';
        return 'warning';
      case 'risk-count':
      default:
        if (value <= t.safe) return 'safe';
        if (value <= t.warning) return 'warning';
        return 'danger';
    }
  }

  function isVisible(el) {
    // Reject zero-size elements (likely hidden tabs / 0x0 panels)
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    // Check offsetParent — if null, el is not in rendered tree
    if (!el.offsetParent && cs.position !== 'fixed') return false;
    return true;
  }

  function findLabelElement(config) {
    var all = document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, p, label');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length > 5) continue;
      if (!isVisible(el)) continue;  // critical fix: skip hidden
      var txt = (el.textContent || '').trim();
      if (txt.length > 80) continue;
      if (config.labelMatch.test(txt)) return el;
    }
    return null;
  }

  function extractValue(card) {
    var candidates = card.querySelectorAll('*');
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el.children.length > 0) continue;
      if (!isVisible(el)) continue;
      var txt = (el.textContent || '').trim();
      var m = txt.match(/^(\d+(?:\.\d+)?)\s*%?$/);
      if (m) {
        var fs = parseFloat(window.getComputedStyle(el).fontSize);
        if (fs >= 18) return parseFloat(m[1]);
      }
    }
    var tm = (card.textContent || '').match(/\d+/);
    return tm ? parseInt(tm[0], 10) : 0;
  }

  function findContainingCard(labelEl) {
    var el = labelEl;
    for (var i = 0; i < 10 && el; i++) {
      var r = el.getBoundingClientRect();
      if (r.width >= 180 && r.height >= 80) {
        var cs = window.getComputedStyle(el);
        var hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                    (cs.backgroundImage && cs.backgroundImage !== 'none');
        var hasPad = parseFloat(cs.paddingTop || 0) >= 8;
        var hasBorder = cs.borderTopWidth !== '0px';
        if ((hasBg || hasBorder) && (hasPad || parseFloat(cs.paddingLeft || 0) >= 8)) {
          return el;
        }
      }
      el = el.parentElement;
    }
    return null;
  }

  function applyState(card, state) {
    var colors = STATE_COLORS[state];
    if (!colors) return;
    var r = card.getBoundingClientRect();
    var isLarge = r.width > 400;
    card.style.setProperty('background', isLarge ? colors.bgLarge : colors.bgSmall, 'important');
    card.style.setProperty('border', colors.border, 'important');
    card.style.setProperty('box-shadow', colors.boxShadow, 'important');
    card.style.setProperty('position', 'relative', 'important');
    card.style.setProperty('overflow', 'hidden', 'important');
    card.setAttribute('data-sp-state', state);

    var innerRows = card.querySelectorAll('[style*="rgba(239"], [style*="rgba(245"], [style*="rgba(16, 185"], [style*="rgba(59,"]');
    innerRows.forEach(function(row) {
      var st = row.getAttribute('style') || '';
      if (st.includes('padding') && st.includes('border') && st.includes('background')) {
        row.style.setProperty('background', colors.innerBg, 'important');
        row.style.setProperty('border', colors.innerBorder, 'important');
      }
    });

    var nums = card.querySelectorAll('*');
    for (var i = 0; i < nums.length; i++) {
      var el = nums[i];
      if (el.children.length > 0) continue;
      var txt = (el.textContent || '').trim();
      if (!/^\d+(\.\d+)?%?$/.test(txt)) continue;
      if (parseFloat(window.getComputedStyle(el).fontSize) < 18) continue;
      el.style.setProperty('color', colors.text, 'important');
    }

    var dots = card.querySelectorAll('[style*="border-radius:50%"], [style*="border-radius: 50%"]');
    dots.forEach(function(dot) {
      var dr = dot.getBoundingClientRect();
      if (dr.width < 20 && dr.height < 20) {
        dot.style.setProperty('background', colors.text, 'important');
      }
    });
  }

  function updateAllCards() {
    var updated = 0;
    CARD_CONFIG.forEach(function(config) {
      var labelEl = findLabelElement(config);
      if (!labelEl) return;
      var card = findContainingCard(labelEl);
      if (!card) return;
      var value = extractValue(card);
      var state = determineState(value, config, card);
      applyState(card, state);
      updated++;
    });
    console.log('[sp-dynamic-states v5] updated ' + updated + ' cards');
  }

  function init() {
    updateAllCards();
    for (var t = 500; t <= 5000; t += 500) setTimeout(updateAllCards, t);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.spUpdateKpiStates = updateAllCards;
})();