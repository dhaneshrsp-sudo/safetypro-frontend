$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.wfend1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__WFEND_V1__')) { Write-Host "Already applied"; return }

# === FIX 1: Throttle all short intervals to 10s to stop flashing ===
$js = [regex]::Replace($js, 'setInterval\(([^,]+),\s*(800|1000|1200|1500|2000|2500|3000)\)', 'setInterval($1, 10000)')
Write-Host "Fix 1: All short intervals now at 10s"

# === FIX 2: Filled button style (was outline) ===
$oldBtn = "background:rgba(255,255,255,.04);border:1px solid ' + t.col + ';color:' + t.col + ' !important"
$newBtn = "background:' + t.col + ';border:0;color:#ffffff !important"
if ($js.Contains($oldBtn)) {
    $js = $js.Replace($oldBtn, $newBtn)
    Write-Host "Fix 2: Buttons changed to FILLED style"
}

# === FIX 3: Move workflow columns to END of each row (after ACTIONS) ===
# Add a new function that runs on interval + on load that MOVES existing wf-split elements to end
$append = @"


  // ========= __WFEND_V1__ Move Workflow columns to END of row (after ACTIONS) =========
  var NEW_GRID_WF_END = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 56px 50px 100px 90px 130px 44px';
  
  function moveWorkflowToEnd(){
    // 1. Move WORKFLOW group header to end (after ACTIONS)
    var groupHdr = document.getElementById('eia-group-header');
    if (groupHdr){
      var wfGroup = null;
      for (var i = 0; i < groupHdr.children.length; i++){
        var c = groupHdr.children[i];
        if (c.textContent.trim() === 'WORKFLOW' && (c.style.gridColumn||'').indexOf('span 3') >= 0){
          wfGroup = c; break;
        }
      }
      if (wfGroup && groupHdr.lastElementChild !== wfGroup){
        groupHdr.appendChild(wfGroup); // appendChild on existing node MOVES it
      }
    }
    
    // 2. Move 3 sub-header cells (Status/Actions/Audit) to end
    var subHdr = document.getElementById('eia-sub-header');
    if (subHdr){
      var wfSubs = subHdr.querySelectorAll('[data-wf-split="1"]');
      wfSubs.forEach(function(s){
        if (subHdr.lastElementChild !== s){
          subHdr.appendChild(s);
        }
      });
    }
    
    // 3. Move each row's workflow cells (status/actions/audit) to end
    var tbody = document.getElementById('eaia-tbody');
    if (tbody){
      for (var r = 0; r < tbody.children.length; r++){
        var row = tbody.children[r];
        var wfCells = row.querySelectorAll('[data-wf-split-cell]');
        // Append in order: status, actions, audit
        var statusCell = row.querySelector('[data-wf-split-cell="status"]');
        var actionsCell = row.querySelector('[data-wf-split-cell="actions"]');
        var auditCell = row.querySelector('[data-wf-split-cell="audit"]');
        if (statusCell && actionsCell && auditCell){
          // Only move if they're not already at the end (last 3)
          var lastThree = [row.children[row.children.length-3], row.children[row.children.length-2], row.children[row.children.length-1]];
          var alreadyAtEnd = lastThree[0] === statusCell && lastThree[1] === actionsCell && lastThree[2] === auditCell;
          if (!alreadyAtEnd){
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            row.appendChild(auditCell);
          }
        }
      }
    }
    
    // 4. Update grid CSS to new order (workflow at end)
    var styleIds = ['eia-wf-split-override', 'eia-legal-col-grid'];
    styleIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el){
        var expected = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + NEW_GRID_WF_END + ' !important; }';
        if (el.textContent !== expected){
          el.textContent = expected;
        }
      }
    });
    
    // Ensure our style is LAST in head
    var good = document.getElementById('eia-wf-split-override');
    if (good && document.head.lastElementChild !== good){
      document.head.appendChild(good);
    }
  }
  
  setInterval(moveWorkflowToEnd, 10000);
  [600, 1500, 3500, 6000].forEach(function(ms){ setTimeout(moveWorkflowToEnd, ms); });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Fix 3: Workflow columns will move to END"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.wfend1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
Write-Host "Final: $((Get-Item $htmlFile).Length) bytes"
