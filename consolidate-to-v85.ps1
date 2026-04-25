$ErrorActionPreference = 'Stop'
try {
  $root = 'C:\safetypro_complete_frontend'
  $utf8 = [System.Text.UTF8Encoding]::new($false)
  $cssPath = Join-Path $root 'sp-shell.css'
  $htmlPath = Join-Path $root 'safetypro_audit_compliance.html'

  Write-Host '=== CONSOLIDATION: clean up V82/V83 overrides, fix originals in place ===' -ForegroundColor Cyan
  $css = [System.IO.File]::ReadAllText($cssPath)
  $origLen = $css.Length
  [System.IO.File]::WriteAllText($cssPath + '.v84.bak', $css, $utf8)
  Write-Host "Source: sp-shell.css ($origLen bytes, backup: .v84.bak)"
  Write-Host ''

  # --- EDIT 1: .sp-row4 justify-content flex-end -> flex-start ---
  Write-Host '[EDIT 1] .sp-row4: flex-end -> flex-start' -ForegroundColor Yellow
  $p = $css.IndexOf('.sp-row4 {')
  if ($p -lt 0) { throw 'anchor ".sp-row4 {" not found' }
  $e = $css.IndexOf('}', $p)
  if ($e -lt 0) { throw 'closing brace not found for .sp-row4' }
  $blk = $css.Substring($p, $e - $p + 1)
  if ($blk.IndexOf('justify-content: flex-end') -lt 0) { throw 'EDIT 1 safety: flex-end not in first .sp-row4 block' }
  $css = $css.Substring(0, $p) + $blk.Replace('justify-content: flex-end', 'justify-content: flex-start') + $css.Substring($e + 1)
  Write-Host '  OK' -ForegroundColor Green

  # --- EDIT 2: SCROLL_AREA padding 0 -> 16px ---
  Write-Host '[EDIT 2] body[data-page="audit"] #__SP_SCROLL_AREA__: padding 0/0 -> 16px/16px' -ForegroundColor Yellow
  $p = $css.IndexOf('body[data-page="risk"] #__SP_SCROLL_AREA__,')
  if ($p -lt 0) { throw 'SCROLL_AREA anchor not found' }
  $e = $css.IndexOf('}', $p)
  if ($e -lt 0) { throw 'closing brace not found for SCROLL_AREA rule' }
  $blk = $css.Substring($p, $e - $p + 1)
  if ($blk.IndexOf('padding-left: 0 !important') -lt 0) { throw 'EDIT 2 safety: padding-left: 0 !important not found' }
  $blkNew = $blk.Replace('padding-left: 0 !important', 'padding-left: 16px !important').Replace('padding-right: 0 !important', 'padding-right: 16px !important')
  $css = $css.Substring(0, $p) + $blkNew + $css.Substring($e + 1)
  Write-Host '  OK' -ForegroundColor Green

  # --- EDIT 3: .sub-header:has(.sp-page-identity) padding 0 -> 0 16px ---
  Write-Host '[EDIT 3] .sub-header:has(.sp-page-identity): padding 0 -> 0 16px' -ForegroundColor Yellow
  $p = $css.IndexOf('.sub-header:has(.sp-page-identity) {')
  if ($p -lt 0) { throw '.sub-header:has anchor not found' }
  $e = $css.IndexOf('}', $p)
  if ($e -lt 0) { throw 'closing brace not found for :has rule' }
  $blk = $css.Substring($p, $e - $p + 1)
  if ($blk.IndexOf('flex-direction: column') -lt 0) { throw 'EDIT 3 safety: first :has block does not contain flex-direction: column' }
  if ($blk.IndexOf('padding: 0 !important') -lt 0) { throw 'EDIT 3 safety: padding: 0 !important not found in :has block' }
  $css = $css.Substring(0, $p) + $blk.Replace('padding: 0 !important', 'padding: 0 16px !important') + $css.Substring($e + 1)
  Write-Host '  OK' -ForegroundColor Green

  # --- REMOVE V82 block ---
  Write-Host '[REMOVE] V82 block' -ForegroundColor Yellow
  $s = $css.IndexOf('/* === V82 UNIFIED SCROLL + DRAG FIX === */')
  $eMark = '/* === END V82 === */'
  $en = $css.IndexOf($eMark)
  if ($s -ge 0 -and $en -ge 0) {
    $enFull = $en + $eMark.Length
    $st = $s
    while ($st -gt 0 -and ($css[$st-1] -eq "`n" -or $css[$st-1] -eq "`r")) { $st-- }
    $css = $css.Substring(0, $st) + $css.Substring($enFull)
    Write-Host '  OK' -ForegroundColor Green
  } else {
    Write-Host '  SKIP: not found' -ForegroundColor DarkYellow
  }

  # --- REMOVE V83 block ---
  Write-Host '[REMOVE] V83 block' -ForegroundColor Yellow
  $s = $css.IndexOf('/* === V83 SUB-HEADER INNER PADDING === */')
  $eMark = '/* === END V83 === */'
  $en = $css.IndexOf($eMark)
  if ($s -ge 0 -and $en -ge 0) {
    $enFull = $en + $eMark.Length
    $st = $s
    while ($st -gt 0 -and ($css[$st-1] -eq "`n" -or $css[$st-1] -eq "`r")) { $st-- }
    $css = $css.Substring(0, $st) + $css.Substring($enFull)
    Write-Host '  OK' -ForegroundColor Green
  } else {
    Write-Host '  SKIP: not found' -ForegroundColor DarkYellow
  }

  # --- APPEND clean drag-scroll support block ---
  Write-Host '[APPEND] DRAG SCROLL SUPPORT block' -ForegroundColor Yellow
  if (-not $css.Contains('=== DRAG SCROLL SUPPORT ===')) {
    $support = @'


/* === DRAG SCROLL SUPPORT === */
/* Companion to sp-drag-scroll.js. Visual cues only - NOT overrides. */
.sp-row4-actions { margin-left: auto !important; flex-shrink: 0 !important; }
.sp-scope-filters,
.sp-row4 {
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
}
.sp-scope-filters.is-dragging,
.sp-row4.is-dragging { cursor: grabbing; }
/* === END DRAG SCROLL SUPPORT === */
'@
    $css = $css + $support
    Write-Host '  OK' -ForegroundColor Green
  } else {
    Write-Host '  SKIP: already present' -ForegroundColor DarkYellow
  }

  [System.IO.File]::WriteAllText($cssPath, $css, $utf8)
  $newLen = $css.Length
  Write-Host ''
  Write-Host "Result: $newLen bytes (was $origLen, delta $($newLen - $origLen))" -ForegroundColor Cyan
  Write-Host ''

  # --- Bump audit HTML v=83 -> v=85 ---
  Write-Host '[HTML] Bump sp-shell.css v=83 -> v=85' -ForegroundColor Cyan
  $html = [System.IO.File]::ReadAllText($htmlPath)
  [System.IO.File]::WriteAllText($htmlPath + '.preconsolidate.bak', $html, $utf8)
  if ($html.Contains('sp-shell.css?v=83')) {
    [System.IO.File]::WriteAllText($htmlPath, $html.Replace('sp-shell.css?v=83', 'sp-shell.css?v=85'), $utf8)
    Write-Host '  OK' -ForegroundColor Green
  } else {
    Write-Host '  SKIP: no v=83 reference in audit HTML' -ForegroundColor DarkYellow
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
