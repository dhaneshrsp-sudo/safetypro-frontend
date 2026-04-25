$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.bleedfix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('fixAcSubTab')) {
    Write-Host "Already has fix - skipping"
    return
}

# Append: override acSubTab with a proper sibling-clearing version
$append = @"


  // ========= FIX TAB BLEEDING - override acSubTab to properly deactivate siblings =========
  function fixAcSubTab(clickedEl, tabGroup, panelName){
    // Deactivate all sub-tabs in the same tab group (remove active from siblings)
    var allSubTabs = document.querySelectorAll('.ac-sub-tab');
    allSubTabs.forEach(function(t){
      var oc = t.getAttribute('onclick') || '';
      if(oc.indexOf("'" + tabGroup + "'") >= 0){
        t.classList.remove('active');
      }
    });
    // Activate the clicked sub-tab
    if(clickedEl) clickedEl.classList.add('active');
    
    // Deactivate all sub-panels in this tab group (by id prefix e.g. 'aspect-' or 'risk-')
    var prefix = tabGroup + '-';
    var allSubPanels = document.querySelectorAll('.ac-sub-panel');
    allSubPanels.forEach(function(p){
      if(p.id && p.id.indexOf(prefix) === 0){
        p.classList.remove('active');
      }
    });
    // Activate target panel
    var targetPanel = document.getElementById(prefix + panelName);
    if(targetPanel) targetPanel.classList.add('active');
  }
  
  // Override global acSubTab (preserves original signature)
  window.acSubTab = fixAcSubTab;
  
  // One-time cleanup: if page loaded with multiple .active panels, fix them NOW
  function cleanupBleed(){
    // For each tab group (aspect, risk, method), ensure at most ONE active panel
    ['aspect', 'risk', 'method'].forEach(function(group){
      var prefix = group + '-';
      var panels = [].slice.call(document.querySelectorAll('.ac-sub-panel')).filter(function(p){
        return p.id && p.id.indexOf(prefix) === 0;
      });
      var activePanels = panels.filter(function(p){ return p.classList.contains('active'); });
      if(activePanels.length > 1){
        // Keep only the first one, deactivate rest
        activePanels.slice(1).forEach(function(p){ p.classList.remove('active'); });
      }
    });
    // Same for sub-tabs
    ['aspect', 'risk', 'method'].forEach(function(group){
      var tabs = [].slice.call(document.querySelectorAll('.ac-sub-tab')).filter(function(t){
        var oc = t.getAttribute('onclick') || '';
        return oc.indexOf("'" + group + "'") >= 0;
      });
      var activeTabs = tabs.filter(function(t){ return t.classList.contains('active'); });
      if(activeTabs.length > 1){
        activeTabs.slice(1).forEach(function(t){ t.classList.remove('active'); });
      }
    });
  }
  setTimeout(cleanupBleed, 100);
  setTimeout(cleanupBleed, 1000);
"@

# Insert before final })();
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added fixAcSubTab override + bleed cleanup"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.bleedfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
