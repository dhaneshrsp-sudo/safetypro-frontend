$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)

$cssFile = "$PWD\sp-shell.css"
Copy-Item $cssFile "$cssFile.scrollfix2.bak" -Force
$css = [System.IO.File]::ReadAllText($cssFile, $utf8)

if ($css.Contains("/* === EIA scroll fix (final-v2) === */")) {
    Write-Host "Already applied - skipping"
    return
}

$append = @"


/* === EIA scroll fix (final-v2) === */
/* 1. Filter bar (top of page) - no scroll bar, wrap instead */
.sp-scope-filters {
  overflow: visible !important;
  flex-wrap: wrap !important;
}

/* 2. Any wrapper DIV directly inside card that only contains eia-group-header - no independent scroll */
#aspect-register .card > div:not(#eaia-tbody):not(#eia-sub-header):not(#eia-group-header) {
  overflow: visible !important;
  width: auto !important;
  min-width: 0 !important;
}

/* 3. EIA card - horizontal scroll at BOTTOM of card (below data rows), scroll bar HIDDEN */
#aspect-register .card {
  overflow-x: auto !important;
  overflow-y: visible !important;
  scrollbar-width: none !important;
  position: relative;
}
#aspect-register .card::-webkit-scrollbar {
  display: none !important;
}

/* 4. Group header + sub header + data rows all at natural width (1522px) */
#eia-group-header,
#eia-sub-header,
#eaia-tbody > div {
  width: max-content !important;
  min-width: 100% !important;
}

/* 5. Fade gradient on right edge as visual cue content continues */
#aspect-register .card::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(15,23,32,.75));
  pointer-events: none;
  z-index: 5;
}
/* === end EIA scroll fix === */
"@

$css = $css + $append
[System.IO.File]::WriteAllText($cssFile, $css, $utf8)
Write-Host "CSS appended"

# Bump sp-shell.css version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.scrollfix2.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, "sp-shell\.css\?v=(\d+)")
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}
Write-Host ""
Write-Host "Backups: sp-shell.css.scrollfix2.bak, safetypro_risk_management.html.scrollfix2.bak"
