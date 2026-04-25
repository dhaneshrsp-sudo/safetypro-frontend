$ErrorActionPreference = 'Stop'
try {
  $cssPath = 'C:\safetypro_complete_frontend\sp-shell.css'
  if (-not (Test-Path $cssPath)) { throw "not found: $cssPath" }
  $css = [System.IO.File]::ReadAllText($cssPath)
  Write-Host "File: $cssPath" -ForegroundColor Cyan
  Write-Host "Length: $($css.Length) bytes" -ForegroundColor Cyan
  Write-Host ""

  $marks = @(
    @{ name='1. .sp-row4 flex rule (will change flex-end -> flex-start)'; anchor='.sp-row4 {'; back=0; fwd=250 },
    @{ name='2. SCROLL_AREA padding rule (will change padding 0 -> 0 16px)'; anchor='Also ensure __SP_SCROLL_AREA__ doesn'; back=0; fwd=400 },
    @{ name='3. .sub-header:has rule (will change padding 0 -> 0 16px)'; anchor='.sub-header:has('; back=0; fwd=250 },
    @{ name='4. V82 block (will be REMOVED - consolidated into originals)'; anchor='V82 UNIFIED SCROLL + DRAG FIX'; back=5; fwd=800 },
    @{ name='5. V83 block (will be REMOVED - consolidated into originals)'; anchor='V83 SUB-HEADER INNER PADDING'; back=5; fwd=400 }
  )

  foreach ($m in $marks) {
    Write-Host ("=" * 70) -ForegroundColor DarkGray
    Write-Host $m.name -ForegroundColor Yellow
    Write-Host ("=" * 70) -ForegroundColor DarkGray
    $count = 0; $i = 0
    while (($i = $css.IndexOf($m.anchor, $i)) -ge 0) { $count++; $i++ }
    Write-Host "  matches: $count"
    if ($count -ge 1) {
      $p = $css.IndexOf($m.anchor)
      $from = [Math]::Max(0, $p - $m.back)
      $len  = [Math]::Min($m.fwd, $css.Length - $from)
      Write-Host ($css.Substring($from, $len))
    } else {
      Write-Host "  (anchor not found)" -ForegroundColor Red
    }
    Write-Host ""
  }
}
catch {
  Write-Host "ERROR: $_" -ForegroundColor Red
}
Read-Host 'Press Enter to close'
