$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\sp-shell.css"
Copy-Item $f "$f.footerfix1.bak" -Force
$css = [System.IO.File]::ReadAllText($f, $utf8)

if ($css.Contains('/* __FOOTER_FIXED_V1__ */')) {
    Write-Host "Footer fix already applied"
    return
}

# Append fixed footer CSS at end of file (last wins in cascade)
$append = @"


/* __FOOTER_FIXED_V1__ Fix footer to viewport bottom (do not scroll with content) */
.sp-footer {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 100 !important;
  background: var(--bg, #0B0F14) !important;
  border-top: 1px solid var(--border, #1E293B) !important;
  padding: 6px 14px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  font-size: 10px !important;
  color: var(--t3, #64748B) !important;
}

/* Reserve space at bottom of content so last rows are not hidden behind footer */
body {
  padding-bottom: 32px !important;
}
"@

$css += $append
[System.IO.File]::WriteAllText($f, $css, $utf8)
Write-Host "Appended fixed footer CSS"

# Bump sp-shell.css version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.footerfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'sp-shell\.css\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}
