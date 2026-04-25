$ErrorActionPreference = 'Stop'
try {
  $root = 'C:\safetypro_complete_frontend'
  $utf8 = [System.Text.UTF8Encoding]::new($false)

  # ----- STEP 1: Append V83 block to sp-shell.css -----
  Write-Host '== STEP 1: sp-shell.css append V83 block ==' -ForegroundColor Cyan
  $cssPath = Join-Path $root 'sp-shell.css'
  $css = [System.IO.File]::ReadAllText($cssPath)
  if ($css.Contains('V83 SUB-HEADER INNER PADDING')) {
    Write-Host '  Already patched - skipping'
  } else {
    $block = @'

/* === V83 SUB-HEADER INNER PADDING === */
/* Match sub-header inner inset to SCROLL_AREA padding so content aligns visually */
/* and never touches the sidebar line or gets clipped on the right. */
/* Background stays full-bleed because .sub-header is a filled dark band. */
.sub-header {
  padding-left: 16px !important;
  padding-right: 16px !important;
  box-sizing: border-box !important;
}
/* === END V83 === */
'@
    [System.IO.File]::WriteAllText($cssPath + '.v82.bak', $css, $utf8)
    [System.IO.File]::WriteAllText($cssPath, $css + $block, $utf8)
    Write-Host '  sp-shell.css patched (backup: sp-shell.css.v82.bak)' -ForegroundColor Green
  }

  # ----- STEP 2: Bump audit HTML v=82 -> v=83 -----
  Write-Host '== STEP 2: Bump audit HTML CSS version ==' -ForegroundColor Cyan
  $htmlPath = Join-Path $root 'safetypro_audit_compliance.html'
  $html = [System.IO.File]::ReadAllText($htmlPath)
  [System.IO.File]::WriteAllText($htmlPath + '.v82.bak', $html, $utf8)

  if ($html.Contains('sp-shell.css?v=82')) {
    $html = $html.Replace('sp-shell.css?v=82', 'sp-shell.css?v=83')
    [System.IO.File]::WriteAllText($htmlPath, $html, $utf8)
    Write-Host '  Bumped sp-shell.css v82 -> v83' -ForegroundColor Green
  } else {
    Write-Host '  WARNING: sp-shell.css?v=82 not found in HTML' -ForegroundColor Yellow
  }

  Write-Host ''
  Write-Host 'Next: run .\deploy.ps1' -ForegroundColor Yellow
}
catch {
  Write-Host ''
  Write-Host "ERROR: $_" -ForegroundColor Red
  Write-Host "At line: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}
Read-Host 'Press Enter to close'
