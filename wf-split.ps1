$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT: files too small"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.wfsplit1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__WF_SPLIT_V1__')) { Write-Host "Already split"; return }

# Append a new version that OVERRIDES the earlier injectWorkflowColumn with a 3-column layout
$append = @"


  // ========= __WF_SPLIT_V1__ Workflow split into 3 sub-columns (Status | Actions | Audit) =========
  
  // Remove any existing workflow injection markers so we can re-inject cleanly
  function clearOldWorkflowInjections(){
    var oldMarkers = document.querySelectorAll('[data-wf-injected]');
    oldMarkers.forEach(function(el){ el.remove(); });
    var oldCells = document.querySelectorAll('[data-wf-cell]');
    oldCells.forEach(function(el){ el.remove(); });
    var oldStyle = document.getElementById('eia-wf-grid-override');
    if (oldStyle) oldStyle.remove();
    var oldStyle2 = document.getElementById('eia-wf-split-override');
    if (oldStyle2) oldStyle2.remove();
  }
  
  function injectWorkflowColumnSplit(){
    var tbody = document.getElementById('eaia-tbody');
    if (!tbody) return;
    var parent = tbody.parentElement;
    if (!parent) return;
    
    var groupHdr = document.getElementById('eia-group-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 6 && c.children.length <= 11; })[0];
    var subHdr = document.getElementById('eia-sub-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 22 && c.children.length <= 28; })[0];
    if (!groupHdr || !subHdr) return;
    
    var alreadySplit = !!groupHdr.querySelector('[data-wf-split="1"]');
    
    if (!alreadySplit){
      // Find RESIDUAL group and inject "WORKFLOW (spans 3)" before it
      var residualGroup = null;
      for (var i = 0; i < groupHdr.children.length; i++){
        if (groupHdr.children[i].textContent.trim().indexOf('RESIDUAL') >= 0){ residualGroup = groupHdr.children[i]; break; }
      }
      if (residualGroup){
        var newGroup = document.createElement('div');
        newGroup.setAttribute('data-wf-split', '1');
        newGroup.style.cssText = 'grid-column:span 3;padding:10px 8px;text-align:center;color:#8B5CF6 !important;background:rgba(139,92,246,.12);border-right:1px solid var(--border);font-weight:700;text-transform:uppercase;letter-spacing:.5px;font-size:10px;';
        newGroup.textContent = 'WORKFLOW';
        groupHdr.insertBefore(newGroup, residualGroup);
      }
      
      // Inject 3 sub-header cells: Status | Actions | Audit - before first residual sub-header
      var residualSub = null;
      for (var j = 0; j < subHdr.children.length; j++){
        if (subHdr.children[j].textContent.trim().toLowerCase().indexOf('residual') >= 0){ residualSub = subHdr.children[j]; break; }
      }
      if (residualSub){
        ['Status','Actions','Audit'].forEach(function(lbl){
          var sub = document.createElement('div');
          sub.setAttribute('data-wf-split', '1');
          sub.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;text-align:center;color:var(--t3);';
          sub.textContent = lbl;
          subHdr.insertBefore(sub, residualSub);
        });
      }
    }
    
    // Define 27-column grid: 21 pre-workflow + 3 workflow + 3 residual/actions
    // 70 130 120 130 50 30 30 30 30 34 34 34 34 34 56 50 130 120 130 120 140 | 90 130 44 | 56 50 100
    var newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 90px 130px 44px 56px 50px 100px';
    groupHdr.style.gridTemplateColumns = newGrid;
    subHdr.style.gridTemplateColumns = newGrid;
    
    var fullData = window.ASPECT_DATA || [];
    var rows = tbody.children;
    
    for (var r = 0; r < rows.length; r++){
      var row = rows[r];
      row.style.gridTemplateColumns = newGrid;
      var status = (fullData[r] && fullData[r].wfStatus) || 'DRAFT';
      var style = WF_STYLES[status] || WF_STYLES.DRAFT;
      var role = window.__currentRole || 'Preparer';
      var transitions = canTransition(role, status);
      
      // Find existing split cells (if any)
      var existingStatus = row.querySelector('[data-wf-split-cell="status"]');
      var existingActions = row.querySelector('[data-wf-split-cell="actions"]');
      var existingAudit = row.querySelector('[data-wf-split-cell="audit"]');
      
      // --- STATUS CELL ---
      var statusHtml = '<div style="display:inline-block;padding:3px 8px;background:' + style.bg + ';color:' + style.col + ' !important;border-radius:10px;font-size:8px;font-weight:700;white-space:nowrap;">' + style.icon + ' ' + style.label + '</div>';
      
      // --- ACTIONS CELL ---
      var actionsHtml = '';
      if (transitions.length === 0){
        actionsHtml = '<span style="color:var(--t3);font-size:8px;font-style:italic;">No action</span>';
      } else {
        actionsHtml = '<div style="display:flex;flex-direction:column;gap:3px;width:100%;">' +
          transitions.map(function(t){
            return '<button onclick="eiaWfTransition(' + r + ',\'' + t.to + '\')" style="background:rgba(255,255,255,.04);border:1px solid ' + t.col + ';color:' + t.col + ' !important;padding:2px 6px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;width:100%;">' + t.label + '</button>';
          }).join('') +
        '</div>';
      }
      
      // --- AUDIT CELL (icon only) ---
      var auditCount = (fullData[r] && fullData[r].wfHistory) ? fullData[r].wfHistory.length : 0;
      var auditHtml = '<button onclick="eiaShowWfHistory(' + r + ')" title="View audit trail (' + auditCount + ' entries)" style="background:transparent;border:0;color:var(--t3);cursor:pointer;font-size:13px;padding:4px;line-height:1;position:relative;">&#128214;' +
        (auditCount > 0 ? '<span style="position:absolute;top:-2px;right:-2px;background:#8B5CF6 !important;color:#fff !important;font-size:7px;padding:1px 4px;border-radius:8px;font-weight:700;min-width:12px;">' + auditCount + '</span>' : '') +
      '</button>';
      
      if (existingStatus){ existingStatus.innerHTML = statusHtml; }
      if (existingActions){ existingActions.innerHTML = actionsHtml; }
      if (existingAudit){ existingAudit.innerHTML = auditHtml; }
      
      if (!existingStatus){
        // Find insertion point: first residual cell in row
        var insertBefore = null;
        for (var k = 20; k < row.children.length && k < 27; k++){
          var c = row.children[k];
          if (c.getAttribute('data-legal-cell') === '1') continue;
          // Residual cell is next after legal (or after position 20 if no legal)
          insertBefore = c; break;
        }
        if (!insertBefore) continue;
        
        var cellStyle = 'padding:4px 4px;border-right:0.5px solid var(--border);display:flex;align-items:center;justify-content:center;';
        
        var cStatus = document.createElement('div');
        cStatus.setAttribute('data-wf-split-cell', 'status');
        cStatus.style.cssText = cellStyle;
        cStatus.innerHTML = statusHtml;
        row.insertBefore(cStatus, insertBefore);
        
        var cActions = document.createElement('div');
        cActions.setAttribute('data-wf-split-cell', 'actions');
        cActions.style.cssText = cellStyle;
        cActions.innerHTML = actionsHtml;
        row.insertBefore(cActions, insertBefore);
        
        var cAudit = document.createElement('div');
        cAudit.setAttribute('data-wf-split-cell', 'audit');
        cAudit.style.cssText = cellStyle;
        cAudit.innerHTML = auditHtml;
        row.insertBefore(cAudit, insertBefore);
      }
    }
    
    // Defensive CSS override
    var styleId = 'eia-wf-split-override';
    var existStyle = document.getElementById(styleId);
    if (!existStyle){
      var s = document.createElement('style');
      s.id = styleId;
      s.textContent = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + newGrid + ' !important; }';
      document.head.appendChild(s);
    }
  }
  
  // Disable the OLD single-column injectWorkflowColumn so it does not re-add 24-col layout
  window.__wfSplitMode = true;
  var _prevInject = window.injectWorkflowColumn;
  // Override internal references (in closure we cant reach the old function, but we can run clearOldWorkflowInjections once)
  clearOldWorkflowInjections();
  
  // Run the new split injector on interval + timeouts
  setInterval(function(){ try { injectWorkflowColumnSplit(); } catch(e){} }, 2500);
  [400, 1200, 2500, 4500].forEach(function(ms){ setTimeout(function(){ try { injectWorkflowColumnSplit(); } catch(e){} }, ms); });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added 3-sub-column workflow split"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }
Copy-Item $htmlFile "$htmlFile.wfsplit1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT: html too small"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT: after replace too small"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
Write-Host "Final HTML: $((Get-Item $htmlFile).Length) bytes"
