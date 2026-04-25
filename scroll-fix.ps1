$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.scrollfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

if ($h.Contains('<!-- eia-scroll-fix-css -->')) {
    Write-Host "Already applied. Skipping."
    return
}

# Inject CSS rule that targets the specific card wrapping eaia-tbody
# and ensures horizontal scroll works ONLY on that container
$cssFix = @"
<!-- eia-scroll-fix-css -->
<style id="eia-scroll-fix">
/* Enable horizontal scroll on the card containing EIA register table */
#aspect-register .card:has(#eaia-tbody) {
  overflow-x: auto !important;
  overflow-y: visible !important;
}
/* Ensure parent sub-panel doesn't clip either */
#aspect-register {
  overflow-x: auto !important;
}
/* Group header + sub-header + data rows all use max-content to force real width */
#eia-group-header, #eia-sub-header, #eaia-tbody > div {
  width: max-content !important;
  min-width: 100% !important;
}
</style>
"@

# Inject before </head>
$headClose = $h.LastIndexOf('</head>')
if ($headClose -lt 0) { Write-Host "ABORT: no </head>"; return }
$h = $h.Substring(0, $headClose) + $cssFix + "`n" + $h.Substring($headClose)

[System.IO.File]::WriteAllText($f, $h, $utf8)

Write-Host "Injected eia-scroll-fix CSS"
Write-Host "  Rule 1: card with eaia-tbody gets overflow-x:auto"
Write-Host "  Rule 2: aspect-register gets overflow-x:auto"
Write-Host "  Rule 3: header + tbody rows get width:max-content"
Write-Host "  Backup: $f.scrollfix1.bak"
