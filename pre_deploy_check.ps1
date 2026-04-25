# pre_deploy_check.ps1 — v5: clean, standalone + landing whitelist + size limit
param([switch]$Fix)
$files = Get-ChildItem "safetypro_*.html" | Where-Object { $_.Name -notmatch '_bk_|_backup_' }
$legalPages = @('safetypro_dpa.html','safetypro_privacy.html','safetypro_terms.html','safetypro_cookies.html','safetypro_refund.html')
$standalonePages = @('safetypro_audit.html','safetypro_checkin.html','safetypro_compliance.html','safetypro_onboarding.html','safetypro_superadmin.html','safetypro_login.html','safetypro_landing.html','safetypro_landing_v2.html','safetypro_landing_v3.html')
$errors = @()
$warnings = @()

# Oversize check (Cloudflare Pages limit)
$oversize = Get-ChildItem -File | Where-Object { $_.Length -gt 25MB -and $_.Name -notmatch '_bk_|_backup_' }
foreach ($f in $oversize) { $errors += "$($f.Name): TOO LARGE for Cloudflare ($([math]::Round($f.Length/1MB,1))MB > 25MB limit)" }

foreach ($f in $files) {
  $html = Get-Content $f.FullName -Raw -Encoding UTF8
  $name = $f.Name
  $isLegal = $legalPages -contains $name
  $isStandalone = $standalonePages -contains $name
  $sO = ([regex]::Matches($html,'<script[^>]*>')).Count; $sC = ([regex]::Matches($html,'</script>')).Count
  if ($sO -ne $sC) { $errors += "${name}: SCRIPT TAGS UNBALANCED ($sO/$sC)" }
  $yO = ([regex]::Matches($html,'<style[^>]*>')).Count; $yC = ([regex]::Matches($html,'</style>')).Count
  if ($yO -ne $yC) { $errors += "${name}: STYLE TAGS UNBALANCED ($yO/$yC)" }
  $minSize = if ($isLegal) { 4000 } elseif ($name -match 'login') { 5000 } else { 15000 }
  if ($f.Length -lt $minSize) { $errors += "${name}: FILE TOO SMALL ($($f.Length) bytes, min $minSize)" }
  if ($html -notmatch '<body') { $errors += "${name}: NO BODY TAG" }
  if ($html -notmatch '</body>\s*</html>') { $warnings += "${name}: missing </body></html>" }
  $bad = [regex]::Matches($html,'href="[^"]*\.html(?:\?|#|")')
  if ($bad.Count -gt 0) { $errors += "${name}: $($bad.Count) .html hrefs present (will cause Cloudflare 404)" }
  if (-not $isLegal -and -not $isStandalone) {
    if ($html -notmatch 'class="topnav"') { $warnings += "${name}: missing topnav" }
  }
}

Write-Host ""
Write-Host "Validated $($files.Count) files" -ForegroundColor Cyan
if ($errors.Count -gt 0) {
  Write-Host ""; Write-Host "DEPLOY BLOCKED — $($errors.Count) error(s):" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host "  [X] $_" -ForegroundColor Red }
  if (-not $Fix) { exit 1 }
}
if ($warnings.Count -gt 0) {
  Write-Host ""; Write-Host "Warnings ($($warnings.Count)):" -ForegroundColor Yellow
  $warnings | ForEach-Object { Write-Host "  [!] $_" -ForegroundColor Yellow }
}
if ($errors.Count -eq 0) { Write-Host ""; Write-Host "All checks passed" -ForegroundColor Green; exit 0 }
