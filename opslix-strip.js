/* ═══════════════════════════════════════════════════════════════════
   OpsLix Inline Style Strip — v2 (safe, no MutationObserver)
   
   Removes dark-theme inline gradient/glow set by dashboard JS on KPI
   tiles, where CSS !important cannot beat inline !important.
   
   STRATEGY:
   - Override only specific properties (background-image, box-shadow,
     border-*) without touching the `background` shorthand.
   - Run at 4 fixed timestamps: DOMContentLoaded + 500ms + 1500ms + 3000ms
   - NO MutationObserver (the v1 loop bug)
   - Idempotent — safe to call repeatedly
   - Marks stripped tiles with data-opslix-stripped to log activity
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Tier border colors — match opslix-shell.css tokens */
  var TIER_BORDERS = {
    'kpi-g': '#7A8B6D',  /* sage */
    'kpi-a': '#B8935C',  /* gold */
    'kpi-r': '#C84F3E',  /* coral */
    'kpi-b': '#5B7B9F'   /* blue */
  };

  /* Strip one .kpi element — idempotent */
  function stripKpi(el) {
    if (!el || !el.style) return;

    /* Determine tier color from class */
    var borderColor = '#D8D2C4';
    for (var cls in TIER_BORDERS) {
      if (el.classList && el.classList.contains(cls)) {
        borderColor = TIER_BORDERS[cls];
        break;
      }
    }

    /* Override only specific properties — leave `background` shorthand alone */
    el.style.setProperty('background-image', 'none', 'important');
    el.style.setProperty('background-color', '#FFFFFF', 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('border-top', '1px solid #D8D2C4', 'important');
    el.style.setProperty('border-right', '1px solid #D8D2C4', 'important');
    el.style.setProperty('border-bottom', '1px solid #D8D2C4', 'important');
    el.style.setProperty('border-left', '3px solid ' + borderColor, 'important');

    el.setAttribute('data-opslix-stripped', '1');
  }

  /* Strip hero/priority cards based on data-sp-state */
  function stripHero(el) {
    if (!el || !el.style) return;

    var state = (el.getAttribute('data-sp-state') || '').toLowerCase();
    var bg = '#FBE9E5', border = '#E8B5A8';   /* default high/coral */

    if (state.indexOf('healthy') > -1 || state.indexOf('ok') > -1 || state.indexOf('low') > -1) {
      bg = '#ECEFE6'; border = '#B8C4A8';
    } else if (state.indexOf('critical') > -1 || state.indexOf('urgent') > -1) {
      bg = '#F4D5CD'; border = '#D9928A';
    } else if (state.indexOf('warn') > -1 || state.indexOf('caution') > -1 || state.indexOf('medium') > -1) {
      bg = '#F5EDD9'; border = '#D9C58A';
    }

    el.style.setProperty('background-image', 'none', 'important');
    el.style.setProperty('background-color', bg, 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('border', '1px solid ' + border, 'important');
    el.setAttribute('data-opslix-stripped', '1');
  }

  /* Run all strips */
  var runCount = 0;
  function stripAll() {
    runCount++;
    var kpiEls = document.querySelectorAll('.kpi');
    var heroEls = document.querySelectorAll('.ai-hero, .priority-actions-hero, [class*="ai-priority"]');
    kpiEls.forEach(stripKpi);
    heroEls.forEach(stripHero);
    if (window.console && console.log) {
      console.log('[opslix-strip] run #' + runCount + ': stripped ' + kpiEls.length + ' KPIs, ' + heroEls.length + ' heroes');
    }
  }

  /* Schedule strips at multiple timestamps to catch late-rendered tiles */
  function schedule() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', stripAll);
    } else {
      stripAll();
    }
    setTimeout(stripAll, 500);
    setTimeout(stripAll, 1500);
    setTimeout(stripAll, 3000);
  }

  schedule();
})();
