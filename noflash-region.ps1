$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.noflash1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Find the origSetRegion call inside the new eiaSetRegion hook and comment it out
# It's the line: if(typeof origSetRegion === 'function') origSetRegion(code);
$old = "if(typeof origSetRegion === 'function') origSetRegion(code);"
$new = "/* origSetRegion(code) skipped to avoid flashing re-render */ localStorage.setItem('sp_eia_region', code); var badge = document.getElementById('eia-region-badge'); var REGIONS_MAP = {GLOBAL:'\ud83c\udf10 Global (ISO)',IN:'\ud83c\uddee\ud83c\uddf3 India',US:'\ud83c\uddfa\ud83c\uddf8 United States',GB:'\ud83c\uddec\ud83c\udde7 United Kingdom',EU:'\ud83c\uddea\ud83c\uddfa European Union',AE:'\ud83c\udde6\ud83c\uddea UAE',SA:'\ud83c\uddf8\ud83c\udde6 Saudi Arabia',QA:'\ud83c\uddf6\ud83c\udde6 Qatar',SG:'\ud83c\uddf8\ud83c\uddec Singapore',AU:'\ud83c\udde6\ud83c\uddfa Australia',MY:'\ud83c\uddf2\ud83c\uddfe Malaysia'}; if(badge) badge.textContent = REGIONS_MAP[code] || REGIONS_MAP.GLOBAL;"

if ($js.Contains($old)) {
    $js = $js.Replace($old, $new)
    [System.IO.File]::WriteAllText($f, $js, $utf8)
    Write-Host "Removed origSetRegion call, inlined badge update"
} else {
    Write-Host "ABORT: old pattern not found"
    return
}

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.noflash1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
