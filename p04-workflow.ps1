$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT: files too small (js=$jsSize html=$htmlSize)"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.wf1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__WORKFLOW_V1__')) { Write-Host "Workflow already present"; return }

$append = @"


  // ========= __WORKFLOW_V1__ EIA Draft/Review/Approved Workflow on Register =========
  
  // Seed workflow fields on ASPECT_DATA
  (function(){
    if (!window.ASPECT_DATA || !Array.isArray(window.ASPECT_DATA)) return;
    var statusSeed = ['APPROVED','REVIEW','APPROVED','DRAFT','APPROVED','REVIEW','DRAFT','APPROVED','REVIEW','DRAFT'];
    window.ASPECT_DATA.forEach(function(a, i){
      if (!a.wfStatus) a.wfStatus = statusSeed[i] || 'DRAFT';
      if (!a.wfPreparer) a.wfPreparer = 'Dhanesh CK';
      if (!a.wfReviewer) a.wfReviewer = (a.wfStatus !== 'DRAFT') ? 'R. Krishnan (HSE Manager)' : '';
      if (!a.wfApprover) a.wfApprover = (a.wfStatus === 'APPROVED') ? 'S. Venkatesh (PM)' : '';
      if (!a.wfHistory) a.wfHistory = buildDemoHistory(a.wfStatus);
    });
  })();
  
  function buildDemoHistory(finalStatus){
    var now = Date.now();
    var hist = [{ts: now - 14*86400000, actor:'Dhanesh CK', role:'Preparer', action:'Created (DRAFT)', comment:'Initial aspect identification per ISO 14001 Cl.6.1.2'}];
    if (finalStatus === 'REVIEW' || finalStatus === 'APPROVED'){
      hist.push({ts: now - 7*86400000, actor:'Dhanesh CK', role:'Preparer', action:'Submitted for Review', comment:'All fields complete, ready for HSE Manager review'});
      hist.push({ts: now - 5*86400000, actor:'R. Krishnan', role:'Reviewer', action:'Review Started', comment:''});
    }
    if (finalStatus === 'APPROVED'){
      hist.push({ts: now - 2*86400000, actor:'R. Krishnan', role:'Reviewer', action:'Recommended for Approval', comment:'Controls verified against Register'});
      hist.push({ts: now - 1*86400000, actor:'S. Venkatesh', role:'Approver', action:'Approved (ISO 14001 Cl.7.5.3)', comment:'Authorised for implementation'});
    }
    return hist;
  }
  
  // Current user role (demo - later tie to auth)
  window.__currentRole = localStorage.getItem('sp_wf_role') || 'Preparer';
  
  window.eiaSetUserRole = function(role){
    window.__currentRole = role;
    try { localStorage.setItem('sp_wf_role', role); } catch(e){}
    if (typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
    injectWorkflowColumn(true);
    renderRoleBadge();
  };
  
  function renderRoleBadge(){
    var existing = document.getElementById('sp-wf-role-badge');
    if (existing) existing.remove();
    var panel = document.getElementById('aspect-register');
    if (!panel) return;
    var role = window.__currentRole || 'Preparer';
    var roleCol = role === 'Preparer' ? '#F59E0B' : role === 'Reviewer' ? '#3B82F6' : '#22C55E';
    var badge = document.createElement('div');
    badge.id = 'sp-wf-role-badge';
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--raised);border:1px solid ' + roleCol + ';border-radius:16px;font-size:10px;color:var(--t2);margin:8px 0;cursor:pointer;';
    badge.innerHTML = '<span style="font-size:9px;color:var(--t3);text-transform:uppercase;">Acting as:</span>' +
      '<span style="color:' + roleCol + ' !important;font-weight:700;">' + role + '</span>' +
      '<select onchange="eiaSetUserRole(this.value)" onclick="event.stopPropagation()" style="background:transparent;border:0;color:var(--t2);font-size:10px;cursor:pointer;margin-left:6px;">' +
        ['Preparer','Reviewer','Approver'].map(function(r){ return '<option value="' + r + '"' + (r===role?' selected':'') + '>Switch to ' + r + '</option>'; }).join('') +
      '</select>';
    var insertAfter = document.getElementById('eia-region-selector-wrap') || panel.querySelector('.card');
    if (insertAfter && insertAfter.parentElement){
      insertAfter.parentElement.insertBefore(badge, insertAfter.nextSibling);
    } else {
      panel.insertBefore(badge, panel.firstChild);
    }
  }
  
  // Workflow status styling
  var WF_STYLES = {
    DRAFT:    {label:'DRAFT',    bg:'rgba(245,158,11,0.15)', col:'#F59E0B', icon:'&#9998;'},
    REVIEW:   {label:'REVIEW',   bg:'rgba(59,130,246,0.15)', col:'#3B82F6', icon:'&#128269;'},
    APPROVED: {label:'APPROVED', bg:'rgba(34,197,94,0.15)',  col:'#22C55E', icon:'&#9989;'}
  };
  
  // Transition logic based on current role + aspect status
  function canTransition(role, status){
    if (role === 'Preparer' && status === 'DRAFT') return [{to:'REVIEW', label:'Submit for Review', col:'#3B82F6'}];
    if (role === 'Reviewer' && status === 'REVIEW') return [
      {to:'APPROVED', label:'Recommend Approval', col:'#22C55E'},
      {to:'DRAFT', label:'Send Back to Draft', col:'#F59E0B'}
    ];
    if (role === 'Approver' && status === 'REVIEW') return [
      {to:'APPROVED', label:'Final Approve', col:'#22C55E'},
      {to:'DRAFT', label:'Reject', col:'#EF4444'}
    ];
    if (role === 'Approver' && status === 'APPROVED') return [{to:'DRAFT', label:'Revoke (Re-draft)', col:'#F59E0B'}];
    return [];
  }
  
  window.eiaWfTransition = function(aspectIdx, toStatus){
    var a = window.ASPECT_DATA[aspectIdx];
    if (!a) return;
    var role = window.__currentRole;
    var comment = prompt('Add comment for this ' + toStatus + ' action (required for audit trail):', '');
    if (comment === null) return;
    var fromStatus = a.wfStatus;
    a.wfStatus = toStatus;
    if (toStatus === 'REVIEW' && role === 'Preparer') a.wfReviewer = 'Assigned';
    if (toStatus === 'APPROVED') a.wfApprover = 'S. Venkatesh (PM)';
    var actor = role === 'Preparer' ? 'Dhanesh CK' : role === 'Reviewer' ? 'R. Krishnan' : 'S. Venkatesh';
    var actionLabel = fromStatus + ' -> ' + toStatus + ' by ' + role;
    a.wfHistory = a.wfHistory || [];
    a.wfHistory.push({ts: Date.now(), actor: actor, role: role, action: actionLabel, comment: comment || '(no comment)'});
    try { localStorage.setItem('sp_eia_wf_' + aspectIdx, JSON.stringify({status: toStatus, history: a.wfHistory})); } catch(e){}
    injectWorkflowColumn(true);
    if (typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
  };
  
  window.eiaShowWfHistory = function(aspectIdx){
    var a = window.ASPECT_DATA[aspectIdx];
    if (!a || !a.wfHistory) return;
    var modal = document.getElementById('sp-wf-history-modal');
    if (!modal){
      modal = document.createElement('div');
      modal.id = 'sp-wf-history-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:40px;';
      modal.onclick = function(e){ if(e.target === modal) modal.remove(); };
      document.body.appendChild(modal);
    }
    var eiaId = 'EIA-' + String(aspectIdx + 1).padStart(3, '0');
    var rowsHtml = a.wfHistory.map(function(h, i){
      var dt = new Date(h.ts).toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
      var roleCol = h.role === 'Preparer' ? '#F59E0B' : h.role === 'Reviewer' ? '#3B82F6' : '#22C55E';
      return '<div style="padding:10px 14px;border-left:2px solid ' + roleCol + ';margin-bottom:8px;background:var(--raised);border-radius:0 6px 6px 0;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
          '<span style="font-size:10px;font-weight:700;color:var(--t1);">' + (h.actor || '-') + ' <span style="color:' + roleCol + ' !important;font-weight:600;">(' + (h.role || '-') + ')</span></span>' +
          '<span style="font-size:9px;color:var(--t3);">' + dt + '</span>' +
        '</div>' +
        '<div style="font-size:10px;color:var(--t2);margin-bottom:3px;">' + (h.action || '-') + '</div>' +
        (h.comment ? '<div style="font-size:9px;color:var(--t3);font-style:italic;">"' + (h.comment || '') + '"</div>' : '') +
      '</div>';
    }).reverse().join('');
    modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:20px;max-width:640px;width:100%;max-height:80vh;overflow-y:auto;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border);">' +
        '<h3 style="margin:0;font-size:14px;color:var(--t1);">&#128275; Audit Trail - ' + eiaId + ' (' + (a.aspect || '') + ')</h3>' +
        '<button onclick="document.getElementById(\'sp-wf-history-modal\').remove()" style="background:transparent;border:0;color:var(--t2);font-size:20px;cursor:pointer;line-height:1;">&times;</button>' +
      '</div>' +
      '<div style="font-size:10px;color:var(--t3);margin-bottom:10px;">ISO 14001 Cl.7.5.3 Control of Documented Information &middot; Records of approval and change history</div>' +
      rowsHtml +
    '</div>';
  };
  
  // Inject WORKFLOW column (25th column) after LEGAL
  function injectWorkflowColumn(forceRender){
    var tbody = document.getElementById('eaia-tbody');
    if (!tbody) return;
    var parent = tbody.parentElement;
    if (!parent) return;
    
    var groupHdr = document.getElementById('eia-group-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 7 && c.children.length <= 10; })[0];
    var subHdr = document.getElementById('eia-sub-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 23 && c.children.length <= 26; })[0];
    if (!groupHdr || !subHdr) return;
    
    // Insert group label "WORKFLOW" after LEGAL group (currently 5th index if legal was injected)
    var hasLegal = !!groupHdr.querySelector('[data-legal-injected]');
    var hasWf = !!groupHdr.querySelector('[data-wf-injected]');
    
    if (!hasWf){
      // Find RESIDUAL group - always exists - inject WF before it
      var residualGroup = null;
      for (var i = 0; i < groupHdr.children.length; i++){
        if (groupHdr.children[i].textContent.trim().indexOf('RESIDUAL') >= 0){ residualGroup = groupHdr.children[i]; break; }
      }
      if (residualGroup){
        var newGroup = document.createElement('div');
        newGroup.setAttribute('data-wf-injected', '1');
        newGroup.style.cssText = 'grid-column:span 1;padding:10px 8px;text-align:center;color:#8B5CF6 !important;background:rgba(139,92,246,.12);border-right:1px solid var(--border);font-weight:700;text-transform:uppercase;letter-spacing:.5px;font-size:10px;';
        newGroup.textContent = 'WORKFLOW';
        groupHdr.insertBefore(newGroup, residualGroup);
        
        var newSub = document.createElement('div');
        newSub.setAttribute('data-wf-injected', '1');
        newSub.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;text-align:center;color:var(--t3);';
        newSub.textContent = 'Status';
        // find residual sub (R-Col in sub header) - first cell matching Residual position
        var residualSub = null;
        for (var j = 0; j < subHdr.children.length; j++){
          if (subHdr.children[j].textContent.trim().toLowerCase().indexOf('residual') >= 0){ residualSub = subHdr.children[j]; break; }
        }
        if (residualSub){ subHdr.insertBefore(newSub, residualSub); }
      }
    }
    
    // Widen grid
    var baseGrid = getComputedStyle(groupHdr).gridTemplateColumns;
    var hasWfCol = baseGrid.split(' ').length >= 25;
    if (!hasWfCol){
      // Inject '130px' before residual column width (around position 21-22)
      var cols = baseGrid.split(' ');
      // Find 56px (residual width) - usually appears near position 21+ in 24-col register
      // Simpler: just add 130px at end and rely on flex to reorder? No, grid is strict.
      // Best approach: set explicit grid value via our own style
    }
    
    // Always sync grid templates + inject row cells
    var fullData = window.ASPECT_DATA || [];
    var rows = tbody.children;
    var newColCount = 25; // 24 (with legal) + 1 (workflow)
    var newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 130px 56px 50px 100px';
    groupHdr.style.gridTemplateColumns = newGrid;
    subHdr.style.gridTemplateColumns = newGrid;
    
    for (var r = 0; r < rows.length; r++){
      var row = rows[r];
      row.style.gridTemplateColumns = newGrid;
      var existingWfCell = row.querySelector('[data-wf-cell]');
      var status = (fullData[r] && fullData[r].wfStatus) || 'DRAFT';
      var style = WF_STYLES[status] || WF_STYLES.DRAFT;
      var role = window.__currentRole || 'Preparer';
      var transitions = canTransition(role, status);
      
      var cellHtml = '<div style="display:flex;flex-direction:column;gap:3px;align-items:center;">' +
        '<div onclick="eiaShowWfHistory(' + r + ')" title="Click for audit trail" style="display:inline-block;padding:2px 7px;background:' + style.bg + ';color:' + style.col + ' !important;border-radius:10px;font-size:8px;font-weight:700;cursor:pointer;">' + style.icon + ' ' + style.label + '</div>';
      transitions.forEach(function(t){
        cellHtml += '<button onclick="eiaWfTransition(' + r + ',\'' + t.to + '\')" style="background:rgba(255,255,255,.04);border:1px solid ' + t.col + ';color:' + t.col + ' !important;padding:2px 6px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;">' + t.label + '</button>';
      });
      cellHtml += '</div>';
      
      if (existingWfCell){
        existingWfCell.innerHTML = cellHtml;
      } else {
        var residualCellInRow = null;
        // Heuristic: residual cell is somewhere near index 20-22
        // Look for cell right before residual score (numeric like 14, 24)
        // Simpler: insert at position (22 if legal exists, 21 if not)
        var targetPos = hasLegal ? 22 : 21;
        residualCellInRow = row.children[targetPos];
        if (!residualCellInRow) continue;
        var newCell = document.createElement('div');
        newCell.setAttribute('data-wf-cell', '1');
        newCell.style.cssText = 'padding:4px 4px;border-right:0.5px solid var(--border);display:flex;align-items:center;justify-content:center;';
        newCell.innerHTML = cellHtml;
        row.insertBefore(newCell, residualCellInRow);
      }
    }
    
    // Inject stylesheet override (defensive - ensures grid value sticks)
    var styleId = 'eia-wf-grid-override';
    var existStyle = document.getElementById(styleId);
    if (!existStyle){
      var s = document.createElement('style');
      s.id = styleId;
      s.textContent = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + newGrid + ' !important; }';
      document.head.appendChild(s);
    }
  }
  
  setInterval(function(){ try { injectWorkflowColumn(); renderRoleBadge(); } catch(e){} }, 2500);
  [600, 1500, 3000].forEach(function(ms){ setTimeout(function(){ try { injectWorkflowColumn(); renderRoleBadge(); } catch(e){} }, ms); });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added Workflow Draft/Review/Approved"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }
Copy-Item $htmlFile "$htmlFile.wf1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT: html content small"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT: replaced too small"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
Write-Host "Final HTML: $((Get-Item $htmlFile).Length) bytes"
