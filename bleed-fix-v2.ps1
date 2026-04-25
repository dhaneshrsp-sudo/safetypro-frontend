$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.bleedfix2.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Find the existing fixAcSubTab function and update it to clear inline display styles
# Also need to remove the old weak cleanup and replace with stronger one

# Simple approach: append a NEW cleanup that runs every 500ms and handles BOTH .active class AND inline display style
if ($js.Contains('aggressiveBleedFix')) {
    Write-Host "Aggressive bleed fix already present"
    return
}

$append = @"


  // ========= AGGRESSIVE BLEED FIX - handles inline display:flex !important stuck on panels =========
  window.acSubTab = function(clickedEl, tabGroup, panelName){
    var prefix = tabGroup + '-';
    // Deactivate all sub-tabs in group
    var tabs = document.querySelectorAll('.ac-sub-tab');
    for(var i = 0; i < tabs.length; i++){
      var oc = tabs[i].getAttribute('onclick') || '';
      if(oc.indexOf("'" + tabGroup + "'") >= 0){
        tabs[i].classList.remove('active');
      }
    }
    if(clickedEl) clickedEl.classList.add('active');
    
    // Deactivate all sub-panels in group - REMOVE both .active AND inline display style
    var panels = document.querySelectorAll('.ac-sub-panel');
    for(var i = 0; i < panels.length; i++){
      var p = panels[i];
      if(p.id && p.id.indexOf(prefix) === 0){
        p.classList.remove('active');
        // CRITICAL: also clear inline display style to override display:flex !important
        p.style.display = 'none';
      }
    }
    // Activate target panel
    var target = document.getElementById(prefix + panelName);
    if(target){
      target.classList.add('active');
      target.style.display = 'flex';
    }
  };
  
  function aggressiveBleedFix(){
    // For each tab group, find visible panels and ensure only the one matching active sub-tab is shown
    ['aspect', 'risk', 'method'].forEach(function(group){
      var prefix = group + '-';
      // Find the currently active sub-tab in this group
      var activeTab = null;
      var tabs = [].slice.call(document.querySelectorAll('.ac-sub-tab'));
      for(var i = 0; i < tabs.length; i++){
        var oc = tabs[i].getAttribute('onclick') || '';
        if(oc.indexOf("'" + group + "'") >= 0 && tabs[i].classList.contains('active')){
          activeTab = tabs[i]; break;
        }
      }
      // Figure out which panel SHOULD be visible based on active tab's onclick
      var targetPanelId = null;
      if(activeTab){
        var oc = activeTab.getAttribute('onclick') || '';
        var m = oc.match(/'([^']+)',\s*'([^']+)'\)/);
        if(m) targetPanelId = m[1] + '-' + m[2];
      }
      // Hide ALL panels in group, show only target
      var panels = document.querySelectorAll('.ac-sub-panel');
      for(var j = 0; j < panels.length; j++){
        var p = panels[j];
        if(p.id && p.id.indexOf(prefix) === 0){
          if(p.id === targetPanelId){
            p.classList.add('active');
            p.style.display = 'flex';
          } else {
            p.classList.remove('active');
            p.style.display = 'none';
          }
        }
      }
    });
  }
  // Run cleanup aggressively on load + periodically
  setTimeout(aggressiveBleedFix, 100);
  setTimeout(aggressiveBleedFix, 500);
  setTimeout(aggressiveBleedFix, 1500);
  window.aggressiveBleedFix = aggressiveBleedFix;
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added aggressiveBleedFix + acSubTab override with inline display cleanup"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.bleedfix2.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
