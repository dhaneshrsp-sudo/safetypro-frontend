/* =============================================================
   OpsLix — Dynamic KPI Card State System (v6, OpsLix-native)
   
   ARCHITECTURE CHANGE FROM v5:
   - v5 wrote inline style="background: radial-gradient ... !important"
   - v6 sets CSS classes only — actual styling lives in opslix-shell.css
   - This produces the clean OpsLix look while preserving all
     score → state intelligence (thresholds, label matching, value
     extraction, visibility checks) unchanged.
   
   Cards are tagged with TWO things for CSS hooks:
     - data-sp-state="safe|warning|danger" attribute
     - className "sp-state-safe|sp-state-warning|sp-state-danger"
   
   v6 also CLEANS UP any inline styles left over from v5 so the
   transition is seamless on already-rendered pages.
   ============================================================= */
(function () {
  'use strict';

  var CARD_CONFIG = [
    /* Hero + critical row */
    { labelMatch: /^AI Priority Actions/i, scoreType: 'ai-priority',   thresholds: {} },
    { labelMatch: /^Critical Risks/i,      scoreType: 'risk-count',    thresholds: { safe: 0,  warning: 2 } },
    { labelMatch: /^Global HSE Score/i,    scoreType: 'higher-better', thresholds: { safe: 80, warning: 60 } },

    /* ISO composite small tiles */
    { labelMatch: /^Overdue Actions$/i,    scoreType: 'risk-count',    thresholds: { safe: 0,  warning: 3 } },
    { labelMatch: /^Open Incidents$/i,     scoreType: 'risk-count',    thresholds: { safe: 0,  warning: 2 } },
    { labelMatch: /^Permits at Risk$/i,    scoreType: 'risk-count',    thresholds: { safe: 0,  warning: 2 } },
    { labelMatch: /^Closed This Week$/i,   scoreType: 'activity-count', thresholds: { safe: 5,  warning: 1 } },

    /* 4 main KPI tiles */
    { labelMatch: /^Safe Actions$/i,       scoreType: 'activity-count', thresholds: { safe: 50, warning: 10 } },
    { labelMatch: /^Actions Due$/i,        scoreType: 'risk-count',    thresholds: { safe: 0,  warning: 10 } },
    { labelMatch: /^Escalated$/i,          scoreType: 'risk-count',    thresholds: { safe: 0,  warning: 3 } },
    { labelMatch: /^Audit Score$/i,        scoreType: 'higher-better', thresholds: { safe: 80, warning: 60 } }
  ];

  /* Stale inline style properties to remove from cards (v5 leftovers) */
  var STALE_PROPS = ['background', 'background-image', 'background-color',
                     'box-shadow', 'border', 'border-color',
                     'position', 'overflow'];

  function determineState(value, config, card) {
    var t = config.thresholds;
    switch (config.scoreType) {
      case 'higher-better':
        if (value >= t.safe)    return 'safe';
        if (value >= t.warning) return 'warning';
        return 'danger';
      case 'activity-count':
        if (value >= t.safe)    return 'safe';
        return 'warning';  /* low/zero activity = caution */
      case 'ai-priority':
        var txt = (card && card.textContent || '').toLowerCase();
        if (/all\s*clear|no critical priorities/.test(txt)) return 'safe';
        if (/critical.*active|incident.*active|urgent|overdue/.test(txt)) return 'warning';
        return 'warning';
      case 'risk-count':
      default:
        if (value <= t.safe)    return 'safe';
        if (value <= t.warning) return 'warning';
        return 'danger';
    }
  }

  function isVisible(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    if (!el.offsetParent && cs.position !== 'fixed') return false;
    return true;
  }

  function findLabelElement(config) {
    var all = document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, p, label');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length > 5) continue;
      if (!isVisible(el)) continue;
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

  /* Strip v5 inline styles cleanly */
  function stripStaleInline(el) {
    if (!el || !el.style) return;
    STALE_PROPS.forEach(function (p) {
      el.style.removeProperty(p);
    });
  }

  /* Apply OpsLix state — class + data attribute only, NO inline styles */
  function applyState(card, state) {
    /* Strip any v5-era inline styles */
    stripStaleInline(card);

    /* Remove any old state classes */
    card.classList.remove('sp-state-safe', 'sp-state-warning', 'sp-state-danger');
    /* Add new state class */
    card.classList.add('sp-state-' + state);
    card.setAttribute('data-sp-state', state);

    /* Mark inner rows that v5 used to inline-color, so CSS can target them */
    var innerRows = card.querySelectorAll('[style*="rgba(239"], [style*="rgba(245"], [style*="rgba(16, 185"], [style*="rgba(59,"]');
    innerRows.forEach(function (row) {
      var st = row.getAttribute('style') || '';
      if (st.indexOf('padding') > -1 && st.indexOf('border') > -1 && st.indexOf('background') > -1) {
        row.setAttribute('data-sp-inner', '1');
        /* Remove stale inline bg/border so CSS takes over */
        row.style.removeProperty('background');
        row.style.removeProperty('background-color');
        row.style.removeProperty('border');
        row.style.removeProperty('border-color');
      }
    });

    /* Mark the big number element (CSS will color via parent state) */
    var nums = card.querySelectorAll('*');
    for (var i = 0; i < nums.length; i++) {
      var el = nums[i];
      if (el.children.length > 0) continue;
      var txt = (el.textContent || '').trim();
      if (!/^\d+(\.\d+)?%?$/.test(txt)) continue;
      var fs = parseFloat(window.getComputedStyle(el).fontSize);
      if (fs < 18) continue;
      el.setAttribute('data-sp-bignum', '1');
      el.style.removeProperty('color');  /* clear v5's inline color */
    }

    /* Mark dot indicators (CSS will color via parent state) */
    var dots = card.querySelectorAll('[style*="border-radius:50%"], [style*="border-radius: 50%"]');
    dots.forEach(function (dot) {
      var dr = dot.getBoundingClientRect();
      if (dr.width < 20 && dr.height < 20) {
        dot.setAttribute('data-sp-dot', '1');
        dot.style.removeProperty('background');
        dot.style.removeProperty('background-color');
      }
    });
  }

  function updateAllCards() {
    var updated = 0;
    CARD_CONFIG.forEach(function (config) {
      var labelEl = findLabelElement(config);
      if (!labelEl) return;
      var card = findContainingCard(labelEl);
      if (!card) return;
      var value = extractValue(card);
      var state = determineState(value, config, card);
      applyState(card, state);
      updated++;
    });
    if (window.console && console.log) {
      console.log('[sp-dynamic-states v6 OpsLix] updated ' + updated + ' cards');
    }
  }

  function init() {
    updateAllCards();
    /* Re-run periodically to catch late-rendered cards */
    for (var t = 500; t <= 5000; t += 500) setTimeout(updateAllCards, t);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.spUpdateKpiStates = updateAllCards;
})();
