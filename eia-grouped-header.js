(function(){
  function injectGroupedHeader(){
    var tbody = document.getElementById('eaia-tbody');
    if(!tbody) return;
    var parent = tbody.parentElement;
    if(!parent) return;

    // CLEAN UP: remove any existing group header rows (by id OR by detecting 7-child label row)
    var siblings = [].slice.call(parent.children);
    for(var i = 0; i < siblings.length; i++){
      var s = siblings[i];
      if(s === tbody) continue;
      if(s.id === 'eia-grouped-header-row1') { s.parentNode.removeChild(s); continue; }
      // Remove orphan 7-child labels row (from prior injections)
      if(s.children.length === 7 && s.children[0].textContent.trim() === 'ID'){
        var txt = s.textContent;
        if(txt.indexOf('ASPECT IDENT') >= 0 && txt.indexOf('IMPACT CRIT') >= 0){
          s.parentNode.removeChild(s);
        }
      }
    }

    // Find the flat 23-col header (the real sub-header we keep)
    var sib = tbody.previousElementSibling;
    var flatHeader = null;
    while(sib){
      if(sib.tagName === 'DIV' && (sib.getAttribute('style')||'').indexOf('grid-template-columns') >= 0 && sib.children.length === 23){
        flatHeader = sib; break;
      }
      sib = sib.previousElementSibling;
    }
    if(!flatHeader) return;

    // Mark the flat header for identification (don't modify its structure)
    flatHeader.id = 'eia-flat-header';

    // Build NEW row1 with SAME grid-template-columns as flat header + use grid-column:span for each group
    var row1 = document.createElement('div');
    row1.id = 'eia-grouped-header-row1';
    // Use SAME grid as data rows - this is the key to alignment
    var gridCols = '30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px';
    row1.style.cssText = 'display:grid;grid-template-columns:' + gridCols + ';background:#0A1222;border-bottom:1px solid #1E293B;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;';

    // Each group cell uses grid-column: span N to align with sub-columns below
    row1.innerHTML =
      '<div style="grid-column:span 1;padding:10px 4px;text-align:center;color:#64748B;border-right:1px solid #1E293B;">ID</div>' +
      '<div style="grid-column:span 4;padding:10px 10px;text-align:center;color:#22C55E;background:rgba(34,197,94,.1);border-right:1px solid #1E293B;">&#127807; ASPECT IDENTIFICATION</div>' +
      '<div style="grid-column:span 4;padding:10px 8px;text-align:center;color:#3B82F6;background:rgba(59,130,246,.1);border-right:1px solid #1E293B;" title="Impact Criteria per ISO 14001 Cl.6.1.2">&#9878; IMPACT CRITERIA</div>' +
      '<div style="grid-column:span 7;padding:10px 8px;text-align:center;color:#EF4444;background:rgba(239,68,68,.1);border-right:1px solid #1E293B;">&#9888; INITIAL SIGNIFICANCE</div>' +
      '<div style="grid-column:span 4;padding:10px 10px;text-align:center;color:#10B981;background:rgba(16,185,129,.1);border-right:1px solid #1E293B;">&#128737; CONTROL MEASURES</div>' +
      '<div style="grid-column:span 2;padding:10px 8px;text-align:center;color:#8B5CF6;background:rgba(139,92,246,.1);border-right:1px solid #1E293B;">&#10003; RESIDUAL</div>' +
      '<div style="grid-column:span 1;padding:10px 8px;text-align:center;color:#64748B;">ACTIONS</div>';

    // Insert row1 BEFORE the flat header
    flatHeader.parentNode.insertBefore(row1, flatHeader);

    // Polish sub-header appearance (remove redundant styling, make consistent)
    flatHeader.style.fontSize = '9px';
    flatHeader.style.fontWeight = '600';
    flatHeader.style.textTransform = 'uppercase';
    flatHeader.style.letterSpacing = '.3px';
    flatHeader.style.background = '#111927';
  }

  setInterval(injectGroupedHeader, 1500);
  [500, 1500, 3000].forEach(function(ms){ setTimeout(injectGroupedHeader, ms); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(injectGroupedHeader, 200); });
  } else {
    setTimeout(injectGroupedHeader, 200);
  }
})();
