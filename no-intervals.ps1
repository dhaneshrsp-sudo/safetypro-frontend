$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.nointervals1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__NOINTERVALS_V1__')) { Write-Host "Already disabled"; return }

# NUCLEAR: replace setInterval with a no-op function
# Pattern: setInterval(fn, ms) -> /* setInterval disabled */ (0 && setInterval)(fn, ms)
# Simpler: replace setInterval( with (function(){return 0;})(setInterval) - no, too hacky
# Simplest: just rename setInterval to _disabled_setInterval so calls become no-ops

$ivBefore = ([regex]::Matches($js, 'setInterval\(')).Count
Write-Host "setInterval calls found: $ivBefore"

# Replace all setInterval( with void(0)&&setInterval( - the void makes expression evaluate to undefined
# Better: replace with a comment-out and a no-op
$js = $js -replace 'setInterval\(', 'null && setInterval('
# Now every setInterval call is preceded by `null && ` which short-circuits - the setInterval never fires
$ivAfter = ([regex]::Matches($js, 'null && setInterval\(')).Count
Write-Host "setInterval calls disabled: $ivAfter"

# Add marker
$marker = "`n  // __NOINTERVALS_V1__ ALL setInterval calls disabled via null-short-circuit to stop flashing`n"
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT"; return }
$js = $js.Substring(0, $lastIdx) + $marker + $js.Substring($lastIdx)

if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.nointervals1.bak" -Force
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
