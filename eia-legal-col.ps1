$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.legalcol1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains("injectLegalColumn")) {
    Write-Host "Legal column injector already present - skipping"
    return
}

# Append a new function that injects a Legal Reference column into group header + sub header + every data row
# Runs via interval (same as region selector) so it catches re-renders
$append = @"


  // === Add Legal Reference column to EIA register (runtime injection) ===
  function injectLegalColumn(){
    var tbody = document.getElementById('eaia-tbody');
    if(!tbody) return;
    var parent = tbody.parentElement;
    if(!parent) return;
    
    // Check if already injected
    if(parent.querySelector('[data-legal-injected="1"]')) return;
    
    // Update the group header: add new group 'LEGAL REFERENCE' between CONTROL MEASURES and RESIDUAL
    var groupHdr = parent.querySelector('#eia-group-header') || [].filter.call(parent.children, function(c){
      return c !== tbody && c.children.length === 7;
    })[0];
    var subHdr = parent.querySelector('#eia-sub-header') || parent.querySelector('#eia-flat-header') || [].filter.call(parent.children, function(c){
      return c !== tbody && c.children.length === 23;
    })[0];
    
    if(!groupHdr || !subHdr) return;
    
    // ----- 1. Insert Legal group label in group header (before RESIDUAL = 5th index of 7) -----
    var residualGroup = groupHdr.children[5]; // RESIDUAL is 5th (0-indexed: ID, ASPECT, IMPACT, INITIAL, CONTROL, RESIDUAL, ACTIONS)
    if(residualGroup){
      var newGroup = document.createElement('div');
      newGroup.setAttribute('data-legal-injected', '1');
      newGroup.style.cssText = 'grid-column:span 1;padding:10px 8px;text-align:center;color:#F59E0B;background:rgba(245,158,11,.1);border-right:1px solid var(--border);font-weight:700;text-transform:uppercase;letter-spacing:.5px;font-size:10px;';
      newGroup.textContent = 'LEGAL';
      groupHdr.insertBefore(newGroup, residualGroup);
    }
    
    // ----- 2. Insert 'Legal Ref' cell in sub-header (before RESIDUAL sub-col = index 20) -----
    var residualSub = subHdr.children[20]; // 0-indexed: 0=#, 1=Activity, 2=Aspect, 3=Impact, 4=Cond, 5-8=LC/IPC/BC/RCP, 9-13=Sc/Sv/Pr/Du/De, 14=Score, 15=S/NS, 16=Existing, 17=Gap, 18=Control, 19=Authority, 20=Residual, 21=R-S/NS, 22=Actions
    if(residualSub){
      var newSub = document.createElement('div');
      newSub.setAttribute('data-legal-injected', '1');
      newSub.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;text-align:center;color:var(--t3);';
      newSub.textContent = 'Legal Ref';
      subHdr.insertBefore(newSub, residualSub);
    }
    
    // ----- 3. Update grid-template-columns of group header + sub header + every data row to add 140px for legal col -----
    // Current: 23 cols - we inject 1 between col 19 (Authority) and col 20 (Residual) = new position 20
    // New grid: ...Authority(120px) | LEGAL(140px) | Residual(56px)...
    var oldGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 56px 50px 100px';
    var newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 56px 50px 100px';
    
    // Set new grid on group + sub headers
    groupHdr.style.gridTemplateColumns = newGrid;
    subHdr.style.gridTemplateColumns = newGrid;
    
    // ----- 4. Inject legal ref cell into every data row (before col 20 = Residual) -----
    var dataRows = tbody.children;
    for(var i = 0; i < dataRows.length; i++){
      var row = dataRows[i];
      if(row.getAttribute('data-legal-col') === '1') continue;
      row.setAttribute('data-legal-col', '1');
      row.style.gridTemplateColumns = newGrid;
      
      var residualCell = row.children[20];
      if(!residualCell) continue;
      
      var newLegalCell = document.createElement('div');
      var aspect = window.ASPECT_DATA && window.ASPECT_DATA[i];
      var legalText = aspect && aspect.legal ? aspect.legal : '';
      var region = window.eiaGetActiveRegion ? window.eiaGetActiveRegion() : 'GLOBAL';
      var displayText = (window.eiaFormatLegal && legalText) ? window.eiaFormatLegal(legalText, region) : legalText;
      newLegalCell.setAttribute('data-legal-cell', '1');
      newLegalCell.setAttribute('title', legalText); // full text on hover
      newLegalCell.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      newLegalCell.textContent = displayText;
      row.insertBefore(newLegalCell, residualCell);
    }
    
    // Also update CSS rule fallback (in case external CSS overrides)
    var style = document.createElement('style');
    style.id = 'eia-legal-col-grid';
    style.textContent = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + newGrid + ' !important; }';
    if(!document.getElementById('eia-legal-col-grid')){
      document.head.appendChild(style);
    }
  }
  
  // Re-hook: update existing eiaSetRegion to also refresh legal column text per region change
  var origSetRegion = window.eiaSetRegion;
  window.eiaSetRegion = function(code){
    if(typeof origSetRegion === 'function') origSetRegion(code);
    // Update legal cells text with new region filter
    var cells = document.querySelectorAll('[data-legal-cell="1"]');
    cells.forEach(function(cell, idx){
      var aspect = window.ASPECT_DATA && window.ASPECT_DATA[idx];
      if(aspect && aspect.legal && window.eiaFormatLegal){
        cell.textContent = window.eiaFormatLegal(aspect.legal, code);
        cell.setAttribute('title', aspect.legal);
      }
    });
  };
  
  // Run at intervals to catch re-renders
  setInterval(injectLegalColumn, 2000);
  [500, 1500, 3000, 5000].forEach(function(ms){ setTimeout(injectLegalColumn, ms); });
"@

# Insert the new code BEFORE the final })(); at end of file
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) {
    Write-Host "ABORT: no IIFE close found in eia-enhancements.js"
    return
}
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added injectLegalColumn + eiaSetRegion hook to eia-enhancements.js"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.legalcol1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
