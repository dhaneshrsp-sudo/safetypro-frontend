/* ═══════════════════════════════════════════════════════════════════
   sp-shell.js v8 — OpsLix unified topnav shell
   
   v8 ADDITIONS over v7:
   - ensureCanonicalLogo() — normalizes the logo's innerHTML so all
     in-app pages render identical OpsLix shield + 16px Fraunces wordmark.
     Idempotent (uses data-opslix-canonical flag).
   - Inner shield bars use #1F1B17 (OpsLix ink token) instead of legacy #04060E
   - Wordmark sized at 16px (small enough for topnav, more confident than 14px)
   
   v7 PRESERVED:
   - normalizeSidebarIcons() — canonical SVG paths for sidebar items
   - Active-state class application based on body[data-page]
   - More dropdown toggle + click-outside-to-close
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────
     SIDEBAR ICON NORMALIZATION (preserved from v7)
     ────────────────────────────────────────────────────────────────── */
  var CANONICAL_ICONS = {
    'safetypro_v2':         '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>',
    'safetypro_operations': '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"></path>',
    'safetypro_control':    '<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"></path>',
    'safetypro_reports':    '<path d="M4 4h12v16H4z"></path><path d="M8 8h4M8 12h4M8 16h2"></path>'
  };

  function normalizeSidebarIcons() {
    var sbItems = document.querySelectorAll('.sidebar .sb-item');
    sbItems.forEach(function (item) {
      var href = item.getAttribute('href') || '';
      Object.keys(CANONICAL_ICONS).forEach(function (key) {
        if (href.indexOf(key) >= 0) {
          var svg = item.querySelector('svg');
          if (svg && svg.innerHTML.trim() !== CANONICAL_ICONS[key].trim()) {
            svg.innerHTML = CANONICAL_ICONS[key];
          }
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     CANONICAL LOGO (NEW in v8)
     Single source of truth for the OpsLix mark across all app pages.
     ────────────────────────────────────────────────────────────────── */
  var CANONICAL_LOGO_INNER =
    '<span class="logo-shield" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#C6583E,#A84A35);flex:0 0 28px;">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="white" style="width:16px;height:16px;flex:0 0 16px;">' +
        '<path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6L12 2z"/>' +
        '<path d="M8 10h1.5v4.5H8zM11 8h1.5v6.5H11zM14 11h1.5v3.5H14z" fill="#1F1B17"/>' +
      '</svg>' +
    '</span>' +
    '<span class="logo-name" style="font-family:Fraunces,Georgia,serif;font-size:16px;font-weight:500;color:#1F1B17;letter-spacing:-0.01em;">' +
      'OpsLix' +
      '<span class="logo-dot" style="color:#C6583E;font-weight:700;margin:0 4px;font-style:normal">.</span>' +
    '</span>';

  function ensureCanonicalLogo() {
    /* Match every <a class="logo"> on the page (in-app topnav) */
    var logos = document.querySelectorAll('a.logo');
    logos.forEach(function (logo) {
      if (logo.dataset.opslixCanonical === '1') return;  /* idempotent */
      /* Standardize href if missing */
      if (!logo.getAttribute('href')) {
        logo.setAttribute('href', 'safetypro_v2');
      }
      /* Replace innerHTML with the canonical mark */
      logo.innerHTML = CANONICAL_LOGO_INNER;
      logo.dataset.opslixCanonical = '1';
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     INIT — ordering matters: logo first (most visible), then nav state
     ────────────────────────────────────────────────────────────────── */
  function init() {
    /* Canonical logo BEFORE anything else — this is the user-visible win */
    ensureCanonicalLogo();

    /* Active-state for current page (preserved from v7) */
    var page = document.body.getAttribute('data-page');
    if (page) {
      var mainItem = document.querySelector('.nav-links [data-page="' + page + '"]');
      if (mainItem) {
        mainItem.classList.add('active');
      } else {
        var moreBtn0 = document.querySelector('[data-page="more"]');
        var moreItem = document.querySelector('.more-menu [data-more="' + page + '"]');
        if (moreBtn0) moreBtn0.classList.add('active');
        if (moreItem) moreItem.style.display = 'none';
      }
    }

    /* Sidebar icons (preserved from v7) */
    normalizeSidebarIcons();

    /* More-button click handling (preserved from v7) */
    var moreBtn = document.getElementById('more-btn');
    if (moreBtn) {
      moreBtn.onclick = null;
      moreBtn.removeAttribute('onclick');
      moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        moreBtn.classList.toggle('open');
      });
    }

    document.addEventListener('click', function (e) {
      var btn = document.getElementById('more-btn');
      if (btn && !btn.contains(e.target)) {
        btn.classList.remove('open');
      }
    });

    if (window.console && console.log) {
      console.log('[sp-shell v8 OpsLix] init complete — canonicalized ' + document.querySelectorAll('a.logo[data-opslix-canonical]').length + ' logo(s)');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Public API (preserved from v7) */
  window.spToggleMore = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var btn = document.getElementById('more-btn');
    if (btn) btn.classList.toggle('open');
  };

  /* New public API (v8) — exposed for runtime re-canonicalization */
  window.opslixEnsureCanonicalLogo = ensureCanonicalLogo;
})();
