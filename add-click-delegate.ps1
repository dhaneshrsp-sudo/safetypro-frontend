$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\hira-enhancements.js"
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('[data-act]')) {
    Write-Host "Delegated click handler already present"
    return
}

# Insert delegated click handler before the final })(); - catches clicks on data-act icons
$old = '})();'
$new = @"
  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if(!t) return;
    var act = t.getAttribute('data-act');
    var row = parseInt(t.getAttribute('data-row'), 10);
    if(typeof window.hiraActionHandler === 'function'){ window.hiraActionHandler(act, row); }
  });
})();
"@

# Count occurrences of })(); - must be exactly 1 (at the very end)
$count = ([regex]::Matches($js, '\}\)\(\);')).Count
Write-Host "})(); occurrences: $count"

if ($count -eq 0) {
    Write-Host "ABORT: no IIFE close found"
    return
}

# Replace the LAST occurrence (at end of file)
$lastIdx = $js.LastIndexOf('})();')
$js = $js.Substring(0, $lastIdx) + $new + $js.Substring($lastIdx + 5)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added delegated click handler at end of hira-enhancements.js"
