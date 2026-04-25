$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.forceseed1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Change non-destructive checks to unconditional for demo purposes
$old1 = "if(typeof a.ocpDrafted === 'undefined') a.ocpDrafted = seed.drafted;"
$new1 = "a.ocpDrafted = seed.drafted;"
if ($js.Contains($old1)) { $js = $js.Replace($old1, $new1); Write-Host "Fix 1: unconditional ocpDrafted" }

$old2 = "if(typeof a.implStatus === 'undefined') a.implStatus = seed.status;"
$new2 = "a.implStatus = seed.status;"
if ($js.Contains($old2)) { $js = $js.Replace($old2, $new2); Write-Host "Fix 2: unconditional implStatus" }

$old3 = "if(!a.gap || !a.gap.trim()) a.gap = seed.gap;"
$new3 = "a.gap = seed.gap;"
if ($js.Contains($old3)) { $js = $js.Replace($old3, $new3); Write-Host "Fix 3: unconditional gap" }

[System.IO.File]::WriteAllText($f, $js, $utf8)

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.forceseed1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
