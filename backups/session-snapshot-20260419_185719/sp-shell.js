/* sp-shell.js - SafetyPro AI topnav active-state + More dropdown + icon normalization */
(function(){
  var CANONICAL_ICONS = {
    'safetypro_v2': '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>',
    'safetypro_operations': '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"></path>',
    'safetypro_control': '<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"></path>',
    'safetypro_reports': '<path d="M4 4h12v16H4z"></path><path d="M8 8h4M8 12h4M8 16h2"></path>'
  };
  
  function normalizeSidebarIcons() {
    var sbItems = document.querySelectorAll('.sidebar .sb-item');
    sbItems.forEach(function(item) {
      var href = item.getAttribute('href') || '';
      Object.keys(CANONICAL_ICONS).forEach(function(key) {
        if (href.indexOf(key) >= 0) {
          var svg = item.querySelector('svg');
          if (svg && svg.innerHTML.trim() !== CANONICAL_ICONS[key].trim()) {
            svg.innerHTML = CANONICAL_ICONS[key];
          }
        }
      });
    });
  }
  
  function init(){
    var page = document.body.getAttribute('data-page');
    if (page) {
      var mainItem = document.querySelector('.nav-links [data-page="' + page + '"]');
      if (mainItem) {
        mainItem.classList.add('active');
      } else {
        var moreBtn = document.querySelector('[data-page="more"]');
        var moreItem = document.querySelector('.more-menu [data-more="' + page + '"]');
        if (moreBtn) moreBtn.classList.add('active');
        if (moreItem) moreItem.style.display = 'none';
      }
    }
    
    // Normalize icons
    normalizeSidebarIcons();
    
    // Attach click handler to More button
    var moreBtn = document.getElementById('more-btn');
    if (moreBtn) {
      moreBtn.onclick = null;
      moreBtn.removeAttribute('onclick');
      moreBtn.addEventListener('click', function(e){
        e.stopPropagation();
        moreBtn.classList.toggle('open');
      });
    }
    
    document.addEventListener('click', function(e){
      var btn = document.getElementById('more-btn');
      if (btn && !btn.contains(e.target)) {
        btn.classList.remove('open');
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.spToggleMore = function(e){
    if (e && e.stopPropagation) e.stopPropagation();
    var btn = document.getElementById('more-btn');
    if (btn) btn.classList.toggle('open');
  };
})();